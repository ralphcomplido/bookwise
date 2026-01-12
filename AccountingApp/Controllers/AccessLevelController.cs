using AccountingApp.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;

namespace AccountingApp.Controllers;

[ApiController]
[Route("api/access-level")]
[Authorize]
public class AccessLevelController : ControllerBase
{
    private const string AdminEmail = "admin@local.test";

    private readonly UserManager<IdentityUser> _userManager;

    public AccessLevelController(UserManager<IdentityUser> userManager)
    {
        _userManager = userManager;
    }

    [HttpGet]
    public async Task<ActionResult<AccessLevelDto>> Get()
    {
        var user = await _userManager.GetUserAsync(User);
        if (user is null) return Unauthorized();

        var email = user.Email ?? user.UserName ?? "";

        if (string.Equals(email, AdminEmail, StringComparison.OrdinalIgnoreCase))
            return Ok(new AccessLevelDto("Admin"));

        var roles = await _userManager.GetRolesAsync(user);

        var accessLevel =
            roles.Contains(IdentitySeeder.RoleBookkeeper) ? IdentitySeeder.RoleBookkeeper :
            roles.Contains(IdentitySeeder.RoleReportViewer) ? IdentitySeeder.RoleReportViewer :
            "Registered";

        return Ok(new AccessLevelDto(accessLevel));
    }

    public sealed record AccessLevelDto(string AccessLevel);
}
