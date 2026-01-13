using AccountingApp.Models;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;

namespace AccountingApp.Data;

public class AppDbContext : IdentityDbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
    {
    }

    public DbSet<Transaction> Transactions => Set<Transaction>();
    public DbSet<Account> Accounts => Set<Account>();

    public DbSet<JournalEntry> JournalEntries => Set<JournalEntry>();
    public DbSet<JournalEntryLine> JournalEntryLines => Set<JournalEntryLine>();

    protected override void OnModelCreating(ModelBuilder builder)
    {
        base.OnModelCreating(builder);

        builder.Entity<Transaction>(entity =>
        {
            entity.ToTable("Transactions");

            entity.HasKey(x => x.Id);

            entity.Property(x => x.Description)
                .IsRequired()
                .HasMaxLength(200);

            entity.Property(x => x.Amount)
                .HasColumnType("decimal(18,2)");

            entity.Property(x => x.Category)
                .HasMaxLength(100);

            entity.Property(x => x.ReferenceNo)
                .HasMaxLength(50);

            entity.Property(x => x.AccountId)
                .IsRequired();

            entity.HasOne(x => x.Account)
                .WithMany()
                .HasForeignKey(x => x.AccountId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasDiscriminator<string>("TransactionType")
                .HasValue<IncomeTransaction>("Income")
                .HasValue<ExpenseTransaction>("Expense");
        });

        builder.Entity<Account>(entity =>
        {
            entity.ToTable("Accounts");

            entity.HasKey(x => x.Id);

            entity.Property(x => x.AccountCode)
                .IsRequired()
                .HasMaxLength(20);

            entity.Property(x => x.Name)
                .IsRequired()
                .HasMaxLength(100);

            entity.Property(x => x.Type)
                .HasConversion<string>()
                .IsRequired()
                .HasMaxLength(20);

            entity.HasIndex(x => x.AccountCode)
                .IsUnique();
        });

        builder.Entity<JournalEntry>(entity =>
        {
            entity.ToTable("JournalEntries");

            entity.HasKey(x => x.Id);

            entity.Property(x => x.Description)
                .IsRequired()
                .HasMaxLength(200);

            entity.Property(x => x.ReferenceNo)
                .HasMaxLength(50);

            
            entity.HasMany(x => x.Lines)
                .WithOne(x => x.JournalEntry)
                .HasForeignKey(x => x.JournalEntryId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        builder.Entity<JournalEntryLine>(entity =>
        {
            entity.ToTable("JournalEntryLines");

            entity.HasKey(x => x.Id);

            entity.Property(x => x.Debit)
                .HasColumnType("decimal(18,2)");

            entity.Property(x => x.Credit)
                .HasColumnType("decimal(18,2)");

            entity.Property(x => x.Memo)
                .HasMaxLength(200);

            entity.Property(x => x.AccountId)
                .IsRequired();

            
            entity.HasOne(x => x.Account)
                .WithMany()
                .HasForeignKey(x => x.AccountId)
                .OnDelete(DeleteBehavior.Restrict);
        });
    }
}
