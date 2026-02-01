namespace AccountingApp.Models;

public abstract class BaseEntity
{
    public int Id { get; protected set; }

    public DateTime CreatedAtUtc { get; protected set; } = DateTime.UtcNow;

    public DateTime? UpdatedAtUtc { get; protected set; }

    protected void TouchUpdated()
    {
        UpdatedAtUtc = DateTime.UtcNow;
    }
}
