import React, { useMemo, useState } from "react";
import {
  CalendarDays,
  Search,
  ChevronRight,
  Clock3,
  CheckCircle2,
  Users,
  FileText,
  Eye,
  X,
  Check,
  Ban,
  CalendarCheck2,
  History,
  SlidersHorizontal,
  AlertTriangle,
  UserRound,
  BriefcaseBusiness,
  ArrowRight,
  CircleCheck,
  CircleX,
} from "lucide-react";

const HRLeaveManagement = () => {
  const [activeTab, setActiveTab] = useState("requests");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [leaveTypeFilter, setLeaveTypeFilter] = useState("All");
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [showFilters, setShowFilters] = useState(false);

  const [leaveRequests, setLeaveRequests] = useState([
    {
      id: 1,
      employee: "Rahul Kumar",
      employeeId: "EMP001",
      department: "Engineering",
      manager: "Suresh Reddy",
      leaveType: "Casual Leave",
      startDate: "2026-09-28",
      endDate: "2026-09-29",
      duration: 2,
      appliedOn: "2026-09-22",
      status: "Pending",
      reason: "Personal work",
      balanceBefore: 10,
      balanceAfter: 8,
    },
    {
      id: 2,
      employee: "Priya Sharma",
      employeeId: "EMP002",
      department: "Finance",
      manager: "Anita Rao",
      leaveType: "Sick Leave",
      startDate: "2026-09-26",
      endDate: "2026-09-26",
      duration: 1,
      appliedOn: "2026-09-24",
      status: "Approved",
      reason: "Medical appointment",
      balanceBefore: 8,
      balanceAfter: 7,
    },
    {
      id: 3,
      employee: "Kiran Reddy",
      employeeId: "EMP003",
      department: "Engineering",
      manager: "Suresh Reddy",
      leaveType: "Casual Leave",
      startDate: "2026-10-02",
      endDate: "2026-10-04",
      duration: 3,
      appliedOn: "2026-09-23",
      status: "Pending",
      reason: "Family function",
      balanceBefore: 12,
      balanceAfter: 9,
    },
    {
      id: 4,
      employee: "Sneha ",
      employeeId: "EMP004",
      department: "Human Resources",
      manager: "HR Admin",
      leaveType: "Earned Leave",
      startDate: "2026-09-30",
      endDate: "2026-10-02",
      duration: 3,
      appliedOn: "2026-09-20",
      status: "Approved",
      reason: "Personal vacation",
      balanceBefore: 15,
      balanceAfter: 12,
    },
    {
      id: 5,
      employee: "Arjun Kumar",
      employeeId: "EMP005",
      department: "Sales",
      manager: "Vikram Singh",
      leaveType: "Sick Leave",
      startDate: "2026-09-25",
      endDate: "2026-09-25",
      duration: 1,
      appliedOn: "2026-09-25",
      status: "Pending",
      reason: "Not feeling well",
      balanceBefore: 6,
      balanceAfter: 5,
    },
    {
      id: 6,
      employee: "Meghana Das",
      employeeId: "EMP006",
      department: "Marketing",
      manager: "Ravi Kumar",
      leaveType: "Earned Leave",
      startDate: "2026-09-18",
      endDate: "2026-09-20",
      duration: 3,
      appliedOn: "2026-09-10",
      status: "Rejected",
      reason: "Personal travel",
      balanceBefore: 11,
      balanceAfter: 11,
    },
  ]);

  const employees = [
    {
      id: "EMP001",
      name: "Rahul Kumar",
      department: "Engineering",
      designation: "Software Engineer",
      entitled: 24,
      used: 8,
      pending: 2,
      available: 14,
    },
    {
      id: "EMP002",
      name: "Priya Sharma",
      department: "Finance",
      designation: "Financial Analyst",
      entitled: 24,
      used: 7,
      pending: 1,
      available: 16,
    },
    {
      id: "EMP003",
      name: "Kiran Reddy",
      department: "Engineering",
      designation: "Frontend Developer",
      entitled: 24,
      used: 9,
      pending: 3,
      available: 12,
    },
    {
      id: "EMP004",
      name: "Sneha",
      department: "Human Resources",
      designation: "HR Executive",
      entitled: 24,
      used: 12,
      pending: 0,
      available: 12,
    },
    {
      id: "EMP005",
      name: "Arjun Kumar",
      department: "Sales",
      designation: "Sales Executive",
      entitled: 18,
      used: 5,
      pending: 1,
      available: 12,
    },
    {
      id: "EMP006",
      name: "Meghana Das",
      employeeId: "EMP006",
      department: "Marketing",
      designation: "Marketing Specialist",
      entitled: 24,
      used: 6,
      pending: 0,
      available: 18,
    },
  ];

  const pendingRequests = leaveRequests.filter(
    (item) => item.status === "Pending"
  );

  const approvedRequests = leaveRequests.filter(
    (item) => item.status === "Approved"
  );

  const approvedThisMonth = approvedRequests.filter(
    (item) => item.appliedOn.startsWith("2026-09")
  );

  const onLeaveToday = leaveRequests.filter((item) => {
    const today = "2026-09-25";

    return (
      item.status === "Approved" &&
      today >= item.startDate &&
      today <= item.endDate
    );
  });

  const balanceAlerts = employees.filter((employee) => employee.available <= 12);

  const filteredRequests = useMemo(() => {
    return leaveRequests.filter((leave) => {
      const matchesSearch =
        `${leave.employee} ${leave.employeeId} ${leave.department} ${leave.leaveType}`
          .toLowerCase()
          .includes(search.toLowerCase());

      const matchesStatus =
        statusFilter === "All" || leave.status === statusFilter;

      const matchesType =
        leaveTypeFilter === "All" || leave.leaveType === leaveTypeFilter;

      return matchesSearch && matchesStatus && matchesType;
    });
  }, [leaveRequests, search, statusFilter, leaveTypeFilter]);

  const formatDate = (date) => {
    if (!date) return "-";

    return new Date(`${date}T00:00:00`).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const getInitials = (name) => {
    return name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case "Approved":
        return "bg-[#EEF6EB] text-[#39733A] border-[#D6E8D1]";

      case "Rejected":
        return "bg-[#F8F0ED] text-[#8A3E2F] border-[#E8D3CC]";

      default:
        return "bg-[#FBF5E9] text-[#806027] border-[#E9DBBD]";
    }
  };

  const approveLeave = (id) => {
    setLeaveRequests((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, status: "Approved" } : item
      )
    );

    setSelectedRequest(null);
  };

  const rejectLeave = (id) => {
    setLeaveRequests((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, status: "Rejected" } : item
      )
    );

    setSelectedRequest(null);
  };

  const tabs = [
    {
      id: "requests",
      label: "Leave Requests",
      icon: FileText,
      count: pendingRequests.length,
    },
    {
      id: "balances",
      label: "Employee Balances",
      icon: Users,
    },
    {
      id: "calendar",
      label: "Team Calendar",
      icon: CalendarDays,
    },
    {
      id: "history",
      label: "Leave History",
      icon: History,
    },
  ];

  return (
    <div className="min-h-screen bg-[#F3F4F2] text-[#301E0F]">

      {/* =========================================================
          HEADER
      ========================================================= */}

      <header className="bg-white border-b border-[#E5E1DA]">

        <div className="px-6 lg:px-8 pt-6">

          <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-5">

            <div>
              <h1 className="text-2xl lg:text-[28px] font-bold tracking-tight">
                Leave Management
              </h1>

              <p className="text-sm text-gray-500 mt-1">
                Manage employee leave requests, balances and attendance
                availability.
              </p>

            </div>

            <div
              className="
                hidden lg:flex
                items-center gap-3
                px-4 py-3
                rounded-xl
                bg-[#F8F6F2]
                border border-[#E8E3DA]
              "
            >
              <div
                className="
                  w-9 h-9
                  rounded-lg
                  bg-[#E8F1E5]
                  text-[#39733A]
                  flex items-center justify-center
                "
              >
                <CalendarDays size={18} />
              </div>

              <div>
                <p className="text-xs text-gray-500">
                  Leave Cycle
                </p>

                <p className="text-sm font-semibold">
                  January — December 2026
                </p>
              </div>
            </div>

          </div>

        </div>


        {/* =======================================================
            TABS
        ======================================================= */}

        <div className="px-6 lg:px-8 mt-6">

          <div className="flex items-center gap-2 overflow-x-auto">

            {tabs.map((tab) => {
              const Icon = tab.icon;

              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`
                    relative
                    flex items-center gap-2
                    px-4 py-3
                    rounded-t-xl
                    text-sm font-medium
                    whitespace-nowrap
                    transition-all
                    ${
                      activeTab === tab.id
                        ? "text-[#2F6F34] bg-[#EEF6EB] font-semibold shadow-[inset_0_-3px_0_#4D8B4F,0_2px_8px_rgba(77,139,79,0.08)]"
                        : "text-gray-500 hover:text-gray-800 hover:bg-[#FAFAF8]"
                    }
                  `}
                >

                  <Icon size={16} />

                  {tab.label}

                  {tab.count !== undefined && tab.count > 0 && (
                    <span
                      className="
                        min-w-[20px] h-5
                        px-1.5
                        rounded-full
                        bg-[#F5EAD4]
                        text-[#806027]
                        flex items-center justify-center
                        text-[10px]
                        font-bold
                      "
                    >
                      {tab.count}
                    </span>
                  )}

                  {activeTab === tab.id && (
                    <span
                      className="
                        absolute
                        bottom-0
                        left-4 right-4
                        h-[3px]
                        rounded-full
                        bg-[#39733A]
                      "
                    />
                  )}

                </button>
              );
            })}

          </div>

        </div>

      </header>


      {/* =========================================================
          MAIN
      ========================================================= */}

      <main className="p-6 lg:p-8 space-y-7">


        {/* =======================================================
            KPI CARDS
        ======================================================= */}

        <section>

          <div className="flex items-center justify-between mb-4">

            <div>
              <h2 className="text-lg font-semibold">
                Leave Overview
              </h2>

              <p className="text-sm text-gray-500 mt-1">
                A quick view of current leave activity.
              </p>
            </div>

            <span className="hidden sm:flex items-center gap-2 text-xs text-gray-500">
              <span className="w-2 h-2 rounded-full bg-[#4D8B4F]" />
              Updated today
            </span>

          </div>


          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">

            {/* Pending */}

            <div
              className="
                group
                bg-white
                border border-[#E5E1DA]
                rounded-2xl
                p-5
                shadow-[0_3px_14px_rgba(0,0,0,0.025)]
                hover:shadow-[0_8px_25px_rgba(0,0,0,0.06)]
                transition-all
              "
            >

              <div className="flex items-start justify-between">

                <div>

                  <p className="text-sm text-gray-500">
                    Pending Approval
                  </p>

                  <p className="text-[30px] leading-none font-bold mt-3">
                    {pendingRequests.length}
                  </p>

                  <p className="text-xs text-[#806027] mt-2">
                    Requests awaiting review
                  </p>

                </div>

                <div
                  className="
                    w-11 h-11
                    rounded-xl
                    bg-[#FBF5E9]
                    text-[#806027]
                    flex items-center justify-center
                    group-hover:scale-105
                    transition
                  "
                >
                  <Clock3 size={20} />
                </div>

              </div>

            </div>


            {/* Approved this month */}

            <div
              className="
                group
                bg-white
                border border-[#E5E1DA]
                rounded-2xl
                p-5
                shadow-[0_3px_14px_rgba(0,0,0,0.025)]
                hover:shadow-[0_8px_25px_rgba(0,0,0,0.06)]
                transition-all
              "
            >

              <div className="flex items-start justify-between">

                <div>

                  <p className="text-sm text-gray-500">
                    Approved This Month
                  </p>

                  <p className="text-[30px] leading-none font-bold mt-3">
                    {approvedThisMonth.length}
                  </p>

                  <p className="text-xs text-[#39733A] mt-2">
                    Approved leave requests
                  </p>

                </div>

                <div
                  className="
                    w-11 h-11
                    rounded-xl
                    bg-[#EAF3E7]
                    text-[#39733A]
                    flex items-center justify-center
                    group-hover:scale-105
                    transition
                  "
                >
                  <CheckCircle2 size={20} />
                </div>

              </div>

            </div>


            {/* On Leave Today */}

            <div
              className="
                group
                bg-white
                border border-[#E5E1DA]
                rounded-2xl
                p-5
                shadow-[0_3px_14px_rgba(0,0,0,0.025)]
                hover:shadow-[0_8px_25px_rgba(0,0,0,0.06)]
                transition-all
              "
            >

              <div className="flex items-start justify-between">

                <div>

                  <p className="text-sm text-gray-500">
                    On Leave Today
                  </p>

                  <p className="text-[30px] leading-none font-bold mt-3">
                    {onLeaveToday.length}
                  </p>

                  <p className="text-xs text-gray-500 mt-2">
                    Employees away today
                  </p>

                </div>

                <div
                  className="
                    w-11 h-11
                    rounded-xl
                    bg-[#F0ECE6]
                    text-[#6B2D1A]
                    flex items-center justify-center
                    group-hover:scale-105
                    transition
                  "
                >
                  <CalendarCheck2 size={20} />
                </div>

              </div>

            </div>


            {/* Balance alerts */}

            <div
              className="
                group
                bg-white
                border border-[#E5E1DA]
                rounded-2xl
                p-5
                shadow-[0_3px_14px_rgba(0,0,0,0.025)]
                hover:shadow-[0_8px_25px_rgba(0,0,0,0.06)]
                transition-all
              "
            >

              <div className="flex items-start justify-between">

                <div>

                  <p className="text-sm text-gray-500">
                    Balance Alerts
                  </p>

                  <p className="text-[30px] leading-none font-bold mt-3">
                    {balanceAlerts.length}
                  </p>

                  <p className="text-xs text-[#8A672B] mt-2">
                    Employees with low balance
                  </p>

                </div>

                <div
                  className="
                    w-11 h-11
                    rounded-xl
                    bg-[#F7F0E3]
                    text-[#8A672B]
                    flex items-center justify-center
                    group-hover:scale-105
                    transition
                  "
                >
                  <AlertTriangle size={20} />
                </div>

              </div>

            </div>

          </div>

        </section>


        {/* =======================================================
            LEAVE REQUESTS
        ======================================================= */}

        {activeTab === "requests" && (

          <section
            className="
              bg-white
              border border-[#E5E1DA]
              rounded-2xl
              overflow-hidden
              shadow-[0_4px_18px_rgba(0,0,0,0.025)]
            "
          >

            <div className="p-6 border-b border-[#ECE8E1]">

              <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4">

                <div>

                  <div className="flex items-center gap-3">

                    <h2 className="text-lg font-semibold">
                      Employee Leave Requests
                    </h2>

                    {pendingRequests.length > 0 && (
                      <span
                        className="
                          px-2.5 py-1
                          rounded-full
                          bg-[#FBF5E9]
                          text-[#806027]
                          text-[11px]
                          font-bold
                        "
                      >
                        {pendingRequests.length} pending
                      </span>
                    )}

                  </div>

                  <p className="text-sm text-gray-500 mt-1">
                    Review and take action on employee leave applications.
                  </p>

                </div>


                <div className="flex flex-col sm:flex-row gap-3">

                  <div className="relative">

                    <Search
                      size={17}
                      className="
                        absolute left-3 top-1/2
                        -translate-y-1/2
                        text-gray-400
                      "
                    />

                    <input
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      placeholder="Search employee..."
                      className="
                        w-full sm:w-64
                        pl-10 pr-4 py-2.5
                        rounded-xl
                        border border-[#DDD9D2]
                        bg-[#FAFAF8]
                        text-sm
                        outline-none
                        focus:border-[#4D8B4F]
                        focus:ring-2
                        focus:ring-[#4D8B4F]/10
                      "
                    />

                  </div>

                  <button
                    onClick={() => setShowFilters(!showFilters)}
                    className="
                      inline-flex items-center justify-center gap-2
                      px-4 py-2.5
                      rounded-xl
                      border border-[#DDD9D2]
                      text-sm font-medium text-gray-600
                      hover:bg-[#F8F6F2]
                    "
                  >
                    <SlidersHorizontal size={16} />
                    Filters
                  </button>

                </div>

              </div>


              {showFilters && (

                <div
                  className="
                    mt-5
                    p-4
                    rounded-xl
                    bg-[#F8F6F2]
                    border border-[#E8E3DA]
                    flex flex-wrap
                    gap-3
                  "
                >

                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="
                      px-3 py-2.5
                      rounded-lg
                      border border-[#DDD9D2]
                      bg-white
                      text-sm
                      outline-none
                    "
                  >
                    <option value="All">All Status</option>
                    <option value="Pending">Pending</option>
                    <option value="Approved">Approved</option>
                    <option value="Rejected">Rejected</option>
                  </select>

                  <select
                    value={leaveTypeFilter}
                    onChange={(e) =>
                      setLeaveTypeFilter(e.target.value)
                    }
                    className="
                      px-3 py-2.5
                      rounded-lg
                      border border-[#DDD9D2]
                      bg-white
                      text-sm
                      outline-none
                    "
                  >
                    <option value="All">All Leave Types</option>
                    <option value="Casual Leave">Casual Leave</option>
                    <option value="Sick Leave">Sick Leave</option>
                    <option value="Earned Leave">Earned Leave</option>
                  </select>

                  <button
                    onClick={() => {
                      setStatusFilter("All");
                      setLeaveTypeFilter("All");
                      setSearch("");
                    }}
                    className="
                      px-4 py-2.5
                      rounded-lg
                      text-sm
                      text-gray-600
                      hover:bg-white
                    "
                  >
                    Clear filters
                  </button>

                </div>

              )}

            </div>


            <div className="overflow-x-auto">

              <table className="w-full min-w-[1050px]">

                <thead>

                  <tr className="bg-[#F8F6F2] border-b border-[#E9E5DE]">

                    <th className="text-left px-6 py-4 text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                      Employee
                    </th>

                    <th className="text-left px-5 py-4 text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                      Leave Type
                    </th>

                    <th className="text-left px-5 py-4 text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                      Leave Period
                    </th>

                    <th className="text-left px-5 py-4 text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                      Duration
                    </th>

                    <th className="text-left px-5 py-4 text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                      Applied On
                    </th>

                    <th className="text-left px-5 py-4 text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                      Status
                    </th>

                    <th className="text-center px-5 py-4 text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                      Action
                    </th>

                  </tr>

                </thead>


                <tbody className="divide-y divide-[#EEEAE4]">

                  {filteredRequests.map((leave) => (

                    <tr
                      key={leave.id}
                      className="hover:bg-[#FBFAF8] transition"
                    >

                      <td className="px-6 py-4">

                        <div className="flex items-center gap-3">

                          <div
                            className="
                              w-10 h-10
                              rounded-full
                              bg-[#E9F1E6]
                              text-[#39733A]
                              flex items-center justify-center
                              text-xs font-bold
                            "
                          >
                            {getInitials(leave.employee)}
                          </div>

                          <div>

                            <p className="text-sm font-semibold">
                              {leave.employee}
                            </p>

                            <p className="text-xs text-gray-500 mt-0.5">
                              {leave.employeeId} · {leave.department}
                            </p>

                          </div>

                        </div>

                      </td>


                      <td className="px-5 py-4">

                        <p className="text-sm font-medium">
                          {leave.leaveType}
                        </p>

                        <p className="text-xs text-gray-400 mt-1">
                          {leave.reason}
                        </p>

                      </td>


                      <td className="px-5 py-4">

                        <p className="text-sm text-gray-700">
                          {formatDate(leave.startDate)}
                        </p>

                        <p className="text-xs text-gray-400 mt-1">
                          to {formatDate(leave.endDate)}
                        </p>

                      </td>


                      <td className="px-5 py-4">

                        <span className="text-sm font-semibold">
                          {leave.duration}
                        </span>

                        <span className="text-xs text-gray-500 ml-1">
                          {leave.duration === 1 ? "day" : "days"}
                        </span>

                      </td>


                      <td className="px-5 py-4 text-sm text-gray-600">
                        {formatDate(leave.appliedOn)}
                      </td>


                      <td className="px-5 py-4">

                        <span
                          className={`
                            inline-flex
                            px-2.5 py-1.5
                            rounded-full
                            border
                            text-xs font-semibold
                            ${getStatusStyle(leave.status)}
                          `}
                        >
                          {leave.status}
                        </span>

                      </td>


                      <td className="px-5 py-4">

                        <div className="flex justify-center">

                          <button
                            onClick={() => setSelectedRequest(leave)}
                            className="
                              inline-flex items-center gap-2
                              px-3 py-2
                              rounded-lg
                              text-xs font-semibold
                              text-[#39733A]
                              hover:bg-[#EAF3E7]
                              transition
                            "
                          >
                            <Eye size={15} />
                            Review
                          </button>

                        </div>

                      </td>

                    </tr>

                  ))}

                </tbody>

              </table>

            </div>


            {filteredRequests.length === 0 && (

              <div className="py-16 text-center">

                <div
                  className="
                    w-12 h-12
                    mx-auto
                    rounded-xl
                    bg-[#F5F2ED]
                    flex items-center justify-center
                    text-gray-400
                  "
                >
                  <FileText size={21} />
                </div>

                <p className="font-medium mt-3">
                  No leave requests found
                </p>

                <p className="text-sm text-gray-500 mt-1">
                  Try changing your search or filters.
                </p>

              </div>

            )}

          </section>

        )}


        {/* =======================================================
            EMPLOYEE BALANCES
        ======================================================= */}

        {activeTab === "balances" && (

          <section
            className="
              bg-white
              border border-[#E5E1DA]
              rounded-2xl
              overflow-hidden
            "
          >

            <div className="p-6 border-b border-[#ECE8E1]">

              <div>

                <h2 className="text-lg font-semibold">
                  Employee Leave Balances
                </h2>

                <p className="text-sm text-gray-500 mt-1">
                  Monitor entitlement, utilization and remaining leave.
                </p>

              </div>

            </div>


            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 p-6">

              {employees.map((employee) => (

                <div
                  key={employee.id}
                  className="
                    border border-[#E5E1DA]
                    rounded-2xl
                    p-5
                    hover:shadow-md
                    hover:border-[#D7D2C9]
                    transition-all
                  "
                >

                  <div className="flex items-center justify-between">

                    <div className="flex items-center gap-3">

                      <div
                        className="
                          w-10 h-10
                          rounded-full
                          bg-[#E9F1E6]
                          text-[#39733A]
                          flex items-center justify-center
                          text-xs font-bold
                        "
                      >
                        {getInitials(employee.name)}
                      </div>

                      <div>

                        <p className="font-semibold text-sm">
                          {employee.name}
                        </p>

                        <p className="text-xs text-gray-500">
                          {employee.id} · {employee.department}
                        </p>

                      </div>

                    </div>

                    <button
                      onClick={() => setSelectedEmployee(employee)}
                      className="
                        w-8 h-8
                        rounded-lg
                        flex items-center justify-center
                        text-gray-400
                        hover:text-[#39733A]
                        hover:bg-[#EEF5EC]
                      "
                    >
                      <Eye size={16} />
                    </button>

                  </div>


                  <div className="mt-5">

                    <div className="flex justify-between text-xs mb-2">

                      <span className="text-gray-500">
                        Leave utilization
                      </span>

                      <span className="font-semibold">
                        {Math.round(
                          (employee.used / employee.entitled) * 100
                        )}
                        %
                      </span>

                    </div>

                    <div className="h-2 rounded-full bg-[#ECE9E3] overflow-hidden">

                      <div
                        className="h-full rounded-full bg-[#4D8B4F]"
                        style={{
                          width: `${Math.min(
                            100,
                            (employee.used / employee.entitled) * 100
                          )}%`,
                        }}
                      />

                    </div>

                  </div>


                  <div className="grid grid-cols-3 gap-3 mt-5">

                    <div>
                      <p className="text-[11px] text-gray-400">
                        Entitled
                      </p>

                      <p className="font-bold mt-1">
                        {employee.entitled}
                      </p>
                    </div>

                    <div>
                      <p className="text-[11px] text-gray-400">
                        Used
                      </p>

                      <p className="font-bold mt-1">
                        {employee.used}
                      </p>
                    </div>

                    <div>
                      <p className="text-[11px] text-gray-400">
                        Available
                      </p>

                      <p className="font-bold text-[#39733A] mt-1">
                        {employee.available}
                      </p>
                    </div>

                  </div>


                  {employee.pending > 0 && (

                    <div
                      className="
                        mt-4
                        px-3 py-2
                        rounded-lg
                        bg-[#FBF5E9]
                        text-[#806027]
                        text-xs
                      "
                    >
                      {employee.pending} pending{" "}
                      {employee.pending === 1 ? "day" : "days"} in requests
                    </div>

                  )}

                </div>

              ))}

            </div>

          </section>

        )}


        {/* =======================================================
            CALENDAR
        ======================================================= */}

        {activeTab === "calendar" && (

          <section
            className="
              bg-white
              border border-[#E5E1DA]
              rounded-2xl
              p-6
            "
          >

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">

              <div>

                <h2 className="text-lg font-semibold">
                  Team Leave Calendar
                </h2>

                <p className="text-sm text-gray-500 mt-1">
                  See employee availability and planned leave.
                </p>

              </div>

              <div className="flex items-center gap-4 text-xs text-gray-500">

                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#4D8B4F]" />
                  Approved
                </div>

                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#C6A15B]" />
                  Pending
                </div>

              </div>

            </div>


            <div className="mt-6 border border-[#E8E4DD] rounded-xl overflow-hidden">

              <div className="grid grid-cols-7 bg-[#F8F6F2] border-b border-[#E8E4DD]">

                {[
                  "Mon",
                  "Tue",
                  "Wed",
                  "Thu",
                  "Fri",
                  "Sat",
                  "Sun",
                ].map((day) => (

                  <div
                    key={day}
                    className="
                      px-3 py-3
                      text-center
                      text-xs font-semibold
                      text-gray-500
                    "
                  >
                    {day}
                  </div>

                ))}

              </div>


              <div className="grid grid-cols-7">

                {Array.from({ length: 35 }).map((_, index) => {

                  const day = index - 3;

                  const leave = leaveRequests.find((item) => {
                    const start = new Date(item.startDate);

                    return (
                      start.getMonth() === 8 &&
                      start.getDate() === day
                    );
                  });

                  return (

                    <div
                      key={index}
                      className="
                        min-h-[110px]
                        border-r border-b border-[#EEEAE4]
                        p-2
                        hover:bg-[#FBFAF8]
                        transition
                      "
                    >

                      {day > 0 && day <= 30 && (

                        <>
                          <div
                            className={`
                              text-xs font-semibold
                              ${
                                day === 25
                                  ? "w-7 h-7 rounded-full bg-[#4D8B4F] text-white flex items-center justify-center"
                                  : "text-gray-500"
                              }
                            `}
                          >
                            {day}
                          </div>

                          {leave && (

                            <div
                              className={`
                                mt-2
                                px-2 py-1.5
                                rounded-lg
                                text-[10px]
                                font-semibold
                                truncate
                                ${
                                  leave.status === "Approved"
                                    ? "bg-[#E8F3E5] text-[#39733A]"
                                    : leave.status === "Pending"
                                    ? "bg-[#FBF5E9] text-[#806027]"
                                    : "bg-[#F5EAE7] text-[#8A3E2F]"
                                }
                              `}
                            >
                              {leave.employee.split(" ")[0]} ·{" "}
                              {leave.leaveType.replace(" Leave", "")}
                            </div>

                          )}

                        </>

                      )}

                    </div>

                  );

                })}

              </div>

            </div>

          </section>

        )}


        {/* =======================================================
            HISTORY
        ======================================================= */}

        {activeTab === "history" && (

          <section
            className="
              bg-white
              border border-[#E5E1DA]
              rounded-2xl
              overflow-hidden
            "
          >

            <div className="p-6 border-b border-[#ECE8E1]">

              <h2 className="text-lg font-semibold">
                Leave History
              </h2>

              <p className="text-sm text-gray-500 mt-1">
                Complete employee leave activity and decisions.
              </p>

            </div>


            <div className="divide-y divide-[#EEEAE4]">

              {leaveRequests.map((leave) => (

                <div
                  key={leave.id}
                  className="
                    px-6 py-5
                    flex flex-col lg:flex-row
                    lg:items-center
                    lg:justify-between
                    gap-4
                    hover:bg-[#FBFAF8]
                    transition
                  "
                >

                  <div className="flex items-center gap-4">

                    <div
                      className="
                        w-10 h-10
                        rounded-full
                        bg-[#E9F1E6]
                        text-[#39733A]
                        flex items-center justify-center
                        text-xs font-bold
                      "
                    >
                      {getInitials(leave.employee)}
                    </div>

                    <div>

                      <p className="text-sm font-semibold">
                        {leave.employee}
                      </p>

                      <p className="text-xs text-gray-500 mt-1">
                        {leave.leaveType} · {leave.duration}{" "}
                        {leave.duration === 1 ? "day" : "days"}
                      </p>

                    </div>

                  </div>


                  <div className="text-sm text-gray-600">
                    {formatDate(leave.startDate)} —{" "}
                    {formatDate(leave.endDate)}
                  </div>


                  <span
                    className={`
                      inline-flex self-start lg:self-auto
                      px-3 py-1.5
                      rounded-full
                      border
                      text-xs font-semibold
                      ${getStatusStyle(leave.status)}
                    `}
                  >
                    {leave.status}
                  </span>

                </div>

              ))}

            </div>

          </section>

        )}

      </main>


      {/* =========================================================
          REVIEW DRAWER
      ========================================================= */}

      {selectedRequest && (

        <div className="fixed inset-0 z-[100]">

          <div
            className="
              absolute inset-0
              bg-[#201A14]/35
              backdrop-blur-[3px]
            "
            onClick={() => setSelectedRequest(null)}
          />


          <aside
            className="
              absolute
              top-0 right-0
              h-full
              w-full max-w-[500px]
              bg-[#FBFBF9]
              shadow-[-12px_0_40px_rgba(0,0,0,0.10)]
              flex flex-col
            "
          >

            {/* Drawer Header */}

            <div
              className="
                px-6 py-5
                bg-white
                border-b border-[#E5E1DA]
              "
            >

              <div className="flex items-center justify-between">

                <div>

                  <div className="flex items-center gap-2 text-xs text-gray-500">

                    <span>Leave Management</span>

                    <ChevronRight size={13} />

                    <span className="text-[#301E0F]">
                      Review Request
                    </span>

                  </div>

                  <h2 className="text-xl font-bold mt-2">
                    Leave Request
                  </h2>

                </div>

                <button
                  onClick={() => setSelectedRequest(null)}
                  className="
                    w-9 h-9
                    rounded-xl
                    flex items-center justify-center
                    text-gray-500
                    hover:bg-[#F5F3EF]
                    hover:text-gray-800
                    transition
                  "
                >
                  <X size={19} />
                </button>

              </div>

            </div>


            {/* Drawer body */}

            <div className="flex-1 overflow-y-auto p-6 space-y-5">

              {/* Employee profile */}

              <div
                className="
                  bg-white
                  border border-[#E5E1DA]
                  rounded-2xl
                  p-5
                "
              >

                <div className="flex items-center justify-between">

                  <div className="flex items-center gap-4">

                    <div
                      className="
                        w-12 h-12
                        rounded-full
                        bg-[#E8F1E5]
                        text-[#39733A]
                        flex items-center justify-center
                        font-bold
                      "
                    >
                      {getInitials(selectedRequest.employee)}
                    </div>

                    <div>

                      <h3 className="font-semibold">
                        {selectedRequest.employee}
                      </h3>

                      <p className="text-xs text-gray-500 mt-1">
                        {selectedRequest.employeeId}
                      </p>

                      <p className="text-xs text-gray-500">
                        {selectedRequest.department}
                      </p>

                    </div>

                  </div>

                  <span
                    className={`
                      px-2.5 py-1.5
                      rounded-full
                      border
                      text-[11px]
                      font-semibold
                      ${getStatusStyle(selectedRequest.status)}
                    `}
                  >
                    {selectedRequest.status}
                  </span>

                </div>


                <div className="grid grid-cols-2 gap-3 mt-5">

                  <div
                    className="
                      p-3
                      rounded-xl
                      bg-[#FAFAF8]
                      border border-[#ECE8E1]
                    "
                  >
                    <p className="text-[11px] text-gray-400">
                      Department
                    </p>

                    <p className="text-sm font-medium mt-1">
                      {selectedRequest.department}
                    </p>
                  </div>

                  <div
                    className="
                      p-3
                      rounded-xl
                      bg-[#FAFAF8]
                      border border-[#ECE8E1]
                    "
                  >
                    <p className="text-[11px] text-gray-400">
                      Reporting Manager
                    </p>

                    <p className="text-sm font-medium mt-1 truncate">
                      {selectedRequest.manager}
                    </p>
                  </div>

                </div>

              </div>


              {/* Request summary */}

              <div
                className="
                  bg-white
                  border border-[#E5E1DA]
                  rounded-2xl
                  p-5
                "
              >

                <div className="flex items-center gap-2 mb-4">

                  <div
                    className="
                      w-8 h-8
                      rounded-lg
                      bg-[#EAF3E7]
                      text-[#39733A]
                      flex items-center justify-center
                    "
                  >
                    <CalendarDays size={16} />
                  </div>

                  <div>

                    <p className="text-sm font-semibold">
                      Leave Details
                    </p>

                    <p className="text-xs text-gray-500">
                      Requested leave period
                    </p>

                  </div>

                </div>


                <div className="grid grid-cols-2 gap-3">

                  <div>
                    <p className="text-[11px] text-gray-400">
                      Leave Type
                    </p>

                    <p className="text-sm font-semibold mt-1">
                      {selectedRequest.leaveType}
                    </p>
                  </div>

                  <div>
                    <p className="text-[11px] text-gray-400">
                      Duration
                    </p>

                    <p className="text-sm font-semibold mt-1">
                      {selectedRequest.duration}{" "}
                      {selectedRequest.duration === 1
                        ? "Day"
                        : "Days"}
                    </p>
                  </div>

                  <div>
                    <p className="text-[11px] text-gray-400">
                      Start Date
                    </p>

                    <p className="text-sm font-semibold mt-1">
                      {formatDate(selectedRequest.startDate)}
                    </p>
                  </div>

                  <div>
                    <p className="text-[11px] text-gray-400">
                      End Date
                    </p>

                    <p className="text-sm font-semibold mt-1">
                      {formatDate(selectedRequest.endDate)}
                    </p>
                  </div>

                </div>

              </div>


              {/* Reason */}

              <div
                className="
                  bg-white
                  border border-[#E5E1DA]
                  rounded-2xl
                  p-5
                "
              >

                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                  Employee Reason
                </p>

                <div
                  className="
                    mt-3
                    p-4
                    rounded-xl
                    bg-[#F8F6F2]
                    border border-[#E9E4DC]
                  "
                >
                  <p className="text-sm text-gray-700 leading-6">
                    {selectedRequest.reason}
                  </p>
                </div>

              </div>


              {/* Balance impact */}

              <div
                className="
                  bg-white
                  border border-[#E5E1DA]
                  rounded-2xl
                  p-5
                "
              >

                <div className="flex items-center justify-between mb-4">

                  <div>

                    <p className="text-sm font-semibold">
                      Leave Balance Impact
                    </p>

                    <p className="text-xs text-gray-500 mt-1">
                      Balance after this request is approved
                    </p>

                  </div>

                  <div
                    className="
                      w-8 h-8
                      rounded-lg
                      bg-[#F7F0E3]
                      text-[#806027]
                      flex items-center justify-center
                    "
                  >
                    <BriefcaseBusiness size={16} />
                  </div>

                </div>


                <div className="flex items-center justify-between">

                  <div>

                    <p className="text-[11px] text-gray-400">
                      Current
                    </p>

                    <p className="text-2xl font-bold mt-1">
                      {selectedRequest.balanceBefore}
                    </p>

                    <p className="text-xs text-gray-400">
                      days
                    </p>

                  </div>


                  <div
                    className="
                      w-9 h-9
                      rounded-full
                      bg-[#F8F6F2]
                      flex items-center justify-center
                      text-gray-400
                    "
                  >
                    <ArrowRight size={17} />
                  </div>


                  <div className="text-right">

                    <p className="text-[11px] text-gray-400">
                      After approval
                    </p>

                    <p className="text-2xl font-bold text-[#39733A] mt-1">
                      {selectedRequest.balanceAfter}
                    </p>

                    <p className="text-xs text-gray-400">
                      days
                    </p>

                  </div>

                </div>


                <div
                  className="
                    mt-4
                    flex items-center gap-2
                    px-3 py-2.5
                    rounded-xl
                    bg-[#F8F6F2]
                    text-xs text-gray-600
                  "
                >
                  <CircleCheck
                    size={15}
                    className="text-[#39733A]"
                  />

                  Leave balance is sufficient for this request.
                </div>

              </div>


              {/* Applied information */}

              <div
                className="
                  flex items-center justify-between
                  px-1
                  text-xs text-gray-500
                "
              >

                <span>
                  Applied on
                </span>

                <span className="font-medium text-gray-700">
                  {formatDate(selectedRequest.appliedOn)}
                </span>

              </div>

            </div>


            {/* Footer */}

            {selectedRequest.status === "Pending" ? (

              <div
                className="
                  p-5
                  bg-white
                  border-t border-[#E5E1DA]
                "
              >

                <p className="text-xs text-gray-500 mb-3">
                  Review the request details before taking an action.
                </p>

                <div className="grid grid-cols-2 gap-3">

                  <button
                    onClick={() =>
                      rejectLeave(selectedRequest.id)
                    }
                    className="
                      inline-flex
                      items-center
                      justify-center
                      gap-2
                      px-4 py-3
                      rounded-xl
                      border border-[#DECAC3]
                      bg-[#FCF8F6]
                      text-[#8A3E2F]
                      text-sm
                      font-semibold
                      hover:bg-[#F7ECE8]
                      transition
                    "
                  >
                    <CircleX size={17} />
                    Reject
                  </button>

                  <button
                    onClick={() =>
                      approveLeave(selectedRequest.id)
                    }
                    className="
                      inline-flex
                      items-center
                      justify-center
                      gap-2
                      px-4 py-3
                      rounded-xl
                      bg-[#4D8B4F]
                      text-white
                      text-sm
                      font-semibold
                      hover:bg-[#427745]
                      transition
                      shadow-sm
                    "
                  >
                    <CircleCheck size={17} />
                    Approve
                  </button>

                </div>

              </div>

            ) : (

              <div
                className="
                  p-5
                  bg-white
                  border-t border-[#E5E1DA]
                "
              >

                <button
                  onClick={() => setSelectedRequest(null)}
                  className="
                    w-full
                    px-4 py-3
                    rounded-xl
                    border border-[#DDD9D2]
                    text-sm font-semibold
                    text-gray-700
                    hover:bg-[#F8F6F2]
                  "
                >
                  Close
                </button>

              </div>

            )}

          </aside>

        </div>

      )}


      {/* =========================================================
          EMPLOYEE BALANCE DRAWER
      ========================================================= */}

      {selectedEmployee && (

        <div className="fixed inset-0 z-[110]">

          <div
            className="
              absolute inset-0
              bg-[#201A14]/35
              backdrop-blur-[3px]
            "
            onClick={() => setSelectedEmployee(null)}
          />

          <aside
            className="
              absolute
              top-0 right-0
              h-full
              w-full max-w-[440px]
              bg-[#FBFBF9]
              shadow-[-12px_0_40px_rgba(0,0,0,0.10)]
            "
          >

            <div
              className="
                px-6 py-5
                bg-white
                border-b border-[#E5E1DA]
              "
            >

              <div className="flex items-center justify-between">

                <div>

                  <p className="text-xs text-gray-500">
                    Employee Profile
                  </p>

                  <h2 className="text-xl font-bold mt-1">
                    Leave Balance
                  </h2>

                </div>

                <button
                  onClick={() => setSelectedEmployee(null)}
                  className="
                    w-9 h-9
                    rounded-xl
                    flex items-center justify-center
                    text-gray-500
                    hover:bg-[#F5F3EF]
                  "
                >
                  <X size={19} />
                </button>

              </div>

            </div>


            <div className="p-6">

              <div
                className="
                  bg-white
                  border border-[#E5E1DA]
                  rounded-2xl
                  p-5
                "
              >

                <div className="flex items-center gap-4">

                  <div
                    className="
                      w-14 h-14
                      rounded-full
                      bg-[#E8F1E5]
                      text-[#39733A]
                      flex items-center justify-center
                      text-lg font-bold
                    "
                  >
                    {getInitials(selectedEmployee.name)}
                  </div>

                  <div>

                    <p className="font-semibold">
                      {selectedEmployee.name}
                    </p>

                    <p className="text-xs text-gray-500 mt-1">
                      {selectedEmployee.designation}
                    </p>

                    <p className="text-xs text-gray-500">
                      {selectedEmployee.department} ·{" "}
                      {selectedEmployee.id}
                    </p>

                  </div>

                </div>

              </div>


              <div className="grid grid-cols-2 gap-3 mt-5">

                <div className="bg-white border border-[#E5E1DA] rounded-xl p-4">
                  <p className="text-xs text-gray-500">
                    Entitled
                  </p>

                  <p className="text-2xl font-bold mt-1">
                    {selectedEmployee.entitled}
                  </p>

                  <p className="text-[11px] text-gray-400 mt-1">
                    days / year
                  </p>
                </div>

                <div className="bg-white border border-[#E5E1DA] rounded-xl p-4">
                  <p className="text-xs text-gray-500">
                    Used
                  </p>

                  <p className="text-2xl font-bold mt-1">
                    {selectedEmployee.used}
                  </p>

                  <p className="text-[11px] text-gray-400 mt-1">
                    days used
                  </p>
                </div>

                <div className="bg-white border border-[#E5E1DA] rounded-xl p-4">
                  <p className="text-xs text-gray-500">
                    Pending
                  </p>

                  <p className="text-2xl font-bold text-[#806027] mt-1">
                    {selectedEmployee.pending}
                  </p>

                  <p className="text-[11px] text-gray-400 mt-1">
                    days pending
                  </p>
                </div>

                <div className="bg-white border border-[#E5E1DA] rounded-xl p-4">
                  <p className="text-xs text-gray-500">
                    Available
                  </p>

                  <p className="text-2xl font-bold text-[#39733A] mt-1">
                    {selectedEmployee.available}
                  </p>

                  <p className="text-[11px] text-gray-400 mt-1">
                    days remaining
                  </p>
                </div>

              </div>


              <div
                className="
                  mt-5
                  bg-white
                  border border-[#E5E1DA]
                  rounded-2xl
                  p-5
                "
              >

                <div className="flex justify-between text-sm mb-2">

                  <span className="text-gray-500">
                    Leave utilization
                  </span>

                  <span className="font-semibold">
                    {Math.round(
                      (selectedEmployee.used /
                        selectedEmployee.entitled) *
                        100
                    )}
                    %
                  </span>

                </div>

                <div className="h-2.5 bg-[#ECE9E3] rounded-full overflow-hidden">

                  <div
                    className="h-full bg-[#4D8B4F] rounded-full"
                    style={{
                      width: `${Math.min(
                        100,
                        (selectedEmployee.used /
                          selectedEmployee.entitled) *
                          100
                      )}%`,
                    }}
                  />

                </div>

              </div>


              {selectedEmployee.available <= 12 && (

                <div
                  className="
                    mt-4
                    p-4
                    rounded-xl
                    bg-[#FBF5E9]
                    border border-[#E9DBBD]
                    flex items-start gap-3
                  "
                >

                  <AlertTriangle
                    size={18}
                    className="text-[#806027] mt-0.5"
                  />

                  <div>

                    <p className="text-sm font-semibold text-[#705522]">
                      Leave balance attention
                    </p>

                    <p className="text-xs text-[#806027] mt-1 leading-5">
                      This employee has a relatively low remaining leave
                      balance and may need monitoring.
                    </p>

                  </div>

                </div>

              )}

            </div>

          </aside>

        </div>

      )}

    </div>
  );
};

export default HRLeaveManagement;