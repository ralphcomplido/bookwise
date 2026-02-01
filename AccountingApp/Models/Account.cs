namespace AccountingApp.Models;

public sealed class Account : BaseEntity
{
    public string AccountCode { get; private set; } = string.Empty;
    public string Name { get; private set; } = string.Empty;

    public AccountType Type { get; private set; } = AccountType.Asset;

    public Account() { } // EF Core

    public Account(string accountCode, string name, AccountType type)
    {
        SetDetails(accountCode, name, type);
        CreatedAtUtc = DateTime.UtcNow;
    }

    public void Update(string accountCode, string name, AccountType type)
    {
        SetDetails(accountCode, name, type);
        TouchUpdated();
    }

    private void SetDetails(string accountCode, string name, AccountType type)
    {
        if (string.IsNullOrWhiteSpace(accountCode))
            throw new ArgumentException("Account code is required.", nameof(accountCode));

        if (string.IsNullOrWhiteSpace(name))
            throw new ArgumentException("Account name is required.", nameof(name));

        AccountCode = accountCode.Trim();
        Name = name.Trim();
        Type = type;
    }
}
