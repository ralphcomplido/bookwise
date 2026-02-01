using AccountingApp.Models;

namespace AccountingApp.Dtos;

public sealed record AccountListItemDto(
    int Id,
    string AccountCode,
    string Name,
    AccountType Type
);

public sealed record AccountCreateDto(
    string AccountCode,
    string Name,
    AccountType Type
);

public sealed record AccountUpdateDto(
    string AccountCode,
    string Name,
    AccountType Type
);
