import { Lock, UserRound, Save, CheckCheck } from "lucide-react";
import TimesheetExport from "./TimesheetExport";

/* =========================================================
   BOTTOM ACTION BAR (Export / Save / Bulk Approve / Finalize)
========================================================= */

export default function BottomActionBar({
  isFinalized,
  monthLabel,
  statusCounts,
  unsavedDays,
  timesheet,
  employee,
  activeEmployeeCode,
  year,
  month,
  monthValue,
  isSaving,
  isEditingDay,
  isFinalizing,
  handleSaveChanges,
  handleBulkApprove,
  handleOpenFinalizeModal,
}) {
  return (
    <div className="mt-4">

      <div className="rounded-2xl border border-slate-200 bg-white/95 p-3 shadow-lg backdrop-blur">

        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">

          {/* INFO */}

          <div className="flex items-center gap-3">

            <div
              className={`flex h-10 w-10 items-center justify-center rounded-xl ${isFinalized ? "bg-slate-100 text-slate-500" : "bg-amber-50 text-amber-600"}`}
            >
              {isFinalized ? (
                <Lock size={18} />
              ) : (
                <UserRound size={18} />
              )}
            </div>

            <div>

              <p className="text-sm font-medium text-slate-800">
                {isFinalized
                  ? "Timesheet finalized"
                  : `${monthLabel} timesheet`}
              </p>

              <p className="text-xs text-slate-500">
                {isFinalized
                  ? "No further changes are allowed."
                  : `${statusCounts.pending} day${statusCounts.pending !== 1
                    ? "s"
                    : ""
                  } waiting for approval.`}
              </p>

              {!isFinalized && unsavedDays.length > 0 && (
                <p className="mt-0.5 text-[11px] font-medium text-amber-600">
                  {unsavedDays.length} unsaved day{unsavedDays.length !== 1 ? "s" : ""}
                </p>
              )}

            </div>
          </div>

          {/* ACTION BUTTONS */}

          <div className="grid grid-cols-1 gap-2 sm:grid-cols-4">

            {/* EXPORT CSV */}

            <TimesheetExport
              timesheet={timesheet}
              employee={employee}
              activeEmployeeCode={activeEmployeeCode}
              year={year}
              month={month}
              monthValue={monthValue}
              monthLabel={monthLabel}
              isFinalized={isFinalized}
            />

            {/* SAVE */}

            <button
              type="button"
              disabled={isFinalized || isSaving || isEditingDay || unsavedDays.length === 0}
              onClick={handleSaveChanges}
              className="inline-flex items-center cursor-pointer justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400"
            >
              <Save size={16} />
              {isSaving ? "Saving..." : "Save Changes"}
            </button>

            {/* BULK APPROVE */}

            <button
              type="button"
              disabled={
                isFinalized || isSaving || (statusCounts.pending + statusCounts.submitted) === 0
              }
              onClick={handleBulkApprove}
              className="inline-flex items-center cursor-pointer justify-center gap-2 rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400"
            >
              <CheckCheck size={16} />
              {isSaving ? "Processing..." : "Bulk Approve"}
            </button>

            {/* FINALIZE */}

            <button
              type="button"
              disabled={isFinalized || isFinalizing || isSaving}
              onClick={handleOpenFinalizeModal}
              className="inline-flex items-center cursor-pointer justify-center gap-2 rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400"
            >
              <Lock size={16} />
              {isFinalizing ? "Finalizing..." : "Finalize"}
            </button>

          </div>
        </div>
      </div>
    </div>
  );
}
