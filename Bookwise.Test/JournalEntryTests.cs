using System;
using AccountingApp.Models;
using Xunit;

namespace Bookwise.Test
{
    public class JournalEntryTests
    {
        // TC-01: Balanced journal entry should pass
        [Fact]
        public void TC01_ValidateBalanced_WithBalancedLines_DoesNotThrow()
        {
            // Arrange
            var entry = new JournalEntry(
                occurredOn: DateTime.UtcNow.Date,
                description: "Balanced test entry",
                referenceNo: "UT-001"
            );

            // Two lines, totals match (Debit 100 == Credit 100)
            entry.AddLine(accountId: 1, debit: 100m, credit: 0m, memo: "Debit line");
            entry.AddLine(accountId: 2, debit: 0m, credit: 100m, memo: "Credit line");

            // Act + Assert (no exception expected)
            var ex = Record.Exception(() => entry.ValidateBalanced());
            Assert.Null(ex);
        }

        // TC-02: Unbalanced journal entry should fail
        [Fact]
        public void TC02_ValidateBalanced_WithUnbalancedLines_ThrowsInvalidOperationException()
        {
            // Arrange
            var entry = new JournalEntry(
                occurredOn: DateTime.UtcNow.Date,
                description: "Unbalanced test entry",
                referenceNo: "UT-002"
            );

            // Two lines, totals do NOT match (Debit 100 != Credit 90)
            entry.AddLine(accountId: 1, debit: 100m, credit: 0m, memo: "Debit line");
            entry.AddLine(accountId: 2, debit: 0m, credit: 90m, memo: "Credit line");

            // Act + Assert
            Assert.Throws<InvalidOperationException>(() => entry.ValidateBalanced());
        }

        // TC-03: Entry with fewer than 2 lines should fail
        [Fact]
        public void TC03_ValidateBalanced_WithLessThanTwoLines_ThrowsInvalidOperationException()
        {
            // Arrange
            var entry = new JournalEntry(
                occurredOn: DateTime.UtcNow.Date,
                description: "Single-line entry",
                referenceNo: "UT-004"
            );

            // Only one line added (invalid for double-entry)
            entry.AddLine(accountId: 1, debit: 50m, credit: 0m, memo: "Only line");

            // Act + Assert
            Assert.Throws<InvalidOperationException>(() => entry.ValidateBalanced());
        }

        // TC-04: Line with both debit and credit should fail
        [Fact]
        public void TC04_AddLine_WithBothDebitAndCredit_ThrowsArgumentException()
        {
            // Arrange
            var entry = new JournalEntry(
                occurredOn: DateTime.UtcNow.Date,
                description: "Invalid line test entry",
                referenceNo: "UT-003"
            );

            // Act + Assert: A line cannot have both Debit and Credit
            Assert.Throws<ArgumentException>(() =>
                entry.AddLine(accountId: 1, debit: 10m, credit: 5m, memo: "Invalid line")
            );
        }

        // TC-05: Line with neither debit nor credit should fail
        [Fact]
        public void TC05_AddLine_WithZeroDebitAndZeroCredit_ThrowsArgumentException()
        {
            // Arrange
            var entry = new JournalEntry(
                occurredOn: DateTime.UtcNow.Date,
                description: "Zero/Zero line test",
                referenceNo: "UT-007"
            );

            // Act + Assert: A line cannot have neither Debit nor Credit
            Assert.Throws<ArgumentException>(() =>
                entry.AddLine(accountId: 1, debit: 0m, credit: 0m, memo: "Invalid zero/zero")
            );
        }

        // TC-06: Negative debit should fail
        [Fact]
        public void TC06_AddLine_WithNegativeDebit_ThrowsArgumentException()
        {
            // Arrange
            var entry = new JournalEntry(
                occurredOn: DateTime.UtcNow.Date,
                description: "Negative debit test",
                referenceNo: "UT-008"
            );

            // Act + Assert: Debit cannot be negative
            Assert.Throws<ArgumentException>(() =>
                entry.AddLine(accountId: 1, debit: -1m, credit: 0m, memo: "Invalid negative debit")
            );
        }

        // TC-07: Missing OccurredOn (default date) should fail
        [Fact]
        public void TC07_Constructor_WithDefaultOccurredOn_ThrowsArgumentException()
        {
            // Arrange + Act + Assert
            Assert.Throws<ArgumentException>(() =>
                new JournalEntry(
                    occurredOn: default,
                    description: "Missing date",
                    referenceNo: "UT-005"
                )
            );
        }

        // TC-08: Blank description should fail
        [Fact]
        public void TC08_Constructor_WithBlankDescription_ThrowsArgumentException()
        {
            // Arrange + Act + Assert
            Assert.Throws<ArgumentException>(() =>
                new JournalEntry(
                    occurredOn: DateTime.UtcNow.Date,
                    description: "   ",
                    referenceNo: "UT-006"
                )
            );
        }

    }
}
