using Microsoft.EntityFrameworkCore;
using BarberiaAPI;
using BarberiaAPI.Data;
using BarberiaAPI.Models;
using BarberiaAPI.Services;

var builder = WebApplication.CreateBuilder(args);

foreach (var smtpLocalJson in new[]
{
    Path.Combine(builder.Environment.ContentRootPath, "smtp.local.json"),
    Path.Combine(AppContext.BaseDirectory, "smtp.local.json"),
})
    builder.Configuration.AddJsonFile(smtpLocalJson, optional: true, reloadOnChange: true);

builder.Services.AddDbContext<BarberiaDbContext>(options =>
    options.UseSqlite(builder.Configuration.GetConnectionString("DefaultConnection")));

builder.Services.AddHttpClient();
builder.Services.AddScoped<NotificationService>();

var corsLocalDev = new[]
{
    "http://localhost:4200", "https://localhost:4200",
    "http://127.0.0.1:4200", "https://127.0.0.1:4200",
    "http://localhost:4300", "https://localhost:4300",
    "http://127.0.0.1:4300", "https://127.0.0.1:4300",
};
var corsExtraRaw = builder.Configuration["Cors:AllowedOrigins"];
if (string.IsNullOrWhiteSpace(corsExtraRaw))
    corsExtraRaw = builder.Configuration["FrontendOrigin"];
var corsExtra = string.IsNullOrWhiteSpace(corsExtraRaw)
    ? Array.Empty<string>()
    : corsExtraRaw.Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries);
var corsOrigins = corsLocalDev.Concat(corsExtra).Distinct(StringComparer.OrdinalIgnoreCase).ToArray();

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
        policy.WithOrigins(corsOrigins)
              .AllowAnyHeader()
              .AllowAnyMethod());
});

builder.Services.AddOpenApi();

var app = builder.Build();

using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<BarberiaDbContext>();
    db.Database.EnsureCreated();
    SqliteSchemaPatcher.Apply(db);
    if (app.Environment.IsDevelopment())
    {
        foreach (var b in db.Barbers.Where(x => string.IsNullOrEmpty(x.PasswordHash)))
            b.PasswordHash = BCrypt.Net.BCrypt.HashPassword("barber123");
        db.SaveChanges();
    }
}

if (app.Environment.IsDevelopment())
    app.MapOpenApi();

app.UseCors("AllowFrontend");

var uploadsPath = Path.Combine(app.Environment.ContentRootPath, "uploads");
Directory.CreateDirectory(uploadsPath);
app.UseStaticFiles(new StaticFileOptions
{
    FileProvider = new Microsoft.Extensions.FileProviders.PhysicalFileProvider(uploadsPath),
    RequestPath = "/uploads"
});

var adminPassword = (app.Configuration.GetValue<string>("AdminPassword") ?? "87061416902").Trim();

// ═══════════════════════════════════════════
//  PUBLIC ENDPOINTS
// ═══════════════════════════════════════════

app.MapGet("/api/services", async (BarberiaDbContext db) =>
    await db.Services.Where(s => s.IsActive).ToListAsync());

app.MapGet("/api/services/{id}", async (int id, BarberiaDbContext db) =>
    await db.Services.FindAsync(id) is Service s ? Results.Ok(s) : Results.NotFound());

app.MapGet("/api/barbers", async (BarberiaDbContext db) =>
    await db.Barbers.Where(b => b.IsActive).ToListAsync());

app.MapGet("/api/barbers/{barberId:int}/portfolio", async (int barberId, BarberiaDbContext db) =>
{
    if (!await db.Barbers.AnyAsync(b => b.Id == barberId && b.IsActive))
        return Results.NotFound();
    var list = await db.BarberPortfolioImages
        .Where(p => p.BarberId == barberId && p.IsActive)
        .OrderBy(p => p.SortOrder)
        .ToListAsync();
    return Results.Ok(list);
});

app.MapGet("/api/gallery", async (BarberiaDbContext db) =>
    await db.GalleryImages.Where(g => g.IsActive).OrderBy(g => g.SortOrder).ToListAsync());

app.MapGet("/api/availability", async (int barberId, DateTime date, int serviceId, BarberiaDbContext db) =>
{
    var barber = await db.Barbers.FindAsync(barberId);
    if (barber is null) return Results.BadRequest(new { available = false, message = "Barbero no encontrado" });

    var slotDuration = barber.CutDurationMinutes;
    var requestedStart = date;
    var requestedEnd = requestedStart.AddMinutes(slotDuration);

    var dayStart = requestedStart.Date;
    var dayEnd = dayStart.AddDays(1);

    var barberAppointments = await db.Appointments
        .Where(a => a.BarberId == barberId
            && !AppointmentScheduling.NonBlockingStatuses.Contains(a.Status)
            && a.AppointmentDate >= dayStart
            && a.AppointmentDate < dayEnd)
        .ToListAsync();

    var conflict = barberAppointments.Any(a =>
        a.AppointmentDate < requestedEnd
        && a.AppointmentDate.AddMinutes(slotDuration) > requestedStart);

    if (conflict)
        return Results.Ok(new { available = false, slotDuration });

    var rules = await db.BarberUnavailableRules.AsNoTracking().Where(r => r.BarberId == barberId).ToListAsync();
    if (ScheduleEvaluator.IsAppointmentBlocked(requestedStart, slotDuration, rules))
        return Results.Ok(new { available = false, slotDuration, reason = "barber_schedule" });

    return Results.Ok(new { available = true, slotDuration });
});

app.MapPost("/api/appointments", async (CreateAppointmentDto dto, BarberiaDbContext db, NotificationService notify) =>
{
    var clientEmail = dto.ClientEmail.Trim();
    if (string.IsNullOrWhiteSpace(clientEmail))
        return Results.BadRequest(new { error = "El email del cliente es obligatorio para enviar la confirmación por correo." });

    var barber = await db.Barbers.FindAsync(dto.BarberId);
    if (barber is null) return Results.BadRequest(new { error = "Barbero no encontrado" });

    var slotDuration = barber.CutDurationMinutes;
    var requestedStart = dto.AppointmentDate;
    var requestedEnd = requestedStart.AddMinutes(slotDuration);

    var dayStart = requestedStart.Date;
    var dayEnd = dayStart.AddDays(1);

    var barberAppointments = await db.Appointments
        .Where(a => a.BarberId == dto.BarberId
            && !AppointmentScheduling.NonBlockingStatuses.Contains(a.Status)
            && a.AppointmentDate >= dayStart
            && a.AppointmentDate < dayEnd)
        .ToListAsync();

    var conflict = barberAppointments.Any(a =>
        a.AppointmentDate < requestedEnd
        && a.AppointmentDate.AddMinutes(slotDuration) > requestedStart);

    if (conflict)
        return Results.Conflict(new { error = "El barbero ya tiene una cita en ese horario" });

    var rules = await db.BarberUnavailableRules.AsNoTracking().Where(r => r.BarberId == dto.BarberId).ToListAsync();
    if (ScheduleEvaluator.IsAppointmentBlocked(requestedStart, slotDuration, rules))
        return Results.Conflict(new { error = "El barbero no acepta citas en ese horario o día" });

    var service = await db.Services.FindAsync(dto.ServiceId);
    if (service is null) return Results.BadRequest(new { error = "Servicio no encontrado" });

    var appointment = new Appointment
    {
        ClientName = dto.ClientName.Trim(),
        ClientPhone = dto.ClientPhone.Trim(),
        ClientEmail = clientEmail,
        ServiceId = dto.ServiceId,
        BarberId = dto.BarberId,
        AppointmentDate = dto.AppointmentDate,
        Status = "EsperandoBarbero",
        CreatedAt = DateTime.UtcNow
    };
    db.Appointments.Add(appointment);
    await db.SaveChangesAsync();

    await notify.NotifyBarberNewAppointmentAsync(appointment, barber, service);
    await notify.NotifyClientBookingReceivedAsync(appointment, barber, service);

    return Results.Created($"/api/appointments/{appointment.Id}", appointment);
});

app.MapPost("/api/contact", async (CreateContactMessageDto dto, BarberiaDbContext db) =>
{
    var message = new ContactMessage
    {
        Name = dto.Name, Email = dto.Email,
        Phone = dto.Phone, Message = dto.Message,
        CreatedAt = DateTime.UtcNow
    };
    db.ContactMessages.Add(message);
    await db.SaveChangesAsync();
    return Results.Created($"/api/contact/{message.Id}", message);
});

app.MapGet("/api/health", () => Results.Ok(new { status = "healthy", timestamp = DateTime.UtcNow }));

// ═══════════════════════════════════════════
//  ADMIN LOGIN
// ═══════════════════════════════════════════

app.MapPost("/api/admin/login", (LoginDto dto) =>
{
    var pw = (dto.Password ?? string.Empty).Trim();
    if (pw == adminPassword)
        return Results.Ok(new { token = Convert.ToBase64String(System.Text.Encoding.UTF8.GetBytes($"admin:{DateTime.UtcNow:yyyyMMddHH}")) });
    return Results.Unauthorized();
});

app.MapPost("/api/barber/login", async (BarberLoginDto dto, BarberiaDbContext db, IConfiguration config) =>
{
    var barber = await db.Barbers.FirstOrDefaultAsync(b => b.Email == dto.Email && b.IsActive);
    if (barber is null || string.IsNullOrEmpty(barber.PasswordHash)
        || !BCrypt.Net.BCrypt.Verify(dto.Password, barber.PasswordHash))
        return Results.Unauthorized();
    var token = BarberAuth.CreateToken(barber.Id, config);
    return Results.Ok(new { token, barberName = barber.Name, barberId = barber.Id });
});

var barberApi = app.MapGroup("/api/barber").AddEndpointFilter(async (ctx, next) =>
{
    var authHeader = ctx.HttpContext.Request.Headers.Authorization.FirstOrDefault();
    if (string.IsNullOrEmpty(authHeader) || !authHeader.StartsWith("Bearer ", StringComparison.OrdinalIgnoreCase))
        return Results.Unauthorized();
    var token = authHeader["Bearer ".Length..].Trim();
    var config = ctx.HttpContext.RequestServices.GetRequiredService<IConfiguration>();
    if (!BarberAuth.TryValidateToken(token, config, out var bid))
        return Results.Unauthorized();
    ctx.HttpContext.Items["BarberId"] = bid;
    return await next(ctx);
});

barberApi.MapGet("/me", async (HttpContext http, BarberiaDbContext db) =>
{
    var id = (int)http.Items["BarberId"]!;
    var b = await db.Barbers.FindAsync(id);
    return b is null ? Results.NotFound() : Results.Ok(b);
});

barberApi.MapGet("/appointments", async (HttpContext http, BarberiaDbContext db) =>
{
    var id = (int)http.Items["BarberId"]!;
    var list = await db.Appointments.Include(a => a.Service).Include(a => a.Barber)
        .Where(a => a.BarberId == id)
        .OrderByDescending(a => a.AppointmentDate)
        .ToListAsync();
    return Results.Ok(list);
});

barberApi.MapPut("/appointments/{id}/accept", async (int id, HttpContext http, BarberiaDbContext db, NotificationService notify) =>
{
    var barberId = (int)http.Items["BarberId"]!;
    var a = await db.Appointments.Include(x => x.Service).Include(x => x.Barber).FirstOrDefaultAsync(x => x.Id == id);
    if (a is null) return Results.NotFound();
    if (a.BarberId != barberId) return Results.Forbid();
    if (a.Status is not ("EsperandoBarbero" or "Pendiente"))
        return Results.BadRequest(new { error = "La cita no está pendiente de aprobación" });
    a.Status = "Confirmada";
    await db.SaveChangesAsync();
    if (a.Barber is not null && a.Service is not null)
        await notify.NotifyClientAppointmentConfirmedAsync(a, a.Barber, a.Service);
    return Results.Ok(a);
});

barberApi.MapPut("/appointments/{id}/reject", async (int id, HttpContext http, BarberiaDbContext db) =>
{
    var barberId = (int)http.Items["BarberId"]!;
    var a = await db.Appointments.FindAsync(id);
    if (a is null) return Results.NotFound();
    if (a.BarberId != barberId) return Results.Forbid();
    if (a.Status is not ("EsperandoBarbero" or "Pendiente"))
        return Results.BadRequest(new { error = "La cita no está pendiente de aprobación" });
    a.Status = "Rechazada";
    await db.SaveChangesAsync();
    return Results.Ok(a);
});

barberApi.MapGet("/portfolio", async (HttpContext http, BarberiaDbContext db) =>
{
    var barberId = (int)http.Items["BarberId"]!;
    var list = await db.BarberPortfolioImages.Where(p => p.BarberId == barberId).OrderBy(p => p.SortOrder).ToListAsync();
    return Results.Ok(list);
});

barberApi.MapPost("/portfolio", async (HttpContext http, CreateBarberPortfolioDto dto, BarberiaDbContext db) =>
{
    var barberId = (int)http.Items["BarberId"]!;
    var img = new BarberPortfolioImage
    {
        BarberId = barberId,
        ImageUrl = dto.ImageUrl,
        Caption = dto.Caption ?? "",
        SortOrder = dto.SortOrder
    };
    db.BarberPortfolioImages.Add(img);
    await db.SaveChangesAsync();
    return Results.Created($"/api/barber/portfolio/{img.Id}", img);
});

barberApi.MapPut("/portfolio/{id}", async (HttpContext http, int id, UpdateBarberPortfolioDto dto, BarberiaDbContext db) =>
{
    var barberId = (int)http.Items["BarberId"]!;
    var img = await db.BarberPortfolioImages.FirstOrDefaultAsync(p => p.Id == id && p.BarberId == barberId);
    if (img is null) return Results.NotFound();
    img.ImageUrl = dto.ImageUrl;
    img.Caption = dto.Caption ?? "";
    img.SortOrder = dto.SortOrder;
    img.IsActive = dto.IsActive;
    await db.SaveChangesAsync();
    return Results.Ok(img);
});

barberApi.MapDelete("/portfolio/{id}", async (HttpContext http, int id, BarberiaDbContext db) =>
{
    var barberId = (int)http.Items["BarberId"]!;
    var img = await db.BarberPortfolioImages.FirstOrDefaultAsync(p => p.Id == id && p.BarberId == barberId);
    if (img is null) return Results.NotFound();
    db.BarberPortfolioImages.Remove(img);
    await db.SaveChangesAsync();
    return Results.NoContent();
});

barberApi.MapGet("/unavailable-rules", async (HttpContext http, BarberiaDbContext db) =>
{
    var barberId = (int)http.Items["BarberId"]!;
    var list = await db.BarberUnavailableRules.Where(r => r.BarberId == barberId).OrderBy(r => r.Id).ToListAsync();
    return Results.Ok(list);
});

barberApi.MapPost("/unavailable-rules", async (HttpContext http, CreateBarberUnavailableRuleDto dto, BarberiaDbContext db) =>
{
    var barberId = (int)http.Items["BarberId"]!;
    if (!UnavailableRuleValidation.TryValidate(dto, out var err))
        return Results.BadRequest(new { error = err });
    var rule = new BarberUnavailableRule
    {
        BarberId = barberId,
        Mode = dto.Mode,
        DayOfWeek = dto.DayOfWeek,
        Date = dto.Date,
        RangeEnd = dto.RangeEnd,
        AllDay = dto.AllDay,
        StartTimeMinutes = dto.StartTimeMinutes,
        EndTimeMinutes = dto.EndTimeMinutes
    };
    db.BarberUnavailableRules.Add(rule);
    await db.SaveChangesAsync();
    return Results.Created($"/api/barber/unavailable-rules/{rule.Id}", rule);
});

barberApi.MapDelete("/unavailable-rules/{id}", async (HttpContext http, int id, BarberiaDbContext db) =>
{
    var barberId = (int)http.Items["BarberId"]!;
    var rule = await db.BarberUnavailableRules.FirstOrDefaultAsync(r => r.Id == id && r.BarberId == barberId);
    if (rule is null) return Results.NotFound();
    db.BarberUnavailableRules.Remove(rule);
    await db.SaveChangesAsync();
    return Results.NoContent();
});

barberApi.MapPost("/upload", async (HttpRequest request) =>
{
    var form = await request.ReadFormAsync();
    var file = form.Files.FirstOrDefault();
    if (file is null || file.Length == 0)
        return Results.BadRequest(new { error = "No file provided" });
    var allowed = new[] { ".jpg", ".jpeg", ".png", ".webp", ".gif" };
    var ext = Path.GetExtension(file.FileName).ToLowerInvariant();
    if (!allowed.Contains(ext))
        return Results.BadRequest(new { error = "File type not allowed" });
    if (file.Length > 5 * 1024 * 1024)
        return Results.BadRequest(new { error = "File too large (max 5MB)" });
    var fileName = $"{Guid.NewGuid()}{ext}";
    var filePath = Path.Combine(uploadsPath, fileName);
    using var stream = new FileStream(filePath, FileMode.Create);
    await file.CopyToAsync(stream);
    return Results.Ok(new { url = $"/uploads/{fileName}" });
}).DisableAntiforgery();

// ═══════════════════════════════════════════
//  ADMIN ENDPOINTS
// ═══════════════════════════════════════════

var admin = app.MapGroup("/api/admin").AddEndpointFilter(async (ctx, next) =>
{
    var authHeader = ctx.HttpContext.Request.Headers.Authorization.FirstOrDefault();
    if (string.IsNullOrEmpty(authHeader) || !authHeader.StartsWith("Bearer "))
        return Results.Unauthorized();
    return await next(ctx);
});

// ── Admin: Dashboard Stats ──
admin.MapGet("/stats", async (BarberiaDbContext db) => Results.Ok(new
{
    totalServices = await db.Services.CountAsync(),
    totalBarbers = await db.Barbers.CountAsync(),
    totalAppointments = await db.Appointments.CountAsync(),
    pendingAppointments = await db.Appointments.CountAsync(a => a.Status == "EsperandoBarbero"),
    totalMessages = await db.ContactMessages.CountAsync(),
    unreadMessages = await db.ContactMessages.CountAsync(m => !m.IsRead),
    totalGalleryImages = await db.GalleryImages.CountAsync(g => g.IsActive)
}));

// ── Admin: Services CRUD ──
admin.MapGet("/services", async (BarberiaDbContext db) =>
    await db.Services.OrderBy(s => s.Id).ToListAsync());

admin.MapPost("/services", async (CreateServiceDto dto, BarberiaDbContext db) =>
{
    var service = new Service
    {
        Name = dto.Name, Description = dto.Description,
        Price = dto.Price, DurationMinutes = dto.DurationMinutes, Icon = dto.Icon
    };
    db.Services.Add(service);
    await db.SaveChangesAsync();
    return Results.Created($"/api/services/{service.Id}", service);
});

admin.MapPut("/services/{id}", async (int id, UpdateServiceDto dto, BarberiaDbContext db) =>
{
    var s = await db.Services.FindAsync(id);
    if (s is null) return Results.NotFound();
    s.Name = dto.Name; s.Description = dto.Description;
    s.Price = dto.Price; s.DurationMinutes = dto.DurationMinutes;
    s.Icon = dto.Icon; s.IsActive = dto.IsActive;
    await db.SaveChangesAsync();
    return Results.Ok(s);
});

admin.MapDelete("/services/{id}", async (int id, BarberiaDbContext db) =>
{
    var s = await db.Services.FindAsync(id);
    if (s is null) return Results.NotFound();
    db.Services.Remove(s);
    await db.SaveChangesAsync();
    return Results.NoContent();
});

// ── Admin: Barbers CRUD ──
admin.MapGet("/barbers", async (BarberiaDbContext db) =>
    await db.Barbers.OrderBy(b => b.Id).ToListAsync());

admin.MapPost("/barbers", async (CreateBarberDto dto, BarberiaDbContext db) =>
{
    string? hash = string.IsNullOrWhiteSpace(dto.Password) ? null : BCrypt.Net.BCrypt.HashPassword(dto.Password);
    var barber = new Barber
    {
        Name = dto.Name, Specialty = dto.Specialty,
        ImageUrl = dto.ImageUrl, Phone = dto.Phone, Email = dto.Email,
        CutDurationMinutes = dto.CutDurationMinutes,
        PasswordHash = hash
    };
    db.Barbers.Add(barber);
    await db.SaveChangesAsync();
    return Results.Created($"/api/barbers/{barber.Id}", barber);
});

admin.MapPut("/barbers/{id}", async (int id, UpdateBarberDto dto, BarberiaDbContext db) =>
{
    var b = await db.Barbers.FindAsync(id);
    if (b is null) return Results.NotFound();
    b.Name = dto.Name; b.Specialty = dto.Specialty;
    b.ImageUrl = dto.ImageUrl; b.Phone = dto.Phone;
    b.Email = dto.Email; b.CutDurationMinutes = dto.CutDurationMinutes;
    b.IsActive = dto.IsActive;
    if (!string.IsNullOrWhiteSpace(dto.Password))
        b.PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password);
    await db.SaveChangesAsync();
    return Results.Ok(b);
});

admin.MapDelete("/barbers/{id}", async (int id, BarberiaDbContext db) =>
{
    var b = await db.Barbers.FindAsync(id);
    if (b is null) return Results.NotFound();
    db.Barbers.Remove(b);
    await db.SaveChangesAsync();
    return Results.NoContent();
});

// ── Admin: Gallery CRUD ──
admin.MapGet("/gallery", async (BarberiaDbContext db) =>
    await db.GalleryImages.OrderBy(g => g.SortOrder).ToListAsync());

admin.MapPost("/gallery", async (CreateGalleryImageDto dto, BarberiaDbContext db) =>
{
    var img = new GalleryImage
    {
        Title = dto.Title, TitleEn = dto.TitleEn,
        ImageUrl = dto.ImageUrl, SortOrder = dto.SortOrder
    };
    db.GalleryImages.Add(img);
    await db.SaveChangesAsync();
    return Results.Created($"/api/gallery/{img.Id}", img);
});

admin.MapPut("/gallery/{id}", async (int id, UpdateGalleryImageDto dto, BarberiaDbContext db) =>
{
    var img = await db.GalleryImages.FindAsync(id);
    if (img is null) return Results.NotFound();
    img.Title = dto.Title; img.TitleEn = dto.TitleEn;
    img.ImageUrl = dto.ImageUrl; img.SortOrder = dto.SortOrder;
    img.IsActive = dto.IsActive;
    await db.SaveChangesAsync();
    return Results.Ok(img);
});

admin.MapDelete("/gallery/{id}", async (int id, BarberiaDbContext db) =>
{
    var img = await db.GalleryImages.FindAsync(id);
    if (img is null) return Results.NotFound();
    db.GalleryImages.Remove(img);
    await db.SaveChangesAsync();
    return Results.NoContent();
});

// ── Admin: Appointments ──
admin.MapGet("/appointments", async (BarberiaDbContext db) =>
    await db.Appointments.Include(a => a.Service).Include(a => a.Barber)
        .OrderByDescending(a => a.AppointmentDate).ToListAsync());

admin.MapPut("/appointments/{id}/status", async (int id, UpdateAppointmentStatusDto dto, BarberiaDbContext db, NotificationService notify) =>
{
    var a = await db.Appointments.Include(x => x.Service).Include(x => x.Barber).FirstOrDefaultAsync(x => x.Id == id);
    if (a is null) return Results.NotFound();
    var prev = a.Status;
    a.Status = dto.Status;
    await db.SaveChangesAsync();
    if (prev != "Confirmada"
        && dto.Status == "Confirmada"
        && a.Barber is not null
        && a.Service is not null)
        await notify.NotifyClientAppointmentConfirmedAsync(a, a.Barber, a.Service);
    return Results.Ok(a);
});

admin.MapDelete("/appointments/{id}", async (int id, BarberiaDbContext db) =>
{
    var a = await db.Appointments.FindAsync(id);
    if (a is null) return Results.NotFound();
    db.Appointments.Remove(a);
    await db.SaveChangesAsync();
    return Results.NoContent();
});

// ── Admin: File Upload ──
admin.MapPost("/upload", async (HttpRequest request) =>
{
    var form = await request.ReadFormAsync();
    var file = form.Files.FirstOrDefault();
    if (file is null || file.Length == 0)
        return Results.BadRequest(new { error = "No file provided" });

    var allowed = new[] { ".jpg", ".jpeg", ".png", ".webp", ".gif" };
    var ext = Path.GetExtension(file.FileName).ToLowerInvariant();
    if (!allowed.Contains(ext))
        return Results.BadRequest(new { error = "File type not allowed" });

    if (file.Length > 5 * 1024 * 1024)
        return Results.BadRequest(new { error = "File too large (max 5MB)" });

    var fileName = $"{Guid.NewGuid()}{ext}";
    var filePath = Path.Combine(uploadsPath, fileName);

    using var stream = new FileStream(filePath, FileMode.Create);
    await file.CopyToAsync(stream);

    var url = $"/uploads/{fileName}";
    return Results.Ok(new { url });
}).DisableAntiforgery();

// ── Admin: Messages ──
admin.MapGet("/messages", async (BarberiaDbContext db) =>
    await db.ContactMessages.OrderByDescending(m => m.CreatedAt).ToListAsync());

admin.MapPut("/messages/{id}/read", async (int id, BarberiaDbContext db) =>
{
    var m = await db.ContactMessages.FindAsync(id);
    if (m is null) return Results.NotFound();
    m.IsRead = true;
    await db.SaveChangesAsync();
    return Results.Ok(m);
});

admin.MapDelete("/messages/{id}", async (int id, BarberiaDbContext db) =>
{
    var m = await db.ContactMessages.FindAsync(id);
    if (m is null) return Results.NotFound();
    db.ContactMessages.Remove(m);
    await db.SaveChangesAsync();
    return Results.NoContent();
});

app.Run();
