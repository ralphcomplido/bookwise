using AccountingApp.Data;
using AccountingApp.Dtos;
using AccountingApp.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace AccountingApp.Controllers;

[ApiController]
[Route("api/journal-entries")]
public class JournalEntriesController : ControllerBase
{
    private readonly AppDbContext _db;

    public JournalEntriesController(AppDbContext db)
    {
        _db = db;
    }

    // Read: Admin, Bookkeeper, ReportViewer
    [HttpGet]
    [Authorize(Roles = $"{IdentitySeeder.RoleAdmin},{IdentitySeeder.RoleBookkeeper},{IdentitySeeder.RoleReportViewer}")]
    public async Task<ActionResult<List<JournalEntryDto>>> GetAll()
    {
        var entries = await _db.JournalEntries
            .AsNoTracking()
            .OrderByDescending(e => e.OccurredOn)
            .ThenByDescending(e => e.Id)
            .Select(e => new JournalEntryDto(
                e.Id,
                e.OccurredOn,
                e.Description,
                e.ReferenceNo,
                e.CreatedAtUtc,
                e.Lines
                    .OrderBy(l => l.Id)
                    .Select(l => new JournalEntryLineDto(
                        l.Id,
                        l.AccountId,
                        l.Debit,
                        l.Credit,
                        l.Memo
                    ))
                    .ToList()
            ))
            .ToListAsync();

        return Ok(entries);
    }

    // Read: Admin, Bookkeeper, ReportViewer
    [HttpGet("{id:int}")]
    [Authorize(Roles = $"{IdentitySeeder.RoleAdmin},{IdentitySeeder.RoleBookkeeper},{IdentitySeeder.RoleReportViewer}")]
    public async Task<ActionResult<JournalEntryDto>> GetById(int id)
    {
        var entry = await _db.JournalEntries
            .AsNoTracking()
            .Where(e => e.Id == id)
            .Select(e => new JournalEntryDto(
                e.Id,
                e.OccurredOn,
                e.Description,
                e.ReferenceNo,
                e.CreatedAtUtc,
                e.Lines
                    .OrderBy(l => l.Id)
                    .Select(l => new JournalEntryLineDto(
                        l.Id,
                        l.AccountId,
                        l.Debit,
                        l.Credit,
                        l.Memo
                    ))
                    .ToList()
            ))
            .FirstOrDefaultAsync();

        if (entry is null) return NotFound();
        return Ok(entry);
    }

    // Write: Admin, Bookkeeper
    [HttpPost]
    [Authorize(Roles = $"{IdentitySeeder.RoleAdmin},{IdentitySeeder.RoleBookkeeper}")]
    public async Task<ActionResult<JournalEntryDto>> Create([FromBody] JournalEntryCreateDto dto)
    {
        if (dto is null) return BadRequest();
        if (dto.OccurredOn == default) return BadRequest("OccurredOn is required.");
        if (string.IsNullOrWhiteSpace(dto.Description)) return BadRequest("Description is required.");
        if (dto.Lines is null || dto.Lines.Count < 2) return BadRequest("At least 2 lines are required.");

        // Validate lines and account existence
        foreach (var line in dto.Lines)
        {
            if (line.AccountId <= 0) return BadRequest("AccountId is required for each line.");
            if (line.Debit < 0) return BadRequest("Debit cannot be negative.");
            if (line.Credit < 0) return BadRequest("Credit cannot be negative.");
            if ((line.Debit > 0 && line.Credit > 0) || (line.Debit == 0 && line.Credit == 0))
                return BadRequest("Each line must have either Debit or Credit (not both).");
        }

        var distinctAccountIds = dto.Lines.Select(l => l.AccountId).Distinct().ToList();
        var existingAccountIds = await _db.Accounts
            .Where(a => distinctAccountIds.Contains(a.Id))
            .Select(a => a.Id)
            .ToListAsync();

        if (existingAccountIds.Count != distinctAccountIds.Count)
            return BadRequest("One or more AccountId values are invalid.");

        var totalDebit = dto.Lines.Sum(l => l.Debit);
        var totalCredit = dto.Lines.Sum(l => l.Credit);

        if (totalDebit != totalCredit)
            return BadRequest("Journal entry is not balanced.");

        var entry = new JournalEntry(dto.OccurredOn, dto.Description.Trim(), dto.ReferenceNo);

        foreach (var line in dto.Lines)
        {
            entry.AddLine(line.AccountId, line.Debit, line.Credit, line.Memo);
        }

        entry.ValidateBalanced();

        _db.JournalEntries.Add(entry);
        await _db.SaveChangesAsync();

        // Reload with lines to return a complete DTO
        var created = await _db.JournalEntries
            .AsNoTracking()
            .Where(e => e.Id == entry.Id)
            .Select(e => new JournalEntryDto(
                e.Id,
                e.OccurredOn,
                e.Description,
                e.ReferenceNo,
                e.CreatedAtUtc,
                e.Lines
                    .OrderBy(l => l.Id)
                    .Select(l => new JournalEntryLineDto(
                        l.Id,
                        l.AccountId,
                        l.Debit,
                        l.Credit,
                        l.Memo
                    ))
                    .ToList()
            ))
            .FirstAsync();

        return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
    }
}
