namespace AccountingApp.Dtos;

public sealed record JournalEntryLineCreateDto(
    int AccountId,
    decimal Debit,
    decimal Credit,
    string? Memo
);

public sealed record JournalEntryCreateDto(
    DateTime OccurredOn,
    string Description,
    string? ReferenceNo,
    List<JournalEntryLineCreateDto> Lines
);

public sealed record JournalEntryLineDto(
    int Id,
    int AccountId,
    decimal Debit,
    decimal Credit,
    string? Memo
);

public sealed record JournalEntryDto(
    int Id,
    DateTime OccurredOn,
    string Description,
    string? ReferenceNo,
    DateTime CreatedAtUtc,
    List<JournalEntryLineDto> Lines
);

// Batch import (multiple journal entries in one request)
public sealed record BulkJournalEntriesCreateDto(
    List<JournalEntryCreateDto> Entries
);

public sealed record BulkJournalEntriesResultDto(
    int CreatedCount,
    List<int> CreatedIds
);
