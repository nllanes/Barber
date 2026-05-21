namespace BarberiaAPI.Models;

/** JSON camelCase (clientEmail, …) enlaza de forma fiable con propiedades. */
public sealed class CreateAppointmentDto
{
    public string ClientName { get; set; } = string.Empty;
    public string ClientPhone { get; set; } = string.Empty;
    public string ClientEmail { get; set; } = string.Empty;
    public int ServiceId { get; set; }
    public int BarberId { get; set; }
    public DateTime AppointmentDate { get; set; }
}

public record CreateContactMessageDto(
    string Name,
    string Email,
    string Phone,
    string Message
);

public record LoginDto(string Password);

public record CreateServiceDto(
    string Name,
    string Description,
    decimal Price,
    int DurationMinutes,
    string Icon
);

public record UpdateServiceDto(
    string Name,
    string Description,
    decimal Price,
    int DurationMinutes,
    string Icon,
    bool IsActive
);

public record CreateBarberDto(
    string Name,
    string Specialty,
    string ImageUrl,
    string Phone,
    string Email,
    int CutDurationMinutes = 30,
    string? Password = null
);

public record UpdateBarberDto(
    string Name,
    string Specialty,
    string ImageUrl,
    string Phone,
    string Email,
    int CutDurationMinutes,
    bool IsActive,
    string? Password = null
);

public record BarberLoginDto(string Email, string Password);

public record CreateGalleryImageDto(
    string Title,
    string TitleEn,
    string ImageUrl,
    int SortOrder
);

public record UpdateGalleryImageDto(
    string Title,
    string TitleEn,
    string ImageUrl,
    int SortOrder,
    bool IsActive
);

public record UpdateAppointmentStatusDto(string Status);

public record CreateBarberPortfolioDto(string ImageUrl, string Caption = "", int SortOrder = 0);

public record UpdateBarberPortfolioDto(string ImageUrl, string Caption, int SortOrder, bool IsActive);

public record CreateBarberUnavailableRuleDto(
    string Mode,
    int? DayOfWeek,
    DateTime? Date,
    DateTime? RangeEnd,
    bool AllDay,
    int? StartTimeMinutes,
    int? EndTimeMinutes
);
