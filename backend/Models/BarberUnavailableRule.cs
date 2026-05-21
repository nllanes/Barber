namespace BarberiaAPI.Models;

/// <summary>
/// Reglas de indisponibilidad del barbero.
/// Mode: Weekly (cada semana un día/intervalo), SingleDate (un día concreto), DateRange (varios días seguidos).
/// </summary>
public class BarberUnavailableRule
{
    public int Id { get; set; }
    public int BarberId { get; set; }
    public Barber? Barber { get; set; }

    public string Mode { get; set; } = "Weekly";

    /// <summary>0=Domingo … 6=Sábado (DayOfWeek de .NET)</summary>
    public int? DayOfWeek { get; set; }

    public DateTime? Date { get; set; }
    public DateTime? RangeEnd { get; set; }

    public bool AllDay { get; set; } = true;

    /// <summary>Minutos desde medianoche (0–1439)</summary>
    public int? StartTimeMinutes { get; set; }
    public int? EndTimeMinutes { get; set; }
}
