namespace BarberiaAPI;

public static class AppointmentScheduling
{
    /// <summary>Estados que ya no ocupan agenda (EF puede traducir consultas con !Contains).</summary>
    public static readonly string[] NonBlockingStatuses = ["Rechazada", "Cancelada", "Completada"];

    public static bool BlocksTimeSlot(string status) =>
        !NonBlockingStatuses.Contains(status);
}
