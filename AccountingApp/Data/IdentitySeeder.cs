
using Microsoft.AspNetCore.Identity;

namespace AccountingApp.Data;

public static class IdentitySeeder
{
    public const string RoleAdmin = "Admin";
    public const string RoleBookkeeper = "Bookkeeper";
    public const string RoleReportViewer = "ReportViewer";

    public static async Task SeedAsync(IServiceProvider services)
    {
        using var scope = services.CreateScope();

        var roleManager = scope.ServiceProvider.GetRequiredService<RoleManager<IdentityRole>>();
        var userManager = scope.ServiceProvider.GetRequiredService<UserManager<IdentityUser>>();

        // 1) Ensure roles exist
        var roles = new[] { RoleAdmin, RoleBookkeeper, RoleReportViewer };
        foreach (var role in roles)
        {
            if (!await roleManager.RoleExistsAsync(role))
            {
                await roleManager.CreateAsync(new IdentityRole(role));
            }
        }

        // 2) Create default admin user 
        var adminEmail = "admin@local.test";
        var adminPassword = "Admin!23456"; 

        var adminUser = await userManager.FindByEmailAsync(adminEmail);
        if (adminUser is null)
        {
            adminUser = new IdentityUser
            {
                UserName = adminEmail,
                Email = adminEmail,
                EmailConfirmed = true
            };

            var createResult = await userManager.CreateAsync(adminUser, adminPassword);
            if (!createResult.Succeeded)
            {
                var errors = string.Join("; ", createResult.Errors.Select(e => e.Description));
                throw new Exception($"Failed to create seed admin user: {errors}");
            }
        }

        // 3) Ensure admin user has Admin role
        if (!await userManager.IsInRoleAsync(adminUser, RoleAdmin))
        {
            await userManager.AddToRoleAsync(adminUser, RoleAdmin);
        }
    }
}
