import { useMemo } from "react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface Post {
  _id: string;
  title: string;
  mood?: string;
  createdAt: string;
  content?: string;
}

interface MoodColor {
  empty: string;
  light: string;
  medium: string;
  dark: string;
}

const MOOD_COLORS: Record<string, MoodColor> = {
  productive: { empty: "bg-contribution-empty", light: "bg-contribution-light/60", medium: "bg-contribution-medium/80", dark: "bg-contribution-dark" },
  focused: { empty: "bg-contribution-empty", light: "bg-contribution-light/70", medium: "bg-contribution-medium/85", dark: "bg-contribution-dark" },
  accomplished: { empty: "bg-contribution-empty", light: "bg-contribution-light/80", medium: "bg-contribution-medium/90", dark: "bg-contribution-dark" },
  reflective: { empty: "bg-contribution-empty", light: "bg-contribution-light/50", medium: "bg-contribution-medium/75", dark: "bg-contribution-dark" },
  motivated: { empty: "bg-contribution-empty", light: "bg-contribution-light/65", medium: "bg-contribution-medium/82", dark: "bg-contribution-dark" },
  peaceful: { empty: "bg-contribution-empty", light: "bg-contribution-light/55", medium: "bg-contribution-medium/78", dark: "bg-contribution-dark" },
  energetic: { empty: "bg-contribution-empty", light: "bg-contribution-light/75", medium: "bg-contribution-medium/88", dark: "bg-contribution-dark" },
  creative: { empty: "bg-contribution-empty", light: "bg-contribution-light/68", medium: "bg-contribution-medium/83", dark: "bg-contribution-dark" },
  testing: { empty: "bg-contribution-empty", light: "bg-contribution-light/40", medium: "bg-contribution-medium/70", dark: "bg-contribution-dark" },
  default: { empty: "bg-contribution-empty", light: "bg-contribution-light/45", medium: "bg-contribution-medium/72", dark: "bg-contribution-dark" },
};

const getColorByMood = (mood?: string): MoodColor => {
  if (!mood) return MOOD_COLORS.default;
  const normalizedMood = mood.toLowerCase().trim();
  return MOOD_COLORS[normalizedMood] || MOOD_COLORS.default;
};

const getIntensity = (count: number): "light" | "medium" | "dark" | "empty" => {
  if (count === 0) return "empty";
  if (count === 1) return "light";
  if (count === 2) return "medium";
  return "dark";
};

const ContributionCalendar = ({ posts }: { posts: Post[] }) => {
  const calendarData = useMemo(() => {
    // Group posts by date and mood
    const dateMap = new Map<string, { count: number; moods: string[] }>();

    posts.forEach((post) => {
      const date = new Date(post.createdAt);
      const dateKey = date.toISOString().split("T")[0]; // YYYY-MM-DD

      if (!dateMap.has(dateKey)) {
        dateMap.set(dateKey, { count: 0, moods: [] });
      }

      const entry = dateMap.get(dateKey)!;
      entry.count += 1;
      if (post.mood) {
        entry.moods.push(post.mood);
      }
    });

    // Generate calendar for last 12 months
    const today = new Date();
    const startDate = new Date(today);
    startDate.setFullYear(today.getFullYear() - 1);

    const weeks: Array<Array<{ date: Date; count: number; moods: string[] }>> = [];
    let currentWeek: Array<{ date: Date; count: number; moods: string[] }> = [];

    // Fill initial empty days
    const startDayOfWeek = startDate.getDay();
    for (let i = 0; i < startDayOfWeek; i++) {
      currentWeek.push({ date: new Date(0), count: 0, moods: [] });
    }

    // Fill calendar
    const currentDate = new Date(startDate);
    while (currentDate <= today) {
      const dateKey = currentDate.toISOString().split("T")[0];
      const data = dateMap.get(dateKey) || { count: 0, moods: [] };

      currentWeek.push({
        date: new Date(currentDate),
        count: data.count,
        moods: data.moods,
      });

      if (currentWeek.length === 7) {
        weeks.push(currentWeek);
        currentWeek = [];
      }

      currentDate.setDate(currentDate.getDate() + 1);
    }

    if (currentWeek.length > 0) {
      weeks.push(currentWeek);
    }

    return weeks;
  }, [posts]);

  const dayLabels = ["Mon", "Wed", "Fri"];
  const monthLabels = useMemo(() => {
    const labels: Array<{ month: string; weekIndex: number }> = [];
    let lastMonth = -1;

    calendarData.forEach((week, weekIndex) => {
      const firstValidDay = week.find((day) => day.date.getTime() !== 0);
      if (firstValidDay) {
        const month = firstValidDay.date.getMonth();
        if (month !== lastMonth) {
          labels.push({
            month: firstValidDay.date.toLocaleDateString("en-US", { month: "short" }),
            weekIndex,
          });
          lastMonth = month;
        }
      }
    });

    return labels;
  }, [calendarData]);

  const getDominantMood = (moods: string[]): string | undefined => {
    if (moods.length === 0) return undefined;
    const moodCount = moods.reduce(
      (acc, mood) => {
        acc[mood] = (acc[mood] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );
    return Object.entries(moodCount).sort(([, a], [, b]) => b - a)[0][0];
  };

  return (
    <div className="w-full py-8">
      <div className="mb-6">
        <h2 className="text-sm font-semibold text-foreground mb-2">Year Contributions</h2>
        <p className="text-xs text-muted-foreground">
          {posts.length} posts · Color intensity shows daily activity · Colors match your mood
        </p>
      </div>

      <div className="overflow-x-auto">
        <div className="inline-block min-w-max">
          {/* Month labels */}
          <div className="flex mb-2 pl-8">
            {monthLabels.map((label, idx) => (
              <div
                key={idx}
                style={{ marginLeft: label.weekIndex > 0 ? "13px" : "0px" }}
                className="text-xs text-muted-foreground flex-shrink-0 w-12"
              >
                {label.weekIndex > 0 ? label.month : ""}
              </div>
            ))}
          </div>

          {/* Calendar grid */}
          <div className="flex gap-1">
            {/* Day labels */}
            <div className="flex flex-col gap-1 pr-3">
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day, idx) => (
                <div
                  key={idx}
                  className="w-3 h-3 text-xs text-muted-foreground text-right leading-3"
                >
                  {day.substring(0, 1)}
                </div>
              ))}
            </div>

            {/* Weeks */}
            <div className="flex gap-1">
              {calendarData.map((week, weekIdx) => (
                <div key={weekIdx} className="flex flex-col gap-1">
                  {week.map((day, dayIdx) => {
                    const isValid = day.date.getTime() !== 0;
                    const dominantMood = getDominantMood(day.moods);
                    const colors = getColorByMood(dominantMood);
                    const intensity = getIntensity(day.count);

                    let bgColor = "bg-secondary/20";
                    if (isValid) {
                      if (intensity === "light") bgColor = colors.light;
                      else if (intensity === "medium") bgColor = colors.medium;
                      else if (intensity === "dark") bgColor = colors.dark;
                    }

                    return (
                      <TooltipProvider key={dayIdx}>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div
                              className={`w-3 h-3 rounded-sm cursor-pointer transition-all hover:ring-1 hover:ring-offset-1 hover:ring-primary ${bgColor}`}
                            />
                          </TooltipTrigger>
                          {isValid && (
                            <TooltipContent side="top" className="text-xs">
                              <div>
                                {day.date.toLocaleDateString("en-US", {
                                  weekday: "short",
                                  month: "short",
                                  day: "numeric",
                                })}
                              </div>
                              <div>{day.count} post{day.count !== 1 ? "s" : ""}</div>
                              {dominantMood && <div className="capitalize">{dominantMood}</div>}
                            </TooltipContent>
                          )}
                        </Tooltip>
                      </TooltipProvider>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="mt-6 flex items-center gap-4 text-xs text-muted-foreground">
        <span>Less</span>
        <div className="flex gap-1">
          <div className="w-3 h-3 rounded-sm bg-contribution-empty" />
          <div className="w-3 h-3 rounded-sm bg-contribution-light/60" />
          <div className="w-3 h-3 rounded-sm bg-contribution-medium/80" />
          <div className="w-3 h-3 rounded-sm bg-contribution-dark" />
        </div>
        <span>More</span>
      </div>
    </div>
  );
};

export default ContributionCalendar;
