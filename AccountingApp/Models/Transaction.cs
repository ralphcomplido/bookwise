namespace AccountingApp.Models;

public abstract class Transaction : BaseEntity
{
    public int AccountId { get; protected set; }
    public Account? Account { get; protected set; }

    public DateTime OccurredOn { get; protected set; }
    public string Description { get; protected set; } = string.Empty;
    public decimal Amount { get; protected set; }

    public string? Category { get; protected set; }
    public string? ReferenceNo { get; protected set; }

    protected Transaction() { } // EF Core

    protected Transaction(int accountId, DateTime occurredOn, string description, decimal amount, string? category, string? referenceNo)
    {
        SetDetails(accountId, occurredOn, description, amount, category, referenceNo);
        CreatedAtUtc = DateTime.UtcNow;
    }

    public void UpdateDetails(int accountId, DateTime occurredOn, string description, decimal amount, string? category, string? referenceNo)
    {
        SetDetails(accountId, occurredOn, description, amount, category, referenceNo);
        TouchUpdated();
    }

    private void SetDetails(int accountId, DateTime occurredOn, string description, decimal amount, string? category, string? referenceNo)
    {
        if (accountId <= 0)
            throw new ArgumentException("AccountId is required.", nameof(accountId));

        if (occurredOn == default)
            throw new ArgumentException("OccurredOn is required.", nameof(occurredOn));

        if (string.IsNullOrWhiteSpace(description))
            throw new ArgumentException("Description is required.", nameof(description));

        if (amount <= 0)
            throw new ArgumentException("Amount must be greater than zero.", nameof(amount));

        AccountId = accountId;
        OccurredOn = occurredOn;
        Description = description.Trim();
        Amount = amount;

        Category = string.IsNullOrWhiteSpace(category) ? null : category.Trim();
        ReferenceNo = string.IsNullOrWhiteSpace(referenceNo) ? null : referenceNo.Trim();
    }

    public abstract string Type { get; }
    public abstract decimal SignedAmount { get; }
}
