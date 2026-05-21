namespace BarberiaAPI.Models;

public class Appointment
{
    public int Id { get; set; }
    public string ClientName { get; set; } = string.Empty;
    public string ClientPhone { get; set; } = string.Empty;
    public string ClientEmail { get; set; } = string.Empty;
    public int ServiceId { get; set; }
    public Service? Service { get; set; }
    public int BarberId { get; set; }
    public Barber? Barber { get; set; }
    public DateTime AppointmentDate { get; set; }
    public string Status { get; set; } = "EsperandoBarbero";
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
