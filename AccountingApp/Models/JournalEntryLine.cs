namespace AccountingApp.Models;

public sealed class JournalEntryLine : BaseEntity
{
    public int JournalEntryId { get; private set; }
    public JournalEntry? JournalEntry { get; private set; }

    public int AccountId { get; private set; }
    public Account? Account { get; private set; }

    public decimal Debit { get; private set; }
    public decimal Credit { get; private set; }

    public string? Memo { get; private set; }

    public JournalEntryLine() { } // EF Core

    public JournalEntryLine(int accountId, decimal debit, decimal credit, string? memo = null)
    {
        AccountId = accountId;
        Debit = debit;
        Credit = credit;
        Memo = string.IsNullOrWhiteSpace(memo) ? null : memo.Trim();
        CreatedAtUtc = DateTime.UtcNow;
    }
}
