import { Lock } from "lucide-react";

/* =========================================================
   EMPLOYEE SUMMARY (profile + status badges)
========================================================= */

export default function EmployeeSummary({
  employee,
  avatarError,
  setAvatarError,
  isFinalized,
  statusCounts,
  getInitials,
  STATUS_CONFIG,
}) {
  return (
          <div className="mb-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">

            <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">

              {/* PROFILE */}

              <div className="flex items-center gap-3">

                <div className="h-12 w-12 overflow-hidden rounded-xl border border-slate-200 bg-emerald-50">
                  {employee.avatar && !avatarError ? (
                    <img
                      src={employee.avatar}
                      alt={employee.name || employee.code}
                      className="h-full w-full object-cover"
                      onError={() => setAvatarError(true)}
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-emerald-50 text-sm font-bold tracking-wide text-emerald-700">
                      {getInitials(employee.name || employee.code)}
                    </div>
                  )}
                </div>

                <div>
                  <div className="flex items-center gap-2">

                    <h2 className="text-base font-semibold text-slate-900">
                      {employee.name || employee.code}
                    </h2>

                    {isFinalized && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-1 text-[11px] font-medium text-slate-500">
                        <Lock size={11} />
                        Locked
                      </span>
                    )}
                  </div>

                  <p className="mt-0.5 text-sm text-slate-500">
                    {employee.role || "Employee"}{employee.joiningDate ? ` • ${employee.joiningDate}` : ""}
                  </p>
                  <p className="mt-0.5 text-[11px] font-medium text-slate-400">
                    Employee Code: {employee.code}
                  </p>
                </div>
              </div>

              {/* STATUS CARDS */}

              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 xl:grid-cols-6">

                <SummaryCard
                  title="Approved"
                  value={statusCounts.approved}
                  config={STATUS_CONFIG.approved}
                  finalized={isFinalized}
                />

                <SummaryCard
                  title="Pending"
                  value={statusCounts.pending}
                  config={STATUS_CONFIG.pending}
                  finalized={isFinalized}
                />

                <SummaryCard
                  title="Rejected"
                  value={statusCounts.rejected}
                  config={STATUS_CONFIG.rejected}
                  finalized={isFinalized}
                />

                <SummaryCard
                  title="Unlogged"
                  value={statusCounts.unlogged}
                  config={STATUS_CONFIG.unlogged}
                  finalized={isFinalized}
                />

                <SummaryCard
                  title="Leave"
                  value={statusCounts.leave}
                  config={STATUS_CONFIG.leave}
                  finalized={isFinalized}
                />

                <SummaryCard
                  title="Holidays"
                  value={statusCounts.holiday}
                  config={STATUS_CONFIG.holiday}
                  finalized={isFinalized}
                />

              </div>
            </div>
          </div>
  );
}

/* =========================================================
   SUMMARY CARD
========================================================= */

function SummaryCard({
  title,
  value,
  config,
  finalized,
}) {
  return (
    <div
      className={`min-w-[105px] rounded-xl border px-3 py-2.5 ${finalized ? "border-slate-200 bg-slate-100 text-slate-400" : config.cardClass}`}
    >
      <div className="flex items-center gap-1.5">

        <span
          className={`h-2 w-2 rounded-full ${finalized ? "bg-slate-400" : config.dotClass}`}
        />

        <p className="text-[10px] font-medium">
          {title}
        </p>
      </div>
      <p className="mt-1 text-lg font-semibold">
        {value}
      </p>
    </div>
  );
}
