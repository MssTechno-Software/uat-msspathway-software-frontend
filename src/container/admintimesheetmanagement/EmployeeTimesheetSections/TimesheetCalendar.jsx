import { ChevronLeft, ChevronRight, Copy, Lock } from "lucide-react";

/* =========================================================
   CALENDAR (header, grid, legend, month total)
========================================================= */

export default function TimesheetCalendar({
  monthLabel,
  isFinalized,
  handleOpenCopyEffort,
  canCopyThisEffort,
  changeMonth,
  isLoading,
  calendarDays,
  timesheet,
  STATUS_CONFIG,
  FINALIZED_DAY_CLASS,
  selectedDay,
  year,
  month,
  isTodayDate,
  getDateForDay,
  handleDayClick,
  calendarDayRefs,
  formatHours,
  displayTotalHours,
  targetHours,
  progressPercentFromApi,
}) {
  return (
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">

              {/* HEADER */}

              <div className="mb-3 flex items-center justify-between">

                <div>
                  <h2 className="text-xl font-semibold text-slate-900">
                    {monthLabel}
                  </h2>

                  <p className="mt-1 text-xs text-slate-500">
                    {isFinalized
                      ? "This month has been finalized and is read-only."
                      : "Click a day to view or edit timesheet details."}
                  </p>
                </div>

                <div className="flex items-center gap-2">

                  <button
                    type="button"
                    onClick={handleOpenCopyEffort}
                    disabled={!canCopyThisEffort}
                    title={
                      canCopyThisEffort
                        ? "Copy this approved day's effort to unlogged days"
                        : "Select an approved day with project details first"
                    }
                    className="inline-flex h-9 items-center justify-center gap-1.5 rounded-lg border border-emerald-200 bg-emerald-50 px-3 text-xs font-semibold text-emerald-700 transition hover:border-emerald-300 hover:bg-emerald-100 disabled:cursor-not-allowed disabled:border-slate-200 disabled:bg-slate-100 disabled:text-slate-400"
                  >
                    <Copy size={14} />
                    Copy This Effort
                  </button>

                  <button
                    type="button"
                    onClick={() => changeMonth(-1)}
                    disabled={isLoading}
                    className="flex cursor-pointer h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                    aria-label="Previous month"
                  >
                    <ChevronLeft size={18} />
                  </button>

                  <button
                    type="button"
                    onClick={() => changeMonth(1)}
                    disabled={isLoading}
                    className="flex cursor-pointer h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                    aria-label="Next month"
                  >
                    <ChevronRight size={18} />
                  </button>

                </div>
              </div>

              {/* WEEK DAYS */}

              <div className="mb-1 grid w-full grid-cols-7 gap-0.5 sm:gap-1.5">

                {[
                  "MON",
                  "TUE",
                  "WED",
                  "THU",
                  "FRI",
                  "SAT",
                  "SUN",
                ].map((day) => (
                  <div
                    key={day}
                    className="min-w-0 py-1.5 text-center text-[8px] font-medium tracking-normal text-slate-400 sm:text-[10px] sm:tracking-wide"
                  >
                    {day}
                  </div>
                ))}

              </div>

              {/* CALENDAR */}

              <div className="grid w-full grid-cols-7 gap-0.5 sm:gap-1.5">

                {calendarDays.map((day, index) => {

                  if (!day) {
                    return (
                      <div
                        key={`empty-${index}`}
                        className="min-h-[58px] sm:min-h-[72px]"
                      />
                    );
                  }

                  const data = timesheet[day];

                  const config =
                    STATUS_CONFIG[data?.status] ||
                    STATUS_CONFIG.unlogged;

                  const isSelected =
                    selectedDay === day;

                  // Highlight today only when no other day is selected
                  const isToday =
                    isTodayDate(getDateForDay(year, month, day));

                  const showTodayHighlight =
                    isToday && (selectedDay === null || selectedDay === day);

                  return (
                    <button
                      key={day}
                      ref={(element) => {
                        calendarDayRefs.current[day] = element;
                      }}
                      type="button"
                      onClick={() => handleDayClick(day)}
                      className={`relative flex min-h-[58px] cursor-pointer min-w-0 w-full flex-col items-center justify-between rounded-lg border p-1 text-center transition-all sm:min-h-[72px] sm:p-2 ${isFinalized
                          ? `${FINALIZED_DAY_CLASS} cursor-default`
                          : config.dayClass
                        } ${showTodayHighlight && !isFinalized
                          ? "ring-2 ring-emerald-500/80 ring-inset"
                          : ""
                        } ${isSelected && !isFinalized && !isToday
                          ? "ring-2 ring-slate-900 ring-offset-1"
                          : ""
                        }`}
                    >

                      {/* STATUS DOT */}

                      <div className="flex w-full justify-end">

                        {!isFinalized ? (
                          <span
                            className={`h-2 w-2 rounded-full ${config.dotClass}`}
                          />
                        ) : (
                          <Lock
                            size={12}
                            className="text-slate-400"
                          />
                        )}

                      </div>

                      {/* DAY */}

                      <div>

                        <p
                          className={`text-[12px] font-semibold leading-none sm:text-sm ${isFinalized ? "text-slate-400" : "text-slate-800"}`}
                        >
                          {day}
                        </p>

                        {data?.status === "holiday" ? (
                          <div className="mt-1">
                            <p
                              className={`text-[7px] font-medium leading-[9px] sm:text-[10px] sm:leading-normal ${isFinalized ? "text-slate-400" : "text-violet-600"}`}
                            >
                              Public Holiday
                            </p>
                            {!isFinalized && data?.holidayName && (
                              <p className="mt-0.5 max-w-full break-words text-[7px] font-medium leading-[8px] text-violet-500 sm:max-w-[90px] sm:truncate sm:text-[9px] sm:leading-normal">
                                {data.holidayName}
                              </p>
                            )}
                          </div>
                        ) : data?.status === "weekend" ? (
                          <p
                            className={`mt-1 max-w-full text-[7px] font-medium leading-[9px] sm:text-[10px] sm:leading-normal ${isFinalized ? "text-slate-400" : "text-slate-500"}`}
                          >
                            Weekend
                          </p>
                        ) : data?.status === "leave" ? (
                          <p
                            className={`mt-1 max-w-full text-[7px] font-medium leading-[9px] sm:text-[10px] sm:leading-normal ${isFinalized ? "text-slate-400" : "text-sky-600"}`}
                          >
                            Leave
                          </p>
                        ) : (
                          <p
                            className={`mt-1 max-w-full text-[7px] font-medium leading-[9px] sm:text-[10px] sm:leading-normal ${isFinalized ? "text-slate-400" : "text-slate-600"}`}
                          >
                            {formatHours(data?.hours || 0)}h
                          </p>
                        )}

                      </div>

                      {/* STATUS */}

                      {data?.status !== "holiday" &&
                        data?.status !== "weekend" && (
                          <span
                            className={`max-w-full text-[7px] font-medium leading-[9px] break-words sm:text-[9px] sm:leading-normal ${isFinalized ? "text-slate-400" : config.cardClass.split(" ").find((x) => x.startsWith("text-")) || "text-slate-500"}`}
                          >
                            {isFinalized ? "Finalized" : config.shortLabel}
                          </span>
                        )}
                    </button>
                  );
                })}
              </div>

              {/* =================================================
                LEGEND
            ================================================= */}

              <div className="mt-4 border-t border-slate-200 pt-3">

                <div className="flex flex-wrap gap-x-5 gap-y-3">

                  <LegendItem
                    label="Approved"
                    color="bg-emerald-500"
                    finalized={isFinalized}
                  />

                  <LegendItem
                    label="Submitted"
                    color="bg-amber-400"
                    finalized={isFinalized}
                  />

                  <LegendItem
                    label="Rejected"
                    color="bg-red-500"
                    finalized={isFinalized}
                  />

                  <LegendItem
                    label="Unlogged"
                    color="bg-slate-400"
                    finalized={isFinalized}
                  />

                  <LegendItem
                    label="Leave"
                    color="bg-sky-500"
                    finalized={isFinalized}
                  />

                  <LegendItem
                    label="Public Holiday"
                    color="bg-violet-500"
                    finalized={isFinalized}
                  />

                  <LegendItem
                    label="Weekend"
                    color="bg-slate-400"
                    finalized={isFinalized}
                  />

                </div>
              </div>

              {/* MONTH TOTAL */}

              <div className="mt-3 flex flex-col gap-2 border-t border-slate-200 pt-3 sm:flex-row sm:items-center sm:justify-between">

                <div>
                  <p className="text-xs text-slate-500">
                    Monthly Hours
                  </p>

                  <p className="mt-1 text-xl font-semibold text-slate-900">
                    {formatHours(displayTotalHours)}h

                    <span className="ml-1 text-sm font-normal text-slate-400">
                      / {formatHours(targetHours)}h
                    </span>
                  </p>
                </div>

                <div className="w-full max-w-[280px]">

                  <div className="mb-1 flex justify-between text-[11px] text-slate-500">
                    <span>Monthly Progress</span>

                    <span>
                      {progressPercentFromApi ||
                        Math.round(
                          (displayTotalHours / Math.max(targetHours, 1)) * 100
                        )}
                      %
                    </span>
                  </div>

                  <div className="h-2 overflow-hidden rounded-full bg-slate-100">

                    <div
                      className={`h-full rounded-full transition-all ${isFinalized ? "bg-slate-400" : "bg-emerald-500"}`}
                      style={{
                        width: `${Math.min(
                          (displayTotalHours / Math.max(targetHours, 1)) * 100,
                          100
                        )}%`,
                      }}
                    />

                  </div>
                </div>
              </div>
            </div>
  );
}

/* =========================================================
   LEGEND
========================================================= */
function LegendItem({
  label,
  color,
  finalized,
}) {
  return (
    <div className="flex items-center gap-2">

      <span
        className={`h-2.5 w-2.5 rounded-full ${finalized ? "bg-slate-300" : color}`}
      />

      <span
        className={`text-xs ${finalized ? "text-slate-400" : "text-slate-500"}`}
      >
        {label}
      </span>
    </div>
  );
}
