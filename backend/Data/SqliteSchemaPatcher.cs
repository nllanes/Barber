using System.Data;
using BarberiaAPI.Data;
using Microsoft.EntityFrameworkCore;

namespace BarberiaAPI;

/// <summary>
/// Actualiza bases SQLite creadas con versiones anteriores del modelo (sin borrar barberia.db).
/// </summary>
public static class SqliteSchemaPatcher
{
    public static void Apply(BarberiaDbContext db)
    {
        var provider = db.Database.ProviderName ?? "";
        if (!provider.Contains("Sqlite", StringComparison.OrdinalIgnoreCase))
            return;

        var conn = db.Database.GetDbConnection();
        var wasOpen = conn.State == ConnectionState.Open;
        if (!wasOpen) conn.Open();
        try
        {
            PatchBarbersTable(conn);
            CreateBarberPortfolioImagesTable(conn);
            CreateBarberUnavailableRulesTable(conn);
        }
        finally
        {
            if (!wasOpen) conn.Close();
        }
    }

    static void PatchBarbersTable(IDbConnection conn)
    {
        var cols = new HashSet<string>(StringComparer.OrdinalIgnoreCase);
        using (var pragma = conn.CreateCommand())
        {
            pragma.CommandText = "PRAGMA table_info(Barbers)";
            using var r = pragma.ExecuteReader();
            while (r.Read())
                cols.Add(r.GetString(1));
        }

        if (!cols.Contains("PasswordHash"))
        {
            using var cmd = conn.CreateCommand();
            cmd.CommandText = "ALTER TABLE Barbers ADD COLUMN PasswordHash TEXT NULL";
            cmd.ExecuteNonQuery();
        }

        if (!cols.Contains("CutDurationMinutes"))
        {
            using var cmd = conn.CreateCommand();
            cmd.CommandText = "ALTER TABLE Barbers ADD COLUMN CutDurationMinutes INTEGER NOT NULL DEFAULT 30";
            cmd.ExecuteNonQuery();
        }
    }

    static void CreateBarberPortfolioImagesTable(IDbConnection conn)
    {
        using var cmd = conn.CreateCommand();
        cmd.CommandText = """
            CREATE TABLE IF NOT EXISTS "BarberPortfolioImages" (
                "Id" INTEGER NOT NULL CONSTRAINT "PK_BarberPortfolioImages" PRIMARY KEY AUTOINCREMENT,
                "BarberId" INTEGER NOT NULL,
                "ImageUrl" TEXT NOT NULL,
                "Caption" TEXT NOT NULL DEFAULT '',
                "SortOrder" INTEGER NOT NULL DEFAULT 0,
                "CreatedAt" TEXT NOT NULL,
                "IsActive" INTEGER NOT NULL DEFAULT 1,
                CONSTRAINT "FK_BarberPortfolioImages_Barbers_BarberId" FOREIGN KEY ("BarberId") REFERENCES "Barbers" ("Id") ON DELETE CASCADE
            );
            """;
        cmd.ExecuteNonQuery();

        using var idx = conn.CreateCommand();
        idx.CommandText = """CREATE INDEX IF NOT EXISTS "IX_BarberPortfolioImages_BarberId" ON "BarberPortfolioImages" ("BarberId");""";
        idx.ExecuteNonQuery();
    }

    static void CreateBarberUnavailableRulesTable(IDbConnection conn)
    {
        using var cmd = conn.CreateCommand();
        cmd.CommandText = """
            CREATE TABLE IF NOT EXISTS "BarberUnavailableRules" (
                "Id" INTEGER NOT NULL CONSTRAINT "PK_BarberUnavailableRules" PRIMARY KEY AUTOINCREMENT,
                "BarberId" INTEGER NOT NULL,
                "Mode" TEXT NOT NULL,
                "DayOfWeek" INTEGER NULL,
                "Date" TEXT NULL,
                "RangeEnd" TEXT NULL,
                "AllDay" INTEGER NOT NULL DEFAULT 1,
                "StartTimeMinutes" INTEGER NULL,
                "EndTimeMinutes" INTEGER NULL,
                CONSTRAINT "FK_BarberUnavailableRules_Barbers_BarberId" FOREIGN KEY ("BarberId") REFERENCES "Barbers" ("Id") ON DELETE CASCADE
            );
            """;
        cmd.ExecuteNonQuery();

        using var idx = conn.CreateCommand();
        idx.CommandText = """CREATE INDEX IF NOT EXISTS "IX_BarberUnavailableRules_BarberId" ON "BarberUnavailableRules" ("BarberId");""";
        idx.ExecuteNonQuery();
    }
}
