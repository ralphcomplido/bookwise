using AccountingApp.Data;
using AccountingApp.Dtos;
using AccountingApp.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace AccountingApp.Controllers;

[ApiController]
[Route("api/accounts")]
public class AccountsController : ControllerBase
{
    private readonly AppDbContext _db;

    public AccountsController(AppDbContext db)
    {
        _db = db;
    }

    // Read: Admin, Bookkeeper, ReportViewer
    [HttpGet]
    [Authorize(Roles = $"{IdentitySeeder.RoleAdmin},{IdentitySeeder.RoleBookkeeper},{IdentitySeeder.RoleReportViewer}")]
    public async Task<ActionResult<List<AccountListItemDto>>> GetAll()
    {
        var items = await _db.Accounts
            .OrderBy(a => a.AccountCode)
            .ThenBy(a => a.Name)
            .Select(a => new AccountListItemDto(a.Id, a.AccountCode, a.Name, a.Type))
            .ToListAsync();

        return Ok(items);
    }

    // Read: Admin, Bookkeeper, ReportViewer
    [HttpGet("{id:int}")]
    [Authorize(Roles = $"{IdentitySeeder.RoleAdmin},{IdentitySeeder.RoleBookkeeper},{IdentitySeeder.RoleReportViewer}")]
    public async Task<ActionResult<AccountListItemDto>> GetById(int id)
    {
        var a = await _db.Accounts.FirstOrDefaultAsync(x => x.Id == id);
        if (a is null) return NotFound();

        return Ok(new AccountListItemDto(a.Id, a.AccountCode, a.Name, a.Type));
    }

    // Write: Admin, Bookkeeper
    [HttpPost]
    [Authorize(Roles = $"{IdentitySeeder.RoleAdmin},{IdentitySeeder.RoleBookkeeper}")]
    public async Task<ActionResult<AccountListItemDto>> Create([FromBody] AccountCreateDto dto)
    {
        if (dto is null) return BadRequest();

        var code = (dto.AccountCode ?? "").Trim();
        var name = (dto.Name ?? "").Trim();

        if (string.IsNullOrWhiteSpace(code))
            return BadRequest("AccountCode is required.");
        if (string.IsNullOrWhiteSpace(name))
            return BadRequest("Name is required.");

        var exists = await _db.Accounts.AnyAsync(a => a.AccountCode == code);
        if (exists)
            return Conflict("AccountCode already exists.");

        var entity = new Account(code, name, dto.Type);

        _db.Accounts.Add(entity);
        await _db.SaveChangesAsync();

        var created = new AccountListItemDto(entity.Id, entity.AccountCode, entity.Name, entity.Type);
        return CreatedAtAction(nameof(GetById), new { id = entity.Id }, created);
    }

    // Write: Admin, Bookkeeper
    [HttpPut("{id:int}")]
    [Authorize(Roles = $"{IdentitySeeder.RoleAdmin},{IdentitySeeder.RoleBookkeeper}")]
    public async Task<ActionResult> Update(int id, [FromBody] AccountUpdateDto dto)
    {
        if (dto is null) return BadRequest();

        var entity = await _db.Accounts.FirstOrDefaultAsync(x => x.Id == id);
        if (entity is null) return NotFound();

        var code = (dto.AccountCode ?? "").Trim();
        var name = (dto.Name ?? "").Trim();

        if (string.IsNullOrWhiteSpace(code))
            return BadRequest("AccountCode is required.");
        if (string.IsNullOrWhiteSpace(name))
            return BadRequest("Name is required.");

        var existsOther = await _db.Accounts.AnyAsync(a => a.AccountCode == code && a.Id != id);
        if (existsOther)
            return Conflict("AccountCode already exists.");

        entity.Update(code, name, dto.Type);

        await _db.SaveChangesAsync();
        return NoContent();
    }

    // Write: Admin, Bookkeeper
    [HttpDelete("{id:int}")]
    [Authorize(Roles = $"{IdentitySeeder.RoleAdmin},{IdentitySeeder.RoleBookkeeper}")]
    public async Task<ActionResult> Delete(int id)
    {
        var entity = await _db.Accounts.FirstOrDefaultAsync(x => x.Id == id);
        if (entity is null) return NotFound();

        _db.Accounts.Remove(entity);
        await _db.SaveChangesAsync();

        return NoContent();
    }
}
