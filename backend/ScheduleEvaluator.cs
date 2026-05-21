using BarberiaAPI.Models;

namespace BarberiaAPI;

public static class ScheduleEvaluator
{
    public static bool IsAppointmentBlocked(DateTime appointmentStart, int durationMinutes, IEnumerable<BarberUnavailableRule> rules)
    {
        var appointmentEnd = appointmentStart.AddMinutes(durationMinutes);
        foreach (var r in rules)
        {
            switch (r.Mode)
            {
                case "Weekly" when r.DayOfWeek.HasValue:
                    if ((int)appointmentStart.DayOfWeek != r.DayOfWeek.Value) continue;
                    if (r.AllDay) return true;
                    if (TimeWindowOverlaps(appointmentStart, appointmentEnd, r.StartTimeMinutes, r.EndTimeMinutes))
                        return true;
                    break;
                case "SingleDate" when r.Date.HasValue:
                {
                    var d = r.Date.Value.Date;
                    if (appointmentStart.Date != d) continue;
                    if (r.AllDay) return true;
                    if (TimeWindowOverlaps(appointmentStart, appointmentEnd, r.StartTimeMinutes, r.EndTimeMinutes))
                        return true;
                    break;
                }
                case "DateRange" when r.Date.HasValue && r.RangeEnd.HasValue:
                {
                    var cur = appointmentStart.Date;
                    var start = r.Date.Value.Date;
                    var end = r.RangeEnd.Value.Date;
                    if (cur < start || cur > end) continue;
                    if (r.AllDay) return true;
                    if (TimeWindowOverlaps(appointmentStart, appointmentEnd, r.StartTimeMinutes, r.EndTimeMinutes))
                        return true;
                    break;
                }
            }
        }
        return false;
    }

    static bool TimeWindowOverlaps(DateTime aStart, DateTime aEnd, int? startMin, int? endMin)
    {
        if (!startMin.HasValue || !endMin.HasValue) return false;
        var day = aStart.Date;
        var blockStart = day.AddMinutes(startMin.Value);
        var blockEnd = day.AddMinutes(endMin.Value);
        if (blockEnd <= blockStart) return false;
        return aStart < blockEnd && blockStart < aEnd;
    }
}
