import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FiUsers,
  FiCalendar,
  FiClock,
  FiCheckCircle,
  FiArrowUpRight,
  FiChevronRight,
  FiChevronDown,
  FiX,
  FiDollarSign,
  FiFileText,
  FiBriefcase,
  FiSearch,
} from "react-icons/fi";

// Shared employee profile data kept inside this file so no separate employee JS file is required.
// Employee ID is the connection key between HR Dashboard and HR Payroll.
const employeeProfiles = [
  {
    id: "EMP005",
    name: "Kiran Reddy",
    department: "Finance",
    designation: "Finance Executive",
    hours: "39h",
    finalizedOn: "Sep 24, 2026",
    workingDays: 22,
    paidDays: 22,
    leaveDays: 0,
    lopDays: 0,
    basic: 42000,
    hra: 16800,
    allowances: 6200,
    gross: 65000,
    pf: 5040,
    professionalTax: 200,
    lop: 0,
    deductions: 5240,
    netPay: 59760,
    managerFinalized: true,
    leaveApproved: true,
    salaryReady: true,
    hrStatus: "Pending",
    payrollStatus: "Ready for HR Review",
    payslipGenerated: false,
  },
  {
    id: "EMP012",
    name: "Lasya",
    department: "Engineering",
    designation: "Software Engineer",
    hours: "40h",
    finalizedOn: "Sep 24, 2026",
    workingDays: 22,
    paidDays: 22,
    leaveDays: 0,
    lopDays: 0,
    basic: 38000,
    hra: 15200,
    allowances: 4800,
    gross: 58000,
    pf: 4560,
    professionalTax: 200,
    lop: 0,
    deductions: 4760,
    netPay: 53240,
    managerFinalized: true,
    leaveApproved: true,
    salaryReady: true,
    hrStatus: "Pending",
    payrollStatus: "Ready for HR Review",
    payslipGenerated: false,
  },
  {
    id: "EMP018",
    name: "Sreya",
    department: "HR",
    designation: "HR Executive",
    hours: "38h",
    finalizedOn: "Sep 23, 2026",
    workingDays: 22,
    paidDays: 22,
    leaveDays: 0,
    lopDays: 0,
    basic: 34000,
    hra: 13600,
    allowances: 4400,
    gross: 52000,
    pf: 4080,
    professionalTax: 200,
    lop: 0,
    deductions: 4280,
    netPay: 47720,
    managerFinalized: true,
    leaveApproved: true,
    salaryReady: true,
    hrStatus: "Pending",
    payrollStatus: "Ready for HR Review",
    payslipGenerated: false,
  },
  {
    id: "EMP021",
    name: "Rajitha",
    department: "Design",
    designation: "UI/UX Designer",
    hours: "40h",
    finalizedOn: "Sep 23, 2026",
    workingDays: 22,
    paidDays: 22,
    leaveDays: 0,
    lopDays: 0,
    basic: 31000,
    hra: 12400,
    allowances: 4600,
    gross: 48000,
    pf: 3720,
    professionalTax: 200,
    lop: 0,
    deductions: 3920,
    netPay: 44080,
    managerFinalized: true,
    leaveApproved: true,
    salaryReady: true,
    hrStatus: "Pending",
    payrollStatus: "Ready for HR Review",
    payslipGenerated: false,
  },
  {
    id: "EMP024",
    name: "Pranavi",
    department: "Engineering",
    designation: "Software Engineer",
    hours: "37h",
    finalizedOn: "Sep 22, 2026",
    workingDays: 22,
    paidDays: 21,
    leaveDays: 1,
    lopDays: 0,
    basic: 39000,
    hra: 15600,
    allowances: 5400,
    gross: 60000,
    pf: 4680,
    professionalTax: 200,
    lop: 0,
    deductions: 4880,
    netPay: 55120,
    managerFinalized: true,
    leaveApproved: true,
    salaryReady: true,
    hrStatus: "Pending",
    payrollStatus: "Ready for HR Review",
    payslipGenerated: false,
  },
];


/* =========================================================
   HR DASHBOARD
   ========================================================= */

const HRDashboard = () => {
  const navigate = useNavigate();
  const [drawer, setDrawer] = useState(null);
  const [search, setSearch] = useState("");
  const [selectedMonth, setSelectedMonth] = useState("2026-09");

  /* =======================================================
     MANAGER-FINALIZED MONTHS
     Only finalized months are available in the dropdown.
     ======================================================= */

  const finalizedMonths = [
    {
      value: "2026-09",
      label: "September 2026",
      period: "Sep 01 – Sep 30",
      totalEmployees: 48,
      finalizedEmployees: 34,
      pendingFinalization: 14,
      completion: 71,
      totalHours: "1,360",
      finalizedOn: "Sep 24, 2026",
      finalizedBy: "Manager Finalization",
      payrollReady: 34,
    },
    {
      value: "2026-08",
      label: "August 2026",
      period: "Aug 01 – Aug 31",
      totalEmployees: 47,
      finalizedEmployees: 47,
      pendingFinalization: 0,
      completion: 100,
      totalHours: "1,328",
      finalizedOn: "Aug 31, 2026",
      finalizedBy: "Manager Finalization",
      payrollReady: 47,
    },
    {
      value: "2026-07",
      label: "July 2026",
      period: "Jul 01 – Jul 31",
      totalEmployees: 46,
      finalizedEmployees: 46,
      pendingFinalization: 0,
      completion: 100,
      totalHours: "1,312",
      finalizedOn: "Jul 31, 2026",
      finalizedBy: "Manager Finalization",
      payrollReady: 46,
    },
    {
      value: "2026-06",
      label: "June 2026",
      period: "Jun 01 – Jun 30",
      totalEmployees: 45,
      finalizedEmployees: 45,
      pendingFinalization: 0,
      completion: 100,
      totalHours: "1,280",
      finalizedOn: "Jun 30, 2026",
      finalizedBy: "Manager Finalization",
      payrollReady: 45,
    },
  ];

  const currentMonth =
    finalizedMonths.find((month) => month.value === selectedMonth) ||
    finalizedMonths[0];

  /* =======================================================
     FINALIZED EMPLOYEES
     ======================================================= */

  const employees = employeeProfiles.map((employee) => {
    const daysWorked =
      employee.paidDays ??
      Math.max(
        0,
        (employee.workingDays ?? 0) -
        (employee.leaveDays ?? 0) -
        (employee.lopDays ?? 0)
      );

    // Monthly working hours are based on the employee's paid/worked days
    // at the existing 8-hour workday used by this dashboard.
    const monthlyHours = daysWorked * 8;

    return {
      id: employee.id,
      name: employee.name,
      code: employee.id,
      department: employee.department,
      hours: employee.hours,
      monthlyHours,
      daysWorked,
      workingDays: employee.workingDays ?? daysWorked,
      leaveDays: employee.leaveDays ?? 0,
      lopDays: employee.lopDays ?? 0,
      finalizedOn: employee.finalizedOn,
    };
  });

  /* =======================================================
     PENDING FINALIZATION
     These are NOT HR review items.
     They are only informational on this dashboard.
     ======================================================= */

  const pendingEmployees = [
    {
      id: 101,
      name: "Anjali",
      code: "EMP031",
      department: "Engineering",
      days: 2,
    },
    {
      id: 102,
      name: "Rohit",
      code: "EMP034",
      department: "Finance",
      days: 1,
    },
    {
      id: 103,
      name: "Harsha",
      code: "EMP037",
      department: "Operations",
      days: 3,
    },
    {
      id: 104,
      name: "Divya",
      code: "EMP041",
      department: "HR",
      days: 1,
    },
  ];

  /* =======================================================
     HOLIDAYS
     ======================================================= */

  const holidays = [
    {
      month: "OCT",
      date: "02",
      name: "Gandhi Jayanti",
      day: "Friday",
    },
    {
      month: "DEC",
      date: "25",
      name: "Christmas",
      day: "Friday",
    },
  ];

  /* =======================================================
     EMPLOYEES CURRENTLY ON LEAVE
     ======================================================= */

  const leaveEmployees = [
    {
      id: 201,
      name: "Rajitha",
      code: "EMP021",
      department: "Design",
      leaveType: "Casual Leave",
      days: 2,
      period: "Sep 24 - Sep 25",
    },
    {
      id: 202,
      name: "Naveen",
      code: "EMP027",
      department: "QA",
      leaveType: "Sick Leave",
      days: 1,
      period: "Sep 24",
    },
    {
      id: 203,
      name: "Sneha",
      code: "EMP033",
      department: "Engineering",
      leaveType: "Casual Leave",
      days: 2,
      period: "Sep 25 - Sep 26",
    },
    {
      id: 204,
      name: "Vamsi",
      code: "EMP040",
      department: "Operations",
      leaveType: "Personal Leave",
      days: 1,
      period: "Sep 24",
    },
    {
      id: 205,
      name: "Pooja",
      code: "EMP044",
      department: "HR",
      leaveType: "Casual Leave",
      days: 1,
      period: "Sep 25",
    },
  ];

  /* =======================================================
     LOCAL LEAVE REQUESTS
     Accept Leave works locally for UI testing.
     ======================================================= */

  const [leaveRequests, setLeaveRequests] = useState([
    {
      id: 301,
      name: "Sneha Reddy",
      code: "EMP028",
      department: "Engineering",
      leaveType: "Casual Leave",
      from: "Sep 26, 2026",
      to: "Sep 27, 2026",
      days: 2,
      status: "Pending",
    },
    {
      id: 302,
      name: "Vamsi Krishna",
      code: "EMP034",
      department: "Operations",
      leaveType: "Personal Leave",
      from: "Sep 28, 2026",
      to: "Sep 28, 2026",
      days: 1,
      status: "Pending",
    },
    {
      id: 303,
      name: "Pooja",
      code: "EMP041",
      department: "HR",
      leaveType: "Casual Leave",
      from: "Sep 29, 2026",
      to: "Sep 30, 2026",
      days: 2,
      status: "Pending",
    },
  ]);

  /* =======================================================
     SEARCH
     ======================================================= */

  const query = search.toLowerCase().trim();
  const filteredEmployees = !query
    ? employees
    : employees.filter(
        (employee) =>
          employee.name.toLowerCase().includes(query) ||
          employee.code.toLowerCase().includes(query) ||
          employee.department.toLowerCase().includes(query)
      );

  /* =======================================================
     DRAWER
     ======================================================= */

  const openDrawer = (type) => {
    setDrawer(type);
  };

  /* =======================================================
     OPEN THE EXISTING PAYROLL PAGE FOR THIS EMPLOYEE
     Uses the employee code as the connection key.
     ======================================================= */
  const openEmployeePayroll = (employee) => {
    navigate(`/hr-dashboard/payroll?employee=${encodeURIComponent(employee.code)}`);
  };

  const closeDrawer = () => {
    setDrawer(null);
  };

  /* =======================================================
     ACCEPT LEAVE - LOCAL UI ACTION
     ======================================================= */

  const acceptLeave = (leaveId) => {
    setLeaveRequests((previousRequests) =>
      previousRequests.map((request) =>
        request.id === leaveId
          ? {
            ...request,
            status: "Approved",
          }
          : request
      )
    );
  };

  /* =======================================================
     RENDER
     ======================================================= */

  return (
    <div className="min-h-screen bg-[#F3F5F1] text-[#17251B]">

      <main className="mx-auto w-full max-w-[1600px] px-4 py-6 sm:px-6 lg:px-8">

        {/* =================================================
            HEADER
            ================================================= */}

        <div className="mb-5 flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">

          <div>
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-[#4D8B4F]" />

              <span className="text-xs font-bold uppercase tracking-[0.16em] text-[#6B2D1A]">
                HR Operations
              </span>
            </div>

            <h1 className="mt-2 text-2xl font-bold tracking-tight text-[#17251B] sm:text-3xl">
              HR Dashboard
            </h1>

            <p className="mt-1 text-sm text-[#6F7971]">
              Monitor employee timesheets, finalization and payroll readiness.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">

            {/* SEARCH */}

            <div className="relative">
              <FiSearch
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-[#89948C]"
              />

              <input
                type="text"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search employee..."
                className="h-10 w-[210px] rounded-lg border border-[#D6DED6] bg-white pl-9 pr-3 text-sm shadow-sm outline-none transition-all duration-200 placeholder:text-[#9AA49D] hover:border-[#C5D0C5] focus:border-[#4D8B4F] focus:ring-2 focus:ring-[#4D8B4F]/10"
              />
            </div>

            {/* MONTH DROPDOWN
                No drawer here.
                Only manager-finalized months are shown.
            */}

            <div className="relative">
              <FiCalendar
                size={15}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#4D8B4F]"
              />

              <select
                value={selectedMonth}
                onChange={(event) => setSelectedMonth(event.target.value)}
                className="h-10 min-w-[205px] appearance-none rounded-lg border border-[#D6DED6] bg-white pl-9 pr-10 text-sm font-semibold text-[#36433A] shadow-sm outline-none transition-all duration-200 hover:border-[#C5D0C5] focus:border-[#4D8B4F] focus:ring-2 focus:ring-[#4D8B4F]/10"
              >
                {finalizedMonths.map((month) => (
                  <option key={month.value} value={month.value}>
                    {month.label}
                  </option>
                ))}
              </select>

              <FiChevronDown
                size={15}
                className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#68756C]"
              />
            </div>

          </div>
        </div>


        {/* =================================================
            TOP KPI CARDS
            ================================================= */}

        <div className="mb-5 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">

          {/* TOTAL EMPLOYEES */}

          <KpiCard
            title="Total Employees"
            value={currentMonth.totalEmployees}
            description="Company workforce"
            icon={<FiUsers size={18} />}
            onClick={() => openDrawer("employees")}
            iconBg="bg-[#4D8B4F]"
            cardBg="bg-[#F0F5EE]"
            border="border-[#D9E5D6]"
            valueColor="text-[#285C32]"
            bottom={
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-semibold text-[#4D8B4F]">
                  Current workforce
                </span>
                <FiArrowUpRight size={13} className="text-[#4D8B4F]" />
              </div>
            }
          />

          {/* LEAVE APPROVAL */}

          <KpiCard
            title="Leave Approval"
            value={leaveRequests.filter((request) => request.status === "Pending").length}
            description="Pending leave requests"
            icon={<FiFileText size={18} />}
            onClick={() => openDrawer("leaveRequests")}
            iconBg="bg-[#6B2D1A]"
            cardBg="bg-[#F8F0EC]"
            border="border-[#E8DAD3]"
            valueColor="text-[#6B2D1A]"
            bottom={
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-semibold text-[#6B2D1A]">
                  Review pending requests
                </span>
                <FiArrowUpRight size={13} className="text-[#6B2D1A]" />
              </div>
            }
          />

          {/* PAYROLL APPROVAL */}

          <KpiCard
            title="Payroll Approval"
            value={
              employeeProfiles.filter(
                (employee) =>
                  employee.hrStatus === "Pending" &&
                  employee.payrollStatus === "Ready for HR Review"
              ).length
            }
            description="Pending HR payroll review"
            icon={<FiDollarSign size={18} />}
            onClick={() => openDrawer("payroll")}
            iconBg="bg-[#B7791F]"
            cardBg="bg-[#FFF7E6]"
            border="border-[#EAD9AE]"
            valueColor="text-[#9A6700]"
            bottom={
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-semibold text-[#9A6700]">
                  Review and approve payroll
                </span>
                <FiArrowUpRight size={13} className="text-[#9A6700]" />
              </div>
            }
          />

          {/* PENDING FINALIZATION */}

          <KpiCard
            title="Pending Finalization"
            value={currentMonth.pendingFinalization}
            description="Awaiting manager finalization"
            icon={<FiClock size={18} />}
            onClick={() => openDrawer("pending")}
            iconBg="bg-[#A04B22]"
            cardBg="bg-[#FFF4EC]"
            border="border-[#EDDCCF]"
            valueColor="text-[#8A3D20]"
            bottom={
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-semibold text-[#8A3D20]">
                  Manager workflow
                </span>
                <FiArrowUpRight size={13} className="text-[#8A3D20]" />
              </div>
            }
          />

          {/* FINALIZED TIMESHEETS */}

          <KpiCard
            title="Finalized Timesheets"
            value={
              <>
                {currentMonth.finalizedEmployees}
                <span className="ml-1 text-[16px] font-semibold text-[#7C9580]">
                  / {currentMonth.totalEmployees}
                </span>
              </>
            }
            description="Monthly completion"
            icon={<FinalizationRing percentage={currentMonth.completion} />}
            iconBg="bg-transparent"
            cardBg="bg-[#F0F5EE]"
            border="border-[#D9E5D6]"
            valueColor="text-[#35733C]"
            bottom={
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-semibold text-[#4D8B4F]">
                  {currentMonth.completion}% completed
                </span>
                <FiArrowUpRight size={13} className="text-[#4D8B4F]" />
              </div>
            }
            onClick={() => openDrawer("finalized")}
          />

        </div>


        {/* =================================================
            MAIN DASHBOARD WORKSPACE
            ================================================= */}

        <div className="mb-5">

          {/* FINALIZATION ACTIVITY */}
          <section className="overflow-hidden rounded-[22px] border border-[#DDE4DE] bg-white shadow-[0_8px_30px_rgba(23,37,27,0.035)]">
            {/* HEADER */}
            <div className="border-b border-[#E9EDE9] px-5 py-5 sm:px-6">
              <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                <div className="flex items-start gap-3.5">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[13px] bg-[#EEF5EC] text-[#4D8B4F]">
                    <FiCheckCircle size={18} strokeWidth={2} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-[15px] font-semibold tracking-[-0.01em] text-[#17251B]">Finalization Activity</h2>
                      <span className="rounded-full bg-[#F1F5F0] px-2 py-0.5 text-[9px] font-semibold text-[#55705A]">{currentMonth.label}</span>
                    </div>
                    <p className="mt-1 text-[11px] leading-5 text-[#7A857D]">Recently completed employee timesheets</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <div className="rounded-[11px] border border-[#E1E7E1] bg-[#FAFCFA] px-3.5 py-2.5">
                    <p className="text-[8px] font-medium uppercase tracking-[0.12em] text-[#89938C]">Finalized</p>
                    <p className="mt-0.5 text-[13px] font-semibold text-[#285C32]">
                      {currentMonth.finalizedEmployees}
                      <span className="ml-1 font-normal text-[#8A958D]">/ {currentMonth.totalEmployees}</span>
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => openDrawer("finalized")}
                    className="group flex h-[43px] items-center gap-2 rounded-[11px] border border-[#D9E3D7] bg-white px-3.5 text-[10px] font-semibold text-[#35733C] transition-all duration-200 hover:border-[#BFD2BB] hover:bg-[#F8FBF7] active:scale-[0.98]"
                  >
                    View all
                    <FiChevronRight size={13} className="transition-transform duration-200 group-hover:translate-x-0.5" />
                  </button>
                </div>
              </div>
            </div>
            {/* EMPLOYEE RECORDS */}
            <div className="border-t border-[#EDF1ED] px-5 py-6 sm:px-7">
              {/* DESKTOP TABLE */}
              <div className="overflow-hidden rounded-[16px] border border-[#DEE5DE] bg-white">
                <div className="hidden grid-cols-[minmax(270px,1fr)_120px_135px_150px_42px] items-center border-b border-[#E7ECE7] bg-[#F8FAF8] px-5 py-3.5 sm:grid">
                  <span className="text-[9px] font-semibold uppercase tracking-[0.13em] text-[#87918A]">
                    Employee
                  </span>
                  <span className="text-[9px] font-semibold uppercase tracking-[0.13em] text-[#87918A]">
                    Days worked
                  </span>
                  <span className="text-[9px] font-semibold uppercase tracking-[0.13em] text-[#87918A]">
                    Monthly hours
                  </span>
                  <span className="text-[9px] font-semibold uppercase tracking-[0.13em] text-[#87918A]">
                    Finalized
                  </span>
                  <span />
                </div>

                {filteredEmployees.map((employee, index) => (
                  <button
                    key={employee.id}
                    type="button"
                    onClick={() => openEmployeePayroll(employee)}
                    className={`group relative grid w-full grid-cols-1 items-center gap-4 px-4 py-4 text-left transition-colors duration-200 hover:bg-[#FBFCFB] sm:grid-cols-[minmax(270px,1fr)_120px_135px_150px_42px] sm:gap-0 sm:px-5 ${index !== filteredEmployees.length - 1
                        ? "border-b border-[#EDF0ED]"
                        : ""
                      }`}
                  >
                    <span className="absolute left-0 top-0 h-full w-[3px] bg-[#4D8B4F] opacity-0 transition-opacity duration-200 group-hover:opacity-100" />

                    {/* EMPLOYEE */}
                    <div className="flex min-w-0 items-center gap-3.5">
                      <div className="relative shrink-0">
                        <div className="flex h-11 w-11 items-center justify-center rounded-full border border-[#DCE8DA] bg-[#F1F6F0] text-[12px] font-semibold text-[#4D8B4F]">
                          {employee.name.charAt(0).toUpperCase()}
                        </div>
                        <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-white bg-[#4D8B4F]" />
                      </div>

                      <div className="min-w-0">
                        <div className="flex min-w-0 items-center gap-2">
                          <p className="truncate text-[12px] font-semibold text-[#17251B]">
                            {employee.name}
                          </p>
                          <span className="hidden rounded-md bg-[#EDF6EB] px-1.5 py-1 text-[8px] font-semibold text-[#35733C] md:inline-flex">
                            Finalized
                          </span>
                        </div>

                        <div className="mt-1 flex min-w-0 items-center gap-1.5 text-[9px] text-[#8A948D]">
                          <span className="font-medium text-[#657168]">{employee.code}</span>
                          <span className="h-1 w-1 shrink-0 rounded-full bg-[#C7CEC7]" />
                          <span className="truncate">{employee.department}</span>
                        </div>
                      </div>
                    </div>

                    {/* DAYS WORKED */}
                    <div className="hidden sm:block">
                      <p className="text-[8px] font-medium uppercase tracking-[0.08em] text-[#9AA39C]">
                        Worked
                      </p>
                      <div className="mt-1 flex items-baseline gap-1">
                        <span className="text-[13px] font-semibold text-[#253329]">
                          {employee.daysWorked}
                        </span>
                        <span className="text-[9px] text-[#89938C]">
                          / {employee.workingDays} days
                        </span>
                      </div>
                    </div>

                    {/* MONTHLY HOURS */}
                    <div className="hidden sm:block">
                      <p className="text-[8px] font-medium uppercase tracking-[0.08em] text-[#9AA39C]">
                        Total hours
                      </p>
                      <p className="mt-1 text-[13px] font-semibold text-[#253329]">
                        {employee.monthlyHours}h
                      </p>
                    </div>

                    {/* FINALIZED */}
                    <div className="hidden sm:block">
                      <p className="text-[8px] font-medium uppercase tracking-[0.08em] text-[#9AA39C]">
                        Finalized
                      </p>
                      <p className="mt-1 text-[10px] font-medium text-[#5F6A62]">
                        {employee.finalizedOn}
                      </p>
                    </div>

                    {/* ACTION */}
                    <div className="absolute right-4 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg border border-[#E1E7E1] bg-white text-[#98A29B] transition-all duration-200 group-hover:border-[#C8D9C5] group-hover:bg-[#F1F7EF] group-hover:text-[#4D8B4F] sm:static sm:translate-y-0">
                      <FiChevronRight
                        size={14}
                        className="transition-transform duration-200 group-hover:translate-x-0.5"
                      />
                    </div>

                    {/* MOBILE MONTHLY SUMMARY */}
                    <div className="ml-[58px] grid grid-cols-3 gap-2 pr-9 sm:hidden">
                      <div className="rounded-lg border border-[#E8ECE8] bg-[#F8FAF8] px-2.5 py-2">
                        <p className="text-[7px] font-medium uppercase tracking-[0.08em] text-[#9AA39C]">
                          Days
                        </p>
                        <p className="mt-0.5 text-[10px] font-semibold text-[#344238]">
                          {employee.daysWorked} / {employee.workingDays}
                        </p>
                      </div>

                      <div className="rounded-lg border border-[#E8ECE8] bg-[#F8FAF8] px-2.5 py-2">
                        <p className="text-[7px] font-medium uppercase tracking-[0.08em] text-[#9AA39C]">
                          Hours
                        </p>
                        <p className="mt-0.5 text-[10px] font-semibold text-[#344238]">
                          {employee.monthlyHours}h
                        </p>
                      </div>

                      <div className="rounded-lg border border-[#E8ECE8] bg-[#F8FAF8] px-2.5 py-2">
                        <p className="text-[7px] font-medium uppercase tracking-[0.08em] text-[#9AA39C]">
                          Finalized
                        </p>
                        <p className="mt-0.5 truncate text-[10px] font-semibold text-[#344238]">
                          {employee.finalizedOn.replace(", 2026", "")}
                        </p>
                      </div>
                    </div>
                  </button>
                ))}

                {filteredEmployees.length === 0 && (
                  <div className="px-5 py-14 text-center">
                    <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full border border-[#E2E8E2] bg-[#F7F9F7] text-[#9AA39C]">
                      <FiSearch size={16} />
                    </div>
                    <p className="mt-3 text-[11px] font-semibold text-[#4D574F]">
                      No employees found
                    </p>
                    <p className="mt-1 text-[9px] text-[#98A19A]">
                      Try searching by employee name, ID or department.
                    </p>
                  </div>
                )}
              </div>

              {filteredEmployees.length > 0 && (
                <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#4D8B4F]" />
                    <span className="text-[9px] text-[#7A857D]">
                      Showing manager-finalized monthly records
                    </span>
                  </div>

                  <span className="text-[9px] text-[#8A948D]">
                    Monthly hours = worked days × 8 hours
                  </span>
                </div>
              )}
            </div>
          </section>

        </div>

        {/* =================================================
            HR OPERATIONS
            ================================================= */}

        <div className="mb-5 grid grid-cols-1 gap-5 xl:grid-cols-2">

          {/* UPCOMING HOLIDAYS */}
          <section className="overflow-hidden rounded-2xl border border-[#DCE4DC] bg-white shadow-[0_3px_12px_rgba(40,92,50,0.035)]">

            <div className="flex items-center justify-between border-b border-[#E5EAE5] bg-[#F7F9F6] px-5 py-4">
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#F5E9E3] text-[#6B2D1A]">
                  <FiCalendar size={15} />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-[#17251B]">Upcoming Holidays</h2>
                  <p className="mt-0.5 text-[10px] text-[#748078]">Company holiday calendar</p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => openDrawer("holidays")}
                className="inline-flex items-center gap-1.5 rounded-lg border border-[#E7D7CF] bg-white px-3 py-1.5 text-[10px] font-bold text-[#6B2D1A] shadow-sm transition-all hover:border-[#D7BFAF] hover:bg-[#FFF9F5]"
              >
                View calendar
                <FiChevronRight size={12} />
              </button>
            </div>

            <div className="grid grid-cols-1 gap-2.5 p-4 sm:grid-cols-2">
              {holidays.map((holiday) => (
                <div
                  key={holiday.name}
                  className="flex items-center gap-3 rounded-xl border border-[#E6DED9] bg-[#FBF8F5] p-3.5 transition hover:-translate-y-0.5 hover:shadow-sm"
                >
                  <div className="flex h-11 w-11 shrink-0 flex-col items-center justify-center rounded-xl bg-[#F5E9E3] text-[#6B2D1A]">
                    <span className="text-[7px] font-bold uppercase">{holiday.month}</span>
                    <span className="text-base font-bold">{holiday.date}</span>
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-xs font-bold text-[#17251B]">{holiday.name}</p>
                    <p className="mt-1 text-[9px] font-medium text-[#748078]">{holiday.day}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>


          {/* QUICK ACTIONS */}
          <section className="overflow-hidden rounded-2xl border border-[#DCE4DC] bg-white shadow-[0_3px_12px_rgba(40,92,50,0.035)]">

            <div className="border-b border-[#E5EAE5] bg-[#F7F9F6] px-5 py-4">
              <h2 className="text-sm font-bold text-[#17251B]">Quick Actions</h2>
              <p className="mt-0.5 text-[10px] text-[#748078]">Common HR operations</p>
            </div>
            <div className="grid grid-cols-1 gap-2.5 p-4 sm:grid-cols-2">
              <QuickAction compact icon={<FiDollarSign size={16} />} title="Review Payroll" description="Review payroll-ready employees" type="green" onClick={() => openDrawer("payroll")} />
              <QuickAction compact icon={<FiCalendar size={16} />} title="Holiday Calendar" description="Review upcoming company holidays" type="brown" onClick={() => openDrawer("holidays")} />
              <QuickAction compact icon={<FiFileText size={16} />} title="Leave Requests" description="Review employee leave requests" type="brown" onClick={() => openDrawer("leaveRequests")} />
              <QuickAction
                compact
                icon={<FiCalendar size={16} />}
                title="Leave Management"
                description="Manage leave, balances and history"
                type="green"
                onClick={() => navigate("/hr-dashboard/leave-management")}
              />
            </div>
          </section>

        </div>
        {/* =================================================
            MONTHLY FINALIZATION
            ================================================= */}

        <div className="rounded-2xl border border-[#CFE0CD] bg-[#EAF3E7] px-4 py-3.5">

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

            <div className="flex min-w-0 items-center gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#4D8B4F] text-white shadow-sm">
                <FiCheckCircle size={15} />
              </div>

              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h2 className="text-xs font-bold text-[#285C32]">Monthly Finalization</h2>
                  <span className="rounded-full bg-white/70 px-2 py-0.5 text-[8px] font-bold text-[#35733C]">
                    {currentMonth.completion}% complete
                  </span>
                </div>
                <p className="mt-1 truncate text-[10px] text-[#55705A]">
                  {currentMonth.label} manager-finalized information is available to HR for downstream HR and payroll activities.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => openDrawer("month")}
              className="inline-flex shrink-0 items-center justify-center gap-1.5 rounded-lg border border-[#4D8B4F] bg-[#4D8B4F] px-3.5 py-2 text-[10px] font-bold text-white shadow-sm transition-all hover:-translate-y-0.5 hover:bg-[#3D713F] hover:shadow-md"
            >
              View details
              <FiChevronRight size={13} />
            </button>

          </div>
        </div>

      </main>

      {/* =================================================
          DRAWER
          ================================================= */}

      {drawer && (
        <DashboardDrawer
          type={drawer}
          closeDrawer={closeDrawer}
          pendingEmployees={pendingEmployees}
          holidays={holidays}
          employees={employees}
          leaveEmployees={leaveEmployees}
          leaveRequests={leaveRequests}
          acceptLeave={acceptLeave}
          currentMonth={currentMonth}
          finalizedMonths={finalizedMonths}
        />
      )}

    </div>
  );
};


/* =========================================================
   FINALIZATION RING
   ========================================================= */

const FinalizationRing = ({ percentage }) => {
  const radius = 21;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (circumference * percentage) / 100;

  return (
    <div className="relative flex h-14 w-14 items-center justify-center">
      <svg
        viewBox="0 0 52 52"
        className="h-14 w-14 -rotate-90"
        aria-label={`${percentage}% finalized`}
      >
        <circle
          cx="26"
          cy="26"
          r={radius}
          fill="none"
          stroke="#C9DDC8"
          strokeWidth="5"
        />
        <circle
          cx="26"
          cy="26"
          r={radius}
          fill="none"
          stroke="#4D8B4F"
          strokeWidth="5"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-all duration-700"
        />
      </svg>

      <span className="absolute text-[11px] font-bold text-[#285C32]">
        {percentage}%
      </span>
    </div>
  );
};


/* =========================================================
   KPI CARD
   ========================================================= */

const KpiCard = ({
  title,
  value,
  description,
  icon,
  iconBg,
  cardBg,
  border,
  valueColor,
  bottom,
  onClick,
}) => {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={!onClick}
      className={`group relative flex min-h-[142px] w-full flex-col justify-between overflow-hidden rounded-[16px] border ${border} ${cardBg} px-4 py-3.5 text-left transition-all duration-200 ${onClick ? "cursor-pointer hover:-translate-y-[2px] hover:shadow-[0_8px_24px_rgba(23,37,27,0.07)] focus:outline-none focus:ring-2 focus:ring-[#4D8B4F]/10" : "cursor-default"}`}
    >
      <div className="relative flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="truncate text-[12px] font-semibold leading-5 text-[#5E6D62]">
            {title}
          </p>

          <div className={`mt-2 text-[27px] font-bold leading-none tracking-tight ${valueColor}`}>
            {value}
          </div>

          <p className="mt-2 line-clamp-2 text-[10px] leading-4 text-[#7A857D]">
            {description}
          </p>
        </div>

        <div
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-[11px] ${iconBg} text-white shadow-sm transition-transform duration-200 group-hover:scale-105`}
        >
          {icon}
        </div>
      </div>

      <div className="relative mt-3 pt-1">
        {bottom}
      </div>
    </button>
  );
};

/* =========================================================
   QUICK ACTION
   ========================================================= */

const QuickAction = ({
  icon,
  title,
  description,
  type,
  onClick,
  compact = false,
}) => {
  const green = type === "green";

  return (
    <button
      type="button"
      onClick={onClick}
      className={`group flex w-full items-center ${compact ? "gap-3 px-4 py-4" : "gap-4 px-6 py-4"
        } text-left transition-all duration-200 ${green
          ? "hover:bg-[#F6FAF5]"
          : "hover:bg-[#FFF9F5]"
        } focus:outline-none focus:ring-2 focus:ring-inset focus:ring-[#4D8B4F]/10`}
    >
      <div
        className={`flex shrink-0 items-center justify-center ${compact ? "h-9 w-9 rounded-lg" : "h-10 w-10 rounded-xl"
          } ${green
            ? "bg-[#E8F2E5] text-[#4D8B4F]"
            : "bg-[#F5E9E3] text-[#6B2D1A]"
          }`}
      >
        {icon}
      </div>

      <div className="min-w-0 flex-1">
        <p className={`${compact ? "text-[12px]" : "text-sm"} font-semibold text-[#17251B]`}>
          {title}
        </p>

        <p className={`${compact ? "mt-1 text-[10px]" : "mt-1 text-xs"} truncate text-[#7A857D]`}>
          {description}
        </p>
      </div>

      <FiChevronRight
        size={compact ? 15 : 17}
        className="shrink-0 text-[#9AA49D] transition group-hover:translate-x-1"
      />
    </button>
  );
};


/* =========================================================
   PAYROLL STAT
   ========================================================= */

const PayrollStat = ({
  title,
  value,
  description,
  icon,
  valueColor,
  iconBg,
  iconColor,
  border,
  onClick,
  compact = false,
}) => {
  return (
    <div
      className={`${compact ? "min-h-[138px] p-4" : "p-6"} ${border
          ? compact
            ? "border-l border-[#E8DCD5]"
            : "border-t border-[#E8E1DC] md:border-l md:border-t-0"
          : ""
        }`}
    >
      <div className="flex items-start justify-between gap-2">

        <div className="min-w-0">
          <p className={`${compact ? "text-[11px]" : "text-xs"} font-medium text-[#6F7771]`}>
            {title}
          </p>

          <div className={`${compact ? "mt-2" : "mt-3"} flex items-end gap-1.5`}>
            <span className={`${compact ? "text-2xl" : "text-3xl"} font-bold ${valueColor}`}>
              {value}
            </span>

            <span className={`${compact ? "mb-0.5 text-[10px]" : "mb-1 text-xs"} text-[#7D8981]`}>
              {description}
            </span>
          </div>

          <button
            type="button"
            onClick={onClick}
            className={`inline-flex items-center gap-1.5 ${compact ? "mt-2 px-2.5 py-1.5 text-[10px]" : "mt-3 px-3 py-1.5 text-xs"} rounded-lg border border-[#DCE4DC] bg-white font-bold ${valueColor} shadow-sm transition-all duration-200 hover:border-[#C6D3C6] hover:bg-[#F7F9F6] focus:outline-none focus:ring-2 focus:ring-[#4D8B4F]/10`}
          >
            View details
            <FiChevronRight size={12} />
          </button>
        </div>

        <div
          className={`flex shrink-0 items-center justify-center ${compact ? "h-9 w-9 rounded-lg" : "h-11 w-11 rounded-xl"
            } ${iconBg} ${iconColor}`}
        >
          {icon}
        </div>

      </div>
    </div>
  );
};


/* =========================================================
   AVATAR
   ========================================================= */

const Avatar = ({ name }) => {
  return (
    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#E8F2E5] text-xs font-bold text-[#4D8B4F]">
      {name.charAt(0).toUpperCase()}
    </div>
  );
};


/* =========================================================
   DASHBOARD DRAWER
   ========================================================= */

const DashboardDrawer = ({
  type,
  closeDrawer,
  pendingEmployees,
  holidays,
  employees,
  leaveEmployees,
  leaveRequests,
  acceptLeave,
  currentMonth,
}) => {

  const drawerInfo = {
    employees: {
      title: "Total Employees",
      subtitle: "Current company workforce",
      icon: <FiUsers size={20} />,
      iconBg: "bg-[#E8F2E5]",
      iconColor: "text-[#4D8B4F]",
    },

    leave: {
      title: "Employees On Leave",
      subtitle: "Employees currently marked on leave",
      icon: <FiCalendar size={20} />,
      iconBg: "bg-[#F5E9E3]",
      iconColor: "text-[#6B2D1A]",
    },

    leaveRequests: {
      title: "Leave Requests",
      subtitle: "Review and accept employee leave requests",
      icon: <FiFileText size={20} />,
      iconBg: "bg-[#F5E9E3]",
      iconColor: "text-[#6B2D1A]",
    },

    pending: {
      title: "Pending Finalization",
      subtitle: "Timesheets awaiting manager finalization",
      icon: <FiClock size={20} />,
      iconBg: "bg-[#FFF1E6]",
      iconColor: "text-[#8A3D20]",
    },

    finalized: {
      title: "Finalized Timesheets",
      subtitle: "Manager-finalized employee timesheets",
      icon: <FiCheckCircle size={20} />,
      iconBg: "bg-[#E8F2E5]",
      iconColor: "text-[#4D8B4F]",
    },

    holidays: {
      title: "Holiday Calendar",
      subtitle: "Upcoming company holidays",
      icon: <FiCalendar size={20} />,
      iconBg: "bg-[#F5E9E3]",
      iconColor: "text-[#6B2D1A]",
    },

    payroll: {
      title: "Payroll",
      subtitle: `${currentMonth.label} payroll readiness`,
      icon: <FiDollarSign size={20} />,
      iconBg: "bg-[#F5E9E3]",
      iconColor: "text-[#6B2D1A]",
    },

    month: {
      title: `${currentMonth.label} Details`,
      subtitle: "Manager-finalized monthly information",
      icon: <FiCalendar size={20} />,
      iconBg: "bg-[#E8F2E5]",
      iconColor: "text-[#4D8B4F]",
    },
  };

  const config = drawerInfo[type];

  return (
    <div className="fixed inset-0 z-[100]">

      {/* BACKDROP */}

      <button
        type="button"
        aria-label="Close"
        onClick={closeDrawer}
        className="absolute inset-0 bg-[#17251B]/30 backdrop-blur-[2px]"
      />


      {/* DRAWER */}

      <aside className="absolute right-0 top-0 flex h-full w-full max-w-[520px] flex-col bg-[#F7F9F6] shadow-2xl">

        {/* HEADER */}

        <div className="flex items-center justify-between border-b border-[#DCE4DC] bg-white px-6 py-5">

          <div className="flex items-center gap-3">

            <div
              className={`flex h-11 w-11 items-center justify-center rounded-xl ${config.iconBg} ${config.iconColor}`}
            >
              {config.icon}
            </div>

            <div>

              <h2 className="text-base font-bold text-[#17251B]">
                {config.title}
              </h2>

              <p className="mt-1 text-xs text-[#748078]">
                {config.subtitle}
              </p>

            </div>

          </div>


          <button
            type="button"
            onClick={closeDrawer}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#DCE4DC] bg-white text-[#657068] shadow-sm transition-all duration-200 hover:border-[#C8D2C8] hover:bg-[#F7F9F6] focus:outline-none focus:ring-2 focus:ring-[#4D8B4F]/10"
          >
            <FiX size={18} />
          </button>

        </div>


        {/* BODY */}

        <div className="flex-1 overflow-y-auto p-5">

          {/* =================================================
              EMPLOYEES
              ================================================= */}

          {type === "employees" && (
            <div className="space-y-3">

              <div className="rounded-xl border border-[#D5E4D2] bg-[#E8F2E5] p-5">

                <p className="text-xs text-[#6F8071]">
                  Total workforce
                </p>

                <p className="mt-1 text-3xl font-bold text-[#285C32]">
                  {currentMonth.totalEmployees}
                </p>

              </div>

              {employees.map((employee) => (

                <div
                  key={employee.id}
                  className="rounded-xl border border-[#DEE4DE] bg-white p-4"
                >

                  <div className="flex items-center gap-3">

                    <Avatar name={employee.name} />

                    <div className="min-w-0 flex-1">

                      <p className="text-sm font-bold text-[#17251B]">
                        {employee.name}
                      </p>

                      <p className="mt-0.5 text-[10px] text-[#7A857D]">
                        {employee.code} • {employee.department}
                      </p>

                    </div>

                  </div>

                </div>

              ))}

            </div>
          )}


          {/* =================================================
              LEAVE
              ================================================= */}

          {type === "leave" && (
            <div className="space-y-5">

              {/* CURRENT LEAVE */}

              <div className="rounded-2xl border border-[#E7D7CF] bg-[#F5E9E3] p-5">

                <div className="flex items-center justify-between">

                  <div>

                    <p className="text-xs font-medium text-[#7B6A61]">
                      Employees currently on leave
                    </p>

                    <p className="mt-1 text-3xl font-bold text-[#6B2D1A]">
                      {leaveEmployees.length}
                    </p>

                  </div>

                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white text-[#6B2D1A]">
                    <FiCalendar size={20} />
                  </div>

                </div>

              </div>


              {/* CURRENT EMPLOYEES ON LEAVE */}

              <div>

                <h3 className="text-sm font-bold text-[#17251B]">
                  Currently On Leave
                </h3>

                <p className="mt-1 text-[11px] text-[#7A857D]">
                  Employees already marked on leave
                </p>

              </div>

              <div className="space-y-3">

                {leaveEmployees.map((employee) => (

                  <div
                    key={employee.id}
                    className="rounded-xl border border-[#E4D8D1] bg-white p-4"
                  >

                    <div className="flex items-center gap-3">

                      <Avatar name={employee.name} />

                      <div className="min-w-0 flex-1">

                        <p className="text-sm font-bold text-[#17251B]">
                          {employee.name}
                        </p>

                        <p className="mt-0.5 text-[10px] text-[#7A857D]">
                          {employee.code} • {employee.department}
                        </p>

                      </div>

                      <span className="rounded-full bg-[#F5E9E3] px-2.5 py-1 text-[10px] font-bold text-[#6B2D1A]">
                        {employee.days} day
                        {employee.days > 1 ? "s" : ""}
                      </span>

                    </div>


                    <div className="mt-3 grid grid-cols-2 gap-2">

                      <div className="rounded-lg bg-[#FBF7F4] p-3">

                        <p className="text-[10px] text-[#7A857D]">
                          Leave Type
                        </p>

                        <p className="mt-1 text-xs font-semibold text-[#36433A]">
                          {employee.leaveType}
                        </p>

                      </div>


                      <div className="rounded-lg bg-[#FBF7F4] p-3">

                        <p className="text-[10px] text-[#7A857D]">
                          Period
                        </p>

                        <p className="mt-1 text-xs font-semibold text-[#36433A]">
                          {employee.period}
                        </p>

                      </div>

                    </div>

                  </div>

                ))}

              </div>


              <div className="rounded-xl border border-[#DCE4DC] bg-[#F7F9F6] p-4">
                <p className="text-xs font-semibold text-[#17251B]">
                  Leave requests are managed separately.
                </p>
                <p className="mt-1 text-[11px] leading-5 text-[#7A857D]">
                  Use Quick Actions → Leave Requests to review and accept pending requests.
                </p>
              </div>

            </div>
          )}


          {/* =================================================
              PENDING FINALIZATION
              ================================================= */}

          {type === "leaveRequests" && (
            <div className="space-y-4">

              <div className="rounded-xl border border-[#E7D7CF] bg-[#F5E9E3] p-5">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-xs font-medium text-[#7B6A61]">Pending leave requests</p>
                    <p className="mt-1 text-3xl font-bold text-[#6B2D1A]">
                      {leaveRequests.filter((request) => request.status === "Pending").length}
                    </p>
                  </div>
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white text-[#6B2D1A]">
                    <FiFileText size={20} />
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                {leaveRequests.map((request) => (
                  <div key={request.id} className="rounded-xl border border-[#DCE4DC] bg-white p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <Avatar name={request.name} />
                        <div>
                          <p className="text-sm font-bold text-[#17251B]">{request.name}</p>
                          <p className="mt-0.5 text-[10px] text-[#7A857D]">
                            {request.code} • {request.department}
                          </p>
                        </div>
                      </div>
                      <span className={`rounded-full px-2.5 py-1 text-[10px] font-bold ${request.status === "Approved"
                          ? "bg-[#E8F2E5] text-[#35733C]"
                          : "bg-[#FFF1E6] text-[#8A3D20]"
                        }`}>
                        {request.status}
                      </span>
                    </div>

                    <div className="mt-4 grid grid-cols-2 gap-2">
                      <div className="rounded-lg bg-[#F7F9F6] p-3">
                        <p className="text-[10px] text-[#7A857D]">Leave Type</p>
                        <p className="mt-1 text-xs font-semibold text-[#36433A]">{request.leaveType}</p>
                      </div>
                      <div className="rounded-lg bg-[#F7F9F6] p-3">
                        <p className="text-[10px] text-[#7A857D]">Duration</p>
                        <p className="mt-1 text-xs font-semibold text-[#36433A]">
                          {request.days} day{request.days > 1 ? "s" : ""}
                        </p>
                      </div>
                    </div>

                    <div className="mt-3 rounded-lg bg-[#FBFCFA] p-3">
                      <p className="text-[10px] text-[#7A857D]">Leave Period</p>
                      <p className="mt-1 text-xs font-semibold text-[#36433A]">
                        {request.from} → {request.to}
                      </p>
                    </div>

                    {request.status === "Pending" ? (
                      <button
                        type="button"
                        onClick={() => acceptLeave(request.id)}
                        className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg bg-[#4D8B4F] py-2.5 text-xs font-bold text-white transition hover:bg-[#3D713F]"
                      >
                        <FiCheckCircle size={14} />
                        Accept Leave
                      </button>
                    ) : (
                      <div className="mt-3 flex items-center justify-center gap-2 rounded-lg bg-[#E8F2E5] py-2.5 text-xs font-bold text-[#35733C]">
                        <FiCheckCircle size={14} />
                        Leave Approved
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}


          {/* =================================================
              PENDING FINALIZATION
              ================================================= */}

          {type === "pending" && (
            <div className="space-y-4">

              <div className="rounded-xl border border-[#E9D8CA] bg-[#FFF1E6] p-5">

                <p className="text-xs text-[#7B6A61]">
                  Awaiting manager finalization
                </p>

                <p className="mt-1 text-3xl font-bold text-[#8A3D20]">
                  {currentMonth.pendingFinalization}
                </p>

                <p className="mt-2 text-[11px] leading-5 text-[#7A6254]">
                  These timesheets remain in the manager workflow.
                  HR does not review or edit them from this dashboard.
                </p>

              </div>


              {pendingEmployees.map((employee) => (

                <div
                  key={employee.id}
                  className="rounded-xl border border-[#E3D9D2] bg-white p-4"
                >

                  <div className="flex items-center justify-between gap-3">

                    <div className="flex items-center gap-3">

                      <Avatar name={employee.name} />

                      <div>

                        <p className="text-sm font-bold text-[#17251B]">
                          {employee.name}
                        </p>

                        <p className="mt-0.5 text-[10px] text-[#7A857D]">
                          {employee.code} • {employee.department}
                        </p>

                      </div>

                    </div>

                    <span className="rounded-full bg-[#FFF1E6] px-2.5 py-1 text-[10px] font-bold text-[#8A3D20]">
                      Awaiting Manager
                    </span>

                  </div>


                  <div className="mt-4 flex items-center justify-between rounded-lg bg-[#FBF7F4] p-3">

                    <span className="text-xs text-[#7A857D]">
                      Workflow days
                    </span>

                    <span className="text-xs font-bold text-[#6B2D1A]">
                      {employee.days}
                    </span>

                  </div>

                </div>

              ))}

            </div>
          )}


          {/* =================================================
              FINALIZED
              ================================================= */}

          {type === "finalized" && (
            <div className="space-y-3">

              <div className="rounded-xl border border-[#D1E3CF] bg-[#E8F2E5] p-5">

                <div className="flex items-center justify-between">

                  <div>

                    <p className="text-xs text-[#6F8071]">
                      {currentMonth.label}
                    </p>

                    <p className="mt-1 text-3xl font-bold text-[#285C32]">
                      {currentMonth.finalizedEmployees}
                      <span className="text-lg font-medium text-[#719175]">
                        {" "}
                        / {currentMonth.totalEmployees}
                      </span>
                    </p>

                  </div>

                  <FiCheckCircle
                    size={28}
                    className="text-[#4D8B4F]"
                  />

                </div>

                <div className="mt-4 h-2 overflow-hidden rounded-full bg-white">

                  <div
                    className="h-full rounded-full bg-[#4D8B4F]"
                    style={{
                      width: `${currentMonth.completion}%`,
                    }}
                  />

                </div>

              </div>


              {employees.map((employee) => (

                <div
                  key={employee.id}
                  className="rounded-xl border border-[#DEE4DE] bg-white p-4"
                >

                  <div className="flex items-center justify-between gap-3">

                    <div className="flex items-center gap-3">

                      <Avatar name={employee.name} />

                      <div>

                        <p className="text-sm font-bold text-[#17251B]">
                          {employee.name}
                        </p>

                        <p className="mt-0.5 text-[10px] text-[#7A857D]">
                          {employee.code} • {employee.department}
                        </p>

                      </div>

                    </div>


                    <span className="rounded-full bg-[#E8F2E5] px-2.5 py-1 text-[10px] font-bold text-[#35733C]">
                      Finalized
                    </span>

                  </div>


                  <div className="mt-4 grid grid-cols-2 gap-2">

                    <div className="rounded-lg bg-[#F7F9F6] p-3">

                      <p className="text-[10px] text-[#7A857D]">
                        Finalized On
                      </p>

                      <p className="mt-1 text-xs font-semibold text-[#36433A]">
                        {employee.finalizedOn}
                      </p>

                    </div>


                    <div className="rounded-lg bg-[#F7F9F6] p-3">

                      <p className="text-[10px] text-[#7A857D]">
                        Hours
                      </p>

                      <p className="mt-1 text-xs font-semibold text-[#36433A]">
                        {employee.hours}
                      </p>

                    </div>

                  </div>

                  <p className="mt-3 text-[10px] text-[#7A857D]">
                    Finalized on {employee.finalizedOn}
                  </p>

                </div>

              ))}

            </div>
          )}


          {/* =================================================
              HOLIDAYS
              ================================================= */}

          {type === "holidays" && (
            <div className="space-y-3">

              {holidays.map((holiday) => (

                <div
                  key={holiday.name}
                  className="flex items-center gap-4 rounded-xl border border-[#E4D8D1] bg-white p-5"
                >

                  <div className="flex h-16 w-16 shrink-0 flex-col items-center justify-center rounded-xl bg-[#F5E9E3] text-[#6B2D1A]">

                    <span className="text-[9px] font-bold">
                      {holiday.month}
                    </span>

                    <span className="text-xl font-bold">
                      {holiday.date}
                    </span>

                  </div>

                  <div>

                    <p className="font-bold text-[#17251B]">
                      {holiday.name}
                    </p>

                    <p className="mt-1 text-xs text-[#7A857D]">
                      {holiday.day}
                    </p>

                  </div>

                </div>

              ))}

            </div>
          )}


          {/* =================================================
              PAYROLL
              ================================================= */}

          {type === "payroll" && (
            <div className="space-y-4">

              <div className="rounded-xl border border-[#E4D8D1] bg-[#FBF6F2] p-5">

                <p className="text-xs text-[#7B6A61]">
                  Payroll status
                </p>

                <p className="mt-2 text-3xl font-bold text-[#6B2D1A]">
                  Ready
                </p>

                <p className="mt-1 text-xs text-[#7A756F]">
                  Finalized timesheets are available for payroll processing.
                </p>

              </div>


              <div className="grid grid-cols-2 gap-3">

                <PayrollMini
                  label="Pending"
                  value={currentMonth.pendingFinalization}
                  type="brown"
                />

                <PayrollMini
                  label="Ready"
                  value={currentMonth.payrollReady}
                  type="green"
                />

                <PayrollMini
                  label="Payslips"
                  value="28"
                  type="green"
                />

                <PayrollMini
                  label="Period"
                  value={currentMonth.label.split(" ")[0].slice(0, 3).toUpperCase()}
                  type="brown"
                />

              </div>


              <button
                type="button"
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#6B2D1A] py-3 text-xs font-bold text-white"
              >
                Open Payroll
                <FiArrowUpRight size={15} />
              </button>

            </div>
          )}


          {/* =================================================
              MONTH DETAILS
              ================================================= */}

          {type === "month" && (
            <div className="space-y-4">

              <div className="rounded-2xl border border-[#D1E3CF] bg-[#E8F2E5] p-5">

                <div className="flex items-center gap-3">

                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white text-[#4D8B4F]">
                    <FiCalendar size={20} />
                  </div>

                  <div>

                    <p className="text-xs text-[#6F8071]">
                      Manager-finalized month
                    </p>

                    <p className="mt-1 text-lg font-bold text-[#285C32]">
                      {currentMonth.label}
                    </p>

                  </div>

                </div>

              </div>


              <div className="grid grid-cols-2 gap-3">

                <div className="rounded-xl border border-[#DCE4DC] bg-white p-4">

                  <p className="text-[10px] uppercase tracking-wider text-[#89938C]">
                    Employees
                  </p>

                  <p className="mt-1 text-2xl font-bold text-[#17251B]">
                    {currentMonth.totalEmployees}
                  </p>

                </div>


                <div className="rounded-xl border border-[#DCE4DC] bg-white p-4">

                  <p className="text-[10px] uppercase tracking-wider text-[#89938C]">
                    Completion
                  </p>

                  <p className="mt-1 text-2xl font-bold text-[#4D8B4F]">
                    {currentMonth.completion}%
                  </p>

                </div>


                <div className="rounded-xl border border-[#DCE4DC] bg-white p-4">

                  <p className="text-[10px] uppercase tracking-wider text-[#89938C]">
                    Finalized
                  </p>

                  <p className="mt-1 text-2xl font-bold text-[#285C32]">
                    {currentMonth.finalizedEmployees}
                  </p>

                </div>


                <div className="rounded-xl border border-[#DCE4DC] bg-white p-4">

                  <p className="text-[10px] uppercase tracking-wider text-[#89938C]">
                    Total Hours
                  </p>

                  <p className="mt-1 text-2xl font-bold text-[#17251B]">
                    {currentMonth.totalHours}
                  </p>

                </div>

              </div>


              <div className="rounded-xl border border-[#CFE0CD] bg-[#EAF3E7] p-4">

                <p className="text-xs font-semibold text-[#285C32]">
                  Finalization information
                </p>

                <div className="mt-3 space-y-2 text-[11px] text-[#55705A]">

                  <div className="flex justify-between gap-3">
                    <span>Finalized by</span>
                    <span className="font-semibold">
                      {currentMonth.finalizedBy}
                    </span>
                  </div>

                  <div className="flex justify-between gap-3">
                    <span>Finalized on</span>
                    <span className="font-semibold">
                      {currentMonth.finalizedOn}
                    </span>
                  </div>

                </div>

              </div>

            </div>
          )}

        </div>


        {/* FOOTER */}

        <div className="border-t border-[#DCE4DC] bg-white p-4">

          <button
            type="button"
            onClick={closeDrawer}
            className="inline-flex w-full items-center justify-center rounded-lg border border-[#D3DAD3] bg-white py-2.5 text-xs font-bold text-[#46534A] shadow-sm transition-all duration-200 hover:border-[#BFCABF] hover:bg-[#F7F9F6] focus:outline-none focus:ring-2 focus:ring-[#4D8B4F]/10"
          >
            Close
          </button>

        </div>

      </aside>

    </div>
  );
};


/* =========================================================
   PAYROLL MINI
   ========================================================= */

const PayrollMini = ({
  label,
  value,
  type,
}) => {
  const green = type === "green";

  return (
    <div
      className={`rounded-xl p-4 ${green
          ? "bg-[#E8F2E5]"
          : "bg-[#F5E9E3]"
        }`}
    >

      <p className="text-[10px] font-medium text-[#6F7971]">
        {label}
      </p>

      <p
        className={`mt-2 text-2xl font-bold ${green
            ? "text-[#4D8B4F]"
            : "text-[#6B2D1A]"
          }`}
      >
        {value}
      </p>

    </div>
  );
};
export default HRDashboard;
