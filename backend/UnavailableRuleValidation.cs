using BarberiaAPI.Models;

namespace BarberiaAPI;

public static class UnavailableRuleValidation
{
    public static bool TryValidate(CreateBarberUnavailableRuleDto dto, out string? error)
    {
        error = null;
        switch (dto.Mode)
        {
            case "Weekly":
                if (!dto.DayOfWeek.HasValue || dto.DayOfWeek is < 0 or > 6)
                {
                    error = "Día de la semana inválido (0=domingo … 6=sábado)";
                    return false;
                }
                if (!dto.AllDay && (dto.StartTimeMinutes is null || dto.EndTimeMinutes is null))
                {
                    error = "Indica hora de inicio y fin";
                    return false;
                }
                break;
            case "SingleDate":
                if (!dto.Date.HasValue) { error = "Indica la fecha"; return false; }
                if (!dto.AllDay && (dto.StartTimeMinutes is null || dto.EndTimeMinutes is null))
                {
                    error = "Indica hora de inicio y fin";
                    return false;
                }
                break;
            case "DateRange":
                if (!dto.Date.HasValue || !dto.RangeEnd.HasValue)
                {
                    error = "Indica fecha inicio y fin del rango";
                    return false;
                }
                if (dto.RangeEnd.Value.Date < dto.Date.Value.Date)
                {
                    error = "La fecha fin debe ser igual o posterior al inicio";
                    return false;
                }
                if (!dto.AllDay && (dto.StartTimeMinutes is null || dto.EndTimeMinutes is null))
                {
                    error = "Indica hora de inicio y fin";
                    return false;
                }
                break;
            default:
                error = "Modo inválido (Weekly, SingleDate, DateRange)";
                return false;
        }
        if (dto.StartTimeMinutes.HasValue && dto.EndTimeMinutes.HasValue && dto.EndTimeMinutes <= dto.StartTimeMinutes)
        {
            error = "La hora de fin debe ser posterior a la de inicio";
            return false;
        }
        return true;
    }
}
