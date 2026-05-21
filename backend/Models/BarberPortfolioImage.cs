namespace BarberiaAPI.Models;

public class BarberPortfolioImage
{
    public int Id { get; set; }
    public int BarberId { get; set; }
    public Barber? Barber { get; set; }
    public string ImageUrl { get; set; } = string.Empty;
    public string Caption { get; set; } = string.Empty;
    public int SortOrder { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public bool IsActive { get; set; } = true;
}
