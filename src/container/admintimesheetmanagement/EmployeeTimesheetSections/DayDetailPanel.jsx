import {
  X,
  Pencil,
  Save,
  Clock3,
  CalendarDays,
  AlertCircle,
  Lock,
  CheckCircle2,
} from "lucide-react";
import { FiLoader } from "react-icons/fi";

/* =========================================================
   DAY DETAIL PANEL (right side)
========================================================= */

export default function DayDetailPanel({
  selectedDay,
  setSelectedDay,
  isFinalized,
  monthLabel,
  year,
  month,
  timesheet,
  setTimesheet,
  STATUS_CONFIG,
  isPastDate,
  isTodayDate,
  formatHours,
  calculateTimeHours,
  // day details (read / edit existing project details)
  dayDetails,
  setDayDetails,
  dayDetailsError,
  setDayDetailsError,
  isDayDetailsLoading,
  setIsDayDetailsLoading,
  isEditingProjectDetails,
  setIsEditingProjectDetails,
  editableDayProjects,
  updateEditableProject,
  cancelProjectDetailsEdit,
  saveProjectDetailsDraft,
  // copy effort
  setShowCopyEffortModal,
  setCopyTargetDays,
  // missing day (admin submit)
  missingDayProjects,
  setMissingDayProjects,
  missingDayProjectErrors,
  setMissingDayProjectErrors,
  getMissingDayTotalHours,
  createEmptyProject,
  isSubmittingMissingDay,
  handleAdminSubmitMissingDay,
  // common
  saveMessage,
  setSaveMessage,
  editHours,
  setEditHours,
  handleStatusChange,
  isEditingDay,
  handleSaveDay,
}) {
  return (
    <div className="h-full min-h-[650px] rounded-2xl border border-slate-200 bg-white shadow-sm flex flex-col">

      {!selectedDay ? (
        <div className="flex min-h-[360px] flex-col items-center justify-center px-5 text-center">

          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-500">
            {isFinalized ? (
              <Lock size={25} />
            ) : (
              <CalendarDays size={25} />
            )}
          </div>

          <h3 className="text-base font-semibold text-slate-800">
            {isFinalized
              ? "Month Finalized"
              : "Select a day"}
          </h3>

          <p className="mt-2 max-w-[240px] text-sm leading-6 text-slate-500">
            {isFinalized
              ? `${monthLabel} is locked. No further changes are allowed.`
              : "Select any day from the calendar to review or edit its timesheet."}
          </p>

        </div>
      ) : (
        <div>

          {/* PANEL HEADER */}

          <div className="border-b border-slate-200 p-5">

            <div className="flex items-start justify-between">

              <div>
                <p className="text-xs font-medium text-slate-400">
                  TIMESHEET DETAIL
                </p>

                <h3 className="mt-1 text-lg font-semibold text-slate-900">
                  {new Date(year, month, selectedDay).toLocaleDateString(
                    "en-US",
                    {
                      month: "long",
                      day: "numeric",
                      year: "numeric",
                    }
                  )}
                </h3>
              </div>

              <button
                type="button"
                onClick={() => {
                  setSelectedDay(null);
                  setDayDetails(null);
                  setDayDetailsError("");
                  setIsDayDetailsLoading(false);
                  setShowCopyEffortModal(false);
                  setCopyTargetDays([]);
                }}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              >
                <X size={17} />
              </button>

            </div>
          </div>

          {/* PANEL BODY */}
          <div className="space-y-4 p-4">
            {timesheet[selectedDay]?.status === "unlogged" &&
              isPastDate(timesheet[selectedDay]?.date) ? (
              <div className="space-y-4">
                {/* ADMIN SUBMIT HEADER */}
                <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-amber-100 text-amber-700">
                      <Clock3 size={18} />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-amber-900">
                        Admin Submit Missing Day
                      </p>
                      <p className="mt-1 text-xs leading-5 text-amber-700">
                        This employee has not logged this day. Add project work and submit the missing timesheet on their behalf.
                      </p>
                    </div>
                  </div>
                </div>

                {/* PROJECTS */}
                <div>
                  <div className="mb-2 flex items-center justify-between gap-2">
                    <label className="text-xs font-semibold text-slate-700">
                      Projects & Work
                    </label>
                    <span
                      className={`text-xs font-semibold ${getMissingDayTotalHours() > 12 ? "text-red-600" : "text-slate-500"}`}
                    >
                      Total: {formatHours(getMissingDayTotalHours())}h / 12h
                    </span>
                  </div>

                  <div className="space-y-3">
                    {missingDayProjects.map((project, index) => {
                      const calculatedHours = calculateTimeHours(
                        project.start_time,
                        project.end_time
                      );
                      const fieldErrors =
                        missingDayProjectErrors[index] || {};

                      return (
                        <div
                          key={index}
                          className="rounded-xl border border-slate-200 bg-slate-50 p-3"
                        >
                          <div className="mb-3 flex items-center justify-between">
                            <p className="text-xs font-semibold text-slate-700">
                              Project {index + 1}
                            </p>

                            {missingDayProjects.length > 1 && (
                              <button
                                type="button"
                                onClick={() => {
                                  setMissingDayProjects((prev) =>
                                    prev.filter((_, i) => i !== index)
                                  );
                                  setMissingDayProjectErrors((prev) =>
                                    prev.filter((_, i) => i !== index)
                                  );
                                }}
                                className="text-[11px] font-semibold text-red-500 hover:text-red-700"
                              >
                                Remove
                              </button>
                            )}
                          </div>

                          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                            <div>
                              <label className="mb-1 block text-[11px] font-medium text-slate-500">
                                Project
                              </label>
                              <input
                                type="text"
                                value={project.project_name}
                                onChange={(e) => {
                                  const value = e.target.value;
                                  setMissingDayProjects((prev) =>
                                    prev.map((item, i) =>
                                      i === index
                                        ? { ...item, project_name: value }
                                        : item
                                    )
                                  );
                                }}
                                placeholder="Project name"
                                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-xs text-slate-800 outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
                              />
                            </div>

                            <div>
                              <label className="mb-1 block text-[11px] font-medium text-slate-500">
                                Task
                              </label>
                              <input
                                type="text"
                                value={project.task_name}
                                onChange={(e) => {
                                  const value = e.target.value;
                                  setMissingDayProjects((prev) =>
                                    prev.map((item, i) =>
                                      i === index
                                        ? { ...item, task_name: value }
                                        : item
                                    )
                                  );
                                }}
                                placeholder="Task name "
                                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-xs text-slate-800 outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
                              />
                            </div>
                          </div>

                          <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-3">
                            <div>
                              <label className="mb-1 block text-[11px] font-medium text-slate-500">
                                Start Time
                              </label>
                              <input
                                type="time"
                                value={project.start_time}
                                onChange={(e) => {
                                  const value = e.target.value;

                                  setMissingDayProjects((prev) =>
                                    prev.map((item, i) =>
                                      i === index
                                        ? { ...item, start_time: value }
                                        : item
                                    )
                                  );

                                  setMissingDayProjectErrors((prev) =>
                                    prev.map((item, i) => {
                                      if (i !== index) return item;

                                      if (value && project.end_time) {
                                        const calculated = calculateTimeHours(
                                          value,
                                          project.end_time
                                        );

                                        if (calculated <= 0) {
                                          return {
                                            ...item,
                                            start_time:
                                              "Start time must be earlier than end time.",
                                            end_time:
                                              "End time must be later than start time.",
                                          };
                                        }

                                        if (calculated > 12) {
                                          return {
                                            ...item,
                                            start_time:
                                              "Working time cannot exceed 12 hours.",
                                            end_time:
                                              "Working time cannot exceed 12 hours.",
                                          };
                                        }
                                      }

                                      return { ...item, start_time: "", end_time: "" };
                                    })
                                  );
                                  setSaveMessage("");
                                }}
                                className={`w-full rounded-lg border px-3 py-2.5 text-xs outline-none transition ${fieldErrors.start_time ? "border-red-400 bg-red-50 text-red-800 focus:border-red-500 focus:ring-2 focus:ring-red-100" : "border-slate-200 bg-white text-slate-800 focus:border-slate-400 focus:ring-2 focus:ring-slate-100"}`}
                              />
                              {fieldErrors.start_time && (
                                <p className="mt-1 text-[10px] font-medium text-red-600">
                                  {fieldErrors.start_time}
                                </p>
                              )}
                            </div>

                            <div>
                              <label className="mb-1 block text-[11px] font-medium text-slate-500">
                                End Time
                              </label>
                              <input
                                type="time"
                                value={project.end_time}
                                onChange={(e) => {
                                  const value = e.target.value;

                                  setMissingDayProjects((prev) =>
                                    prev.map((item, i) =>
                                      i === index
                                        ? { ...item, end_time: value }
                                        : item
                                    )
                                  );
                                  setMissingDayProjectErrors((prev) =>
                                    prev.map((item, i) => {
                                      if (i !== index) return item;

                                      if (project.start_time && value) {
                                        const calculated = calculateTimeHours(
                                          project.start_time,
                                          value
                                        );

                                        if (calculated <= 0) {
                                          return {
                                            ...item,
                                            start_time:
                                              "Start time must be earlier than end time.",
                                            end_time:
                                              "End time must be later than start time.",
                                          };
                                        }

                                        if (calculated > 12) {
                                          return {
                                            ...item,
                                            start_time:
                                              "Working time cannot exceed 12 hours.",
                                            end_time:
                                              "Working time cannot exceed 12 hours.",
                                          };
                                        }
                                      }
                                      return { ...item, start_time: "", end_time: "" };
                                    })
                                  );
                                  setSaveMessage("");
                                }}
                                className={`w-full rounded-lg border px-3 py-2.5 text-xs outline-none transition ${fieldErrors.end_time ? "border-red-400 bg-red-50 text-red-800 focus:border-red-500 focus:ring-2 focus:ring-red-100" : "border-slate-200 bg-white text-slate-800 focus:border-slate-400 focus:ring-2 focus:ring-slate-100"}`}
                              />
                              {fieldErrors.end_time && (
                                <p className="mt-1 text-[10px] font-medium text-red-600">
                                  {fieldErrors.end_time}
                                </p>
                              )}
                            </div>

                            <div>
                              <label className="mb-1 block text-[11px] font-medium text-slate-500">
                                Hours
                              </label>
                              <div
                                className={`flex min-h-[42px] w-full items-center rounded-lg border px-3 py-2.5 text-xs font-semibold ${fieldErrors.hours ? "border-red-400 bg-red-50 text-red-700" : "border-slate-200 bg-white text-slate-700"}`}
                              >
                                {calculatedHours > 0
                                  ? `${formatHours(calculatedHours)}h`
                                  : ""}
                              </div>
                              {fieldErrors.hours && (
                                <p className="mt-1 text-[10px] font-medium text-red-600">
                                  {fieldErrors.hours}
                                </p>
                              )}
                            </div>
                          </div>

                          <div className="mt-3">
                            <label className="mb-1 block text-[11px] font-medium text-slate-500">
                              Description
                            </label>
                            <textarea
                              rows={2}
                              value={project.description}
                              onChange={(e) => {
                                const value = e.target.value;
                                setMissingDayProjects((prev) =>
                                  prev.map((item, i) =>
                                    i === index
                                      ? { ...item, description: value }
                                      : item
                                  )
                                );
                              }}
                              placeholder="Describe the work completed..."
                              className="w-full resize-none rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-xs text-slate-800 outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      if (missingDayProjects.length >= 10) {
                        setSaveMessage("Maximum 10 projects can be added.");
                        return;
                      }

                      if (getMissingDayTotalHours() >= 12) {
                        setSaveMessage("Maximum 12 hours already reached.");
                        return;
                      }

                      setMissingDayProjects((prev) => [
                        ...prev,
                        createEmptyProject(),
                      ]);
                      setMissingDayProjectErrors((prev) => [
                        ...prev,
                        {},
                      ]);
                      setSaveMessage("");
                    }}
                    className={`mt-3 w-full rounded-lg border border-dashed px-3 py-2.5 text-xs font-semibold transition ${missingDayProjects.length >= 10 ? "cursor-not-allowed border-red-200 bg-red-50 text-red-500" : "border-slate-300 bg-white text-slate-600 hover:border-slate-400 hover:bg-slate-50"}`}
                  >
                    {missingDayProjects.length >= 10
                      ? "Maximum 10 Projects Reached"
                      : "+ Add Project"}
                  </button>
                </div>
                {saveMessage && (
                  <div
                    className={`rounded-lg border px-3 py-2.5 text-xs font-medium ${saveMessage.includes("successfully") ||
                      saveMessage === "All pending days have been approved" ||
                      saveMessage === "All submitted days have been approved"
                      ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                      : "border-red-200 bg-red-50 text-red-700"
                      }`}
                  >
                    <div className="flex items-center gap-2">
                      {saveMessage.includes("successfully") ||
                        saveMessage === "All pending days have been approved" ||
                        saveMessage === "All submitted days have been approved" ? (
                        <CheckCircle2 size={15} />
                      ) : (
                        <AlertCircle size={15} />
                      )}

                      <span>{saveMessage}</span>
                    </div>
                  </div>
                )}

                <button
                  type="button"
                  disabled={isFinalized || isSubmittingMissingDay}
                  onClick={handleAdminSubmitMissingDay}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-3 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400"
                >
                  <Save size={16} />
                  {isSubmittingMissingDay ? "Submitting..." : "Save & Submit Missing Day"}
                </button>
              </div>
            ) : timesheet[selectedDay]?.status === "unlogged" ? (
              <div className="flex flex-1 flex-col p-4">
                <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
                  <div className="flex items-start gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white text-amber-600 shadow-sm">
                      <Clock3 size={18} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-amber-900">
                        {isTodayDate(timesheet[selectedDay]?.date)
                          ? "Today's Timesheet"
                          : "Future Date Locked"}
                      </p>
                      <p className="mt-1 text-xs leading-5 text-amber-700">
                        {isTodayDate(timesheet[selectedDay]?.date)
                          ? "The employee can log their working hours until the end of today. Admin editing will be available once the date has passed."
                          : "Future unlogged dates cannot be edited by Admin. Timesheet details can be added once the date becomes a past working day."}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-4 rounded-xl border border-slate-200 bg-white p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                        Timesheet Status
                      </p>
                      <p className="mt-1 text-sm font-semibold text-slate-800">
                        Unlogged
                      </p>
                    </div>
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[11px] font-semibold text-slate-600">
                      <span className="h-1.5 w-1.5 rounded-full bg-slate-400" />
                      {isTodayDate(timesheet[selectedDay]?.date)
                        ? "Today"
                        : "Future"}
                    </span>
                  </div>
                </div>

                <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-xs font-semibold text-slate-700">
                    What happens next?
                  </p>

                  <div className="mt-4 space-y-4">
                    <div className="flex gap-3">
                      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white text-[11px] font-bold text-slate-500 shadow-sm">
                        1
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-slate-700">
                          Employee logs the work
                        </p>
                        <p className="mt-0.5 text-[11px] leading-5 text-slate-500">
                          Working hours and project details can be entered for the selected day.
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white text-[11px] font-bold text-slate-500 shadow-sm">
                        2
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-slate-700">
                          Day becomes available to Admin
                        </p>
                        <p className="mt-0.5 text-[11px] leading-5 text-slate-500">
                          Admin editing is enabled after the selected date has passed.
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white text-[11px] font-bold text-slate-500 shadow-sm">
                        3
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-slate-700">
                          Timesheet can be reviewed
                        </p>
                        <p className="mt-0.5 text-[11px] leading-5 text-slate-500">
                          Once details are available, Admin can review and process the day normally.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-auto pt-4">
                  <div className="flex items-start gap-2 rounded-xl border border-slate-200 bg-white px-3 py-3">
                    <Lock size={15} className="mt-0.5 shrink-0 text-slate-400" />
                    <p className="text-[11px] leading-5 text-slate-500">
                      {isTodayDate(timesheet[selectedDay]?.date)
                        ? "Admin editing is intentionally disabled while the employee's working day is still in progress."
                        : "Admin editing is intentionally disabled because this is a future working day."}
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <>

                <div className="space-y-4 p-4">

                  {/* CURRENT STATUS */}

                  <div>
                    <label className="mb-2 block text-xs font-medium text-slate-600">
                      Current Status
                    </label>

                    <div className="grid grid-cols-2 gap-2">
                      {Object.entries(STATUS_CONFIG)
                        .filter(([status]) => status !== "weekend" && status !== "submitted")
                        .map(([status, config]) => {
                          const isEditableStatus =
                            status === "approved" || status === "rejected";

                          return (
                            <button
                              key={status}
                              type="button"
                              disabled={
                                isFinalized ||
                                timesheet[selectedDay]?.status === "holiday" ||
                                timesheet[selectedDay]?.status === "weekend" ||
                                !isEditableStatus
                              }
                              onClick={() => {
                                if (isEditableStatus) {
                                  handleStatusChange(status);
                                }
                              }}
                              className={`rounded-lg border px-3 py-2.5 text-left text-xs font-medium transition ${timesheet[selectedDay]?.status === status ? `${config.cardClass} ring-1 ring-current` : "border-slate-200 bg-white text-slate-500"} ${isFinalized || !isEditableStatus ? "cursor-not-allowed opacity-70" : "hover:bg-slate-50"}`}
                            >
                              <span className="flex items-center gap-2">
                                <span
                                  className={`h-2 w-2 rounded-full ${config.dotClass}`}
                                />

                                {status === "pending" ? "Submitted" : config.label}
                              </span>
                            </button>
                          );
                        })}
                    </div>
                  </div>

                  {saveMessage && (
                    <div
                      className={`rounded-lg border px-3 py-2.5 text-xs font-medium ${/(successfully|approved|updated|submitted|finalized|saved)\b/i.test(saveMessage) ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-red-200 bg-red-50 text-red-700"}`}
                    >
                      <div className="flex items-center gap-2">
                        {/(successfully|approved|updated|submitted|finalized|saved)\b/i.test(
                          saveMessage
                        ) ? (
                          <CheckCircle2 size={15} />
                        ) : (
                          <AlertCircle size={15} />
                        )}
                        <span>{saveMessage}</span>
                      </div>
                    </div>
                  )}

                  {/* HOURS */}

                  <div>

                    <label className="mb-2 block text-xs font-medium text-slate-600">
                      Working Hours
                    </label>

                    <div className="relative">

                      <Clock3
                        size={16}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                      />

                      <input
                        type="number"
                        min="0"
                        max="12"
                        step="0.5"
                        value={editHours}
                        disabled={
                          isFinalized ||
                          timesheet[selectedDay]
                            ?.status === "holiday" ||
                          timesheet[selectedDay]
                            ?.status === "weekend" ||
                          timesheet[selectedDay]
                            ?.status === "leave"
                        }
                        onChange={(e) => {
                          const value = e.target.value;
                          setEditHours(value);

                          // Update the draft immediately so the value is not
                          // lost when the user moves to another day.
                          if (selectedDay && value !== "") {
                            const numericHours = Number(value);

                            if (!Number.isNaN(numericHours) && numericHours >= 0) {
                              setTimesheet((prev) => ({
                                ...prev,
                                [selectedDay]: {
                                  ...prev[selectedDay],
                                  hours: numericHours,
                                },
                              }));
                            }
                          }
                        }}
                        className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-10 pr-12 text-sm text-slate-800 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-100 disabled:cursor-not-allowed disabled:bg-slate-100"
                      />

                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400">
                        hours
                      </span>

                    </div>
                  </div>

                  {/* =================================================
                            PROJECT DETAILS FROM DAY DETAIL API
                          ================================================= */}
                  {!['unlogged', 'leave', 'holiday'].includes(timesheet[selectedDay]?.status) && (
                    <div>
                      <div className="mb-2 flex items-center justify-between gap-2">
                        <div className="flex min-w-0 items-center gap-2">
                          <label className="text-xs font-semibold text-slate-700">
                            Project Details
                          </label>
                          {!isEditingProjectDetails && !isDayDetailsLoading && Array.isArray(dayDetails?.projects) && dayDetails.projects.length > 0 && !isFinalized && (
                            <button
                              type="button"
                              onClick={() => setIsEditingProjectDetails(true)}
                              className="inline-flex items-center gap-1 rounded-md border border-slate-200 bg-white px-2 py-1 text-[10px] font-semibold text-slate-500 shadow-sm transition hover:border-slate-300 hover:bg-slate-50 hover:text-slate-700"
                              title="Edit project details"
                            >
                              <Pencil size={11} />
                              Edit
                            </button>
                          )}
                        </div>

                        <div className="flex shrink-0 items-center gap-2">
                          {!isDayDetailsLoading && dayDetails?.total_hours != null && (
                            <span className="text-xs font-semibold text-slate-500">
                              Total: {formatHours(dayDetails.total_hours)}h
                            </span>
                          )}
                          {isEditingProjectDetails && (
                            <>
                              <button
                                type="button"
                                onClick={cancelProjectDetailsEdit}
                                className="rounded-md border border-slate-200 bg-white px-2 py-1 text-[10px] font-semibold text-slate-500 transition hover:bg-slate-50"
                              >
                                Cancel
                              </button>
                              <button
                                type="button"
                                onClick={saveProjectDetailsDraft}
                                className="inline-flex items-center gap-1 rounded-md bg-slate-900 px-2.5 py-1 text-[10px] font-semibold text-white transition hover:bg-slate-800"
                              >
                                <Save size={11} />
                                Save
                              </button>
                            </>
                          )}
                        </div>
                      </div>

                      {isDayDetailsLoading ? (
                        <div className="rounded-xl border border-slate-200 bg-slate-50 p-5 text-center">
                          <FiLoader className="mx-auto animate-spin text-lg text-slate-500" />
                          <p className="mt-2 text-xs text-slate-500">
                            Loading project details...
                          </p>
                        </div>
                      ) : dayDetailsError ? (
                        <div className="rounded-xl border border-red-200 bg-red-50 p-4">
                          <div className="flex items-start gap-2">
                            <AlertCircle size={15} className="mt-0.5 shrink-0 text-red-600" />
                            <p className="text-xs leading-5 text-red-700">
                              {dayDetailsError}
                            </p>
                          </div>
                        </div>
                      ) : Array.isArray(dayDetails?.projects) && dayDetails.projects.length > 0 ? (
                        <div className="space-y-3">
                          {(isEditingProjectDetails ? editableDayProjects : dayDetails.projects).map((project, index) => (
                            <div
                              key={`${dayDetails.day_entry_id || selectedDay}-${index}`}
                              className={`rounded-xl border p-3 ${isEditingProjectDetails ? "border-slate-300 bg-white" : "border-slate-200 bg-slate-50"}`}
                            >
                              <div className="mb-3 flex items-center justify-between gap-2">
                                <p className="text-xs font-semibold text-slate-800">
                                  Project {index + 1}
                                </p>
                                <span className="rounded-full bg-white px-2 py-1 text-[10px] font-semibold text-slate-600 shadow-sm">
                                  {formatHours(
                                    isEditingProjectDetails
                                      ? calculateTimeHours(project.start_time, project.end_time)
                                      : project.hours || 0
                                  )}h
                                </span>
                              </div>

                              {isEditingProjectDetails ? (
                                <>
                                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                                    <div>
                                      <label className="mb-1 block text-[10px] font-medium text-slate-500">Project</label>
                                      <input
                                        type="text"
                                        value={project.project_name || ""}
                                        onChange={(e) => updateEditableProject(index, "project_name", e.target.value)}
                                        className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-xs text-slate-800 outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
                                      />
                                    </div>
                                    <div>
                                      <label className="mb-1 block text-[10px] font-medium text-slate-500">Task</label>
                                      <input
                                        type="text"
                                        value={project.task_name || ""}
                                        onChange={(e) => updateEditableProject(index, "task_name", e.target.value)}
                                        className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-xs text-slate-800 outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
                                      />
                                    </div>
                                  </div>

                                  <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
                                    <div>
                                      <label className="mb-1 block text-[10px] font-medium text-slate-500">Start Time</label>
                                      <input
                                        type="time"
                                        value={project.start_time || ""}
                                        onChange={(e) => updateEditableProject(index, "start_time", e.target.value)}
                                        className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-xs text-slate-800 outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
                                      />
                                    </div>
                                    <div>
                                      <label className="mb-1 block text-[10px] font-medium text-slate-500">End Time</label>
                                      <input
                                        type="time"
                                        value={project.end_time || ""}
                                        onChange={(e) => updateEditableProject(index, "end_time", e.target.value)}
                                        className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-xs text-slate-800 outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
                                      />
                                    </div>
                                  </div>

                                  <div className="mt-3">
                                    <label className="mb-1 block text-[10px] font-medium text-slate-500">Description</label>
                                    <textarea
                                      rows={2}
                                      value={project.description || ""}
                                      onChange={(e) => updateEditableProject(index, "description", e.target.value)}
                                      className="w-full resize-none rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-xs text-slate-800 outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
                                    />
                                  </div>
                                </>
                              ) : (
                                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                                  <div>
                                    <p className="text-[10px] font-medium text-slate-400">Project</p>
                                    <p className="mt-1 break-words text-xs font-semibold text-slate-700">
                                      {project.project_name || "—"}
                                    </p>
                                  </div>
                                  <div>
                                    <p className="text-[10px] font-medium text-slate-400">Task</p>
                                    <p className="mt-1 break-words text-xs font-semibold text-slate-700">
                                      {project.task_name || "—"}
                                    </p>
                                  </div>
                                  <div>
                                    <p className="text-[10px] font-medium text-slate-400">Start Time</p>
                                    <p className="mt-1 text-xs font-semibold text-slate-700">
                                      {project.start_time || "—"}
                                    </p>
                                  </div>
                                  <div>
                                    <p className="text-[10px] font-medium text-slate-400">End Time</p>
                                    <p className="mt-1 text-xs font-semibold text-slate-700">
                                      {project.end_time || "—"}
                                    </p>
                                  </div>
                                </div>
                              )}

                              {!isEditingProjectDetails && project.description && (
                                <div className="mt-3 border-t border-slate-200 pt-3">
                                  <p className="text-[10px] font-medium text-slate-400">Description</p>
                                  <p className="mt-1 break-words text-xs leading-5 text-slate-600">
                                    {project.description}
                                  </p>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-4 text-center">
                          <p className="text-xs text-slate-500">
                            No project details available for this day.
                          </p>
                        </div>
                      )}

                      {dayDetails?.rejection_note && (
                        <div className="mt-3 rounded-xl border border-red-200 bg-red-50 p-3">
                          <div className="flex items-start gap-2">
                            <AlertCircle size={15} className="mt-0.5 shrink-0 text-red-600" />
                            <div>
                              <p className="text-xs font-semibold text-red-800">
                                Rejection Note
                              </p>
                              <p className="mt-1 text-xs leading-5 text-red-700">
                                {dayDetails.rejection_note}
                              </p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* HOLIDAY */}

                  {timesheet[selectedDay]?.status ===
                    "holiday" && (
                      <div className="flex gap-3 rounded-xl border border-violet-200 bg-violet-50 p-4">

                        <CalendarDays
                          size={18}
                          className="mt-0.5 shrink-0 text-violet-600"
                        />

                        <div>
                          <p className="text-sm font-medium text-violet-800">
                            Public Holiday
                          </p>

                          <p className="mt-1 text-xs leading-5 text-violet-600">
                            {timesheet[selectedDay]?.holidayName ||
                              "Public Holiday"}
                          </p>

                          <p className="mt-1 text-xs leading-5 text-violet-500">
                            Holiday dates cannot be edited.
                          </p>
                        </div>

                      </div>
                    )}

                  {/* WEEKEND DETAIL — shown only when a weekend day is selected */}

                  {timesheet[selectedDay]?.status ===
                    "weekend" && (
                      <div className="flex gap-3 rounded-xl border border-slate-200 bg-slate-100 p-4">
                        <CalendarDays
                          size={18}
                          className="mt-0.5 shrink-0 text-slate-500"
                        />

                        <div>
                          <p className="text-sm font-medium text-slate-700">
                            Weekend
                          </p>

                          <p className="mt-1 text-xs leading-5 text-slate-500">
                            {timesheet[selectedDay]?.weekendName ||
                              "Saturday / Sunday"}{" "}
                            is a weekly weekend. Weekend days cannot be edited.
                          </p>
                        </div>
                      </div>
                    )}

                  {/* REJECTED */}

                  {timesheet[selectedDay]?.status ===
                    "rejected" && (
                      <div className="flex gap-3 rounded-xl border border-red-200 bg-red-50 p-4">

                        <AlertCircle
                          size={18}
                          className="mt-0.5 shrink-0 text-red-600"
                        />

                        <div>
                          <p className="text-sm font-medium text-red-800">
                            Timesheet Rejected
                          </p>

                          <p className="mt-1 text-xs leading-5 text-red-600">
                            Review the hours and update the
                            status when required.
                          </p>
                        </div>

                      </div>
                    )}

                  {/* FINALIZED */}

                  {isFinalized && (
                    <div className="flex gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4">

                      <Lock
                        size={18}
                        className="mt-0.5 shrink-0 text-slate-500"
                      />

                      <div>
                        <p className="text-sm font-medium text-slate-700">
                          Month Finalized
                        </p>

                        <p className="mt-1 text-xs leading-5 text-slate-500">
                          This timesheet can no longer be
                          modified.
                        </p>
                      </div>

                    </div>
                  )}

                  {/* SAVE DAY */}

                  <button
                    type="button"
                    disabled={
                      isFinalized ||
                      isEditingDay ||
                      timesheet[selectedDay]
                        ?.status === "holiday" ||
                      timesheet[selectedDay]
                        ?.status === "weekend" ||
                      (timesheet[selectedDay]?.status === "unlogged" &&
                        !isPastDate(timesheet[selectedDay]?.date))
                    }
                    onClick={handleSaveDay}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-3 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400"
                  >
                    <Save size={16} />
                    {isEditingDay ? "Updating..." : "Save Day Changes"}
                  </button>


                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
