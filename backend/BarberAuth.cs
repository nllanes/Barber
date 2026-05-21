using System.Security.Cryptography;
using System.Text;

namespace BarberiaAPI;

public static class BarberAuth
{
    public static string CreateToken(int barberId, IConfiguration config)
    {
        var secret = config["BarberTokenSecret"] ?? "dev-barber-secret-change-in-production";
        var exp = DateTimeOffset.UtcNow.AddDays(14).ToUnixTimeSeconds();
        var payload = $"{barberId}|{exp}";
        using var hmac = new HMACSHA256(Encoding.UTF8.GetBytes(secret));
        var sig = Convert.ToHexString(hmac.ComputeHash(Encoding.UTF8.GetBytes(payload)));
        return Convert.ToBase64String(Encoding.UTF8.GetBytes($"{payload}|{sig}"));
    }

    public static bool TryValidateToken(string? token, IConfiguration config, out int barberId)
    {
        barberId = 0;
        if (string.IsNullOrWhiteSpace(token)) return false;
        try
        {
            var decoded = Encoding.UTF8.GetString(Convert.FromBase64String(token));
            var parts = decoded.Split('|');
            if (parts.Length != 3) return false;
            barberId = int.Parse(parts[0], System.Globalization.CultureInfo.InvariantCulture);
            var exp = long.Parse(parts[1], System.Globalization.CultureInfo.InvariantCulture);
            if (DateTimeOffset.UtcNow.ToUnixTimeSeconds() > exp) return false;
            var payload = $"{parts[0]}|{parts[1]}";
            var secret = config["BarberTokenSecret"] ?? "dev-barber-secret-change-in-production";
            using var hmac = new HMACSHA256(Encoding.UTF8.GetBytes(secret));
            var expectedSig = Convert.ToHexString(hmac.ComputeHash(Encoding.UTF8.GetBytes(payload)));
            return expectedSig.Equals(parts[2], StringComparison.OrdinalIgnoreCase);
        }
        catch
        {
            return false;
        }
    }
}
