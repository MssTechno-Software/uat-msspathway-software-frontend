import React, { useCallback, useMemo, useState } from "react";
import {
  FiActivity,
  FiAlertCircle,
  FiBarChart2,
  FiBriefcase,
  FiCalendar,
  FiCheckCircle,
  FiChevronRight,
  FiClock,
  FiDownload,
  FiEdit3,
  FiEye,
  FiFileText,
  FiLayers,
  FiPlus,
  FiSearch,
  FiShield,
  FiTrash2,
  FiTrendingUp,
  FiUsers,
  FiX,
  FiXCircle,
  FiDollarSign,
  FiClipboard,
} from "react-icons/fi";

const INITIAL_EMPLOYEES = [
  { id: "EMP001", name: "Rahul Kumar", department: "Engineering", technology: "React", manager: "Venkat Rao", joiningDate: "12 Jan 2025", status: "Active" },
  { id: "EMP002", name: "Priya Sharma", department: "Engineering", technology: "Python", manager: "Venkat Rao", joiningDate: "05 Mar 2025", status: "Active" },
  { id: "EMP003", name: "Kiran Reddy", department: "QA", technology: "Testing", manager: "Suresh Kumar", joiningDate: "18 Jun 2025", status: "Active" },
  { id: "EMP004", name: "Sneha ", department: "HR", technology: "HR Operations", manager: "Anitha Reddy", joiningDate: "20 Aug 2025", status: "Active" },
  { id: "EMP005", name: "Arjun Kumar", department: "Engineering", technology: "Node.js", manager: "Venkat Rao", joiningDate: "10 Sep 2026", status: "Active" },
  { id: "EMP006", name: "Rajitha", department: "Design", technology: "UI/UX", manager: "Anitha Reddy", joiningDate: "14 Feb 2025", status: "Active" },
  { id: "EMP007", name: "Naveen", department: "QA", technology: "Automation", manager: "Suresh Kumar", joiningDate: "09 Apr 2025", status: "Active" },
  { id: "EMP008", name: "Vamsi", department: "Operations", technology: "Operations", manager: "Ramesh Kumar", joiningDate: "11 Jul 2025", status: "Active" },
];

const INITIAL_WEEKLY_TIMESHEETS = [
  { employee: "Rahul Kumar", id: "EMP001", department: "Engineering", week: "Week 1", hours: 40, status: "Approved", approvedBy: "Venkat Rao" },
  { employee: "Rahul Kumar", id: "EMP001", department: "Engineering", week: "Week 2", hours: 40, status: "Approved", approvedBy: "Venkat Rao" },
  { employee: "Rahul Kumar", id: "EMP001", department: "Engineering", week: "Week 3", hours: 38, status: "Approved", approvedBy: "Venkat Rao" },
  { employee: "Rahul Kumar", id: "EMP001", department: "Engineering", week: "Week 4", hours: 40, status: "Approved", approvedBy: "Venkat Rao" },

  { employee: "Priya Sharma", id: "EMP002", department: "Engineering", week: "Week 1", hours: 38, status: "Approved", approvedBy: "Venkat Rao" },
  { employee: "Priya Sharma", id: "EMP002", department: "Engineering", week: "Week 2", hours: 40, status: "Approved", approvedBy: "Venkat Rao" },
  { employee: "Priya Sharma", id: "EMP002", department: "Engineering", week: "Week 3", hours: 38, status: "Approved", approvedBy: "Venkat Rao" },
  { employee: "Priya Sharma", id: "EMP002", department: "Engineering", week: "Week 4", hours: 40, status: "Approved", approvedBy: "Venkat Rao" },

  { employee: "Kiran Reddy", id: "EMP003", department: "QA", week: "Week 1", hours: 40, status: "Approved", approvedBy: "Suresh Kumar" },
  { employee: "Kiran Reddy", id: "EMP003", department: "QA", week: "Week 2", hours: 40, status: "Approved", approvedBy: "Suresh Kumar" },
  { employee: "Kiran Reddy", id: "EMP003", department: "QA", week: "Week 3", hours: 40, status: "Approved", approvedBy: "Suresh Kumar" },
  { employee: "Kiran Reddy", id: "EMP003", department: "QA", week: "Week 4", hours: 40, status: "Approved", approvedBy: "Suresh Kumar" },

  { employee: "Sneha ", id: "EMP004", department: "HR", week: "Week 1", hours: 36, status: "Pending", approvedBy: "-" },
  { employee: "Sneha ", id: "EMP004", department: "HR", week: "Week 2", hours: 40, status: "Approved", approvedBy: "Anitha Reddy" },
  { employee: "Sneha ", id: "EMP004", department: "HR", week: "Week 3", hours: 36, status: "Pending", approvedBy: "-" },
  { employee: "Sneha ", id: "EMP004", department: "HR", week: "Week 4", hours: 40, status: "Approved", approvedBy: "Anitha Reddy" },

  { employee: "Arjun Kumar", id: "EMP005", department: "Engineering", week: "Week 1", hours: 40, status: "Approved", approvedBy: "Venkat Rao" },
  { employee: "Arjun Kumar", id: "EMP005", department: "Engineering", week: "Week 2", hours: 40, status: "Approved", approvedBy: "Venkat Rao" },
  { employee: "Arjun Kumar", id: "EMP005", department: "Engineering", week: "Week 3", hours: 40, status: "Approved", approvedBy: "Venkat Rao" },
  { employee: "Arjun Kumar", id: "EMP005", department: "Engineering", week: "Week 4", hours: 40, status: "Approved", approvedBy: "Venkat Rao" },

  { employee: "Rajitha", id: "EMP006", department: "Design", week: "Week 1", hours: 40, status: "Approved", approvedBy: "Anitha Reddy" },
  { employee: "Rajitha", id: "EMP006", department: "Design", week: "Week 2", hours: 40, status: "Approved", approvedBy: "Anitha Reddy" },
  { employee: "Rajitha", id: "EMP006", department: "Design", week: "Week 3", hours: 40, status: "Approved", approvedBy: "Anitha Reddy" },
  { employee: "Rajitha", id: "EMP006", department: "Design", week: "Week 4", hours: 40, status: "Approved", approvedBy: "Anitha Reddy" },

  { employee: "Naveen", id: "EMP007", department: "QA", week: "Week 1", hours: 35, status: "Pending", approvedBy: "-" },
  { employee: "Naveen", id: "EMP007", department: "QA", week: "Week 2", hours: 40, status: "Approved", approvedBy: "Suresh Kumar" },
  { employee: "Naveen", id: "EMP007", department: "QA", week: "Week 3", hours: 35, status: "Pending", approvedBy: "-" },
  { employee: "Naveen", id: "EMP007", department: "QA", week: "Week 4", hours: 40, status: "Approved", approvedBy: "Suresh Kumar" },

  { employee: "Vamsi", id: "EMP008", department: "Operations", week: "Week 1", hours: 40, status: "Approved", approvedBy: "Ramesh Kumar" },
  { employee: "Vamsi", id: "EMP008", department: "Operations", week: "Week 2", hours: 40, status: "Approved", approvedBy: "Ramesh Kumar" },
  { employee: "Vamsi", id: "EMP008", department: "Operations", week: "Week 3", hours: 40, status: "Approved", approvedBy: "Ramesh Kumar" },
  { employee: "Vamsi", id: "EMP008", department: "Operations", week: "Week 4", hours: 40, status: "Approved", approvedBy: "Ramesh Kumar" },
];

const INITIAL_PAYROLL = [
  { employee: "Rahul Kumar", id: "EMP001", department: "Engineering", gross: 72000, deductions: 6400, net: 65600, status: "Processed" },
  { employee: "Priya Sharma", id: "EMP002", department: "Engineering", gross: 68000, deductions: 5900, net: 62100, status: "Processed" },
  { employee: "Kiran Reddy", id: "EMP003", department: "QA", gross: 54000, deductions: 4800, net: 49200, status: "HR Approved" },
  { employee: "Sneha ", id: "EMP004", department: "HR", gross: 58000, deductions: 5100, net: 52900, status: "Processed" },
  { employee: "Arjun Kumar", id: "EMP005", department: "Engineering", gross: 62000, deductions: 5500, net: 56500, status: "HR Approved" },
  { employee: "Rajitha", id: "EMP006", department: "Design", gross: 60000, deductions: 5300, net: 54700, status: "Processed" },
  { employee: "Naveen", id: "EMP007", department: "QA", gross: 52000, deductions: 4600, net: 47400, status: "Processed" },
  { employee: "Vamsi", id: "EMP008", department: "Operations", gross: 50000, deductions: 4200, net: 45800, status: "Processed" },
];

const INITIAL_DOCUMENTS = [
  { id: 1, title: "Employee Handbook", category: "Policy", description: "Company-wide employee guidelines, workplace expectations and HR procedures.", version: "v2.0", updated: "01 Sep 2026", type: "PDF" },
  { id: 2, title: "Attendance & Working Hours Policy", category: "Policy", description: "Working hours, attendance, late login, early logout and attendance requirements.", version: "v1.2", updated: "01 Jul 2026", type: "PDF" },
  { id: 3, title: "Work From Home Policy", category: "Policy", description: "Guidelines for remote work eligibility, approval and employee responsibilities.", version: "v1.1", updated: "20 Jun 2026", type: "PDF" },
  { id: 4, title: "Code of Conduct", category: "Compliance", description: "Professional conduct, workplace behaviour and employee responsibilities.", version: "v2.1", updated: "10 Jun 2026", type: "PDF" },
  { id: 5, title: "Payroll & Compensation Policy", category: "Payroll", description: "Salary processing, payroll cycle, deductions, payslips and compensation rules.", version: "v1.3", updated: "01 Sep 2026", type: "PDF" },
  { id: 6, title: "Performance Management Policy", category: "Policy", description: "Performance review cycle, goals, feedback and appraisal guidelines.", version: "v1.0", updated: "05 May 2026", type: "PDF" },
  { id: 7, title: "Probation Policy", category: "Policy", description: "Probation period, evaluation process, confirmation and extension guidelines.", version: "v1.1", updated: "12 Apr 2026", type: "PDF" },
  { id: 8, title: "Notice Period Policy", category: "Compliance", description: "Notice period, resignation workflow, handover and exit requirements.", version: "v1.2", updated: "20 Mar 2026", type: "PDF" },
  { id: 9, title: "IT & Information Security Policy", category: "Compliance", description: "Company systems, passwords, data protection and information security rules.", version: "v2.0", updated: "18 Feb 2026", type: "PDF" },
  { id: 10, title: "Employee Expense Policy", category: "Finance", description: "Business expense eligibility, approvals, claims and reimbursement process.", version: "v1.0", updated: "10 Jan 2026", type: "PDF" },
];

const INITIAL_HOLIDAYS = [
  { id: 1, date: "2026-01-26", displayDate: "26 Jan 2026", name: "Republic Day", day: "Monday", type: "Public Holiday", status: "Completed" },
  { id: 2, date: "2026-08-15", displayDate: "15 Aug 2026", name: "Independence Day", day: "Saturday", type: "Public Holiday", status: "Completed" },
  { id: 3, date: "2026-10-02", displayDate: "02 Oct 2026", name: "Gandhi Jayanti", day: "Friday", type: "Public Holiday", status: "Upcoming" },
  { id: 4, date: "2026-12-25", displayDate: "25 Dec 2026", name: "Christmas", day: "Friday", type: "Company Holiday", status: "Upcoming" },
];

const INITIAL_FORMS = [
  { id: 1, title: "Joining Formalities Checklist", category: "Onboarding", description: "New employee joining and document verification checklist.", type: "DOCX" },
  { id: 2, title: "Employee Exit Checklist", category: "Exit", description: "Standard employee exit and clearance checklist.", type: "DOCX" },
  { id: 3, title: "Asset Handover Form", category: "Exit", description: "Company asset return and acknowledgement form.", type: "DOCX" },
  { id: 4, title: "Salary Revision Letter", category: "Payroll", description: "Standard salary revision communication template.", type: "DOCX" },
  { id: 5, title: "Offer Letter Template", category: "Offer Letters", description: "Standard company offer letter template for selected candidates.", type: "DOCX", fileName: "Offer-Letter-Template.docx", hasFile: true },
  { id: 6, title: "Appointment Letter Template", category: "Offer Letters", description: "Standard employee appointment letter template.", type: "DOCX", fileName: "Appointment-Letter-Template.docx", hasFile: true },
  { id: 7, title: "Experience Letter Template", category: "Exit", description: "Standard employee experience certificate template.", type: "DOCX" },
  { id: 8, title: "Promotion Letter Template", category: "Employee Lifecycle", description: "Reusable promotion and role-change communication template.", type: "DOCX" },
  { id: 9, title: "Warning Letter Template", category: "Employee Relations", description: "Standard HR warning and corrective-action communication template.", type: "DOCX" },
  { id: 10, title: "Internship Offer Letter Template", category: "Offer Letters", description: "Reusable internship offer letter template.", type: "DOCX", fileName: "Internship-Offer-Letter-Template.docx", hasFile: true },
];

const MONTHS = [
  "September 2026",
  "August 2026",
  "July 2026",
  "June 2026",
  "May 2026",
  "April 2026",
];

const ModalShell = ({ title, children, onClose }) => (
  <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
    <button
      type="button"
      aria-label="Close modal"
      onClick={onClose}
      className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
    />

    <div className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden">
      <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
        <div>
          <h3 className="font-bold text-lg text-slate-900">{title}</h3>
          <p className="text-xs text-slate-500 mt-1">
            Save the resource to the HR library.
          </p>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="w-9 h-9 rounded-xl bg-[#F8F6F2] text-slate-500 flex items-center justify-center hover:text-[#6B2D1A]"
        >
          <FiX size={18} />
        </button>
      </div>

      {children}
    </div>
  </div>
);

const HRReports = () => {
  const [activeSection, setActiveSection] = useState("Analytics");
  const [selectedMonth, setSelectedMonth] = useState("September 2026");
  const [department] = useState("All Departments");
  const [search, setSearch] = useState("");
  const [documentCategory, setDocumentCategory] = useState("All");
  const [formCategory, setFormCategory] = useState("All");

  const [documents, setDocuments] = useState(INITIAL_DOCUMENTS);
  const [holidays, setHolidays] = useState(INITIAL_HOLIDAYS);
  const [forms, setForms] = useState(INITIAL_FORMS);

  const [modal, setModal] = useState(null);
  const [editingItem, setEditingItem] = useState(null);

  const closeModal = () => {
    setModal(null);
    setEditingItem(null);
  };

  const [documentForm, setDocumentForm] = useState({
    title: "",
    category: "Policy",
    description: "",
    version: "v1.0",
    type: "PDF",
  });

  const [holidayForm, setHolidayForm] = useState({
    name: "",
    date: "",
    day: "",
    type: "Public Holiday",
    status: "Upcoming",
  });

  const [templateForm, setTemplateForm] = useState({
    title: "",
    category: "Recruitment",
    description: "",
    type: "DOCX",
    fileName: "",
    file: null,
  });

  const [documentFile, setDocumentFile] = useState(null);

  const normalizedSearch = search.trim().toLowerCase();

  const departmentMatch = useCallback(
    (name) => department === "All Departments" || name === department,
    [department]
  );

  const filteredEmployees = useMemo(
    () =>
      INITIAL_EMPLOYEES.filter((employee) => {
        const searchMatch =
          !normalizedSearch ||
          employee.name.toLowerCase().includes(normalizedSearch) ||
          employee.id.toLowerCase().includes(normalizedSearch) ||
          employee.department.toLowerCase().includes(normalizedSearch) ||
          employee.technology.toLowerCase().includes(normalizedSearch);

        return departmentMatch(employee.department) && searchMatch;
      }),
    [departmentMatch, normalizedSearch]
  );

  /*
    Monthly timesheet:
    Weekly rows are intentionally aggregated here so HR sees ONE row per
    employee for the selected month instead of another weekly report.
  */
  const monthlyTimesheets = useMemo(() => {
    const grouped = INITIAL_WEEKLY_TIMESHEETS.reduce((acc, item) => {
      if (!acc[item.id]) {
        acc[item.id] = {
          employee: item.employee,
          id: item.id,
          department: item.department,
          totalHours: 0,
          approvedWeeks: 0,
          pendingWeeks: 0,
          approvalStatus: "Approved",
          approvedBy: item.approvedBy,
        };
      }

      acc[item.id].totalHours += Number(item.hours || 0);

      if (item.status === "Approved") acc[item.id].approvedWeeks += 1;
      if (item.status === "Pending") acc[item.id].pendingWeeks += 1;

      if (item.status === "Pending") {
        acc[item.id].approvalStatus = "Pending";
        acc[item.id].approvedBy = "-";
      }

      return acc;
    }, {});

    return Object.values(grouped);
  }, []);

  const filteredMonthlyTimesheets = useMemo(
    () =>
      monthlyTimesheets.filter((item) => {
        const searchMatch =
          !normalizedSearch ||
          item.employee.toLowerCase().includes(normalizedSearch) ||
          item.id.toLowerCase().includes(normalizedSearch) ||
          item.department.toLowerCase().includes(normalizedSearch) ||
          item.approvalStatus.toLowerCase().includes(normalizedSearch);

        return departmentMatch(item.department) && searchMatch;
      }),
    [monthlyTimesheets, departmentMatch, normalizedSearch]
  );

  const filteredPayroll = useMemo(
    () =>
      INITIAL_PAYROLL.filter((item) => {
        const searchMatch =
          !normalizedSearch ||
          item.employee.toLowerCase().includes(normalizedSearch) ||
          item.id.toLowerCase().includes(normalizedSearch) ||
          item.department.toLowerCase().includes(normalizedSearch);

        return departmentMatch(item.department) && searchMatch;
      }),
    [departmentMatch, normalizedSearch]
  );

  const filteredDocuments = useMemo(
    () =>
      documents.filter((item) => {
        const categoryMatch =
          documentCategory === "All" || item.category === documentCategory;

        const searchMatch =
          !normalizedSearch ||
          item.title.toLowerCase().includes(normalizedSearch) ||
          item.description.toLowerCase().includes(normalizedSearch) ||
          item.category.toLowerCase().includes(normalizedSearch);

        return categoryMatch && searchMatch;
      }),
    [documents, documentCategory, normalizedSearch]
  );

  const filteredForms = useMemo(
    () =>
      forms.filter((item) => {
        const categoryMatch =
          formCategory === "All" || item.category === formCategory;

        const searchMatch =
          !normalizedSearch ||
          item.title.toLowerCase().includes(normalizedSearch) ||
          item.description.toLowerCase().includes(normalizedSearch) ||
          item.category.toLowerCase().includes(normalizedSearch);

        return categoryMatch && searchMatch;
      }),
    [forms, formCategory, normalizedSearch]
  );

  const filteredHolidays = useMemo(
    () =>
      holidays.filter((item) => {
        const searchMatch =
          !normalizedSearch ||
          item.name.toLowerCase().includes(normalizedSearch) ||
          item.type.toLowerCase().includes(normalizedSearch) ||
          (item.displayDate || item.date).toLowerCase().includes(normalizedSearch);

        return searchMatch;
      }),
    [holidays, normalizedSearch]
  );

  /*
    Analytics is deliberately summary-only.
    Detailed timesheet/payroll/workforce tables remain in their own sections.
  */
  const analytics = useMemo(() => {
    const totalEmployees = INITIAL_EMPLOYEES.length;
    const activeEmployees = INITIAL_EMPLOYEES.filter(
      (item) => item.status === "Active"
    ).length;

    const monthlyHours = monthlyTimesheets.reduce(
      (sum, item) => sum + item.totalHours,
      0
    );

    const approvedMonthlyTimesheets = monthlyTimesheets.filter(
      (item) => item.approvalStatus === "Approved"
    ).length;

    const payrollNet = INITIAL_PAYROLL.reduce(
      (sum, item) => sum + Number(item.net || 0),
      0
    );

    const pendingTimesheets = monthlyTimesheets.filter(
      (item) => item.approvalStatus === "Pending"
    ).length;

    return {
      totalEmployees,
      activeEmployees,
      monthlyHours,
      approvedMonthlyTimesheets,
      pendingTimesheets,
      payrollNet,
      documents: documents.length,
      holidays: holidays.length,
      templates: forms.length,
    };
  }, [monthlyTimesheets, documents.length, holidays.length, forms.length]);

  const departmentData = useMemo(() => {
    const counts = INITIAL_EMPLOYEES.reduce((acc, employee) => {
      acc[employee.department] = (acc[employee.department] || 0) + 1;
      return acc;
    }, {});

    const total = INITIAL_EMPLOYEES.length;

    return Object.entries(counts).map(([name, count]) => ({
      name,
      count,
      percentage: Math.round((count / total) * 100),
    }));
  }, []);

  const formatCurrency = (value) =>
    `₹${Number(value || 0).toLocaleString("en-IN")}`;

  const getStatusClasses = (status) => {
    switch (status) {
      case "Approved":
      case "Processed":
      case "Active":
      case "Completed":
      case "Upcoming":
        return "bg-[#4D8B4F]/10 text-[#4D8B4F] border-[#4D8B4F]/20";
      case "Pending":
      case "HR Approved":
        return "bg-[#EADBC8]/40 text-[#6B2D1A] border-[#EADBC8]";
      case "Rejected":
        return "bg-[#6B2D1A]/10 text-[#6B2D1A] border-[#6B2D1A]/20";
      default:
        return "bg-[#F8F6F2] text-slate-600 border-slate-200";
    }
  };

  const StatusBadge = ({ status }) => {
    const positive = [
      "Approved",
      "Processed",
      "Active",
      "Completed",
      "Upcoming",
    ].includes(status);

    return (
      <span
        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-[11px] font-bold whitespace-nowrap ${getStatusClasses(
          status
        )}`}
      >
        {positive ? (
          <FiCheckCircle size={11} />
        ) : status === "Rejected" ? (
          <FiXCircle size={11} />
        ) : (
          <FiAlertCircle size={11} />
        )}
        {status}
      </span>
    );
  };

  const downloadFile = () => {
    // File download behavior is not implemented in this component yet.
  };

  const viewFile = () => {
    // File preview behavior is not implemented in this component yet.
  };

  const resetDocumentForm = () =>
    setDocumentForm({
      title: "",
      category: "Policy",
      description: "",
      version: "v1.0",
      type: "PDF",
    });

  const resetHolidayForm = () =>
    setHolidayForm({
      name: "",
      date: "",
      day: "",
      type: "Public Holiday",
      status: "Upcoming",
    });

  const resetTemplateForm = () =>
    setTemplateForm({
      title: "",
      category: "Recruitment",
      description: "",
      type: "DOCX",
      fileName: "",
      file: null,
    });

  const openAddDocument = () => {
    setEditingItem(null);
    resetDocumentForm();
    setDocumentFile(null);
    setModal("document");
  };

  const openEditDocument = (item) => {
    setEditingItem(item);
    setDocumentForm({
      title: item.title,
      category: item.category,
      description: item.description,
      version: item.version,
      type: item.type,
    });
    setDocumentFile(null);
    setModal("document");
  };

  const openAddHoliday = () => {
    setEditingItem(null);
    resetHolidayForm();
    setModal("holiday");
  };

  const openEditHoliday = (item) => {
    setEditingItem(item);
    setHolidayForm({
      name: item.name,
      date: item.date,
      day: item.day,
      type: item.type,
      status: item.status,
    });
    setModal("holiday");
  };

  const openAddTemplate = () => {
    setEditingItem(null);
    resetTemplateForm();
    setModal("template");
  };

  const openEditTemplate = (item) => {
    setEditingItem(item);
    setTemplateForm({
      title: item.title,
      category: item.category,
      description: item.description,
      type: item.type,
      fileName: item.fileName || "",
      file: null,
    });
    setModal("template");
  };

  const saveDocument = (event) => {
    event.preventDefault();

    if (!documentForm.title.trim()) return;

    const fileData = documentFile
      ? {
          fileName: documentFile.name,
          fileSize: `${(documentFile.size / 1024 / 1024).toFixed(2)} MB`,
          hasFile: true,
        }
      : {};

    if (editingItem) {
      setDocuments((prev) =>
        prev.map((item) =>
          item.id === editingItem.id
            ? {
                ...item,
                ...documentForm,
                ...fileData,
                updated: "25 Sep 2026",
              }
            : item
        )
      );
    } else {
      setDocuments((prev) => [
        ...prev,
        {
          id: Date.now(),
          ...documentForm,
          ...fileData,
          updated: "25 Sep 2026",
        },
      ]);
    }

    setDocumentFile(null);
    setModal(null);
    setEditingItem(null);
  };

  const getDayName = (dateValue) => {
    if (!dateValue) return "";
    return new Date(`${dateValue}T00:00:00`).toLocaleDateString("en-US", {
      weekday: "long",
    });
  };

  const formatDisplayDate = (dateValue) => {
    if (!dateValue) return "";
    return new Date(`${dateValue}T00:00:00`).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const saveHoliday = (event) => {
    event.preventDefault();

    if (!holidayForm.name.trim() || !holidayForm.date) return;

    const normalizedHoliday = {
      ...holidayForm,
      day: getDayName(holidayForm.date),
      displayDate: formatDisplayDate(holidayForm.date),
    };

    if (editingItem) {
      setHolidays((prev) =>
        prev.map((item) =>
          item.id === editingItem.id ? { ...item, ...normalizedHoliday } : item
        )
      );
    } else {
      setHolidays((prev) => [
        ...prev,
        {
          id: Date.now(),
          ...normalizedHoliday,
        },
      ]);
    }

    setModal(null);
    setEditingItem(null);
  };

  const saveTemplate = (event) => {
    event.preventDefault();

    if (!templateForm.title.trim()) return;

    const templateData = {
      ...templateForm,
      fileName: templateForm.file?.name || templateForm.fileName || "",
      hasFile: Boolean(templateForm.file || templateForm.fileName),
    };

    if (editingItem) {
      setForms((prev) =>
        prev.map((item) =>
          item.id === editingItem.id ? { ...item, ...templateData } : item
        )
      );
    } else {
      setForms((prev) => [
        ...prev,
        {
          id: Date.now(),
          ...templateData,
        },
      ]);
    }

    setModal(null);
    setEditingItem(null);
  };

  const deleteDocument = (id) =>
    setDocuments((prev) => prev.filter((item) => item.id !== id));

  const deleteHoliday = (id) =>
    setHolidays((prev) => prev.filter((item) => item.id !== id));

  const deleteTemplate = (id) =>
    setForms((prev) => prev.filter((item) => item.id !== id));

  const sections = [
    {
      label: "Analytics",
      icon: FiBarChart2,
      description: "High-level HR insights",
    },
    {
      label: "Workforce",
      icon: FiUsers,
      description: "Employee master report",
    },
    {
      label: "Timesheet",
      icon: FiClock,
      description: "Monthly work-hour report",
    },
    {
      label: "Payroll",
      icon: FiDollarSign,
      description: "Monthly salary report",
    },
    {
      label: "Holiday Calendar",
      icon: FiBriefcase,
      description: "Public and company holidays",
    },
    {
      label: "Policies & Documents",
      icon: FiShield,
      description: "Policies and official documents",
    },
    {
      label: "HR Forms",
      icon: FiClipboard,
      description: "Forms and reusable templates",
    },
  ];

  const ReportHeader = ({ title, description, icon }) => (
    <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-5 mb-6">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-2xl bg-[#4D8B4F]/10 text-[#4D8B4F] flex items-center justify-center">
          {React.createElement(icon || FiFileText, { size: 22 })}
        </div>

        <div>
          <h2 className="text-xl font-bold text-slate-900">{title}</h2>
          <p className="text-sm text-slate-500 mt-1">{description}</p>
        </div>
      </div>

      <div />
    </div>
  );

  const renderAnalytics = () => (
    <div className="space-y-6">
      <ReportHeader
        title="HR Analytics"
        description="High-level workforce and HR resource overview"
        icon={FiBarChart2}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
        {[
          {
            label: "Active Workforce",
            value: analytics.activeEmployees,
            icon: FiUsers,
            description: "Current active employees",
          },
          {
            label: "Monthly Hours",
            value: `${analytics.monthlyHours}h`,
            icon: FiClock,
            description: `${selectedMonth} timesheet total`,
          },
          {
            label: "Net Payroll",
            value: formatCurrency(analytics.payrollNet),
            icon: FiDollarSign,
            description: `${selectedMonth} payroll`,
          },
          {
            label: "HR Resources",
            value:
              analytics.documents + analytics.holidays + analytics.templates,
            icon: FiLayers,
            description: "Policies, holidays and templates",
          },
        ].map((card) => {
          const Icon = card.icon;

          return (
            <div
              key={card.label}
              className="bg-white border border-slate-200 rounded-2xl p-5 hover:shadow-lg transition"
            >
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-xl bg-[#F8F6F2] flex items-center justify-center text-[#4D8B4F]">
                  <Icon size={19} />
                </div>
                <FiTrendingUp size={17} className="text-[#4D8B4F]" />
              </div>

              <p className="text-xs font-semibold text-slate-500 mt-5">
                {card.label}
              </p>

              <h3 className="text-2xl font-bold text-slate-900 mt-1">
                {card.value}
              </h3>

              <p className="text-xs text-slate-400 mt-1">
                {card.description}
              </p>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div className="bg-white border border-slate-200 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-bold text-slate-900">
                Workforce Distribution
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Employee distribution by department
              </p>
            </div>
            <FiUsers className="text-[#4D8B4F]" size={20} />
          </div>

          <div className="space-y-5">
            {departmentData.map((item) => (
              <div key={item.name}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-semibold text-slate-700">
                    {item.name}
                  </span>
                  <span className="text-xs font-bold text-slate-500">
                    {item.count} employees · {item.percentage}%
                  </span>
                </div>

                <div className="h-2.5 bg-[#F8F6F2] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#4D8B4F] rounded-full"
                    style={{ width: `${item.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-bold text-slate-900">HR Resource Summary</h3>
              <p className="text-xs text-slate-500 mt-1">
                Centralized resources available to HR
              </p>
            </div>
            <FiActivity className="text-[#4D8B4F]" size={20} />
          </div>

          <div className="space-y-3">
            {[
              ["Official Policies", analytics.documents, FiShield],
              ["Holiday Records", analytics.holidays, FiCalendar],
              ["HR Templates", analytics.templates, FiClipboard],
              ["Pending Monthly Timesheets", analytics.pendingTimesheets, FiClock],
            ].map(([label, value, icon]) => (
              <div
                key={label}
                className="flex items-center justify-between p-4 rounded-xl bg-[#F8F6F2]"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-white flex items-center justify-center text-[#4D8B4F]">
                    {React.createElement(icon, { size: 16 })}
                  </div>
                  <span className="text-sm font-medium text-slate-700">
                    {label}
                  </span>
                </div>
                <span className="text-lg font-bold text-slate-900">
                  {value}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-[#6B2D1A] rounded-2xl p-6 text-white">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
            <FiFileText size={19} />
          </div>
          <div>
            <h3 className="font-bold">Analytics scope</h3>
            <p className="text-sm text-white/75 mt-1 leading-6">
              Analytics is intentionally kept as a summary layer. Detailed
              employee, monthly timesheet, payroll, holiday and document data
              is available in the dedicated sections below, avoiding repeated
              tables and duplicate information.
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderWorkforce = () => (
    <div>
      <ReportHeader
        title="Workforce Reports"
        description="Employee master and workforce information"
        icon={FiUsers}
      />

      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div>
            <h3 className="font-bold text-slate-900">Employee Master Report</h3>
            <p className="text-xs text-slate-500 mt-1">
              {filteredEmployees.length} employee records
            </p>
          </div>


        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[950px]">
            <thead className="bg-[#F8F6F2]">
              <tr>
                {[
                  "Employee",
                  "Employee ID",
                  "Department",
                  "Technology",
                  "Manager",
                  "Joining Date",
                  "Status",
                ].map((heading) => (
                  <th
                    key={heading}
                    className="px-6 py-4 text-left text-[11px] font-bold uppercase tracking-wider text-slate-500"
                  >
                    {heading}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {filteredEmployees.map((employee) => (
                <tr
                  key={employee.id}
                  className="hover:bg-[#F8F6F2]/70 transition"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-[#4D8B4F]/10 text-[#4D8B4F] flex items-center justify-center font-bold text-xs">
                        {employee.name
                          .split(" ")
                          .map((name) => name[0])
                          .join("")
                          .slice(0, 2)}
                      </div>
                      <span className="text-sm font-semibold text-slate-800">
                        {employee.name}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600">{employee.id}</td>
                  <td className="px-6 py-4 text-sm text-slate-600">{employee.department}</td>
                  <td className="px-6 py-4 text-sm text-slate-600">{employee.technology}</td>
                  <td className="px-6 py-4 text-sm text-slate-600">{employee.manager}</td>
                  <td className="px-6 py-4 text-sm text-slate-600">{employee.joiningDate}</td>
                  <td className="px-6 py-4"><StatusBadge status={employee.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderTimesheet = () => (
    <div>
      <ReportHeader
        title="Monthly Timesheet Reports"
        description="One consolidated timesheet record per employee for the selected month"
        icon={FiClock}
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-6">
        <div className="bg-white border border-slate-200 rounded-2xl p-5">
          <p className="text-xs font-semibold text-slate-500">
            Total Monthly Hours
          </p>
          <p className="text-2xl font-bold text-slate-900 mt-2">
            {filteredMonthlyTimesheets.reduce(
              (sum, item) => sum + item.totalHours,
              0
            )}
            h
          </p>
          <p className="text-xs text-slate-400 mt-1">{selectedMonth}</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5">
          <p className="text-xs font-semibold text-slate-500">
            Approved Monthly Records
          </p>
          <p className="text-2xl font-bold text-[#4D8B4F] mt-2">
            {filteredMonthlyTimesheets.filter(
              (item) => item.approvalStatus === "Approved"
            ).length}
          </p>
          <p className="text-xs text-slate-400 mt-1">
            Employee-level records
          </p>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5">
          <p className="text-xs font-semibold text-slate-500">
            Pending Monthly Records
          </p>
          <p className="text-2xl font-bold text-[#6B2D1A] mt-2">
            {filteredMonthlyTimesheets.filter(
              (item) => item.approvalStatus === "Pending"
            ).length}
          </p>
          <p className="text-xs text-slate-400 mt-1">
            Requires HR / manager action
          </p>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-slate-900">
              Monthly Timesheet Register
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Weekly entries are consolidated into a single monthly employee
              record.
            </p>
          </div>


        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px]">
            <thead className="bg-[#F8F6F2]">
              <tr>
                {[
                  "Employee",
                  "ID",
                  "Department",
                  "Monthly Hours",
                  "Approved Weeks",
                  "Pending Weeks",
                  "Status",
                  "Approved By",
                ].map((heading) => (
                  <th
                    key={heading}
                    className="px-6 py-4 text-left text-[11px] font-bold uppercase tracking-wider text-slate-500"
                  >
                    {heading}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {filteredMonthlyTimesheets.map((item) => (
                <tr
                  key={item.id}
                  className="hover:bg-[#F8F6F2]/70 transition"
                >
                  <td className="px-6 py-4 text-sm font-semibold text-slate-800">
                    {item.employee}
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600">{item.id}</td>
                  <td className="px-6 py-4 text-sm text-slate-600">{item.department}</td>
                  <td className="px-6 py-4 text-sm font-bold text-slate-800">
                    {item.totalHours}h
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600">
                    {item.approvedWeeks}
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600">
                    {item.pendingWeeks}
                  </td>
                  <td className="px-6 py-4">
                    <StatusBadge status={item.approvalStatus} />
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600">
                    {item.approvedBy}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderPayroll = () => {
    const gross = filteredPayroll.reduce((sum, item) => sum + item.gross, 0);
    const deductions = filteredPayroll.reduce(
      (sum, item) => sum + item.deductions,
      0
    );
    const net = filteredPayroll.reduce((sum, item) => sum + item.net, 0);

    return (
      <div>
        <ReportHeader
          title="Payroll Reports"
          description="Monthly salary register, deductions and payroll status"
          icon={FiDollarSign}
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-6">
          {[
            ["Gross Payroll", gross],
            ["Total Deductions", deductions],
            ["Net Payroll", net],
          ].map(([label, value]) => (
            <div
              key={label}
              className="bg-white border border-slate-200 rounded-2xl p-5"
            >
              <p className="text-xs font-semibold text-slate-500">{label}</p>
              <p className="text-2xl font-bold text-slate-900 mt-2">
                {formatCurrency(value)}
              </p>
            </div>
          ))}
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-900">Monthly Salary Register</h3>
              <p className="text-xs text-slate-500 mt-1">
                Payroll report for {selectedMonth}
              </p>
            </div>

          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px]">
              <thead className="bg-[#F8F6F2]">
                <tr>
                  {[
                    "Employee",
                    "ID",
                    "Department",
                    "Gross Salary",
                    "Deductions",
                    "Net Salary",
                    "Status",
                  ].map((heading) => (
                    <th
                      key={heading}
                      className="px-6 py-4 text-left text-[11px] font-bold uppercase tracking-wider text-slate-500"
                    >
                      {heading}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {filteredPayroll.map((item) => (
                  <tr key={item.id} className="hover:bg-[#F8F6F2]/70 transition">
                    <td className="px-6 py-4 text-sm font-semibold text-slate-800">{item.employee}</td>
                    <td className="px-6 py-4 text-sm text-slate-600">{item.id}</td>
                    <td className="px-6 py-4 text-sm text-slate-600">{item.department}</td>
                    <td className="px-6 py-4 text-sm font-semibold text-slate-800">{formatCurrency(item.gross)}</td>
                    <td className="px-6 py-4 text-sm text-slate-600">{formatCurrency(item.deductions)}</td>
                    <td className="px-6 py-4 text-sm font-bold text-[#4D8B4F]">{formatCurrency(item.net)}</td>
                    <td className="px-6 py-4"><StatusBadge status={item.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  const renderHolidays = () => (
    <div>
      <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-5 mb-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-[#4D8B4F]/10 text-[#4D8B4F] flex items-center justify-center">
            <FiBriefcase size={22} />
          </div>

          <div>
            <h2 className="text-xl font-bold text-slate-900">
              Holiday Calendar
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              Manage public and company holidays without duplicating Leave Management
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={openAddHoliday}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#4D8B4F] text-white text-sm font-semibold hover:bg-[#3E733F] transition shrink-0"
        >
          <FiPlus size={16} />
          Add Public Holiday
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {filteredHolidays.map((holiday) => (
          <div
            key={holiday.id}
            className="bg-white border border-slate-200 rounded-2xl p-5 hover:shadow-lg transition"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex gap-4">
                <div className="w-12 h-12 rounded-xl bg-[#4D8B4F]/10 text-[#4D8B4F] flex flex-col items-center justify-center">
                  <span className="text-[9px] font-bold">
                    {(holiday.displayDate || holiday.date || "").split(" ")[1]?.toUpperCase() || "DATE"}
                  </span>
                  <span className="text-lg font-bold">
                    {(holiday.displayDate || holiday.date || "").split(" ")[0] || "--"}
                  </span>
                </div>

                <div>
                  <h3 className="font-bold text-slate-900">{holiday.name}</h3>
                  <p className="text-sm text-slate-500 mt-1">
                    {holiday.date} · {holiday.day || "Day not set"}
                  </p>
                </div>
              </div>

              <StatusBadge status={holiday.status} />
            </div>

            <div className="mt-4">
              <span className="inline-flex px-2.5 py-1 rounded-full bg-[#EADBC8]/40 text-[#6B2D1A] text-[10px] font-bold">
                {holiday.type}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 mt-5">
              <button
                type="button"
                onClick={() => openEditHoliday(holiday)}
                className="inline-flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl border border-slate-200 text-slate-700 text-xs font-bold hover:bg-[#F8F6F2]"
              >
                <FiEdit3 size={13} />
                Edit
              </button>

              <button
                type="button"
                onClick={() => deleteHoliday(holiday.id)}
                className="inline-flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl border border-[#6B2D1A]/20 text-[#6B2D1A] text-xs font-bold hover:bg-[#6B2D1A]/5"
              >
                <FiTrash2 size={13} />
                Remove
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderDocuments = () => (
    <div>
      <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-5 mb-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-[#4D8B4F]/10 text-[#4D8B4F] flex items-center justify-center">
            <FiShield size={22} />
          </div>

          <div>
            <h2 className="text-xl font-bold text-slate-900">
              Policies & Documents
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              Central library for official HR policies, compliance documents and company resources
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={openAddDocument}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#4D8B4F] text-white text-sm font-semibold hover:bg-[#3E733F] transition shrink-0"
        >
          <FiPlus size={16} />
          Add Document
        </button>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2 mb-6">
        {["All", "Policy", "Compliance", "Payroll", "Finance", "Other"].map(
          (category) => (
            <button
              key={category}
              type="button"
              onClick={() => setDocumentCategory(category)}
              className={`px-4 py-2.5 rounded-xl text-sm font-semibold whitespace-nowrap transition ${
                documentCategory === category
                  ? "bg-[#4D8B4F] text-white"
                  : "bg-white border border-slate-200 text-slate-600 hover:bg-[#F8F6F2]"
              }`}
            >
              {category}
            </button>
          )
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {filteredDocuments.map((document) => (
          <div
            key={document.id}
            className="group bg-white border border-slate-200 rounded-2xl p-5 hover:shadow-lg hover:-translate-y-0.5 transition"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="w-12 h-12 rounded-xl bg-[#F8F6F2] text-[#6B2D1A] flex items-center justify-center">
                <FiFileText size={22} />
              </div>

              <span className="px-2.5 py-1 rounded-full bg-[#4D8B4F]/10 text-[#4D8B4F] text-[10px] font-bold">
                {document.type}
              </span>
            </div>

            <h3 className="font-bold text-slate-900 mt-5">{document.title}</h3>

            <p className="text-sm text-slate-500 mt-2 leading-6 min-h-[72px]">
              {document.description}
            </p>

            <div className="flex items-center justify-between mt-5 pt-4 border-t border-slate-100">
              <div>
                <p className="text-[10px] uppercase tracking-wider font-bold text-slate-400">
                  Version
                </p>
                <p className="text-xs font-semibold text-slate-700 mt-1">
                  {document.version}
                </p>
              </div>

              <div>
                <p className="text-[10px] uppercase tracking-wider font-bold text-slate-400">
                  Updated
                </p>
                <p className="text-xs font-semibold text-slate-700 mt-1">
                  {document.updated}
                </p>
              </div>
            </div>

            {document.fileName && (
              <div className="mt-4 px-3 py-2.5 rounded-xl bg-[#F8F6F2] border border-slate-100">
                <p className="text-[10px] uppercase tracking-wider font-bold text-slate-400">
                  Attached file
                </p>
                <p className="text-xs font-semibold text-slate-700 mt-1 truncate">
                  {document.fileName}
                </p>
                {document.fileSize && (
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    {document.fileSize}
                  </p>
                )}
              </div>
            )}

            <div className="grid grid-cols-2 gap-2 mt-4">
              <button
                type="button"
                onClick={() => viewFile(document.title)}
                className="inline-flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl border border-slate-200 text-slate-700 text-xs font-bold hover:bg-[#F8F6F2] transition"
              >
                <FiEye size={14} />
                View
              </button>

              <button
                type="button"
                onClick={() => downloadFile(document.title)}
                className="inline-flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl bg-[#4D8B4F] text-white text-xs font-bold hover:bg-[#3E733F] transition"
              >
                <FiDownload size={14} />
                Download
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2 mt-2">
              <button
                type="button"
                onClick={() => openEditDocument(document)}
                className="inline-flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-[#F8F6F2] text-[#6B2D1A] text-xs font-bold"
              >
                <FiEdit3 size={13} />
                Edit
              </button>

              <button
                type="button"
                onClick={() => deleteDocument(document.id)}
                className="inline-flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-[#6B2D1A]/5 text-[#6B2D1A] text-xs font-bold"
              >
                <FiTrash2 size={13} />
                Remove
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderForms = () => (
    <div>
      <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-5 mb-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-[#4D8B4F]/10 text-[#4D8B4F] flex items-center justify-center">
            <FiClipboard size={22} />
          </div>

          <div>
            <h2 className="text-xl font-bold text-slate-900">
              HR Forms & Templates
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              Reusable HR forms, letters and lifecycle templates
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={openAddTemplate}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#4D8B4F] text-white text-sm font-semibold hover:bg-[#3E733F] transition shrink-0"
        >
          <FiPlus size={16} />
          Add HR Template
        </button>
      </div>
      <div className="flex gap-2 overflow-x-auto pb-2 mb-6">
        {[
          "All",
          "Recruitment",
          "Offer Letters",
          "Onboarding",
          "Employee Lifecycle",
          "Payroll",
          "Employee Relations",
          "Exit",
        ].map((category) => (
          <button
            key={category}
            type="button"
            onClick={() => setFormCategory(category)}
            className={`px-4 py-2.5 rounded-xl text-sm font-semibold whitespace-nowrap transition ${
              formCategory === category
                ? "bg-[#4D8B4F] text-white"
                : "bg-white border border-slate-200 text-slate-600 hover:bg-[#F8F6F2]"
            }`}
          >
            {category}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {filteredForms.map((form) => (
          <div
            key={form.id}
            className="bg-white border border-slate-200 rounded-2xl p-5 hover:shadow-lg transition"
          >
            <div className="flex items-start justify-between">
              <div className="w-11 h-11 rounded-xl bg-[#EADBC8]/40 text-[#6B2D1A] flex items-center justify-center">
                <FiClipboard size={19} />
              </div>

              <span className="text-[10px] font-bold uppercase tracking-wider text-[#4D8B4F]">
                {form.category}
              </span>
            </div>

            <h3 className="font-bold text-slate-900 mt-5">{form.title}</h3>

            <p className="text-sm text-slate-500 mt-2 leading-6 min-h-[48px]">
              {form.description}
            </p>

            <div className="flex items-center gap-2 mt-4">
              <span className="px-2.5 py-1 rounded-full bg-[#F8F6F2] text-slate-500 text-[10px] font-bold">
                {form.type}
              </span>
              {form.fileName && (
                <span className="px-2.5 py-1 rounded-full bg-[#4D8B4F]/10 text-[#4D8B4F] text-[10px] font-bold truncate max-w-[180px]">
                  {form.fileName}
                </span>
              )}
            </div>

            <button
              type="button"
              onClick={() => downloadFile(form.title)}
              className="w-full mt-5 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#6B2D1A] text-white text-sm font-semibold hover:bg-[#542315] transition"
            >
              <FiDownload size={15} />
              Download Template
            </button>

            <div className="grid grid-cols-2 gap-2 mt-2">
              <button
                type="button"
                onClick={() => openEditTemplate(form)}
                className="inline-flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-[#F8F6F2] text-[#6B2D1A] text-xs font-bold"
              >
                <FiEdit3 size={13} />
                Edit
              </button>

              <button
                type="button"
                onClick={() => deleteTemplate(form.id)}
                className="inline-flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-[#6B2D1A]/5 text-[#6B2D1A] text-xs font-bold"
              >
                <FiTrash2 size={13} />
                Remove
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeSection) {
      case "Analytics":
        return renderAnalytics();
      case "Workforce":
        return renderWorkforce();
      case "Timesheet":
        return renderTimesheet();
      case "Payroll":
        return renderPayroll();
      case "Holiday Calendar":
        return renderHolidays();
      case "Policies & Documents":
        return renderDocuments();
      case "HR Forms":
        return renderForms();
      default:
        return renderAnalytics();
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F6F2]">
      <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-xl border-b border-slate-200">
        <div className="px-5 lg:px-8 py-5">
          <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-5">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-[#4D8B4F]/10 text-[#4D8B4F] flex items-center justify-center">
                <FiLayers size={22} />
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl font-bold text-slate-900">
                    HR Reports & Resources
                  </h1>

                  <span className="hidden sm:inline-flex px-2.5 py-1 rounded-full bg-[#EADBC8]/40 text-[#6B2D1A] text-[9px] font-bold uppercase tracking-wider">
                    HR Control Center
                  </span>
                </div>

                <p className="text-sm text-slate-500 mt-1">
                  Reporting, policies, holidays and reusable HR resources
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <div className="relative">
                <FiSearch
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search reports..."
                  className="w-full sm:w-[230px] pl-9 pr-4 py-2.5 bg-[#F8F6F2] border border-slate-200 rounded-xl text-sm outline-none focus:border-[#4D8B4F]"
                />
              </div>

              <div className="flex items-center gap-2">
                <label className="text-xs font-bold uppercase tracking-wide text-slate-500 whitespace-nowrap">
                  Reporting Month
                </label>
                <div className="relative">
                  <FiCalendar
                    size={15}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-[#4D8B4F] pointer-events-none"
                  />
                  <select
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(e.target.value)}
                    className="pl-9 pr-9 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 outline-none focus:border-[#4D8B4F]"
                  >
                    {MONTHS.map((month) => (
                      <option key={month}>{month}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="p-5 lg:p-8 max-w-[1700px] mx-auto">
        <div className="mb-7">
          <div className="relative flex items-end border-b border-slate-200">
            {sections.map((section) => {
              const Icon = section.icon;
              const active = activeSection === section.label;

              return (
                <button
                  key={section.label}
                  type="button"
                  onClick={() => setActiveSection(section.label)}
                  className={`
                    relative
                    flex items-center gap-2.5
                    min-h-[60px]
                    px-5
                    -mb-px
                    text-sm font-semibold
                    whitespace-nowrap
                    outline-none
                    transition-all duration-200
                    ${
                      active
                        ? `
                          z-20
                          bg-white
                          text-[#39733A]
                          rounded-t-[20px]
                          border border-slate-200
                          border-b-white
                          shadow-[0_-5px_16px_rgba(15,23,42,0.045)]
                        `
                        : `
                          z-10
                          border border-transparent
                          rounded-t-[14px]
                          text-slate-500
                          hover:text-slate-800
                          hover:bg-[#FAFAF8]
                        `
                    }
                  `}
                >
                  <span
                    className={`
                      flex items-center justify-center
                      w-9 h-9
                      rounded-[11px]
                      transition-all duration-200
                      ${
                        active
                          ? "bg-[#EEF5EB] text-[#39733A]"
                          : "bg-[#F8F8F6] text-slate-500"
                      }
                    `}
                  >
                    <Icon size={17} strokeWidth={1.9} />
                  </span>

                  <span>{section.label}</span>

                  {active && (
                    <span
                      className="
                        absolute
                        -bottom-[1px]
                        left-0
                        right-0
                        h-[10px]
                        bg-white
                        border-x border-slate-200
                      "
                    />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-400 mb-5">
          <span>HR</span>
          <FiChevronRight size={12} />
          <span className="text-[#4D8B4F] font-semibold">
            {activeSection}
          </span>
        </div>

        {renderContent()}
      </main>

      {modal === "document" && (
        <ModalShell
          title={editingItem ? "Edit HR Document" : "Add HR Document"}
          onClose={closeModal}
        >
          <form onSubmit={saveDocument} className="p-6 space-y-4">
            <input
              value={documentForm.title}
              onChange={(e) =>
                setDocumentForm((p) => ({ ...p, title: e.target.value }))
              }
              placeholder="Document title"
              className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:border-[#4D8B4F]"
              required
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <select
                value={documentForm.category}
                onChange={(e) =>
                  setDocumentForm((p) => ({ ...p, category: e.target.value }))
                }
                className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:border-[#4D8B4F]"
              >
                <option>Policy</option>
                <option>Compliance</option>
                <option>Payroll</option>
                <option>Finance</option>
                <option>Other</option>
              </select>

              <input
                value={documentForm.version}
                onChange={(e) =>
                  setDocumentForm((p) => ({ ...p, version: e.target.value }))
                }
                placeholder="Version e.g. v1.0"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:border-[#4D8B4F]"
              />
            </div>

            <textarea
              value={documentForm.description}
              onChange={(e) =>
                setDocumentForm((p) => ({
                  ...p,
                  description: e.target.value,
                }))
              }
              placeholder="Short description"
              rows={4}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:border-[#4D8B4F] resize-none"
              required
            />

            <div className="rounded-2xl border border-dashed border-[#4D8B4F]/40 bg-[#F8F6F2] p-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-white text-[#4D8B4F] flex items-center justify-center shrink-0">
                  <FiFileText size={18} />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-bold text-slate-800">
                    Attach Policy / HR Document
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    Upload the actual PDF file. Maximum 10 MB.
                  </p>
                  <label className="inline-flex items-center gap-2 mt-3 px-4 py-2.5 rounded-xl bg-white border border-slate-200 text-sm font-semibold text-slate-700 cursor-pointer hover:bg-white/70">
                    <FiPlus size={15} />
                    Choose PDF
                    <input
                      type="file"
                      accept=".pdf,application/pdf"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        if (file.size > 10 * 1024 * 1024) {
                          alert("Please select a PDF smaller than 10 MB.");
                          e.target.value = "";
                          return;
                        }
                        setDocumentFile(file);
                      }}
                    />
                  </label>

                  {documentFile ? (
                    <p className="text-xs font-semibold text-[#4D8B4F] mt-3">
                      Selected: {documentFile.name}
                    </p>
                  ) : editingItem?.fileName ? (
                    <p className="text-xs font-semibold text-slate-500 mt-3">
                      Current file: {editingItem.fileName}
                    </p>
                  ) : null}
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setModal(null)}
                className="px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-[#4D8B4F] text-white text-sm font-semibold"
              >
                {editingItem ? "Save Changes" : "Add Document"}
              </button>
            </div>
          </form>
        </ModalShell>
      )}

      {modal === "holiday" && (
        <ModalShell
          title={editingItem ? "Edit Holiday" : "Add Holiday"}
          onClose={closeModal}
        >
          <form onSubmit={saveHoliday} className="p-6 space-y-4">
            <input
              value={holidayForm.name}
              onChange={(e) =>
                setHolidayForm((p) => ({ ...p, name: e.target.value }))
              }
              placeholder="Holiday name"
              className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:border-[#4D8B4F]"
              required
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <input
                type="date"
                value={
                  holidayForm.date.includes("-")
                    ? holidayForm.date
                    : ""
                }
                onChange={(e) =>
                  setHolidayForm((p) => ({
                    ...p,
                    date: e.target.value,
                    day: getDayName(e.target.value),
                  }))
                }
                className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:border-[#4D8B4F]"
                required
              />

              <div className="relative">
                <input
                  value={holidayForm.day}
                  readOnly
                  placeholder="Day will be calculated"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-[#F8F6F2] text-slate-600 outline-none"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-[#4D8B4F]">
                  AUTO
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <select
                value={holidayForm.type}
                onChange={(e) =>
                  setHolidayForm((p) => ({ ...p, type: e.target.value }))
                }
                className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:border-[#4D8B4F]"
              >
                <option>Public Holiday</option>
                <option>Company Holiday</option>
              </select>

              <select
                value={holidayForm.status}
                onChange={(e) =>
                  setHolidayForm((p) => ({ ...p, status: e.target.value }))
                }
                className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:border-[#4D8B4F]"
              >
                <option>Upcoming</option>
                <option>Completed</option>
              </select>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setModal(null)}
                className="px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-[#4D8B4F] text-white text-sm font-semibold"
              >
                {editingItem ? "Save Changes" : "Add Holiday"}
              </button>
            </div>
          </form>
        </ModalShell>
      )}

      {modal === "template" && (
        <ModalShell
          title={editingItem ? "Edit HR Template" : "Add HR Template"}
          onClose={closeModal}
        >
          <form onSubmit={saveTemplate} className="p-6 space-y-4">
            <input
              value={templateForm.title}
              onChange={(e) =>
                setTemplateForm((p) => ({ ...p, title: e.target.value }))
              }
              placeholder="Template title e.g. Offer Letter Template"
              className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:border-[#4D8B4F]"
              required
            />

            <select
              value={templateForm.category}
              onChange={(e) =>
                setTemplateForm((p) => ({ ...p, category: e.target.value }))
              }
              className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:border-[#4D8B4F]"
            >
              <option>Recruitment</option>
              <option>Offer Letters</option>
              <option>Onboarding</option>
              <option>Employee Lifecycle</option>
              <option>Payroll</option>
              <option>Employee Relations</option>
              <option>Exit</option>
            </select>

            <textarea
              value={templateForm.description}
              onChange={(e) =>
                setTemplateForm((p) => ({
                  ...p,
                  description: e.target.value,
                }))
              }
              placeholder="Short description"
              rows={4}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:border-[#4D8B4F] resize-none"
              required
            />

            <div className="rounded-2xl border border-dashed border-[#6B2D1A]/30 bg-[#F8F6F2] p-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-white text-[#6B2D1A] flex items-center justify-center shrink-0">
                  <FiFileText size={18} />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-bold text-slate-800">
                    Upload Template File
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    PDF, DOC or DOCX · Maximum 10 MB
                  </p>

                  <label className="inline-flex items-center gap-2 mt-3 px-4 py-2.5 rounded-xl bg-white border border-slate-200 text-sm font-semibold text-slate-700 cursor-pointer">
                    <FiPlus size={15} />
                    Choose Template
                    <input
                      type="file"
                      accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        if (file.size > 10 * 1024 * 1024) {
                          alert("Please select a file smaller than 10 MB.");
                          e.target.value = "";
                          return;
                        }

                        setTemplateForm((p) => ({
                          ...p,
                          file,
                          fileName: file.name,
                          type: file.name.toLowerCase().endsWith(".pdf")
                            ? "PDF"
                            : "DOCX",
                        }));
                      }}
                    />
                  </label>

                  {templateForm.fileName && (
                    <p className="text-xs font-semibold text-[#6B2D1A] mt-3">
                      Selected: {templateForm.fileName}
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setModal(null)}
                className="px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-[#4D8B4F] text-white text-sm font-semibold"
              >
                {editingItem ? "Save Changes" : "Add Template"}
              </button>
            </div>
          </form>
        </ModalShell>
      )}
    </div>
  );
};

export default HRReports;
