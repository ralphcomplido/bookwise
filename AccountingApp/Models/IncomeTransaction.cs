namespace AccountingApp.Models;

public sealed class IncomeTransaction : Transaction
{
    public IncomeTransaction() { } // EF Core

    public IncomeTransaction(int accountId, DateTime occurredOn, string description, decimal amount, string? category = null, string? referenceNo = null)
    : base(accountId, occurredOn, description, amount, category, referenceNo)
    {
    }


    public override string Type => "Income";

    public override decimal SignedAmount => Amount;
}
