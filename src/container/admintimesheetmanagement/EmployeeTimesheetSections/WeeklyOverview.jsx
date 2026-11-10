import { useMemo, useRef, useState } from "react";

export default function WeeklyOverview({
  calendarDays,
  timesheet,
  year,
  month,
  monthLabel,
  isFinalized,
  handleDayClick,
  formatHours,
  resetKey,
}) {
  const [selectedWeek, setSelectedWeek] = useState(null);
  const [previousResetKey, setPreviousResetKey] = useState(resetKey);
  const [previousIsFinalized, setPreviousIsFinalized] = useState(isFinalized);
  const weekDetailRefs = useRef({});

  // Reset selection when the parent resets the view or finalizes the month.
  if (resetKey !== previousResetKey || isFinalized !== previousIsFinalized) {
    const shouldResetSelectedWeek =
      resetKey !== previousResetKey || (isFinalized && !previousIsFinalized);

    setPreviousResetKey(resetKey);
    setPreviousIsFinalized(isFinalized);

    if (shouldResetSelectedWeek) {
      setSelectedWeek(null);
    }
  }

  // Build weekly overview data.
  const weeklyData = useMemo(() => {
    const weeks = [];

    for (let weekIndex = 0; weekIndex < 5; weekIndex++) {
      const weekDays = calendarDays
        .slice(weekIndex * 7, (weekIndex + 1) * 7)
        .filter(Boolean);

      const items = weekDays.map((day) => ({
        day,
        data: timesheet[day],
      }));

      const totalHours = Math.round(
        (items.reduce(
          (sum, { data }) => sum + Number(data?.hours || 0),
          0
        ) + Number.EPSILON) *
          100
      ) / 100;

      const unloggedDays = items.filter(
        ({ data }) => data?.status === "unlogged"
      );

      weeks.push({
        week: weekIndex + 1,
        items,
        totalHours,
        unloggedDays,
      });
    }

    return weeks;
  }, [calendarDays, timesheet]);

  const allUnloggedDays = useMemo(
    () =>
      Array.isArray(weeklyData)
        ? weeklyData.flatMap((week) =>
            week.unloggedDays.map(({ day }) => ({ week: week.week, day }))
          )
        : [],
    [weeklyData]
  );

  const handleWeekClick = (weekNumber) => {
    if (isFinalized) return;

    const isSelected = selectedWeek === weekNumber;
    setSelectedWeek(isSelected ? null : weekNumber);

    if (!isSelected) {
      requestAnimationFrame(() => {
        requestAnimationFrame(() =>
          weekDetailRefs.current[weekNumber]?.scrollIntoView({ behavior: "smooth", block: "center", inline: "nearest" })
        );
      });
    }
  };

  return (
    <section className="mt-4 mb-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">
            Weekly Overview
          </p>
          <h2 className="mt-1 text-base font-semibold text-slate-900">
            {monthLabel} by week
          </h2>
        </div>

        {selectedWeek !== null && (
          <button
            type="button"
            onClick={() => setSelectedWeek(null)}
            className="self-start rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 transition hover:bg-slate-50 sm:self-auto"
          >
            Close Week
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {weeklyData.map((week) => {
          const isSelected = selectedWeek === week.week;
          const approvedCount = week.items.filter(
            ({ data }) => data?.status === "approved"
          ).length;
          const pendingCount = week.items.filter(
            ({ data }) => data?.status === "pending"
          ).length;
          const rejectedCount = week.items.filter(
            ({ data }) => data?.status === "rejected"
          ).length;
          const firstDay = week.items[0]?.day;
          const lastDay = week.items[week.items.length - 1]?.day;

          return (
            <button
              key={week.week}
              type="button"
              disabled={isFinalized}
              onClick={() => handleWeekClick(week.week)}
              className={`min-h-[145px] rounded-2xl border p-4 text-left transition-all duration-200 ${
                isSelected
                  ? "border-emerald-300 bg-emerald-50 shadow-md"
                  : "border-slate-200 bg-white hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md"
              } ${isFinalized ? "cursor-not-allowed opacity-60" : ""}`}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-slate-900">
                    Week {week.week}
                  </p>
                  <p className="mt-1 text-[11px] text-slate-500">
                    {firstDay
                      ? new Date(year, month, firstDay).toLocaleDateString(
                          "en-US",
                          { month: "short", day: "numeric" }
                        )
                      : ""}
                    {firstDay && lastDay ? " – " : ""}
                    {lastDay
                      ? new Date(year, month, lastDay).toLocaleDateString(
                          "en-US",
                          { month: "short", day: "numeric" }
                        )
                      : ""}
                  </p>
                </div>

                <div className="text-right">
                  <p className="text-lg font-bold text-slate-900">
                    {formatHours(week.totalHours)}h
                  </p>
                  <p className="text-[10px] text-slate-400">logged</p>
                </div>
              </div>

              <div className="mt-5 flex flex-wrap gap-2">
                {approvedCount > 0 && (
                  <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-semibold text-emerald-700">
                    {approvedCount} Approved
                  </span>
                )}
                {pendingCount > 0 && (
                  <span className="rounded-full bg-amber-50 px-2.5 py-1 text-[10px] font-semibold text-amber-700">
                    {pendingCount} Pending
                  </span>
                )}
                {rejectedCount > 0 && (
                  <span className="rounded-full bg-red-50 px-2.5 py-1 text-[10px] font-semibold text-red-700">
                    {rejectedCount} Rejected
                  </span>
                )}
              </div>

              <div className="mt-4 border-t border-slate-100 pt-3 text-[10px] font-medium text-slate-400">
                Click to view week details
              </div>
            </button>
          );
        })}
      </div>

      {selectedWeek !== null && (
        <div className="mt-4 grid gap-4 lg:grid-cols-[minmax(0,1fr)_280px]">
          <div
            ref={(element) => {
              weekDetailRefs.current[selectedWeek] = element;
            }}
            className="rounded-xl border border-slate-200 bg-slate-50/70 p-3"
          >
            {(() => {
              const week = weeklyData.find(
                (item) => item.week === selectedWeek
              );

              if (!week) return null;

              return (
                <>
                  <div className="mb-3 flex items-center justify-between gap-2">
                    <div>
                      <h3 className="text-sm font-semibold text-slate-900">
                        Week {week.week} Details
                      </h3>
                      <p className="mt-0.5 text-[11px] text-slate-500">
                        Only days belonging to Week {week.week} are shown here.
                      </p>
                    </div>
                    <span className="rounded-full bg-white px-2.5 py-1 text-[10px] font-medium text-slate-500 shadow-sm">
                      {formatHours(week.totalHours)}h total
                    </span>
                  </div>

                  <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
                    {week.items.map(({ day, data }) => {
                      const date = new Date(year, month, day);
                      const dayName = date.toLocaleDateString("en-US", {
                        weekday: "short",
                      });

                      const isLocked =
                        isFinalized ||
                        data?.status === "weekend" ||
                        data?.status === "holiday" ||
                        data?.status === "leave";

                      const config = {
                        approved: { label: "Approved", dotClass: "bg-emerald-500" },
                        submitted: { label: "Submitted", dotClass: "bg-amber-400" },
                        pending: { label: "Submitted", dotClass: "bg-amber-400" },
                        rejected: { label: "Rejected", dotClass: "bg-red-500" },
                        unlogged: { label: "Unlogged", dotClass: "bg-slate-400" },
                        leave: { label: "Leave", dotClass: "bg-sky-500" },
                        holiday: { label: "Public Holiday", dotClass: "bg-violet-500" },
                        weekend: { label: "Weekend", dotClass: "bg-slate-400" },
                      }[data?.status] || {
                        label: "Unlogged",
                        dotClass: "bg-slate-400",
                      };

                      return (
                        <div
                          key={day}
                          className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white p-3"
                        >
                          <div className="min-w-0">
                            <p className="text-xs font-semibold text-slate-800">
                              {dayName},{" "}
                              {date.toLocaleDateString("en-US", {
                                month: "short",
                                day: "numeric",
                              })}
                            </p>

                            <div className="mt-1 flex items-center gap-2">
                              <span
                                className={`h-1.5 w-1.5 rounded-full ${config.dotClass}`}
                              />
                              <span className="truncate text-[11px] text-slate-500">
                                {data?.status === "holiday"
                                  ? data.holidayName || "Public Holiday"
                                  : data?.status === "weekend"
                                  ? data.weekendName || "Weekend"
                                  : data?.status === "leave"
                                  ? data.leaveType || "Leave"
                                  : config.label}
                              </span>
                            </div>
                          </div>

                          <div className="flex shrink-0 flex-col items-end gap-1.5">
                            <span className="text-xs font-semibold text-slate-700">
                              {formatHours(data?.hours || 0)}h
                            </span>

                            <button
                              type="button"
                              disabled={isLocked}
                              onClick={() => handleDayClick(day)}
                              className="rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-[10px] font-semibold text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400"
                            >
                              {data?.status === "unlogged"
                                ? "Open"
                                : isLocked
                                ? "View"
                                : "Edit"}
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </>
              );
            })()}
          </div>

          <aside className="rounded-xl border border-slate-200 bg-white p-3">
            <div className="mb-3 flex items-center justify-between gap-2">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">
                  Unlogged Days
                </p>
                <h3 className="mt-1 text-sm font-semibold text-slate-900">
                  Missing entries
                </h3>
              </div>

              <span className="rounded-full bg-slate-100 px-2 py-1 text-[10px] font-semibold text-slate-600">
                {allUnloggedDays.length}
              </span>
            </div>

            {allUnloggedDays.length === 0 ? (
              <div className="rounded-lg border border-dashed border-slate-200 bg-slate-50 p-3 text-center text-[11px] text-slate-500">
                No unlogged days
              </div>
            ) : (
              <div className="space-y-2">
                {allUnloggedDays.map(({ week, day }) => (
                  <button
                    key={`${week}-${day}`}
                    type="button"
                    onClick={() => handleDayClick(day)}
                    disabled={isFinalized}
                    className="flex w-full cursor-pointer items-center justify-between rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-left transition hover:border-slate-300 hover:bg-white disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <span>
                      <span className="block text-xs font-semibold text-slate-800">
                        {new Date(year, month, day).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                        })}
                      </span>
                      <span className="mt-0.5 block text-[10px] text-slate-500">
                        Week {week}
                      </span>
                    </span>

                    <span className="text-[10px] font-semibold text-slate-500">
                      Open →
                    </span>
                  </button>
                ))}
              </div>
            )}
          </aside>
        </div>
      )}
    </section>
  );
}
