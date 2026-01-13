using AccountingApp.Data;
using AccountingApp.Dtos;
using AccountingApp.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace AccountingApp.Controllers;

[ApiController]
[Route("api/transactions")]
public class TransactionsController : ControllerBase
{
    private readonly AppDbContext _db;

    public TransactionsController(AppDbContext db)
    {
        _db = db;
    }

    // Read: Admin, Bookkeeper, ReportViewer
    [HttpGet]
    [Authorize(Roles = $"{IdentitySeeder.RoleAdmin},{IdentitySeeder.RoleBookkeeper},{IdentitySeeder.RoleReportViewer}")]
    public async Task<ActionResult<List<TransactionListItemDto>>> GetAll()
    {
        var items = await _db.Transactions
            .OrderByDescending(t => t.OccurredOn)
            .ThenByDescending(t => t.Id)
            .Select(t => new TransactionListItemDto(
                t.Id,
                t.AccountId,
                t.Type,
                t.OccurredOn,
                t.Description,
                t.Amount,
                t.SignedAmount,
                t.Category,
                t.ReferenceNo,
                t.CreatedAtUtc
            ))
            .ToListAsync();

        return Ok(items);
    }

    // Read: Admin, Bookkeeper, ReportViewer
    [HttpGet("{id:int}")]
    [Authorize(Roles = $"{IdentitySeeder.RoleAdmin},{IdentitySeeder.RoleBookkeeper},{IdentitySeeder.RoleReportViewer}")]
    public async Task<ActionResult<TransactionListItemDto>> GetById(int id)
    {
        var t = await _db.Transactions.FirstOrDefaultAsync(x => x.Id == id);
        if (t is null) return NotFound();

        var dto = new TransactionListItemDto(
            t.Id,
            t.AccountId,
            t.Type,
            t.OccurredOn,
            t.Description,
            t.Amount,
            t.SignedAmount,
            t.Category,
            t.ReferenceNo,
            t.CreatedAtUtc
        );

        return Ok(dto);
    }

    // Write: Admin, Bookkeeper
    [HttpPost]
    [Authorize(Roles = $"{IdentitySeeder.RoleAdmin},{IdentitySeeder.RoleBookkeeper}")]
    public async Task<ActionResult<TransactionListItemDto>> Create([FromBody] TransactionCreateDto dto)
    {
        if (dto is null) return BadRequest();

        // Validate account exists
        var accountExists = await _db.Accounts.AnyAsync(a => a.Id == dto.AccountId);
        if (!accountExists) return BadRequest("AccountId is invalid.");

        Transaction entity;
        var type = (dto.TransactionType ?? "").Trim();

        if (string.Equals(type, "Income", StringComparison.OrdinalIgnoreCase))
        {
            entity = new IncomeTransaction(dto.AccountId, dto.OccurredOn, dto.Description, dto.Amount, dto.Category, dto.ReferenceNo);
        }
        else if (string.Equals(type, "Expense", StringComparison.OrdinalIgnoreCase))
        {
            entity = new ExpenseTransaction(dto.AccountId, dto.OccurredOn, dto.Description, dto.Amount, dto.Category, dto.ReferenceNo);
        }
        else
        {
            return BadRequest("TransactionType must be Income or Expense.");
        }

        _db.Transactions.Add(entity);
        await _db.SaveChangesAsync();

        var created = new TransactionListItemDto(
            entity.Id,
            entity.AccountId,
            entity.Type,
            entity.OccurredOn,
            entity.Description,
            entity.Amount,
            entity.SignedAmount,
            entity.Category,
            entity.ReferenceNo,
            entity.CreatedAtUtc
        );

        return CreatedAtAction(nameof(GetById), new { id = entity.Id }, created);
    }

    // Write: Admin, Bookkeeper
    [HttpPut("{id:int}")]
    [Authorize(Roles = $"{IdentitySeeder.RoleAdmin},{IdentitySeeder.RoleBookkeeper}")]
    public async Task<ActionResult> Update(int id, [FromBody] TransactionUpdateDto dto)
    {
        if (dto is null) return BadRequest();

        var entity = await _db.Transactions.FirstOrDefaultAsync(x => x.Id == id);
        if (entity is null) return NotFound();

        var accountExists = await _db.Accounts.AnyAsync(a => a.Id == dto.AccountId);
        if (!accountExists) return BadRequest("AccountId is invalid.");

        entity.UpdateDetails(dto.AccountId, dto.OccurredOn, dto.Description, dto.Amount, dto.Category, dto.ReferenceNo);

        await _db.SaveChangesAsync();
        return NoContent();
    }

    // Write: Admin, Bookkeeper
    [HttpDelete("{id:int}")]
    [Authorize(Roles = $"{IdentitySeeder.RoleAdmin},{IdentitySeeder.RoleBookkeeper}")]
    public async Task<ActionResult> Delete(int id)
    {
        var entity = await _db.Transactions.FirstOrDefaultAsync(x => x.Id == id);
        if (entity is null) return NotFound();

        _db.Transactions.Remove(entity);
        await _db.SaveChangesAsync();

        return NoContent();
    }
}
