import React, { useState } from "react";
import {
    FiCalendar,
    FiCheckCircle,
    FiChevronRight,
    FiClock,
    FiEye,
    FiFileText,
    FiCreditCard,
    FiBell,
    FiSearch,
    FiCheck,
    FiTrendingUp,
    FiX,
    FiUser,
} from "react-icons/fi";
import { FaRupeeSign } from "react-icons/fa";

import PayslipPDF from "../container/PayslipPDF";

const INITIAL_PAYSLIPS = [
    { id: 1, month: "September 2026", shortMonth: "SEP", workingDays: 22, paidDays: 22, gross: 65000, deductions: 5240, netPay: 59760, status: "Processed", generatedDate: "30 Sep 2026" },
    { id: 2, month: "August 2026", shortMonth: "AUG", workingDays: 22, paidDays: 22, gross: 65000, deductions: 5240, netPay: 59760, status: "Processed", generatedDate: "31 Aug 2026" },
    { id: 3, month: "July 2026", shortMonth: "JUL", workingDays: 23, paidDays: 23, gross: 65000, deductions: 5240, netPay: 59760, status: "Processed", generatedDate: "31 Jul 2026" },
    { id: 4, month: "June 2026", shortMonth: "JUN", workingDays: 22, paidDays: 22, gross: 65000, deductions: 5240, netPay: 59760, status: "Processed", generatedDate: "30 Jun 2026" },
    { id: 5, month: "May 2026", shortMonth: "MAY", workingDays: 21, paidDays: 21, gross: 65000, deductions: 5240, netPay: 59760, status: "Processed", generatedDate: "31 May 2026" },
    { id: 6, month: "April 2026", shortMonth: "APR", workingDays: 22, paidDays: 22, gross: 65000, deductions: 5240, netPay: 59760, status: "Processed", generatedDate: "30 Apr 2026" },
    { id: 7, month: "March 2026", shortMonth: "MAR", workingDays: 22, paidDays: 22, gross: 65000, deductions: 5240, netPay: 59760, status: "Processed", generatedDate: "31 Mar 2026" },
    { id: 8, month: "February 2026", shortMonth: "FEB", workingDays: 20, paidDays: 20, gross: 65000, deductions: 5240, netPay: 59760, status: "Processed", generatedDate: "28 Feb 2026" },
    { id: 9, month: "January 2026", shortMonth: "JAN", workingDays: 22, paidDays: 22, gross: 65000, deductions: 5240, netPay: 59760, status: "Processed", generatedDate: "31 Jan 2026" },
];

const EmployeePayslips = () => {
    const [selectedPayslip, setSelectedPayslip] = useState(null);

    const [showNotifications, setShowNotifications] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedYear, setSelectedYear] = useState("2026");
    const [selectedMonth, setSelectedMonth] = useState("All");

    const [notifications, setNotifications] = useState([
        {
            id: "payslip-september-2026",
            type: "PAYSLIP_APPROVED",
            title: "Payslip Ready",
            message:
                "Your September 2026 payslip has been approved by HR and is now available to view.",
            payslipId: 1,
            isRead: false,
            time: "Just now",
        },
    ]);

    const unreadNotifications = notifications.filter(
        (notification) => !notification.isRead
    ).length;

    const handleNotificationClick = (notification) => {
        setNotifications((current) =>
            current.map((item) =>
                item.id === notification.id
                    ? { ...item, isRead: true }
                    : item
            )
        );

        if (notification.type === "PAYSLIP_APPROVED") {
            const targetPayslip =
                payslips.find(
                    (payslip) => payslip.id === notification.payslipId
                ) || topPayslip;

            setSelectedPayslip(targetPayslip);
            setShowNotifications(false);
        }
    };

    const markAllNotificationsAsRead = () => {
        setNotifications((current) =>
            current.map((notification) => ({
                ...notification,
                isRead: true,
            }))
        );
    };

    // Employee details

    const employee = {
        id: "EMP005",
        name: "Kiran Reddy",
        department: "Finance",
        designation: "Finance Executive",

        hours: 176,
        workingDays: 22,
        paidDays: 22,
        leaveDays: 0,
        lopDays: 0,

        basic: 35000,
        hra: 15000,
        allowances: 15000,

        gross: 65000,

        pf: 4200,
        professionalTax: 200,
        lop: 840,

        deductions: 5240,

        netPay: 59760,

        payrollStatus: "Processed",
        hrStatus: "Approved",

        payslipGenerated: true,
    };

    // Payslip data
    const payslips = INITIAL_PAYSLIPS;

    const dataYears = payslips.map((payslip) => Number(payslip.month.split(" ")[1]));
    const currentYear = new Date().getFullYear();
    const latestDataYear = Math.max(currentYear, ...dataYears);

    const availableYears = Array.from(
        { length: 5 },
        (_, index) => String(latestDataYear + index)
    );

    const availableMonths = [
        "All",
        ...new Set(
            payslips.map((payslip) => payslip.month.split(" ")[0])
        ),
    ];

    const filteredPayslips = payslips.filter((payslip) => {
        const [monthName, year] = payslip.month.split(" ");
        const searchValue = searchTerm.trim().toLowerCase();

        const matchesSearch =
            !searchValue ||
            payslip.month.toLowerCase().includes(searchValue) ||
            payslip.generatedDate.toLowerCase().includes(searchValue) ||
            payslip.shortMonth.toLowerCase().includes(searchValue);

        const matchesYear =
            selectedYear === "All" || year === selectedYear;

        const matchesMonth =
            selectedMonth === "All" || monthName === selectedMonth;

        return matchesSearch && matchesYear && matchesMonth;
    });

    const hasActiveFilters =
        Boolean(searchTerm.trim()) ||
        selectedYear !== "2026" ||
        selectedMonth !== "All";

    const topPayslip = filteredPayslips[0] || {
        id: null,
        month: "No matching payslip",
        shortMonth: "--",
        workingDays: 0,
        paidDays: 0,
        gross: 0,
        deductions: 0,
        netPay: 0,
        status: "No data",
        generatedDate: "",
    };

    const hasPayslip = filteredPayslips.length > 0;

    // Format currency

    const currency = (value) => {
        return `₹${Number(value || 0).toLocaleString("en-IN")}`;
    };

    // Calculate total net pay

    const totalNetPay = payslips.reduce(
        (total, payslip) => total + payslip.netPay,
        0
    );

    const ytdNetPay = payslips
        .filter((payslip) => payslip.month.endsWith("2026"))
        .reduce((total, payslip) => total + payslip.netPay, 0);

    // Prepare payslip data

    const getEmployeeForPayslip = (payslip) => {
        return {
            ...employee,

            workingDays: payslip.workingDays,
            paidDays: payslip.paidDays,

            gross: payslip.gross,
            deductions: payslip.deductions,
            netPay: payslip.netPay,

            payrollStatus: payslip.status,

            payslipGenerated: true,
        };
    };

    // Render

    return (
        <div className="min-h-screen bg-[#F5F6F4] text-slate-800">
            {/* Page Header */}

            <header className="border-b border-slate-200/80 bg-white">
                <div className="mx-auto w-full max-w-[1500px] px-5 py-5 sm:px-7 lg:px-9">
                    <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                        {/* Title */}

                        <div className="flex items-center gap-4">
                            <div
                                className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-[#DCE8DC] bg-[#F1F6F1] text-[#4D8B4F] shadow-sm"
                            >
                                <FaRupeeSign size={21} />
                            </div>

                            <div>
                                <div className="flex flex-wrap items-center gap-2">
                                    <h1
                                        className="text-xl font-bold tracking-tight text-[#2F241C] sm:text-2xl"
                                    >
                                        My Payslips
                                    </h1>

                                </div>

                                <p className="mt-1 text-sm leading-5 text-slate-500">
                                    View your monthly salary statements and
                                    download generated payslips.
                                </p>
                            </div>
                        </div>

                        {/* Search  Filters  Notification */}

                        <div className="flex w-full min-w-0 items-center justify-end gap-2 overflow-x-auto pb-1 lg:w-auto lg:overflow-visible lg:pb-0">
                            <div className="relative w-[230px] shrink-0 sm:w-[250px]">
                                <FiSearch
                                    size={15}
                                    className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                                />
                                <input
                                    type="text"
                                    value={searchTerm}
                                    onChange={(event) => setSearchTerm(event.target.value)}
                                    placeholder="Search payslip..."
                                    className="h-10 w-full rounded-xl border border-slate-200 bg-[#FAFBFA] pl-9 pr-3 text-xs font-medium text-slate-700 outline-none transition-all placeholder:text-slate-400 focus:border-[#BFD5BF] focus:bg-white focus:ring-4 focus:ring-[#4D8B4F]/[0.06]"
                                />
                            </div>

                            <div className="flex h-10 shrink-0 items-center rounded-xl border border-slate-200 bg-[#FAFBFA] px-3">
                                <select
                                    value={selectedYear}
                                    onChange={(event) => setSelectedYear(event.target.value)}
                                    className="bg-transparent text-xs font-semibold text-slate-700 outline-none"
                                    aria-label="Filter by year"
                                >
                                    <option value="All">Year</option>
                                    {availableYears.map((year) => (
                                        <option key={year} value={year}>{year}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="flex h-10 shrink-0 items-center rounded-xl border border-slate-200 bg-[#FAFBFA] px-3">
                                <select
                                    value={selectedMonth}
                                    onChange={(event) => setSelectedMonth(event.target.value)}
                                    className="bg-transparent text-xs font-semibold text-slate-700 outline-none"
                                    aria-label="Filter by month"
                                >
                                    {availableMonths.map((month) => (
                                        <option key={month} value={month}>
                                            {month === "All" ? "Month" : month}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {hasActiveFilters && (
                                <button
                                    type="button"
                                    onClick={() => {
                                        setSearchTerm("");
                                        setSelectedYear("2026");
                                        setSelectedMonth("All");
                                    }}
                                    className="flex h-10 shrink-0 items-center rounded-xl px-2 text-[11px] font-semibold text-slate-400 transition hover:text-[#4D8B4F]"
                                >
                                    Clear
                                </button>
                            )}

                            <button
                                type="button"
                                onClick={() => setShowNotifications((current) => !current)}
                                className="group relative flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 shadow-[0_4px_16px_rgba(15,23,42,0.04)] transition-all duration-200 hover:-translate-y-0.5 hover:border-slate-300 hover:bg-slate-50 hover:text-slate-800"
                                aria-label="Notifications"
                            >
                                <FiBell size={17} />
                                {unreadNotifications > 0 && (
                                    <span className="absolute -right-1.5 -top-1.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full border-2 border-white bg-[#DC2626] px-1 text-[9px] font-bold leading-none text-white">
                                        {unreadNotifications}
                                    </span>
                                )}
                            </button>
                        </div>

                        {/* Notification Drawer */}

                        {showNotifications && (
                            <>
                                <button
                                    type="button"
                                    aria-label="Close notifications"
                                    onClick={() => setShowNotifications(false)}
                                    className="fixed inset-0 z-[60] cursor-default bg-slate-950/20 backdrop-blur-[2px]"
                                />

                                <aside
                                    className="fixed right-0 top-0 z-[70] flex h-screen w-full max-w-[400px] flex-col overflow-hidden border-l border-slate-200/80 bg-[#F8FAF8] shadow-[-24px_0_70px_rgba(15,23,42,0.16)]"
                                >
                                    {/* Drawer Header */}
                                    <div className="relative overflow-hidden border-b border-slate-200/80 bg-white px-6 pb-5 pt-6">
                                        <div className="pointer-events-none absolute -right-16 -top-20 h-44 w-44 rounded-full bg-[#EAF2EA] blur-2xl" />
                                        <div className="pointer-events-none absolute -bottom-20 left-16 h-32 w-32 rounded-full bg-[#F1E8E1] blur-3xl" />

                                        <div className="relative flex items-start justify-between gap-4">
                                            <div className="flex items-center gap-3.5">
                                                <div className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-[17px] border border-[#DDE8DD] bg-[#F2F7F2] text-[#4D8B4F] shadow-[0_6px_18px_rgba(77,139,79,0.10)]">
                                                    <FiBell size={20} strokeWidth={2.2} />
                                                    {unreadNotifications > 0 && (
                                                        <span className="absolute -right-1.5 -top-1.5 flex h-5 min-w-5 items-center justify-center rounded-full border-2 border-white bg-[#DC2626] px-1 text-[9px] font-extrabold text-white shadow-[0_4px_10px_rgba(220,38,38,0.25)]">
                                                            {unreadNotifications}
                                                        </span>
                                                    )}
                                                </div>

                                                <div>
                                                    <div className="flex items-center gap-2">
                                                        <p className="text-[17px] font-bold tracking-[-0.02em] text-slate-800">
                                                            Notifications
                                                        </p>
                                                        <span className="rounded-full bg-[#F1F5F1] px-2 py-0.5 text-[9px] font-bold uppercase tracking-[0.08em] text-[#4D8B4F]">
                                                            Payroll
                                                        </span>
                                                    </div>
                                                    <p className="mt-1 text-[11px] font-medium text-slate-400">
                                                        Important updates from MSS Pathway
                                                    </p>
                                                </div>
                                            </div>

                                            <button
                                                type="button"
                                                onClick={() => setShowNotifications(false)}
                                                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-400 shadow-sm transition-all duration-200 hover:border-slate-300 hover:bg-slate-50 hover:text-slate-700"
                                                aria-label="Close notifications"
                                            >
                                                <FiX size={17} />
                                            </button>
                                        </div>
                                    </div>

                                    {/* Summary Bar */}
                                    <div className="border-b border-slate-200/70 bg-white px-6 py-3.5">
                                        <div className="flex items-center justify-between gap-4">
                                            <div className="flex items-center gap-2.5">
                                                <span className="h-2 w-2 rounded-full bg-[#DC2626] shadow-[0_0_0_4px_rgba(220,38,38,0.08)]" />
                                                <p className="text-[11px] font-semibold text-slate-600">
                                                    {unreadNotifications === 1
                                                        ? "1 unread notification"
                                                        : `${unreadNotifications} unread notifications`}
                                                </p>
                                            </div>

                                            {unreadNotifications > 0 && (
                                                <button
                                                    type="button"
                                                    onClick={markAllNotificationsAsRead}
                                                    className="text-[10px] font-bold text-[#4D8B4F] transition-colors hover:text-[#3D713F]"
                                                >
                                                    Mark all as read
                                                </button>
                                            )}
                                        </div>
                                    </div>

                                    {/* Notification Content */}
                                    <div className="flex-1 overflow-y-auto px-4 py-4 sm:px-5">
                                        {notifications.map((notification) => (
                                            <button
                                                key={notification.id}
                                                type="button"
                                                onClick={() => handleNotificationClick(notification)}
                                                className={`group relative w-full overflow-hidden rounded-[20px] border p-4 text-left transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_14px_30px_rgba(15,23,42,0.08)] ${notification.isRead
                                                    ? "border-slate-200 bg-white"
                                                    : "border-[#D7E6D7] bg-white shadow-[0_8px_24px_rgba(77,139,79,0.06)]"
                                                    }`}
                                            >
                                                {!notification.isRead && (
                                                    <span className="absolute left-0 top-0 h-full w-[3px] bg-[#4D8B4F]" />
                                                )}

                                                {/* Top Row */}
                                                <div className="flex items-center gap-3">
                                                    <div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-[13px] border border-[#DCE8DC] bg-[#F3F8F3] text-[#4D8B4F]">
                                                        <FiFileText size={17} strokeWidth={2} />
                                                        <span className="absolute -bottom-1 -right-1 flex h-[17px] w-[17px] items-center justify-center rounded-full border-2 border-white bg-[#4D8B4F] text-white shadow-sm">
                                                            <FiCheck size={8} strokeWidth={3} />
                                                        </span>
                                                    </div>

                                                    <div className="min-w-0 flex-1">
                                                        <div className="flex items-center gap-1.5">
                                                            <p className="truncate text-[13px] font-bold tracking-[-0.01em] text-slate-800">
                                                                {notification.title}
                                                            </p>
                                                            {!notification.isRead && (
                                                                <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-[#DC2626]" />
                                                            )}
                                                        </div>
                                                        <p className="mt-0.5 text-[9px] font-bold uppercase tracking-[0.11em] text-[#4D8B4F]">
                                                            Salary & Payroll
                                                        </p>
                                                    </div>

                                                    <span className="shrink-0 self-start pt-0.5 text-[9px] font-semibold text-slate-400">
                                                        {notification.time}
                                                    </span>
                                                </div>

                                                {/* Message */}
                                                <p className="mt-3 pl-[52px] text-[10px] leading-[1.55] text-slate-500">
                                                    {notification.message}
                                                </p>

                                                {/* Payslip Summary */}
                                                <div className="mt-3 flex items-center justify-between rounded-[14px] border border-slate-100 bg-[#FAFBFA] px-3 py-2.5">
                                                    <div className="flex min-w-0 items-center gap-2.5">
                                                        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-[10px] bg-white text-[#4D8B4F] shadow-[0_2px_7px_rgba(15,23,42,0.06)]">
                                                            <FaRupeeSign size={11} />
                                                        </div>
                                                        <div className="min-w-0">
                                                            <p className="text-[8px] font-bold uppercase tracking-[0.08em] text-slate-400">
                                                                September 2026
                                                            </p>
                                                            <p className="mt-0.5 truncate text-[11px] font-bold text-slate-700">
                                                                Payslip approved
                                                            </p>
                                                        </div>
                                                    </div>

                                                    <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-[#EDF6ED] px-2 py-1 text-[8px] font-bold text-[#4D8B4F]">
                                                        <FiCheckCircle size={10} />
                                                        Processed
                                                    </span>
                                                </div>

                                                {/* Action Row */}
                                                <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-3">
                                                    <span className="flex items-center gap-1.5 text-[9px] font-medium text-slate-400">
                                                        <FiClock size={10} />
                                                        Approved by HR
                                                    </span>

                                                    <span className="inline-flex items-center gap-1 rounded-[9px] bg-[#F0F6F0] px-2.5 py-1.5 text-[9px] font-bold text-[#4D8B4F] transition-all duration-200 group-hover:bg-[#E5F0E5]">
                                                        View Payslip
                                                        <FiChevronRight size={11} className="transition-transform duration-200 group-hover:translate-x-0.5" />
                                                    </span>
                                                </div>
                                            </button>
                                        ))}
                                    </div>

                                    {/* Drawer Footer */}
                                    <div className="border-t border-slate-200/70 bg-white px-5 py-3">
                                        <p className="text-center text-[9px] font-medium text-slate-400">
                                            Payroll notifications appear here
                                        </p>
                                    </div>
                                </aside>
                            </>
                        )}

                    </div>
                </div>
            </header>

            {/* Main */}

            <main
                className="mx-auto w-full max-w-[1500px] px-5 py-6 sm:px-7 lg:px-9 lg:py-8"
            >
                {/* Summary Cards */}

                <section
                    className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4"
                >
                    {/* Net Pay */}

                    <div
                        className="group relative overflow-hidden rounded-[22px] bg-[#2F241C] p-5 text-white shadow-[0_10px_30px_rgba(47,36,28,0.10)] transition duration-300 hover:-translate-y-0.5 hover:shadow-[0_16px_35px_rgba(47,36,28,0.14)]"
                    >
                        <div
                            className="absolute -right-12 -top-12 h-32 w-32 rounded-full border border-white/[0.06] bg-white/[0.03]"
                        />

                        <div
                            className="absolute -bottom-10 -left-8 h-24 w-24 rounded-full bg-white/[0.025]"
                        />

                        <div className="relative">
                            <div className="flex items-start justify-between">
                                <div>
                                    <p className="text-[11px] font-medium uppercase tracking-[0.08em] text-white/45">
                                        Latest Net Pay
                                    </p>

                                    <p className="mt-2 text-2xl font-bold tracking-tight sm:text-[26px]">
                                        {topPayslip ? currency(topPayslip.netPay) : "--"}
                                    </p>
                                </div>

                                <div
                                    className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/[0.07] text-[#EADBC8]"
                                >
                                    <FaRupeeSign size={19} />
                                </div>
                            </div>

                            <div className="mt-5 flex items-center gap-2">
                                <FiTrendingUp size={13} />

                                <span className="text-[11px] text-white/55">
                                    {topPayslip?.month || "No payslip"} payroll
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Available Payslips */}

                    <SummaryCard
                        label="Available Payslips"
                        value={payslips.length}
                        description="Generated salary statements"
                        icon={<FiFileText size={18} />}
                        iconClass="bg-[#EEF4EE] text-[#4D8B4F]"
                    />

                    {/* Paid Days */}

                    <SummaryCard
                        label="Paid Days"
                        value={
                            <>
                                {topPayslip ? topPayslip.paidDays : "--"}
                                <span className="ml-1 text-sm font-medium text-slate-400">
                                    / {topPayslip ? topPayslip.workingDays : "--"}
                                </span>
                            </>
                        }
                        description="Attendance considered for payroll"
                        icon={<FiCalendar size={18} />}
                        iconClass="bg-[#F3EFEA] text-[#6B2D1A]"
                    />

                    {/* Ytd Net Pay */}

                    <SummaryCard
                        label="YTD Net Pay"
                        value={currency(ytdNetPay)}
                        description="Total net pay for 2026"
                        icon={<FiTrendingUp size={18} />}
                        iconClass="bg-[#EEF4EE] text-[#4D8B4F]"
                    />
                </section>

                {/* Current Payslip */}

                <section className="mt-8">
                    <SectionHeading
                        eyebrow="Latest Statement"
                        title="Current Payslip"
                        rightContent={
                            <span className="hidden text-xs text-slate-400 sm:block">
                                Updated {topPayslip?.generatedDate || "No payslip available"}
                            </span>
                        }
                    />

                    <div
                        className="overflow-hidden rounded-[26px] border border-slate-200 bg-white shadow-[0_8px_30px_rgba(15,23,42,0.045)]"
                    >
                        {/* Card Header */}

                        {!hasPayslip && (
                            <div className="border-b border-slate-100 bg-[#FAFAFA] px-5 py-4 sm:px-7">
                                <div className="flex items-center gap-3 text-sm text-slate-500">
                                    <FiSearch size={16} />
                                    <span>No payslip matches the selected search or filters.</span>
                                </div>
                            </div>
                        )}

                        <div className="border-b border-slate-100 px-5 py-5 sm:px-7">
                            <div
                                className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
                            >
                                <div className="flex items-center gap-3">
                                    <div
                                        className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#F3EFEA] text-[#6B2D1A]"
                                    >
                                        <FiFileText size={19} />
                                    </div>

                                    <div>
                                        <div className="flex flex-wrap items-center gap-2">
                                            <h3 className="text-base font-bold text-slate-800">
                                                {topPayslip.month}
                                            </h3>

                                            <StatusBadge
                                                status={topPayslip.status}
                                            />
                                        </div>

                                        <p className="mt-1 text-xs text-slate-400">
                                            Monthly salary statement
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2 text-xs text-slate-400">
                                    <FiCalendar size={14} />

                                    <span>
                                        {topPayslip?.generatedDate || "No payslip available"}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Card Body */}

                        <div className="p-5 sm:p-7">
                            <div
                                className="grid grid-cols-1 gap-5 xl:grid-cols-[1.2fr_1fr]"
                            >
                                {/* Net Pay */}

                                <div
                                    className="group relative overflow-hidden rounded-[22px] border border-[#DDE2DE] bg-[#F4F5F3] shadow-[0_10px_30px_rgba(25,35,30,0.06)] transition-all duration-300 hover:-translate-y-[2px] hover:shadow-[0_16px_38px_rgba(25,35,30,0.10)]"
                                >
                                    {/* Left Accent Rail */}

                                    <div
                                        className="absolute left-0 top-0 h-full w-[4px] bg-[#596B5C] transition-all duration-300 group-hover:w-[6px]"
                                    />

                                    {/* Abstract Background Shape */}

                                    <div
                                        className="pointer-events-none absolute -right-20 -top-20 h-52 w-52 rounded-full border border-[#D5DAD6] transition-transform duration-700 ease-out group-hover:scale-110"
                                    />

                                    <div
                                        className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full border border-[#DEE2DF] transition-transform duration-700 group-hover:rotate-12"
                                    />

                                    {/* Soft Light */}

                                    <div
                                        className="pointer-events-none absolute right-10 top-8 h-20 w-20 rounded-full bg-white/70 blur-2xl transition-all duration-500 group-hover:bg-white"
                                    />

                                    {/* Content */}

                                    <div className="relative p-6 pl-7">

                                        {/* Top Row */}
                                        <div className="flex items-start justify-between">

                                            <div>

                                                <div className="flex items-center gap-2">

                                                    <span
                                                        className="h-1.5 w-1.5 rounded-full bg-[#596B5C]"
                                                    />

                                                    <p
                                                        className="text-[10px] font-semibold uppercase tracking-[0.13em] text-[#7B8780]"
                                                    >
                                                        Latest Net Pay
                                                    </p>

                                                </div>

                                                <p
                                                    className="mt-2 text-[12px] text-[#9AA39D]"
                                                >
                                                    {topPayslip?.month || "No payslip"} payroll
                                                </p>

                                            </div>

                                            {/* Floating Rupee Badge */}
                                            <div
                                                className="flex h-11 w-11 items-center justify-center rounded-full border border-[#DCE1DD] bg-white text-[#53645A] shadow-[0_5px_14px_rgba(25,35,30,0.07)] transition-all duration-300 group-hover:-translate-y-1 group-hover:shadow-[0_8px_18px_rgba(25,35,30,0.10)]"
                                            >
                                                <FaRupeeSign size={17} />
                                            </div>

                                        </div>

                                        {/* Salary */}

                                        <div className="mt-7">

                                            <p
                                                className="text-[42px] font-bold leading-none tracking-[-0.045em] text-[#18211C] sm:text-[46px]"
                                            >
                                                {currency(topPayslip.netPay)}
                                            </p>

                                            <div className="mt-3 flex items-center gap-2">

                                                <span
                                                    className="inline-flex h-5 items-center rounded-full border border-[#D7E2D7] bg-[#F1F6F1] px-2 text-[9px] font-semibold uppercase tracking-[0.07em] text-[#4D8B4F]"
                                                >
                                                    Processed
                                                </span>

                                                <span className="text-[11px] text-[#98A19B]">
                                                    After deductions
                                                </span>

                                            </div>

                                        </div>

                                        {/* Bottom Divider */}

                                        <div
                                            className="mt-7 h-px bg-[#DEE3DF]"
                                        />

                                        {/* Bottom Information Strip */}

                                        <div
                                            className="mt-4 flex items-center justify-between"
                                        >

                                            {/* Pay Period */}
                                            <div>

                                                <p
                                                    className="text-[9px] font-medium uppercase tracking-[0.11em] text-[#9AA39D]"
                                                >
                                                    Pay Period
                                                </p>

                                                <p
                                                    className="mt-1 text-[13px] font-semibold text-[#303A34]"
                                                >
                                                    September 2026
                                                </p>

                                            </div>

                                            {/* Payroll State */}
                                            <div
                                                className="flex items-center gap-2 rounded-full border border-[#E0E4E1] bg-white/70 px-3 py-2"
                                            >

                                                <span
                                                    className="h-1.5 w-1.5 rounded-full bg-[#4D8B4F] shadow-[0_0_0_3px_rgba(77,139,79,0.10)]"
                                                />

                                                <span
                                                    className="text-[10px] font-semibold text-[#59665D]"
                                                >
                                                    Payroll Processed
                                                </span>

                                            </div>

                                        </div>

                                    </div>
                                </div>

                                {/* Breakdown */}

                                <div
                                    className="group relative overflow-hidden rounded-[22px] border border-slate-200 bg-[#FAFAFA] p-5 shadow-[0_6px_20px_rgba(15,23,42,0.03)] transition-all duration-300 ease-out hover:-translate-y-1 hover:border-slate-300 hover:bg-white hover:shadow-[0_14px_32px_rgba(15,23,42,0.07)]"
                                >
                                    {/* Subtle Decorative Glow */}
                                    <div
                                        className="pointer-events-none absolute -right-12 -top-12 h-28 w-28 rounded-full bg-slate-100/70 blur-2xl transition-all duration-500 group-hover:scale-125 group-hover:bg-slate-100"
                                    />

                                    <div className="relative">

                                        {/* Header */}
                                        <div className="flex items-center justify-between">

                                            <div>
                                                <p
                                                    className="text-sm font-bold text-slate-800 transition-colors duration-300 group-hover:text-slate-900"
                                                >
                                                    Salary Breakdown
                                                </p>

                                                <p className="mt-1 text-[11px] text-slate-400">
                                                    {topPayslip?.month || "No payslip"} payroll summary
                                                </p>
                                            </div>

                                            {/* Animated Rupee Icon */}
                                            <div
                                                className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-100 bg-white text-slate-400 shadow-sm transition-all duration-300 group-hover:-translate-y-0.5 group-hover:scale-105 group-hover:text-slate-600 group-hover:shadow-md"
                                            >
                                                <FaRupeeSign
                                                    size={16}
                                                    className="transition-transform duration-300 group-hover:scale-110"
                                                />
                                            </div>

                                        </div>

                                        {/* Salary Details */}
                                        <div className="mt-5 space-y-4">

                                            {/* Gross Salary */}
                                            <div
                                                className="rounded-lg px-1 transition-all duration-300 hover:translate-x-1"
                                            >
                                                <SalaryRow
                                                    label="Gross Salary"
                                                    value={currency(
                                                        topPayslip.gross
                                                    )}
                                                />
                                            </div>

                                            {/* Divider */}
                                            <div
                                                className="h-px bg-slate-200 transition-all duration-300 group-hover:bg-slate-300"
                                            />

                                            {/* Total Deductions */}
                                            <div
                                                className="rounded-lg px-1 transition-all duration-300 hover:translate-x-1"
                                            >
                                                <SalaryRow
                                                    label="Total Deductions"
                                                    value={`- ${currency(
                                                        topPayslip.deductions
                                                    )}`}
                                                    valueClass="text-[#6B2D1A]"
                                                />
                                            </div>

                                            {/* Divider */}
                                            <div
                                                className="h-px bg-slate-200 transition-all duration-300 group-hover:bg-slate-300"
                                            />

                                            {/* Net Pay */}
                                            <div
                                                className="relative overflow-hidden rounded-xl px-2 py-2 transition-all duration-300 hover:bg-[#F4F7F3]"
                                            >
                                                {/* Small Animated Highlight */}
                                                <div
                                                    className="pointer-events-none absolute -left-10 top-0 h-full w-8 rotate-[15deg] bg-white/70 opacity-0 transition-all duration-700 group-hover:left-[110%] group-hover:opacity-100"
                                                />

                                                <div className="relative">
                                                    <SalaryRow
                                                        label="Net Pay"
                                                        value={currency(
                                                            topPayslip.netPay
                                                        )}
                                                        labelClass="font-semibold text-slate-700"
                                                        valueClass="font-bold text-[#4D8B4F]"
                                                    />
                                                </div>
                                            </div>

                                        </div>

                                    </div>
                                </div>
                            </div>

                            {/* Employee Information */}

                            <div className="mt-7 border-t border-slate-100 pt-6">
                                <div className="mb-4">
                                    <p className="text-sm font-bold text-slate-800">
                                        Employee Information
                                    </p>

                                    <p className="mt-1 text-[11px] text-slate-400">
                                        Details associated with this payslip
                                    </p>
                                </div>

                                <div
                                    className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4"
                                >
                                    <InfoItem
                                        label="Employee"
                                        value={employee.name}
                                        icon={<FiUser size={15} />}
                                    />

                                    <InfoItem
                                        label="Employee ID"
                                        value={employee.id}
                                        icon={<FiCreditCard size={15} />}
                                    />

                                    <InfoItem
                                        label="Department"
                                        value={employee.department}
                                        icon={<FiFileText size={15} />}
                                    />

                                    <InfoItem
                                        label="Designation"
                                        value={employee.designation}
                                        icon={<FiUser size={15} />}
                                    />
                                </div>
                            </div>

                            {/* Actions */}

                            {hasPayslip && (
                                <div
                                    className="mt-6 flex flex-col gap-3 border-t border-slate-100 pt-6 sm:flex-row sm:justify-end"
                                >
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setSelectedPayslip(topPayslip)
                                        }
                                        className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-slate-300 hover:bg-slate-50 hover:shadow-md"
                                    >
                                        <FiEye size={16} />
                                        View Details
                                    </button>

                                    {/* Real Pdf Component */}

                                    <PayslipPDF
                                        employee={getEmployeeForPayslip(
                                            topPayslip
                                        )}
                                        selectedMonth={topPayslip.month}
                                        className="inline-flex h-auto w-auto items-center justify-center gap-2 rounded-xl border-0 bg-[#4D8B4F] px-5 py-3 text-sm font-semibold text-white shadow-[0_6px_18px_rgba(77,139,79,0.18)] transition duration-200 hover:-translate-y-0.5 hover:bg-[#417543] hover:shadow-[0_9px_22px_rgba(77,139,79,0.22)]"
                                    />
                                </div>
                            )}
                        </div>
                    </div>
                </section>

                {/* Previous Payslips */}

                <section className="mt-8">
                    <SectionHeading
                        eyebrow="Salary History"
                        title="Previous Payslips"
                        rightContent={
                            <div className="hidden text-right sm:block">
                                <p className="text-[11px] text-slate-400">
                                    Total available
                                </p>

                                <p className="mt-0.5 text-sm font-bold text-slate-700">
                                    {currency(totalNetPay)}
                                </p>
                            </div>
                        }
                    />
                    <div
                        className="overflow-hidden rounded-[26px] border border-slate-200 bg-white shadow-[0_8px_30px_rgba(15,23,42,0.045)]"
                    >
                        {/* Table Header */}
                        <div className="hidden grid-cols-[1.3fr_1fr_1.2fr_auto] items-center gap-4 border-b border-slate-100 bg-[#FAFAFA] px-6 py-4 text-[10px] font-bold uppercase tracking-[0.08em] text-slate-400 lg:grid">
                            <span>Pay Period</span>

                            <span>Gross Salary</span>

                            <span>Net Pay</span>

                            <span>Action</span>
                        </div>
                        <div className="divide-y divide-slate-100">
                            {filteredPayslips.filter((payslip) => payslip.id !== topPayslip.id).length === 0 ? (
                                <div className="px-6 py-10 text-center">
                                    <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-xl bg-[#F2F7F2] text-[#4D8B4F]">
                                        <FiFileText size={17} />
                                    </div>
                                    <p className="mt-3 text-sm font-semibold text-slate-700">
                                        No payslips found
                                    </p>
                                    <p className="mt-1 text-[11px] text-slate-400">
                                        Try changing your search or filters.
                                    </p>
                                </div>
                            ) : (
                                filteredPayslips.filter((payslip) => payslip.id !== topPayslip.id).map((payslip) => (
                                    <div
                                        key={payslip.id}
                                        className="group px-5 py-5 transition duration-200 hover:bg-[#FCFCFB] sm:px-6"
                                    >
                                        <div
                                            className="flex flex-col gap-5 lg:grid lg:grid-cols-[1.5fr_1fr_1fr_auto] lg:items-center lg:gap-4"
                                        >
                                            {/* Month */}

                                            <div className="flex items-center gap-3">
                                                <div
                                                    className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-[#E4EADF] bg-[#F3F7F3] text-xs font-bold tracking-wide text-[#4D8B4F]"
                                                >
                                                    {payslip.shortMonth}
                                                </div>

                                                <div>
                                                    <p className="text-sm font-bold text-slate-800">
                                                        {payslip.month}
                                                    </p>

                                                    <p className="mt-1 text-[11px] text-slate-400">
                                                        Generated{" "}
                                                        {payslip.generatedDate}
                                                    </p>
                                                </div>
                                            </div>

                                            {/* Gross */}

                                            <div>
                                                <p className="text-[10px] uppercase tracking-wide text-slate-400 lg:hidden">
                                                    Gross Salary
                                                </p>

                                                <p className="mt-1 text-sm font-semibold text-slate-700 lg:mt-0">
                                                    {currency(payslip.gross)}
                                                </p>
                                            </div>

                                            {/* Net */}

                                            <div>
                                                <p className="text-[10px] uppercase tracking-wide text-slate-400 lg:hidden">
                                                    Net Pay
                                                </p>

                                                <p className="mt-1 text-sm font-bold text-slate-800 lg:mt-0">
                                                    {currency(payslip.netPay)}
                                                </p>
                                            </div>

                                            {/* Actions */}

                                            <div className="flex items-center gap-2">
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        setSelectedPayslip(
                                                            payslip
                                                        )
                                                    }
                                                    className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-semibold text-slate-700 shadow-sm transition duration-200 hover:border-slate-300 hover:bg-slate-50 hover:shadow-md lg:flex-none"
                                                >
                                                    <FiEye size={14} />
                                                    View
                                                </button>

                                                {/* Real Pdf Download */}

                                                <PayslipPDF
                                                    employee={getEmployeeForPayslip(
                                                        payslip
                                                    )}
                                                    selectedMonth={
                                                        payslip.month
                                                    }
                                                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[#D8E7D8] bg-[#F2F7F2] text-[#4D8B4F] shadow-sm transition duration-200 hover:-translate-y-0.5 hover:bg-[#E8F1E8] hover:shadow-md"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </section>

                {/* Information Note */}

                <div
                    className="mt-6 flex flex-col gap-3 rounded-2xl border border-[#E6E0DA] bg-[#FBF9F7] p-4 sm:flex-row sm:items-center"
                >
                    <div
                        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#EEE8E2] text-[#6B2D1A]"
                    >
                        <FiClock size={16} />
                    </div>

                    <div>
                        <p className="text-xs font-semibold text-slate-700">
                            Payslip availability
                        </p>

                        <p className="mt-0.5 text-[11px] leading-5 text-slate-500">
                            Payslips become available after payroll processing
                            and HR approval are completed.
                        </p>
                    </div>
                </div>
            </main>

            {/* View Payslip Modal */}

            {selectedPayslip && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-[#1E1814]/45 p-4 backdrop-blur-md"
                    onClick={() => setSelectedPayslip(null)}
                >
                    <div
                        className="max-h-[90vh] w-full max-w-2xl overflow-hidden rounded-[26px] border border-white/70 bg-white shadow-[0_30px_80px_rgba(0,0,0,0.20)]"
                        onClick={(event) => event.stopPropagation()}
                    >
                        {/* Modal Header */}

                        <div
                            className="flex items-center justify-between border-b border-slate-100 px-5 py-5 sm:px-7"
                        >
                            <div className="flex items-center gap-3">
                                <div
                                    className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#F3EFEA] text-[#6B2D1A]"
                                >
                                    <FiFileText size={19} />
                                </div>

                                <div>
                                    <h2 className="text-base font-bold text-slate-800">
                                        Payslip Details
                                    </h2>

                                    <p className="mt-1 text-xs text-slate-400">
                                        {employee.name} ·{" "}
                                        {selectedPayslip.month}
                                    </p>
                                </div>
                            </div>

                            <button
                                type="button"
                                onClick={() => setSelectedPayslip(null)}
                                className="flex h-9 w-9 items-center justify-center rounded-xl text-slate-400 transition duration-200 hover:bg-slate-100 hover:text-slate-700"
                            >
                                <FiX size={18} />
                            </button>
                        </div>

                        {/* Modal Body */}

                        <div
                            className="max-h-[calc(90vh-145px)] overflow-y-auto p-5 sm:p-7"
                        >
                            <div
                                className="relative overflow-hidden rounded-[22px] bg-[#2F241C] p-6 text-white"
                            >
                                <div
                                    className="absolute -right-10 -top-10 h-32 w-32 rounded-full border border-white/[0.06]"
                                />

                                <div className="relative">
                                    <div className="flex items-center justify-between">
                                        <p className="text-[11px] font-medium uppercase tracking-[0.08em] text-white/45">
                                            Net Pay
                                        </p>

                                        <FaRupeeSign
                                            size={19}
                                            className="text-[#EADBC8]"
                                        />
                                    </div>

                                    <p className="mt-3 text-3xl font-bold">
                                        {currency(selectedPayslip.netPay)}
                                    </p>

                                    <div className="mt-4 flex items-center gap-2">
                                        <span className="h-2 w-2 rounded-full bg-[#A7D98E]" />

                                        <span className="text-xs text-white/55">
                                            {selectedPayslip.status}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
                                <ModalStat
                                    label="Gross Salary"
                                    value={currency(
                                        selectedPayslip.gross
                                    )}
                                />

                                <ModalStat
                                    label="Deductions"
                                    value={currency(
                                        selectedPayslip.deductions
                                    )}
                                />

                                <ModalStat
                                    label="Working Days"
                                    value={selectedPayslip.workingDays}
                                />

                                <ModalStat
                                    label="Paid Days"
                                    value={selectedPayslip.paidDays}
                                />
                            </div>

                            <div
                                className="mt-5 rounded-[22px] border border-slate-200 bg-[#FAFAFA] p-5"
                            >
                                <p
                                    className="text-[10px] font-bold uppercase tracking-[0.08em] text-slate-400"
                                >
                                    Employee Details
                                </p>

                                <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                                    <DetailRow
                                        label="Employee Name"
                                        value={employee.name}
                                    />

                                    <DetailRow
                                        label="Employee ID"
                                        value={employee.id}
                                    />

                                    <DetailRow
                                        label="Department"
                                        value={employee.department}
                                    />

                                    <DetailRow
                                        label="Designation"
                                        value={employee.designation}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Modal Footer */}

                        <div
                            className="flex flex-col-reverse gap-2 border-t border-slate-100 px-5 py-4 sm:flex-row sm:justify-end sm:px-7"
                        >
                            <button
                                type="button"
                                onClick={() => setSelectedPayslip(null)}
                                className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition duration-200 hover:bg-slate-50 hover:shadow-md"
                            >
                                Close
                            </button>

                            {/* Real Pdf Download In Modal */}

                            <PayslipPDF
                                employee={getEmployeeForPayslip(
                                    selectedPayslip
                                )}
                                selectedMonth={selectedPayslip.month}
                                className="inline-flex items-center justify-center gap-2 rounded-xl border-0 bg-[#4D8B4F] px-5 py-2.5 text-sm font-semibold text-white shadow-[0_6px_18px_rgba(77,139,79,0.18)] transition duration-200 hover:-translate-y-0.5 hover:bg-[#417543]"
                            />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

// Summary Card

const SummaryCard = ({
    label,
    value,
    description,
    icon,
    iconClass,
    status = false,
}) => {
    return (
        <div
            className="group rounded-[22px] border border-slate-200 bg-white p-5 shadow-[0_5px_20px_rgba(15,23,42,0.035)] transition duration-300 hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-[0_12px_30px_rgba(15,23,42,0.07)]"
        >
            <div className="flex items-start justify-between">
                <div>
                    <p className="text-[11px] font-medium uppercase tracking-[0.06em] text-slate-400">
                        {label}
                    </p>

                    <p
                        className={`
                            mt-2
                            font-bold
                            tracking-tight
                            ${status
                                ? "text-lg text-slate-800"
                                : "text-2xl text-slate-800"
                            }
                        `}
                    >
                        {value}
                    </p>
                </div>

                <div
                    className={`
                        flex
                        h-10
                        w-10
                        items-center
                        justify-center
                        rounded-xl
                        ${iconClass}
                    `}
                >
                    {icon}
                </div>
            </div>

            {status ? (
                <div className="mt-5 flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-[#4D8B4F]" />

                    <span className="text-[11px] text-slate-400">
                        {description}
                    </span>
                </div>
            ) : (
                <p className="mt-5 text-[11px] text-slate-400">
                    {description}
                </p>
            )}
        </div>
    );
};

// Section Heading

const SectionHeading = ({
    eyebrow,
    title,
    rightContent,
}) => {
    return (
        <div className="mb-4 flex items-end justify-between">
            <div>
                <p
                    className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#4D8B4F]"
                >
                    {eyebrow}
                </p>

                <h2
                    className="mt-1 text-xl font-bold tracking-tight text-[#2F241C]"
                >
                    {title}
                </h2>
            </div>

            {rightContent}
        </div>
    );
};

// Status Badge

const StatusBadge = ({ status }) => {
    return (
        <span
            className="inline-flex items-center gap-1.5 rounded-full border border-[#D8E7D8] bg-[#F2F7F2] px-2.5 py-1.5 text-[10px] font-bold text-[#4D8B4F]"
        >
            <FiCheckCircle size={11} />

            {status}
        </span>
    );
};

// Salary Row

const SalaryRow = ({
    label,
    value,
    labelClass = "text-slate-500",
    valueClass = "text-slate-800",
}) => {
    return (
        <div className="flex items-center justify-between gap-4">
            <span className={`text-xs ${labelClass}`}>
                {label}
            </span>

            <span
                className={`text-sm font-semibold ${valueClass}`}
            >
                {value}
            </span>
        </div>
    );
};

// Info Item

const InfoItem = ({
    label,
    value,
    icon,
}) => {
    return (
        <div
            className="flex items-center gap-3 rounded-xl border border-slate-100 bg-[#FAFAFA] px-4 py-3 transition duration-200 hover:border-slate-200 hover:bg-white"
        >
            <div
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white text-slate-400 shadow-sm"
            >
                {icon}
            </div>

            <div className="min-w-0">
                <p
                    className="text-[10px] font-bold uppercase tracking-wide text-slate-400"
                >
                    {label}
                </p>

                <p className="mt-1 truncate text-xs font-semibold text-slate-700">
                    {value}
                </p>
            </div>
        </div>
    );
};

// Modal Stat

const ModalStat = ({
    label,
    value,
}) => {
    return (
        <div
            className="rounded-2xl border border-slate-200 bg-[#FAFAFA] p-4 transition duration-200 hover:bg-white hover:shadow-sm"
        >
            <p className="text-[11px] text-slate-400">
                {label}
            </p>

            <p className="mt-1 text-base font-bold text-slate-800">
                {value}
            </p>
        </div>
    );
};

// Detail Row

const DetailRow = ({
    label,
    value,
}) => {
    return (
        <div>
            <p
                className="text-[10px] font-bold uppercase tracking-wide text-slate-400"
            >
                {label}
            </p>

            <p className="mt-1 text-sm font-semibold text-slate-700">
                {value}
            </p>
        </div>
    );
};

export default EmployeePayslips;

