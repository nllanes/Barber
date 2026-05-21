using Microsoft.EntityFrameworkCore;
using BarberiaAPI.Models;

namespace BarberiaAPI.Data;

public class BarberiaDbContext : DbContext
{
    public BarberiaDbContext(DbContextOptions<BarberiaDbContext> options) : base(options) { }

    public DbSet<Service> Services => Set<Service>();
    public DbSet<Barber> Barbers => Set<Barber>();
    public DbSet<Appointment> Appointments => Set<Appointment>();
    public DbSet<ContactMessage> ContactMessages => Set<ContactMessage>();
    public DbSet<GalleryImage> GalleryImages => Set<GalleryImage>();
    public DbSet<BarberPortfolioImage> BarberPortfolioImages => Set<BarberPortfolioImage>();
    public DbSet<BarberUnavailableRule> BarberUnavailableRules => Set<BarberUnavailableRule>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Service>().HasData(
            new Service { Id = 1, Name = "Corte Clásico", Description = "Corte de cabello tradicional con acabado perfecto", Price = 15.00m, DurationMinutes = 30, Icon = "content_cut" },
            new Service { Id = 2, Name = "Corte + Barba", Description = "Corte de cabello y perfilado de barba profesional", Price = 25.00m, DurationMinutes = 45, Icon = "face" },
            new Service { Id = 3, Name = "Afeitado Clásico", Description = "Afeitado con navaja y toalla caliente", Price = 12.00m, DurationMinutes = 25, Icon = "spa" },
            new Service { Id = 4, Name = "Diseño de Barba", Description = "Perfilado y diseño personalizado de barba", Price = 18.00m, DurationMinutes = 30, Icon = "design_services" },
            new Service { Id = 5, Name = "Corte Infantil", Description = "Corte especial para los más pequeños", Price = 10.00m, DurationMinutes = 20, Icon = "child_care" },
            new Service { Id = 6, Name = "Tratamiento Capilar", Description = "Tratamiento hidratante y revitalizante", Price = 30.00m, DurationMinutes = 40, Icon = "auto_awesome" }
        );

        modelBuilder.Entity<Barber>().HasData(
            new Barber { Id = 1, Name = "Carlos Méndez", Specialty = "Cortes Modernos", ImageUrl = "", Phone = "+1 555-0101", Email = "carlos@barbershopelite.com", CutDurationMinutes = 30 },
            new Barber { Id = 2, Name = "Miguel Torres", Specialty = "Barbas y Afeitados", ImageUrl = "", Phone = "+1 555-0102", Email = "miguel@barbershopelite.com", CutDurationMinutes = 40 },
            new Barber { Id = 3, Name = "Andrés López", Specialty = "Cortes Clásicos", ImageUrl = "", Phone = "+1 555-0103", Email = "andres@barbershopelite.com", CutDurationMinutes = 35 }
        );

        modelBuilder.Entity<BarberPortfolioImage>()
            .HasOne(p => p.Barber)
            .WithMany()
            .HasForeignKey(p => p.BarberId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<BarberUnavailableRule>()
            .HasOne(r => r.Barber)
            .WithMany()
            .HasForeignKey(r => r.BarberId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<GalleryImage>().HasData(
            new GalleryImage { Id = 1, Title = "Corte Moderno", TitleEn = "Modern Cut", ImageUrl = "https://images.unsplash.com/photo-1599351431202-1e0f0137899a?w=600&q=80", SortOrder = 1 },
            new GalleryImage { Id = 2, Title = "Diseño de Barba", TitleEn = "Beard Design", ImageUrl = "https://images.unsplash.com/photo-1621605815971-fbc98d665033?w=600&q=80", SortOrder = 2 },
            new GalleryImage { Id = 3, Title = "Estilo Clásico", TitleEn = "Classic Style", ImageUrl = "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=600&q=80", SortOrder = 3 },
            new GalleryImage { Id = 4, Title = "Corte Fade", TitleEn = "Fade Cut", ImageUrl = "https://images.unsplash.com/photo-1622286342621-4bd786c2447c?w=600&q=80", SortOrder = 4 },
            new GalleryImage { Id = 5, Title = "Afeitado Premium", TitleEn = "Premium Shave", ImageUrl = "https://images.unsplash.com/photo-1605497788044-5a32c7078486?w=600&q=80", SortOrder = 5 },
            new GalleryImage { Id = 6, Title = "Acabado Perfecto", TitleEn = "Perfect Finish", ImageUrl = "https://images.unsplash.com/photo-1596728325441-3b19c26f3fee?w=600&q=80", SortOrder = 6 }
        );
    }
}
