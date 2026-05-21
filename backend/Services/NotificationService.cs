using System.Net.Http.Headers;
using System.Text;
using BarberiaAPI.Models;
using MailKit.Net.Smtp;
using MailKit.Security;
using MimeKit;

namespace BarberiaAPI.Services;

public class NotificationService(
    IConfiguration config,
    ILogger<NotificationService> logger,
    IHttpClientFactory httpClientFactory)
{
    public async Task NotifyBarberNewAppointmentAsync(Appointment appointment, Barber barber, Service service, CancellationToken ct = default)
    {
        var baseUrl = (config["PublicAppUrl"] ?? "http://localhost:4200").TrimEnd('/');
        var portalUrl = $"{baseUrl}/barber/login";

        var when = appointment.AppointmentDate.ToString("dd/MM/yyyy HH:mm", System.Globalization.CultureInfo.InvariantCulture);
        var emailBody = $"""
            Hola {barber.Name},

            Tienes una nueva solicitud de cita pendiente de aprobación.

            Cliente: {appointment.ClientName}
            Teléfono: {appointment.ClientPhone}
            Email: {appointment.ClientEmail}
            Servicio: {service.Name}
            Fecha y hora: {when}

            Entra a tu panel de barbero para aceptar o rechazar la cita:
            {portalUrl}

            Mientras no respondas, ese horario quedará reservado.
            """;

        var smsBody = $"Barbería: nueva cita de {appointment.ClientName} el {when}. Servicio: {service.Name}. Entra en {portalUrl} para aceptar o rechazar.";

        try
        {
            await SendEmailIfConfiguredAsync(barber.Email, $"Nueva cita pendiente — {appointment.ClientName}", emailBody, ct);
        }
        catch (Exception ex)
        {
            logger.LogWarning(ex, "No se pudo enviar el email al barbero {BarberId}", barber.Id);
        }

        try
        {
            await SendSmsIfConfiguredAsync(barber.Phone, smsBody, ct);
        }
        catch (Exception ex)
        {
            logger.LogWarning(ex, "No se pudo enviar SMS al barbero {BarberId}", barber.Id);
        }
    }

    /// <summary>Correo al cliente tras enviar la solicitud (aún pendiente del barbero).</summary>
    public async Task NotifyClientBookingReceivedAsync(Appointment appointment, Barber barber, Service service, CancellationToken ct = default)
    {
        if (string.IsNullOrWhiteSpace(appointment.ClientEmail))
        {
            logger.LogWarning("Correo al cliente no enviado: ClientEmail vacío (cita Id {AppointmentId})", appointment.Id);
            return;
        }

        var baseUrl = (config["PublicAppUrl"] ?? "http://localhost:4200").TrimEnd('/');
        var when = appointment.AppointmentDate.ToString("dd/MM/yyyy HH:mm", System.Globalization.CultureInfo.InvariantCulture);
        var body = $"""
            Hola {appointment.ClientName},

            Hemos recibido tu solicitud de cita.

            Barbero: {barber.Name}
            Servicio: {service.Name}
            Fecha y hora solicitada: {when}

            Estado actual: pendiente de confirmación por parte del barbero. Cuando la acepte, recibirás otro correo de confirmación.

            Tus datos de contacto registrados:
            Teléfono: {appointment.ClientPhone}
            Email: {appointment.ClientEmail}

            Sitio web: {baseUrl}

            Si no solicitaste esta cita, puedes ignorar este mensaje.
            """;

        try
        {
            await SendEmailIfConfiguredAsync(
                appointment.ClientEmail,
                $"Solicitud de cita recibida — {when}",
                body,
                ct);
        }
        catch (Exception ex)
        {
            logger.LogWarning(ex, "No se pudo enviar el correo de solicitud al cliente (cita {AppointmentId})", appointment.Id);
        }
    }

    /// <summary>Correo al cliente cuando la cita queda confirmada.</summary>
    public async Task NotifyClientAppointmentConfirmedAsync(Appointment appointment, Barber barber, Service service, CancellationToken ct = default)
    {
        if (string.IsNullOrWhiteSpace(appointment.ClientEmail))
        {
            logger.LogWarning("Correo de confirmación no enviado: ClientEmail vacío (cita Id {AppointmentId})", appointment.Id);
            return;
        }

        var baseUrl = (config["PublicAppUrl"] ?? "http://localhost:4200").TrimEnd('/');
        var when = appointment.AppointmentDate.ToString("dd/MM/yyyy HH:mm", System.Globalization.CultureInfo.InvariantCulture);
        var body = $"""
            Hola {appointment.ClientName},

            Tu cita ha sido confirmada.

            Barbero: {barber.Name}
            Servicio: {service.Name}
            Fecha y hora: {when}

            Te esperamos. Para cualquier cambio, contacta con la barbería usando los datos del sitio:
            {baseUrl}

            ¡Gracias por tu preferencia!
            """;

        try
        {
            await SendEmailIfConfiguredAsync(
                appointment.ClientEmail,
                $"Cita confirmada — {when}",
                body,
                ct);
        }
        catch (Exception ex)
        {
            logger.LogWarning(ex, "No se pudo enviar el correo de confirmación al cliente (cita {AppointmentId})", appointment.Id);
        }
    }

    private static string NormalizeConfig(string? value)
        => string.IsNullOrEmpty(value)
            ? string.Empty
            : value.Trim().TrimStart('\uFEFF');

    /// <summary>E.164 aproximado: quita espacios y caracteres típicos para que Twilio lo acepte.</summary>
    private static string NormalizePhoneForSms(string raw)
    {
        var s = NormalizeConfig(raw).Replace(" ", "", StringComparison.Ordinal)
            .Replace("-", "", StringComparison.Ordinal).Replace("(", "", StringComparison.Ordinal)
            .Replace(")", "", StringComparison.Ordinal);
        return string.IsNullOrEmpty(s) ? string.Empty : s;
    }

    private async Task SendEmailIfConfiguredAsync(string to, string subject, string body, CancellationToken ct)
    {
        var host = NormalizeConfig(config["Smtp:Host"]);
        var user = NormalizeConfig(config["Smtp:User"]);
        var pass = NormalizeConfig(config["Smtp:Password"]);
        var from = NormalizeConfig(config["Smtp:FromEmail"]);
        to = NormalizeConfig(to);
        if (string.IsNullOrWhiteSpace(host) || string.IsNullOrWhiteSpace(from))
        {
            logger.LogWarning(
                "Correo no enviado: falta Smtp:Host o Smtp:FromEmail en configuración. " +
                "Configura SMTP para envío real (p. ej. Mailpit en desarrollo o un proveedor en producción).");
            return;
        }

        if (string.IsNullOrWhiteSpace(to))
        {
            logger.LogWarning("Correo no enviado: dirección de destinatario vacía.");
            return;
        }

        var port = config.GetValue("Smtp:Port", 587);
        var useSsl = config.GetValue("Smtp:UseSsl", true);
        // Mailpit / dev sin TLS: UseSsl false → sin cifrado (puerto típico 1025).
        // Producción 587: UseSsl true → STARTTLS.
        var socketOptions = useSsl ? SecureSocketOptions.StartTls : SecureSocketOptions.None;

        var message = new MimeMessage();
        message.From.Add(MailboxAddress.Parse(from));
        message.To.Add(MailboxAddress.Parse(to));
        message.Subject = subject;
        message.Body = new TextPart("plain") { Text = body };

        logger.LogInformation("SMTP intentando conexión a {Host}:{Port} (UseSsl={UseSsl})", host, port, useSsl);

        using var client = new SmtpClient();
        await client.ConnectAsync(host, port, socketOptions, ct);
        if (!string.IsNullOrEmpty(user) && !string.IsNullOrEmpty(pass))
            await client.AuthenticateAsync(user, pass, ct);
        await client.SendAsync(message, ct);
        await client.DisconnectAsync(true, ct);
        logger.LogInformation(
            "Correo SMTP enviado correctamente (asunto: {Subject}, destinatario terminado en {Domain})",
            subject,
            to.Contains('@', StringComparison.Ordinal) ? to[(to.LastIndexOf('@'))..] : "?");
    }

    private async Task SendSmsIfConfiguredAsync(string toPhone, string body, CancellationToken ct)
    {
        var sid = NormalizeConfig(config["Twilio:AccountSid"]);
        var token = NormalizeConfig(config["Twilio:AuthToken"]);
        var from = NormalizePhoneForSms(NormalizeConfig(config["Twilio:FromNumber"]));
        var to = NormalizePhoneForSms(toPhone);
        if (string.IsNullOrWhiteSpace(sid) || string.IsNullOrWhiteSpace(token) || string.IsNullOrWhiteSpace(from) || string.IsNullOrWhiteSpace(to))
        {
            logger.LogWarning(
                "SMS al barbero no enviado: Twilio no configurado (AccountSid/AuthToken/FromNumber) o teléfono del barbero vacío.");
            return;
        }

        if (!to.StartsWith('+'))
            logger.LogWarning(
                "Teléfono destino `{ToMasked}` sin prefijo internacional +. Twilio espera E.164 (ej. +18095551234).",
                MaskPhone(to));

        var client = httpClientFactory.CreateClient();
        var url = $"https://api.twilio.com/2010-04-01/Accounts/{sid}/Messages.json";
        var auth = Convert.ToBase64String(Encoding.ASCII.GetBytes($"{sid}:{token}"));
        var content = new FormUrlEncodedContent(new Dictionary<string, string>
        {
            ["To"] = to,
            ["From"] = from,
            ["Body"] = body.Length > 1500 ? body[..1500] : body
        });
        var request = new HttpRequestMessage(HttpMethod.Post, url) { Content = content };
        request.Headers.Authorization = new AuthenticationHeaderValue("Basic", auth);

        logger.LogInformation("SMS Twilio: enviando a {MaskedTo} desde número Twilio configurado.", MaskPhone(to));
        var response = await client.SendAsync(request, ct);
        if (!response.IsSuccessStatusCode)
        {
            var err = await response.Content.ReadAsStringAsync(ct);
            logger.LogWarning("Twilio error: {Status} {Body}", response.StatusCode, err);
            return;
        }

        logger.LogInformation("SMS Twilio enviado correctamente.");
    }

    private static string MaskPhone(string digitsOrE164)
    {
        if (string.IsNullOrEmpty(digitsOrE164) || digitsOrE164.Length <= 4) return "***";
        return "***" + digitsOrE164[^4..];
    }
}
