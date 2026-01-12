using AccountingApp.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace AccountingApp.Controllers;

[ApiController]
[Route("api/admin/users")]
[Authorize] 
public class AdminUsersController : ControllerBase
{
    private const string AdminEmail = "admin@local.test";

    private readonly UserManager<IdentityUser> _userManager;
    private readonly RoleManager<IdentityRole> _roleManager;

    public AdminUsersController(
        UserManager<IdentityUser> userManager,
        RoleManager<IdentityRole> roleManager)
    {
        _userManager = userManager;
        _roleManager = roleManager;
    }

    private async Task<bool> IsAdminEmailAsync()
    {
        var current = await _userManager.GetUserAsync(User);
        if (current is null) return false;

        var email = current.Email ?? current.UserName ?? "";
        return string.Equals(email, AdminEmail, StringComparison.OrdinalIgnoreCase);
    }

    // GET api/admin/users
    [HttpGet]
    public async Task<ActionResult<List<UserRowDto>>> GetUsers()
    {
        if (!await IsAdminEmailAsync())
            return Forbid();

        var users = await _userManager.Users
            .OrderBy(u => u.Email)
            .ToListAsync();

        var result = new List<UserRowDto>(users.Count);

        foreach (var u in users)
        {
            var email = u.Email ?? u.UserName ?? "";

            if (string.Equals(email, AdminEmail, StringComparison.OrdinalIgnoreCase))
            {
                result.Add(new UserRowDto(u.Id, email, "Admin"));
                continue;
            }

            var roles = await _userManager.GetRolesAsync(u);

            var accessLevel =
                roles.Contains(IdentitySeeder.RoleBookkeeper) ? IdentitySeeder.RoleBookkeeper :
                roles.Contains(IdentitySeeder.RoleReportViewer) ? IdentitySeeder.RoleReportViewer :
                "Registered";

            result.Add(new UserRowDto(u.Id, email, accessLevel));
        }

        return Ok(result);
    }

    // PUT api/admin/users/{userId}/access-level
    [HttpPut("{userId}/access-level")]
    public async Task<ActionResult> SetAccessLevel(string userId, [FromBody] SetAccessLevelRequest request)
    {
        if (!await IsAdminEmailAsync())
            return Forbid();

        if (request is null || string.IsNullOrWhiteSpace(request.AccessLevel))
            return BadRequest("AccessLevel is required.");

        var newLevel = request.AccessLevel.Trim();

        var allowed = new[]
        {
            "Registered",
            IdentitySeeder.RoleBookkeeper,
            IdentitySeeder.RoleReportViewer
        };

        if (!allowed.Contains(newLevel))
            return BadRequest($"Invalid AccessLevel. Allowed: {string.Join(", ", allowed)}");

        var user = await _userManager.FindByIdAsync(userId);
        if (user is null) return NotFound("User not found.");

        var email = user.Email ?? user.UserName ?? "";

        if (string.Equals(email, AdminEmail, StringComparison.OrdinalIgnoreCase))
            return BadRequest("Cannot change the admin account access level.");

        foreach (var role in new[] { IdentitySeeder.RoleBookkeeper, IdentitySeeder.RoleReportViewer })
        {
            if (!await _roleManager.RoleExistsAsync(role))
            {
                await _roleManager.CreateAsync(new IdentityRole(role));
            }
        }

        var currentRoles = await _userManager.GetRolesAsync(user);
        var toRemove = currentRoles
            .Where(r => r == IdentitySeeder.RoleBookkeeper || r == IdentitySeeder.RoleReportViewer)
            .ToArray();

        if (toRemove.Length > 0)
        {
            var removeRes = await _userManager.RemoveFromRolesAsync(user, toRemove);
            if (!removeRes.Succeeded) return BadRequest(removeRes.Errors);
        }

        if (newLevel == "Registered")
            return NoContent();

        var addRes = await _userManager.AddToRoleAsync(user, newLevel);
        if (!addRes.Succeeded) return BadRequest(addRes.Errors);

        return NoContent();
    }

    public sealed record UserRowDto(string Id, string Email, string AccessLevel);
    public sealed record SetAccessLevelRequest(string AccessLevel);
}
