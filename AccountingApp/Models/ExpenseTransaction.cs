namespace AccountingApp.Models;

public sealed class ExpenseTransaction : Transaction
{
    public ExpenseTransaction() { } // EF Core

    public ExpenseTransaction(int accountId, DateTime occurredOn, string description, decimal amount, string? category = null, string? referenceNo = null)
        : base(accountId, occurredOn, description, amount, category, referenceNo)
    {
    }

    public override string Type => "Expense";
    public override decimal SignedAmount => -Amount;
}
