import { Copy, X, AlertCircle, XCircle, CalendarDays, Lock } from "lucide-react";

/* =========================================================
   MODALS: Copy Effort / Success-Error Popup / Finalize
========================================================= */

export default function TimesheetModals({
  // copy effort
  showCopyEffortModal,
  setShowCopyEffortModal,
  isCopyingEffort,
  setCopyTargetDays,
  copyTargetDays,
  copyEffortSourceProjects,
  copyEffortTargetDays,
  handleCopyEffort,
  selectedDay,
  year,
  month,
  monthLabel,
  formatHours,
  calculateTimeHours,
  saveMessage,
  setSaveMessage,
  // popup
  popup,
  setPopup,
  setApiError,
  // finalize
  showFinalizeModal,
  setShowFinalizeModal,
  isFinalizing,
  handleFinalize,
}) {
  return (
    <>
          {/* =====================================================
            COPY THIS EFFORT MODAL
        ===================================================== */}

          {showCopyEffortModal && (
            <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
              <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white shadow-2xl">
                <div className="border-b border-slate-200 p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
                          <Copy size={17} />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-slate-900">
                            Copy This Effort
                          </p>
                          <p className="mt-0.5 text-[11px] text-slate-500">
                            Copy the approved day's project and time details to selected unlogged days.
                          </p>
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        if (isCopyingEffort) return;
                        setShowCopyEffortModal(false);
                        setCopyTargetDays([]);
                      }}
                      disabled={isCopyingEffort}
                      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-600 disabled:cursor-not-allowed disabled:opacity-50"
                      aria-label="Close copy effort modal"
                    >
                      <X size={17} />
                    </button>
                  </div>
                </div>

                <div className="space-y-4 p-5">
                  <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-emerald-700">
                          Source Day
                        </p>
                        <p className="mt-1 text-sm font-semibold text-emerald-900">
                          {selectedDay
                            ? new Date(year, month, selectedDay).toLocaleDateString("en-US", {
                              month: "long",
                              day: "numeric",
                              year: "numeric",
                            })
                            : "—"}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] font-medium text-emerald-700">Approved</p>
                        <p className="mt-1 text-sm font-bold text-emerald-900">
                          {formatHours(
                            copyEffortSourceProjects.reduce(
                              (total, project) =>
                                total +
                                (Number(project.hours) ||
                                  calculateTimeHours(project.start_time, project.end_time)),
                              0
                            )
                          )}h
                        </p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <div className="mb-2 flex items-center justify-between gap-3">
                      <div>
                        <p className="text-xs font-semibold text-slate-800">
                          Select Unlogged Days
                        </p>
                        <p className="mt-0.5 text-[10px] text-slate-500">
                          Only unlogged days from {monthLabel} can be selected.
                        </p>
                      </div>
                      <span className="rounded-full bg-slate-100 px-2 py-1 text-[10px] font-semibold text-slate-600">
                        {copyTargetDays.length} selected
                      </span>
                    </div>
                    {copyEffortTargetDays.length === 0 ? (
                      <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-5 text-center">
                        <p className="text-xs font-medium text-slate-600">
                          No unlogged days available
                        </p>
                        <p className="mt-1 text-[10px] text-slate-400">
                          All days in this month already have a timesheet status.
                        </p>
                      </div>
                    ) : (
                      <div className="max-h-64 space-y-2 overflow-y-auto pr-1">
                        {copyEffortTargetDays.map(({ day, data }) => {
                          const checked = copyTargetDays.includes(day);

                          return (
                            <label
                              key={`copy-target-${day}`}
                              className={`flex cursor-pointer items-center justify-between gap-3 rounded-xl border px-3 py-3 transition ${checked
                                ? "border-emerald-300 bg-emerald-50"
                                : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"
                                }`}
                            >
                              <span className="flex min-w-0 items-center gap-3">
                                <input
                                  type="checkbox"
                                  checked={checked}
                                  disabled={isCopyingEffort}
                                  onChange={() => {
                                    setCopyTargetDays((prev) =>
                                      prev.includes(day)
                                        ? prev.filter((item) => item !== day)
                                        : [...prev, day].sort((a, b) => a - b)
                                    );
                                    setSaveMessage("");
                                  }}
                                  className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                                />
                                <span className="min-w-0">
                                  <span className="block text-xs font-semibold text-slate-800">
                                    {new Date(year, month, day).toLocaleDateString("en-US", {
                                      weekday: "short",
                                      month: "short",
                                      day: "numeric",
                                    })}
                                  </span>
                                  <span className="mt-0.5 block text-[10px] font-medium text-slate-500">
                                    Unlogged • {data?.hours ? `${formatHours(data.hours)}h` : "0h"}
                                  </span>
                                </span>
                              </span>

                              <span className="shrink-0 rounded-full bg-slate-100 px-2 py-1 text-[9px] font-semibold text-slate-500">
                                Unlogged
                              </span>
                            </label>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {saveMessage && (
                    <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2.5 text-xs font-medium text-amber-800">
                      <div className="flex items-center gap-2">
                        <AlertCircle size={15} />
                        <span>{saveMessage}</span>
                      </div>
                    </div>
                  )}

                  <div className="flex gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => {
                        if (isCopyingEffort) return;
                        setShowCopyEffortModal(false);
                        setCopyTargetDays([]);
                        setSaveMessage("");
                      }}
                      disabled={isCopyingEffort}
                      className="flex-1 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      Cancel
                    </button>

                    <button
                      type="button"
                      onClick={handleCopyEffort}
                      disabled={
                        isCopyingEffort ||
                        copyTargetDays.length === 0 ||
                        copyEffortSourceProjects.length === 0
                      }
                      className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-3 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400"
                    >
                      <Copy size={16} />
                      {isCopyingEffort ? "Copying & Submitting..." : "Copy & Submit"}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* =====================================================
            SUCCESS / ERROR POPUP
          ===================================================== */}

          {popup.show && (
            <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/45 p-4 backdrop-blur-sm">
              <div className="w-full max-w-md overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl">
                {popup.type === "finalize-error" ? (
                  <>
                    <div className="border-b border-slate-100 px-5 py-5">
                      <div className="flex items-start gap-3">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-red-50 text-red-600">
                          <XCircle size={22} />
                        </div>
                        <div className="min-w-0">
                          <h3 className="text-base font-semibold text-slate-900">
                            Cannot Finalize Timesheet
                          </h3>
                          <p className="mt-1 text-xs leading-5 text-slate-500">
                            Please resolve the following days before finalizing this timesheet.
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="max-h-[330px] space-y-3 overflow-y-auto px-5 py-4">
                      {Object.entries(popup.details || {}).map(([status, dates]) => {
                        const labelMap = {
                          unlogged: "Unlogged Days",
                          rejected: "Rejected Days",
                          submitted: "Submitted Days",
                        };
                        const label =
                          labelMap[status] ||
                          `${status.charAt(0).toUpperCase()}${status.slice(1)} Days`;

                        return (
                          <div
                            key={status}
                            className="rounded-xl border border-slate-200 bg-slate-50/70 p-3"
                          >
                            <div className="mb-2 flex items-center justify-between gap-3">
                              <div className="flex items-center gap-2">
                                <span className="h-2 w-2 rounded-full bg-red-500" />
                                <p className="text-xs font-semibold text-slate-800">
                                  {label}
                                </p>
                              </div>
                              <span className="rounded-full bg-white px-2 py-1 text-[10px] font-bold text-slate-600 shadow-sm">
                                {dates.length}
                              </span>
                            </div>

                            <div className="flex flex-wrap gap-2">
                              {dates.map((date, index) => {
                                const formattedDate = date
                                  ? new Date(`${date}T00:00:00`).toLocaleDateString("en-US", {
                                    month: "short",
                                    day: "numeric",
                                  })
                                  : "Unknown date";

                                return (
                                  <span
                                    key={`${status}-${date}-${index}`}
                                    className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-[10px] font-medium text-slate-600"
                                  >
                                    <CalendarDays size={12} className="text-slate-400" />
                                    {formattedDate}
                                  </span>
                                );
                              })}
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    <div className="border-t border-slate-100 bg-white px-5 py-4">
                      <div className="mb-3 rounded-lg bg-amber-50 px-3 py-2.5 text-[11px] font-medium leading-5 text-amber-800">
                        Approved, holiday, leave, unpaid leave and weekend days do not block finalization.
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setPopup({ show: false });
                          setSaveMessage("");
                          setApiError("");
                        }}
                        className="w-full rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800"
                      >
                        Close
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="p-6 text-center">
                    <p className={`mb-4 font-semibold ${popup.type === "success" ? "text-green-600" : "text-red-600"}`}>
                      {popup.message}
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        setPopup({ show: false });
                        setSaveMessage("");
                        setApiError("");
                      }}
                      className="rounded px-4 py-2 bg-green-800 text-white cursor-pointer hover:bg-green-700"
                    >
                      OK
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* =====================================================
            FINALIZE MODAL
        ===================================================== */}

          {showFinalizeModal && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">

              <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl">

                <div className="flex items-start gap-4">

                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
                    <Lock size={20} />
                  </div>

                  <div>

                    <h3 className="text-lg font-semibold text-slate-900">
                      Finalize {monthLabel}?
                    </h3>

                    <p className="mt-2 text-sm leading-6 text-slate-500">
                      Once finalized, this employee's
                      {monthLabel} timesheet cannot be edited or
                      changed anymore.
                    </p>

                  </div>
                </div>

                <div className="mt-5 rounded-xl border border-amber-200 bg-amber-50 p-4">

                  <p className="text-xs font-medium leading-5 text-amber-800">
                    Please verify all hours, approvals,
                    rejected days, leave requests, holidays and
                    weekends before finalizing.
                  </p>

                </div>

                <div className="mt-6 flex gap-2">

                  <button
                    type="button"
                    onClick={() =>
                      setShowFinalizeModal(false)
                    }
                    className="flex-1 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50"
                  >
                    Cancel
                  </button>

                  <button
                    type="button"
                    onClick={handleFinalize}
                    disabled={isFinalizing}
                    className="flex-1 rounded-xl bg-slate-900 px-4 py-3 text-sm font-medium text-white hover:bg-slate-800"
                  >
                    {isFinalizing ? "Finalizing..." : "Finalize Month"}
                  </button>

                </div>
              </div>
            </div>
          )}
    </>
  );
}
