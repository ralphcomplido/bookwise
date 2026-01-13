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

    }
}
