namespace AccountingApp.Models;

public sealed class JournalEntry : BaseEntity
{
    public DateTime OccurredOn { get; private set; }
    public string Description { get; private set; } = string.Empty;
    public string? ReferenceNo { get; private set; }

    private readonly List<JournalEntryLine> _lines = new();
    public IReadOnlyCollection<JournalEntryLine> Lines => _lines;

    public JournalEntry() { } // EF Core

    public JournalEntry(DateTime occurredOn, string description, string? referenceNo = null)
    {
        SetHeader(occurredOn, description, referenceNo);
        CreatedAtUtc = DateTime.UtcNow;
    }

    public void UpdateHeader(DateTime occurredOn, string description, string? referenceNo)
    {
        SetHeader(occurredOn, description, referenceNo);
        TouchUpdated();
    }

    public void AddLine(int accountId, decimal debit, decimal credit, string? memo = null)
    {
        if (accountId <= 0) throw new ArgumentException("AccountId is required.", nameof(accountId));
        if (debit < 0) throw new ArgumentException("Debit cannot be negative.", nameof(debit));
        if (credit < 0) throw new ArgumentException("Credit cannot be negative.", nameof(credit));
        if ((debit > 0 && credit > 0) || (debit == 0 && credit == 0))
            throw new ArgumentException("Line must have either Debit or Credit (not both).");

        _lines.Add(new JournalEntryLine(accountId, debit, credit, memo));
    }

    public void ValidateBalanced()
    {
        if (_lines.Count < 2)
            throw new InvalidOperationException("Journal entry must have at least 2 lines.");

        var totalDebit = _lines.Sum(l => l.Debit);
        var totalCredit = _lines.Sum(l => l.Credit);

        if (totalDebit != totalCredit)
            throw new InvalidOperationException("Journal entry is not balanced.");
    }

    private void SetHeader(DateTime occurredOn, string description, string? referenceNo)
    {
        if (occurredOn == default)
            throw new ArgumentException("OccurredOn is required.", nameof(occurredOn));

        if (string.IsNullOrWhiteSpace(description))
            throw new ArgumentException("Description is required.", nameof(description));

        OccurredOn = occurredOn;
        Description = description.Trim();
        ReferenceNo = string.IsNullOrWhiteSpace(referenceNo) ? null : referenceNo.Trim();
    }
}
