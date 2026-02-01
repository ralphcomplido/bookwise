namespace AccountingApp.Dtos;

public sealed record TransactionListItemDto(
    int Id,
    int AccountId,
    string TransactionType,
    DateTime OccurredOn,
    string Description,
    decimal Amount,
    decimal SignedAmount,
    string? Category,
    string? ReferenceNo,
    DateTime CreatedAtUtc
);

public sealed record TransactionCreateDto(
    int AccountId,
    string TransactionType,
    DateTime OccurredOn,
    string Description,
    decimal Amount,
    string? Category,
    string? ReferenceNo
);

public sealed record TransactionUpdateDto(
    int AccountId,
    DateTime OccurredOn,
    string Description,
    decimal Amount,
    string? Category,
    string? ReferenceNo
);
