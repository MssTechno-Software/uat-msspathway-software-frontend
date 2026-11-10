import React, { useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  FiDollarSign,
  FiUsers,
  FiCheckCircle,
  FiAlertCircle,
  FiEye,
  FiSearch,
  FiCalendar,
  FiX,
  FiShield,
  FiClock,
  FiFileText,
  FiUserCheck,
  FiCheck,
  FiInfo,
} from "react-icons/fi";

import PayslipPDF from "../container/PayslipPDF";

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

  {
    id: "EMP001",
    name: "Rahul Kumar",
    department: "Engineering",
    designation: "Frontend Developer",
    hours: "36h",
    finalizedOn: "—",
    workingDays: 22,
    paidDays: 20,
    leaveDays: 1,
    lopDays: 1,
    basic: 42000,
    hra: 16800,
    allowances: 6200,
    gross: 65000,
    pf: 5040,
    professionalTax: 200,
    lop: 2727,
    deductions: 7967,
    netPay: 57033,
    managerFinalized: false,
    leaveApproved: true,
    salaryReady: false,
    hrStatus: "Waiting",
    payrollStatus: "Waiting for Manager",
    payslipGenerated: false,
  },
  {
    id: "EMP002",
    name: "Priya Sharma",
    department: "Engineering",
    designation: "Backend Developer",
    hours: "34h",
    finalizedOn: "—",
    workingDays: 22,
    paidDays: 19,
    leaveDays: 2,
    lopDays: 1,
    basic: 38000,
    hra: 15200,
    allowances: 4800,
    gross: 58000,
    pf: 4560,
    professionalTax: 200,
    lop: 2636,
    deductions: 7396,
    netPay: 50604,
    managerFinalized: false,
    leaveApproved: true,
    salaryReady: false,
    hrStatus: "Waiting",
    payrollStatus: "Waiting for Manager",
    payslipGenerated: false,
  },
  {
    id: "EMP006",
    name: "Arjun Kumar",
    department: "Engineering",
    designation: "Node.js Developer",
    hours: "35h",
    finalizedOn: "—",
    workingDays: 22,
    paidDays: 20,
    leaveDays: 1,
    lopDays: 1,
    basic: 39000,
    hra: 15600,
    allowances: 5400,
    gross: 60000,
    pf: 4680,
    professionalTax: 200,
    lop: 2727,
    deductions: 7607,
    netPay: 52393,
    managerFinalized: false,
    leaveApproved: true,
    salaryReady: false,
    hrStatus: "Waiting",
    payrollStatus: "Waiting for Manager",
    payslipGenerated: false,
  },
];

const initialEmployees = employeeProfiles;

const currency = (value) =>
  `₹${Number(value || 0).toLocaleString("en-IN")}`;

const getInitials = (name = "") =>
  name
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

const statusStyles = {
  "Waiting for Manager": "bg-slate-50 text-slate-600 border-slate-200",
  "Ready for HR Review": "bg-amber-50 text-amber-700 border-amber-200",
  "HR Approved": "bg-emerald-50 text-emerald-700 border-emerald-200",
  "Processed": "bg-green-50 text-green-700 border-green-200",
  "Payslip Generated": "bg-green-50 text-green-700 border-green-200",
  "Rejected": "bg-red-50 text-red-700 border-red-200",
  "Pending": "bg-amber-50 text-amber-700 border-amber-200",
  "Approved": "bg-green-50 text-green-700 border-green-200",
};

const StatusBadge = ({ status }) => {
  const style = statusStyles[status] || "bg-slate-50 text-slate-600 border-slate-200";
  const positive = ["HR Approved", "Processed", "Payslip Generated", "Approved"].includes(status);
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-full border text-[10px] font-bold whitespace-nowrap ${style}`}>
      {positive ? <FiCheckCircle
        size={11} /> : <FiClock
        size={11} />}
      {status}
    </span>
  );
};

const HRPayroll = () => {
  const [searchParams] = useSearchParams();
  const requestedEmployeeId = searchParams.get("employee");

  const [selectedMonth, setSelectedMonth] = useState("September 2026");
  const [search, setSearch] = useState("");
  const [employees, setEmployees] = useState(initialEmployees);
  const [activeTab, setActiveTab] = useState("payroll");

  const requestedEmployee = employees.find(
    (item) => item.id.toLowerCase() === requestedEmployeeId?.toLowerCase()
  ) || null;

  const [selectedEmployee, setSelectedEmployee] = useState(() => requestedEmployee);
  const [showReviewModal, setShowReviewModal] = useState(() => Boolean(requestedEmployee));
  const [previousRequestedEmployeeId, setPreviousRequestedEmployeeId] = useState(requestedEmployeeId);
  const [showPayslip, setShowPayslip] = useState(false);
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [feedback, setFeedback] = useState(null);

  if (requestedEmployeeId !== previousRequestedEmployeeId) {
    setPreviousRequestedEmployeeId(requestedEmployeeId);

    const employee = requestedEmployeeId
      ? employees.find(
          (item) => item.id.toLowerCase() === requestedEmployeeId.toLowerCase()
        )
      : null;

    if (employee) {
      setActiveTab("payroll");
      setSelectedEmployee(employee);
      setShowReviewModal(true);
    }
  }

  const finalizedEmployees = useMemo(
    () => employees.filter((employee) => employee.managerFinalized),
    [employees]
  );

  const hrReadyEmployees = useMemo(
    () => employees.filter((employee) =>
      employee.managerFinalized &&
      employee.leaveApproved &&
      employee.salaryReady &&
      employee.hrStatus === "Pending"
    ),
    [employees]
  );

  const payslipEmployees = useMemo(
    () => employees.filter((employee) => employee.payslipGenerated),
    [employees]
  );

  const waitingEmployees = useMemo(
    () => employees.filter((employee) => !employee.managerFinalized),
    [employees]
  );

  const filteredEmployees = useMemo(() => {
    const query = search.trim().toLowerCase();
    const source = activeTab === "payslips" ? payslipEmployees : employees;
    return source.filter((employee) =>
      !query ||
      employee.name.toLowerCase().includes(query) ||
      employee.id.toLowerCase().includes(query)
    );
  }, [employees, payslipEmployees, search, activeTab]);

  const grossPayroll = useMemo(
    () => finalizedEmployees.reduce((sum, employee) => sum + Number(employee.gross || 0), 0),
    [finalizedEmployees]
  );

  const deductions = useMemo(
    () => finalizedEmployees.reduce((sum, employee) => sum + Number(employee.deductions || 0), 0),
    [finalizedEmployees]
  );

  const netPayroll = grossPayroll - deductions;

  const openFeedback = (title, message, type = "success", actionLabel = "Done", onAction = null) => {
    setFeedback({ title, message, type, actionLabel, onAction });
  };

  const closeFeedback = () => {
    const action = feedback?.onAction;
    setFeedback(null);
    if (action) action();
  };

  const handleOpenReview = (employee) => {
    setSelectedEmployee(employee);
    setShowReviewModal(true);
  };

  const handleApproveClick = (employee) => {
    if (!employee.managerFinalized) {
      openFeedback(
        "Approval unavailable",
        "This employee is still waiting for the manager to finalize the monthly timesheet.",
        "error"
      );
      return;
    }
    setSelectedEmployee(employee);
    setShowReviewModal(false);
    setShowApproveModal(true);
  };

  const handleApprovePayroll = () => {
    if (!selectedEmployee) return;
    const employeeName = selectedEmployee.name;
    const updated = { ...selectedEmployee, hrStatus: "Approved", payrollStatus: "HR Approved" };

    setEmployees((current) => current.map((employee) =>
      employee.id === selectedEmployee.id ? updated : employee
    ));
    setSelectedEmployee(updated);
    setShowApproveModal(false);

    openFeedback(
      "Payroll approved",
      `${employeeName}'s payroll has been approved by HR. The employee is now ready for individual payslip generation.`,
      "success",
      "Continue"
    );
  };

  const handleGeneratePayslip = (employee) => {
    if (employee.hrStatus !== "Approved") {
      openFeedback(
        "Payslip unavailable",
        "HR approval is required before this employee's payslip can be generated.",
        "error"
      );
      return;
    }

    const updated = { ...employee, payrollStatus: "Processed", payslipGenerated: true };
    setEmployees((current) => current.map((item) => item.id === employee.id ? updated : item));
    setSelectedEmployee(updated);

    openFeedback(
      "Payslip generated",
      `${employee.name}'s payslip has been generated successfully. You can now view or download the individual PDF.`,
      "success",
      "View Payslip",
      () => {
        setActiveTab("payslips");
        setShowPayslip(true);
      }
    );
  };

  const renderAction = (employee) => {
    if (!employee.managerFinalized) {
      return (
        <button
          type="button"
          onClick={() => handleOpenReview(employee)}
          className="inline-flex items-center justify-center gap-1.5 min-w-[82px] px-3 py-1.5 rounded-lg border border-slate-200 text-[11px] font-bold text-slate-500 hover:bg-slate-50">
          <FiEye
            size={13} /> View
        </button>
      );
    }

    if (employee.payslipGenerated) {
      return (
        <div
          className="flex items-center justify-end gap-1.5 whitespace-nowrap">
          <button
            type="button"
            onClick={() => {
              setSelectedEmployee(employee);
              setShowPayslip(true);
            }}
            className="inline-flex items-center justify-center gap-1.5 min-w-[82px] px-3 py-1.5 rounded-lg border border-slate-200 text-[11px] font-bold text-slate-700 hover:bg-slate-50">
            <FiEye
              size={13} /> View
          </button>
          <PayslipPDF
            employee={employee}
            selectedMonth={selectedMonth}
            className="w-9 h-9 shrink-0 rounded-lg border border-emerald-200 text-emerald-700 bg-emerald-50 flex items-center justify-center hover:bg-emerald-100 disabled:opacity-50 disabled:cursor-not-allowed" />
        </div>
      );
    }

    if (employee.hrStatus === "Approved") {
      return (
        <button
          type="button"
          onClick={() => handleGeneratePayslip(employee)}
          className="inline-flex items-center justify-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-green-800 text-white text-[11px] font-bold hover:bg-green-700">
          <FiFileText
            size={13} /> Generate
        </button>
      );
    }

    return (
      <button
        type="button"
        onClick={() => handleOpenReview(employee)}
        className="inline-flex items-center justify-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[#301E0F] text-white text-[11px] font-bold hover:opacity-90">
        <FiEye
          size={13} /> Review
      </button>
    );
  };

  const renderPayrollTable = () => (
    <div
      className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
      <div
        className="px-5 sm:px-6 py-4 border-b border-slate-200">
        <div
          className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4">
          <div
            className="min-w-0">
            <div
              className="flex items-center gap-2.5">
              <h2
                className="text-base sm:text-lg font-bold text-[#301E0F]">Employee Payroll Review</h2>
              <span
                className="px-2 py-1 rounded-full bg-slate-100 text-slate-500 text-[10px] font-bold">{filteredEmployees.length}</span>
            </div>
            <p
              className="text-xs sm:text-sm text-slate-500 mt-1">Review finalized employees and approve payroll individually.</p>
          </div>

          <div
            className="flex flex-col sm:flex-row sm:items-center gap-2.5 w-full xl:w-auto">
            <div
              className="relative w-full sm:w-64 lg:w-72">
              <FiSearch
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                size={15} />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search employee or ID"
                className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm outline-none focus:bg-white focus:ring-2 focus:ring-green-100" />
            </div>

            <div
              className="inline-flex items-center p-1 rounded-xl bg-slate-100 border border-slate-200 shrink-0">
              <button
                type="button"
                onClick={() => setActiveTab("payroll")}
                className={`px-3.5 py-2 rounded-lg text-[11px] sm:text-xs font-bold transition ${activeTab === "payroll" ? "bg-white text-[#301E0F] shadow-sm" : "text-slate-500 hover:text-slate-800"}`}>Payroll Review</button>
              <button
                type="button"
                onClick={() => setActiveTab("payslips")}
                className={`px-3.5 py-2 rounded-lg text-[11px] sm:text-xs font-bold transition ${activeTab === "payslips" ? "bg-white text-[#301E0F] shadow-sm" : "text-slate-500 hover:text-slate-800"}`}>Payslips <span
                  className="ml-1">{payslipEmployees.length}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div
        className="w-full overflow-hidden">
        <table
          className="w-full table-fixed">
          <colgroup>
            <col
              className="w-[26%]" />
            <col
              className="w-[7%]" />
            <col
              className="w-[10%]" />
            <col
              className="w-[10%]" />
            <col
              className="w-[10%]" />
            <col
              className="w-[10%]" />
            <col
              className="w-[12%]" />
            <col
              className="w-[15%]" />
          </colgroup>
          <thead
            className="bg-slate-50 border-b border-slate-200">
            <tr>
              {[["Employee", "text-left"], ["Pay Days", "text-left hidden sm:table-cell"], ["Gross", "text-left hidden md:table-cell"], ["Deductions", "text-left hidden lg:table-cell"], ["Net Pay", "text-left"], ["Manager", "text-left hidden xl:table-cell"], ["Status", "text-left"], ["Action", "text-right"]].map(([label, cls]) =>
                <th
                  key={label}
                  className={`px-2.5 sm:px-3 lg:px-3.5 py-3 text-[9px] font-bold text-slate-500 uppercase tracking-wider ${cls}`}>{label}</th>)}
            </tr>
          </thead>
          <tbody
            className="divide-y divide-slate-100">
            {filteredEmployees.map((employee) => (
              <tr
                key={employee.id}
                className="hover:bg-[#F8F6F2] transition">
                <td
                  className="px-2.5 sm:px-3 lg:px-3.5 py-3.5 align-middle">
                  <div
                    className="flex items-center gap-2.5 min-w-0">
                    <div
                      className="w-9 h-9 shrink-0 rounded-xl bg-green-50 text-green-800 flex items-center justify-center font-bold text-[10px]">{getInitials(employee.name)}</div>
                    <div
                      className="min-w-0">
                      <p
                        className="font-semibold text-slate-800 text-xs sm:text-sm truncate">{employee.name}</p>
                      <p
                        className="text-[10px] text-slate-500 mt-0.5 truncate">{employee.id} · {employee.designation}</p>
                    </div>
                  </div>
                </td>
                <td
                  className="px-2.5 sm:px-3 lg:px-3.5 py-3.5 hidden sm:table-cell text-left">
                  <div
                    className="leading-tight">
                    <p
                      className="font-semibold text-slate-800 text-xs">{employee.paidDays}</p>
                    <p
                      className="text-[9px] text-slate-400">/{employee.workingDays}</p>
                  </div>
                </td>
                <td
                  className="px-2.5 sm:px-3 lg:px-3.5 py-3.5 text-left hidden md:table-cell">
                  <span
                    className="font-semibold text-slate-800 text-xs">{currency(employee.gross)}</span>
                </td>
                <td
                  className="px-2.5 sm:px-3 lg:px-3.5 py-3.5 text-left hidden lg:table-cell">
                  <span
                    className="font-semibold text-slate-700 text-xs">{currency(employee.deductions)}</span>
                </td>
                <td
                  className="px-2.5 sm:px-3 lg:px-3.5 py-3.5 text-left">
                  <span
                    className="font-bold text-[#301E0F] text-xs sm:text-sm">{currency(employee.netPay)}</span>
                </td>
                <td
                  className="px-2.5 sm:px-3 lg:px-3.5 py-3.5 hidden xl:table-cell">{employee.managerFinalized ? <span
                    className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700">
                    <FiCheckCircle
                      size={12} />Finalized</span> : <span
                        className="inline-flex items-center gap-1 text-[10px] font-bold text-slate-500">
                    <FiClock
                      size={12} />Waiting</span>}</td>
                <td
                  className="px-2.5 sm:px-3 lg:px-3.5 py-3.5">
                  <StatusBadge
                    status={employee.payslipGenerated ? "Payslip Generated" : employee.hrStatus === "Approved" ? "HR Approved" : employee.managerFinalized ? "Ready for HR Review" : "Waiting for Manager"} />
                </td>
                <td
                  className="px-2 sm:px-2.5 lg:px-3 py-3.5 text-right whitespace-nowrap">{renderAction(employee)}</td>
              </tr>
            ))}
            {!filteredEmployees.length && <tr>
              <td
                colSpan={8}
                className="px-6 py-16 text-center">
                <FiUsers
                  className="mx-auto text-slate-300"
                  size={28} />
                <p
                  className="font-semibold text-slate-600 mt-3 text-sm">No employees found</p>
                <p
                  className="text-xs text-slate-400 mt-1">Try another employee name or ID.</p>
              </td>
            </tr>}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderPayslipTable = () => (
    <div
      className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
      <div
        className="px-5 sm:px-6 py-4 border-b border-slate-200">
        <div
          className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4">
          <div>
            <div
              className="flex items-center gap-2.5">
              <h2
                className="text-base sm:text-lg font-bold text-[#301E0F]">Generated Payslips</h2>
              <span
                className="px-2 py-1 rounded-full bg-green-50 text-green-700 text-[10px] font-bold">{payslipEmployees.length}</span>
            </div>
            <p
              className="text-xs sm:text-sm text-slate-500 mt-1">Individual payslips generated after HR approval.</p>
          </div>
          <div
            className="flex items-center gap-2 w-full xl:w-auto">
            <div
              className="relative flex-1 sm:w-64 xl:w-72">
              <FiSearch
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                size={15} />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search employee or ID"
                className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm outline-none focus:bg-white focus:ring-2 focus:ring-green-100" />
            </div>
            <div
              className="inline-flex items-center p-1 rounded-xl bg-slate-100 border border-slate-200 shrink-0">
              <button
                type="button"
                onClick={() => setActiveTab("payroll")}
                className="px-3.5 py-2 rounded-lg text-[11px] sm:text-xs font-bold text-slate-500 hover:text-slate-800">Payroll Review</button>
              <button
                type="button"
                onClick={() => setActiveTab("payslips")}
                className="px-3.5 py-2 rounded-lg text-[11px] sm:text-xs font-bold bg-white text-[#301E0F] shadow-sm">Payslips <span
                  className="ml-1">{payslipEmployees.length}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
      {filteredEmployees.length === 0 ? (
        <div
          className="py-20 px-6 text-center">
          <div
            className="mx-auto w-14 h-14 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400">
            <FiFileText
              size={24} />
          </div>
          <h3
            className="font-bold text-slate-700 mt-4 text-sm">No payslips generated</h3>
          <p
            className="text-xs sm:text-sm text-slate-500 mt-1 max-w-md mx-auto">Approve an employee in Payroll Review and generate the individual payslip.</p>
        </div>
      ) : (
        <div
          className="w-full overflow-hidden">
          <table
            className="w-full table-fixed">
            <colgroup>
              <col
                className="w-[36%]" />
              <col
                className="w-[18%]" />
              <col
                className="w-[18%]" />
              <col
                className="w-[28%]" />
            </colgroup>
            <thead
              className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th
                  className="px-4 sm:px-5 py-3.5 text-left text-[9px] font-bold text-slate-500 uppercase">Employee</th>
                <th
                  className="px-4 sm:px-5 py-3.5 text-left text-[9px] font-bold text-slate-500 uppercase hidden sm:table-cell">Pay Period</th>
                <th
                  className="px-4 sm:px-5 py-3.5 text-right text-[9px] font-bold text-slate-500 uppercase">Net Pay</th>
                <th
                  className="px-4 sm:px-5 py-3.5 text-right text-[9px] font-bold text-slate-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody
              className="divide-y divide-slate-100">{filteredEmployees.map((employee) => <tr
                key={employee.id}
                className="hover:bg-[#F8F6F2]">
                <td
                  className="px-4 sm:px-5 py-4">
                  <p
                    className="font-semibold text-slate-800 text-xs sm:text-sm truncate">{employee.name}</p>
                  <p
                    className="text-[10px] text-slate-500 mt-0.5 truncate">{employee.id} · {employee.designation}</p>
                </td>
                <td
                  className="px-4 sm:px-5 py-4 text-xs text-slate-600 hidden sm:table-cell">{selectedMonth}</td>
                <td
                  className="px-4 sm:px-5 py-4 text-right font-bold text-[#301E0F] text-xs sm:text-sm">{currency(employee.netPay)}</td>
                <td
                  className="px-4 sm:px-5 py-4">
                  <div
                    className="flex items-center justify-end gap-1.5 whitespace-nowrap">
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedEmployee(employee);
                        setShowPayslip(true);
                      }}
                      className="inline-flex items-center justify-center gap-1.5 min-w-[82px] px-3 py-1.5 rounded-lg border border-slate-200 text-[11px] font-bold text-slate-700 hover:bg-slate-50">
                      <FiEye
                        size={13} />View</button>
                    <PayslipPDF
                      employee={employee}
                      selectedMonth={selectedMonth}
                      className="w-9 h-9 shrink-0 rounded-lg border border-emerald-200 text-emerald-700 bg-emerald-50 flex items-center justify-center hover:bg-emerald-100 disabled:opacity-50 disabled:cursor-not-allowed" />
                  </div>
                </td>
              </tr>)}</tbody>
          </table>
        </div>
      )}
    </div>
  );

  return (
    <div
      className="hr-payroll min-h-screen bg-[#F8F6F2]">
      <header
        className="bg-white border-b border-slate-200">
        <div
          className="px-5 sm:px-6 lg:px-8 py-5">
          <div
            className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div
              className="flex items-center gap-2.5 min-w-0">
              <div
                className="w-11 h-11 shrink-0 rounded-xl bg-green-50 text-green-800 flex items-center justify-center">
                <FiDollarSign
                  size={21} />
              </div>
              <div
                className="min-w-0">
                <h1
                  className="text-xl sm:text-2xl font-bold text-[#301E0F]">Payroll</h1>
                <p
                  className="text-xs sm:text-sm text-slate-500 mt-1 truncate">Review finalized timesheets, approve payroll and generate individual payslips.</p>
              </div>
            </div>
            <div
              className="flex items-center gap-3 shrink-0">
              <div
                className="flex items-center gap-2">
                <FiCalendar
                  className="text-slate-400"
                  size={15} />
                <select
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  className="bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm font-semibold text-slate-700 outline-none focus:ring-2 focus:ring-green-100">
                  <option>September 2026</option>
                  <option>August 2026</option>
                  <option>July 2026</option>
                  <option>June 2026</option>
                </select>
              </div>
              <div
                className={`hidden sm:flex items-center gap-2 px-3.5 py-2.5 rounded-xl border ${waitingEmployees.length ? "bg-amber-50 border-amber-200 text-amber-700" : "bg-green-50 border-green-200 text-green-700"}`}>
                <span
                  className={`w-2 h-2 rounded-full ${waitingEmployees.length ? "bg-amber-500" : "bg-green-600"}`} />
                <span
                  className="text-xs font-bold">{waitingEmployees.length ? `${waitingEmployees.length} waiting` : "Payroll Ready"}</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main
        className="p-4 sm:p-6 lg:p-8 max-w-[1600px] mx-auto">
        <section
          className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
          <div
            className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-sm">
            <div
              className="flex items-start justify-between gap-2">
              <div>
                <p
                  className="text-[11px] text-slate-500">Employees</p>
                <h2
                  className="text-2xl font-bold text-[#301E0F] mt-1.5">{employees.length}</h2>
                <p
                  className="text-[10px] text-slate-400 mt-1">Payroll population</p>
              </div>
              <div
                className="w-9 h-9 rounded-xl bg-green-50 text-green-800 flex items-center justify-center">
                <FiUsers
                  size={17} />
              </div>
            </div>
          </div>
          <div
            className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-sm">
            <div
              className="flex items-start justify-between gap-2">
              <div>
                <p
                  className="text-[11px] text-slate-500">Manager Finalized</p>
                <h2
                  className="text-2xl font-bold text-[#301E0F] mt-1.5">{finalizedEmployees.length}</h2>
                <p
                  className="text-[10px] text-green-700 mt-1">Ready for HR</p>
              </div>
              <div
                className="w-9 h-9 rounded-xl bg-green-50 text-green-800 flex items-center justify-center">
                <FiUserCheck
                  size={17} />
              </div>
            </div>
          </div>
          <div
            className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-sm">
            <div
              className="flex items-start justify-between gap-2">
              <div>
                <p
                  className="text-[11px] text-slate-500">HR Review</p>
                <h2
                  className="text-2xl font-bold text-[#301E0F] mt-1.5">{hrReadyEmployees.length}</h2>
                <p
                  className="text-[10px] text-amber-700 mt-1">Individual approval</p>
              </div>
              <div
                className="w-9 h-9 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center">
                <FiClock
                  size={17} />
              </div>
            </div>
          </div>
          <div
            className="bg-[#301E0F] rounded-2xl p-4 sm:p-5 text-white shadow-sm">
            <div
              className="flex items-start justify-between gap-2">
              <div>
                <p
                  className="text-[11px] text-white/60">Net Payroll</p>
                <h2
                  className="text-lg sm:text-xl font-bold mt-1.5">{currency(netPayroll)}</h2>
                <p
                  className="text-[10px] text-white/50 mt-1">Finalized employees</p>
              </div>
              <div
                className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center">
                <FiDollarSign
                  size={17} />
              </div>
            </div>
          </div>
        </section>

        {activeTab === "payroll" ? renderPayrollTable() : renderPayslipTable()}
      </main>

      {feedback && (
        <div
          className="fixed inset-0 z-[100] bg-[#301E0F]/30 backdrop-blur-sm flex items-center justify-center p-4">
          <div
            className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
            <div
              className="p-7 text-center">
              <div
                className={`mx-auto w-14 h-14 rounded-2xl flex items-center justify-center ${feedback.type === "error" ? "bg-red-50 text-red-600" : "bg-green-50 text-green-700"}`}>{feedback.type === "error" ? <FiAlertCircle
                  size={25} /> : <FiCheckCircle
                  size={25} />}</div>
              <h2
                className="text-xl font-bold text-[#301E0F] mt-4">{feedback.title}</h2>
              <p
                className="text-sm text-slate-500 leading-6 mt-2">{feedback.message}</p>
            </div>
            <div
              className="px-6 py-4 border-t border-slate-200 flex justify-end">
              <button
                type="button"
                onClick={closeFeedback}
                className={`px-5 py-2.5 rounded-xl text-sm font-bold text-white ${feedback.type === "error" ? "bg-[#301E0F]" : "bg-green-800 hover:bg-green-700"}`}>{feedback.actionLabel}</button>
            </div>
          </div>
        </div>
      )}

      {showReviewModal && selectedEmployee && (
        <div
          className="fixed inset-0 z-50 bg-[#301E0F]/30 backdrop-blur-sm flex items-center justify-center p-4">
          <div
            className="bg-white w-full max-w-3xl max-h-[90vh] rounded-2xl shadow-2xl overflow-hidden flex flex-col">
            <div
              className="px-5 sm:px-6 py-5 border-b border-slate-200 flex items-center justify-between shrink-0">
              <div
                className="min-w-0">
                <div
                  className="flex flex-wrap items-center gap-2">
                  <h2
                    className="text-lg sm:text-xl font-bold text-[#301E0F]">
                    HR Payroll Review
                  </h2>
                  <StatusBadge
                    status={selectedEmployee.managerFinalized ? "Ready for HR Review" : "Waiting for Manager"} />
                </div>
                <p
                  className="text-xs sm:text-sm text-slate-500 mt-1 truncate">{selectedEmployee.name} · {selectedEmployee.id}</p>
              </div>
              <button
                type="button"
                onClick={() => setShowReviewModal(false)}
                className="w-9 h-9 shrink-0 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-500">
                <FiX />
              </button>
            </div>
            <div
              className="p-5 sm:p-6 overflow-y-auto">
              {!selectedEmployee.managerFinalized ? (
                <div
                  className="rounded-2xl border border-amber-200 bg-amber-50 p-5">
                  <div
                    className="flex gap-3">
                    <div
                      className="w-10 h-10 rounded-xl bg-white text-amber-600 flex items-center justify-center shrink-0">
                      <FiClock
                        size={18} />
                    </div>
                    <div>
                      <p
                        className="font-bold text-amber-800">Waiting for manager finalization</p>
                      <p
                        className="text-sm text-amber-700 mt-1 leading-5">HR cannot approve payroll or generate a payslip until the manager finalizes this employee's monthly timesheet.</p>
                    </div>
                  </div>
                </div>
              ) : (
                <>
                  <div
                    className="rounded-2xl bg-green-50 border border-green-200 p-4 mb-5">
                    <div
                      className="flex items-center gap-3">
                      <div
                        className="w-9 h-9 rounded-xl bg-green-700 text-white flex items-center justify-center">
                        <FiCheck
                          size={17} />
                      </div>
                      <div>
                        <p
                          className="text-sm font-bold text-green-800">Manager finalized this employee</p>
                        <p
                          className="text-xs text-green-700 mt-0.5">HR can review the finalized payroll data below.</p>
                      </div>
                    </div>
                  </div>
                  <div
                    className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">{[["Working Days", selectedEmployee.workingDays], ["Paid Days", selectedEmployee.paidDays], ["Leave Days", selectedEmployee.leaveDays], ["LOP Days", selectedEmployee.lopDays]].map(([label, value]) =>
                      <div
                        key={label}
                        className="bg-slate-50 border border-slate-100 rounded-xl p-4">
                        <p
                          className="text-[11px] text-slate-500">{label}</p>
                        <p
                          className="text-lg font-bold text-slate-800 mt-1">{value}</p>
                      </div>)}</div>
                  <div
                    className="grid md:grid-cols-2 gap-5">
                    <div>
                      <h3
                        className="font-bold text-slate-800 mb-3">Earnings</h3>
                      <div
                        className="border border-slate-200 rounded-xl overflow-hidden">{[["Basic Salary", selectedEmployee.basic], ["HRA", selectedEmployee.hra], ["Allowances", selectedEmployee.allowances], ["Gross Salary", selectedEmployee.gross]].map(([label, value], index) =>
                          <div
                            key={label}
                            className={`flex justify-between px-4 py-3 ${index === 3 ? "bg-slate-50" : "border-b border-slate-100"}`}>
                            <span
                              className={`text-sm ${index === 3 ? "font-bold text-slate-800" : "text-slate-600"}`}>{label}</span>
                            <span
                              className="font-semibold text-slate-800">{currency(value)}</span>
                          </div>)}</div>
                    </div>
                    <div>
                      <h3
                        className="font-bold text-slate-800 mb-3">Deductions</h3>
                      <div
                        className="border border-slate-200 rounded-xl overflow-hidden">{[["PF", selectedEmployee.pf], ["Professional Tax", selectedEmployee.professionalTax], ["LOP", selectedEmployee.lop], ["Total Deductions", selectedEmployee.deductions]].map(([label, value], index) =>
                          <div
                            key={label}
                            className={`flex justify-between px-4 py-3 ${index === 3 ? "bg-slate-50" : "border-b border-slate-100"}`}>
                            <span
                              className={`text-sm ${index === 3 ? "font-bold text-slate-800" : "text-slate-600"}`}>{label}</span>
                            <span
                              className={`font-semibold ${label === "LOP" ? "text-red-600" : "text-slate-800"}`}>{currency(value)}</span>
                          </div>)}</div>
                    </div>
                  </div>
                  <div
                    className="mt-5 bg-[#301E0F] text-white rounded-xl p-5 flex items-center justify-between">
                    <div>
                      <p
                        className="text-xs text-white/60">Net Pay</p>
                      <p
                        className="text-2xl font-bold mt-1">{currency(selectedEmployee.netPay)}</p>
                    </div>
                    <FiDollarSign
                      size={28} />
                  </div>
                </>
              )}
            </div>
            <div
              className="px-5 sm:px-6 py-4 border-t border-slate-200 flex justify-end gap-2 shrink-0">
              <button
                type="button"
                onClick={() => setShowReviewModal(false)}
                className="px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-700">Close</button>{selectedEmployee.managerFinalized && selectedEmployee.hrStatus !== "Approved" && !selectedEmployee.payslipGenerated && <button
                  type="button"
                  onClick={() => handleApproveClick(selectedEmployee)}
                  className="px-5 py-2.5 rounded-xl bg-green-800 text-white text-sm font-semibold flex items-center gap-2">
                  <FiCheckCircle
                    size={15} />Approve Payroll</button>}{selectedEmployee.hrStatus === "Approved" && !selectedEmployee.payslipGenerated && <button
                      type="button"
                      onClick={() => {
                        setShowReviewModal(false);
                        handleGeneratePayslip(selectedEmployee);
                      }}
                      className="px-5 py-2.5 rounded-xl bg-[#301E0F] text-white text-sm font-semibold flex items-center gap-2">
                      <FiFileText
                        size={15} />Generate Payslip</button>}</div>
          </div>
        </div>
      )}

      {showApproveModal && selectedEmployee && (
        <div
          className="fixed inset-0 z-[90] bg-[#301E0F]/35 backdrop-blur-sm flex items-center justify-center p-4">
          <div
            className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden">
            <div
              className="p-6">
              <div
                className="w-12 h-12 rounded-2xl bg-green-50 text-green-700 flex items-center justify-center mb-4">
                <FiShield
                  size={22} />
              </div>
              <h2
                className="text-xl font-bold text-[#301E0F]">Approve payroll?</h2>
              <p
                className="text-sm text-slate-500 mt-2 leading-5">You are approving payroll for <span
                  className="font-bold text-slate-700">{selectedEmployee.name}</span> for {selectedMonth}.</p>
              <div
                className="mt-5 rounded-xl bg-slate-50 border border-slate-200 p-4 space-y-3">
                <div
                  className="flex justify-between">
                  <span
                    className="text-xs text-slate-500">Gross Salary</span>
                  <span
                    className="text-sm font-bold text-slate-800">{currency(selectedEmployee.gross)}</span>
                </div>
                <div
                  className="flex justify-between">
                  <span
                    className="text-xs text-slate-500">Deductions</span>
                  <span
                    className="text-sm font-bold text-slate-800">{currency(selectedEmployee.deductions)}</span>
                </div>
                <div
                  className="border-t border-slate-200 pt-3 flex justify-between">
                  <span
                    className="text-sm font-bold text-slate-700">Net Pay</span>
                  <span
                    className="text-lg font-bold text-[#301E0F]">{currency(selectedEmployee.netPay)}</span>
                </div>
              </div>
              <div
                className="mt-4 flex items-start gap-2 text-[11px] text-slate-500">
                <FiInfo
                  size={14}
                  className="mt-0.5 shrink-0" />
                <span>Only this employee will be approved. Other employees remain unchanged.</span>
              </div>
            </div>
            <div
              className="px-6 py-4 border-t border-slate-200 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowApproveModal(false)}
                className="px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-700">Cancel</button>
              <button
                type="button"
                onClick={handleApprovePayroll}
                className="px-5 py-2.5 rounded-xl bg-green-800 text-white text-sm font-semibold flex items-center gap-2">
                <FiCheck
                  size={15} />Confirm Approval</button>
            </div>
          </div>
        </div>
      )}

      {showPayslip && selectedEmployee && (
        <div
          className="fixed inset-0 z-50 bg-[#301E0F]/35 backdrop-blur-sm flex items-center justify-center p-4">
          <div
            className="bg-white w-full max-w-3xl max-h-[92vh] rounded-2xl shadow-2xl overflow-hidden flex flex-col">
            <div
              className="px-5 sm:px-6 py-5 border-b border-slate-200 flex items-center justify-between shrink-0">
              <div
                className="min-w-0">
                <div
                  className="flex flex-wrap items-center gap-2">
                  <h2
                    className="text-lg sm:text-xl font-bold text-[#301E0F]">Employee Payslip</h2>
                  <StatusBadge
                    status="Payslip Generated" />
                </div>
                <p
                  className="text-xs sm:text-sm text-slate-500 mt-1 truncate">
                  {selectedEmployee.name} · {selectedEmployee.id} · {selectedMonth}
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setShowPayslip(false);
                  setSelectedEmployee(null);
                }}
                className="w-9 h-9 rounded-lg hover:bg-slate-100 flex items-center justify-center">
                <FiX />
              </button>
            </div>

            <div
              className="p-5 sm:p-8 overflow-y-auto">
              <div
                className="border border-slate-200 rounded-2xl overflow-hidden">
                <div
                  className="bg-[#301E0F] text-white px-5 sm:px-6 py-5 flex items-center justify-between gap-4">
                  <div
                    className="flex items-center gap-3">
                    <div
                      className="w-11 h-11 rounded-xl bg-white/10 flex items-center justify-center">
                      <FiFileText
                        size={20} />
                    </div>
                    <div>
                      <h3
                        className="font-bold text-lg">MSS Techno</h3>
                      <p
                        className="text-xs text-white/60">Employee Payslip</p>
                    </div>
                  </div>
                  <div
                    className="text-right">
                    <p
                      className="text-[10px] text-white/50 uppercase tracking-wide">Pay Period</p>
                    <p
                      className="text-sm font-bold mt-1">{selectedMonth}</p>
                  </div>
                </div>

                <div
                  className="p-5 sm:p-6">
                  <div
                    className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-5 pb-6 border-b border-slate-200">
                    {[
                      ["Employee", selectedEmployee.name],
                      ["Employee ID", selectedEmployee.id],
                      ["Department", selectedEmployee.department],
                      ["Designation", selectedEmployee.designation],
                    ].map(([label, value]) => (
                      <div
                        key={label}
                        className="min-w-0">
                        <p
                          className="text-[10px] uppercase tracking-wide text-slate-400 font-bold">{label}</p>
                        <p
                          className="font-semibold text-slate-800 text-xs sm:text-sm mt-1 truncate">{value}</p>
                      </div>
                    ))}
                  </div>

                  <div
                    className="grid grid-cols-4 gap-2 sm:gap-3 py-6 border-b border-slate-200">
                    {[
                      ["Working", selectedEmployee.workingDays],
                      ["Paid", selectedEmployee.paidDays],
                      ["Leave", selectedEmployee.leaveDays],
                      ["LOP", selectedEmployee.lopDays],
                    ].map(([label, value]) => (
                      <div
                        key={label}
                        className="bg-slate-50 rounded-xl p-3">
                        <p
                          className="text-[10px] text-slate-500">{label}</p>
                        <p
                          className="font-bold text-slate-800 mt-1">{value}</p>
                      </div>
                    ))}
                  </div>

                  <div
                    className="grid md:grid-cols-2 gap-6 pt-6">
                    <div>
                      <h3
                        className="font-bold text-slate-800 mb-3">Earnings</h3>
                      <div
                        className="border border-slate-200 rounded-xl overflow-hidden">
                        {[
                          ["Basic Salary", selectedEmployee.basic],
                          ["HRA", selectedEmployee.hra],
                          ["Allowances", selectedEmployee.allowances],
                          ["Gross", selectedEmployee.gross],
                        ].map(([label, value], index) => (
                          <div
                            key={label}
                            className={`flex justify-between px-4 py-3 ${index === 3 ? "bg-slate-50" : "border-b border-slate-100"}`}>
                            <span
                              className={`text-sm ${index === 3 ? "font-bold" : "text-slate-600"}`}>{label}</span>
                            <span
                              className="font-semibold">{currency(value)}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h3
                        className="font-bold text-slate-800 mb-3">Deductions</h3>
                      <div
                        className="border border-slate-200 rounded-xl overflow-hidden">
                        {[
                          ["PF", selectedEmployee.pf],
                          ["Professional Tax", selectedEmployee.professionalTax],
                          ["LOP", selectedEmployee.lop],
                          ["Deductions", selectedEmployee.deductions],
                        ].map(([label, value], index) => (
                          <div
                            key={label}
                            className={`flex justify-between px-4 py-3 ${index === 3 ? "bg-slate-50" : "border-b border-slate-100"}`}>
                            <span
                              className={`text-sm ${index === 3 ? "font-bold" : "text-slate-600"}`}>{label}</span>
                            <span
                              className="font-semibold">{currency(value)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div
                    className="mt-7 bg-[#301E0F] text-white rounded-xl p-5 flex items-center justify-between">
                    <div>
                      <p
                        className="text-xs text-white/60">Net Pay</p>
                      <p
                        className="text-3xl font-bold mt-1">{currency(selectedEmployee.netPay)}</p>
                    </div>
                    <FiDollarSign
                      size={30} />
                  </div>
                </div>
              </div>

              <div
                className="mt-5 rounded-xl bg-green-50 border border-green-200 p-4">
                <div
                  className="flex gap-3">
                  <FiCheckCircle
                    className="text-green-700 mt-0.5"
                    size={17} />
                  <div>
                    <p
                      className="text-sm font-bold text-green-800">Payslip generated successfully</p>
                    <p
                      className="text-xs text-green-700 mt-1">
                      This payslip belongs only to {selectedEmployee.name}. Download the individual PDF below.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div
              className="px-5 sm:px-6 py-4 border-t border-slate-200 flex justify-end gap-2 shrink-0">
              <button
                type="button"
                onClick={() => {
                  setShowPayslip(false);
                  setSelectedEmployee(null);
                }}
                className="px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-700">
                Close
              </button>
              <PayslipPDF
                employee={selectedEmployee}
                selectedMonth={selectedMonth}
                className="px-5 py-2.5 rounded-xl bg-green-800 text-white text-sm font-semibold flex items-center gap-2 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HRPayroll;
