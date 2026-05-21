using System.Text.Json.Serialization;

namespace BarberiaAPI.Models;

public class Barber
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Specialty { get; set; } = string.Empty;
    public string ImageUrl { get; set; } = string.Empty;
    public string Phone { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;

    [JsonIgnore]
    public string? PasswordHash { get; set; }

    public int CutDurationMinutes { get; set; } = 30;
    public bool IsActive { get; set; } = true;
}
