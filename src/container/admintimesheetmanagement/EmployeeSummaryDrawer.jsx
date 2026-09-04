import React, { useEffect, useState } from "react";
import ExcelJS from "exceljs";
import EditTimesheet from "./EditTimesheet";

const API_BASE_URL =
    "https://uat-msspathway-software-backend-81057313575.asia-south1.run.app";

function EmployeeSummaryDrawer({
    employeeCode,
    month,
    onClose,
}) {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const [selectedWeek, setSelectedWeek] = useState(null);
    const [showEditTimesheet, setShowEditTimesheet] = useState(false);
    const [exportingCSV, setExportingCSV] = useState(false);

    const [timesheetSuccess, setTimesheetSuccess] = useState(false);
    const [timesheetError, setTimesheetError] = useState("");

    useEffect(() => {
        if (!employeeCode || !month) {
            setData(null);
            return;
        }

        let cancelled = false;

        const fetchEmployeeSummary = async () => {
            try {
                setLoading(true);
                setError("");
                setData(null);

                const token =
                    localStorage.getItem("token") ||
                    localStorage.getItem("access_token") ||
                    localStorage.getItem("accessToken");

                const url =
                    `${API_BASE_URL}/timesheet/admin/dashboard/monthly-summary/` +
                    `${encodeURIComponent(employeeCode)}?month=${encodeURIComponent(month)}`;

                const response = await fetch(url, {
                    method: "GET",
                    headers: {
                        Accept: "application/json",
                        ...(token
                            ? {
                                Authorization: `Bearer ${token}`,
                            }
                            : {}),
                    },
                });

                if (!response.ok) {
                    let message = `Unable to load employee summary (${response.status})`;

                    try {
                        const errorData = await response.json();

                        if (typeof errorData?.detail === "string") {
                            message = errorData.detail;
                        }
                    } catch {
                        // Ignore invalid error response
                    }

                    throw new Error(message);
                }

                const result = await response.json();

                if (!cancelled) {
                    setData(result);
                }
            } catch (err) {
                if (!cancelled) {
                    console.error(
                        "Employee monthly summary error:",
                        err
                    );

                    setError(
                        err?.message ||
                        "Failed to load employee summary."
                    );
                }
            } finally {
                if (!cancelled) {
                    setLoading(false);
                }
            }
        };

        fetchEmployeeSummary();

        return () => {
            cancelled = true;
        };
    }, [employeeCode, month]);

    if (!employeeCode) {
        return null;
    }

    /* =========================================================
       HELPERS
    ========================================================= */

    const formatHours = (hours) => {
        const value = Number(hours || 0);

        if (Number.isInteger(value)) {
            return `${value}h`;
        }

        return `${value}h`;
    };

    const getInitials = (name) => {
        const initials = String(name || "")
            .trim()
            .split(/\s+/)
            .filter(Boolean)
            .slice(0, 2)
            .map(
                (word) =>
                    word.charAt(0).toUpperCase()
            )
            .join("");

        return initials || "?";
    };

    const getWeekStatusStyle = (status) => {
        const normalized = String(status || "")
            .toLowerCase()
            .trim();

        if (normalized === "approved") {
            return {
                wrapper:
                    "border-[#E4D8D2] bg-white",
                icon:
                    "bg-[#B9E9B9] text-[#27632A]",
                iconText: "✓",
                hours:
                    "text-[#27632A]",
            };
        }

        if (
            normalized === "missing" ||
            normalized === "action required"
        ) {
            return {
                wrapper:
                    "border-[#E8D4CC] bg-[#FFF8F7]",
                icon:
                    "bg-[#FFD8D2] text-[#C0392B]",
                iconText: "!",
                hours:
                    "text-[#C0392B]",
            };
        }

        if (normalized === "pending approval") {
            return {
                wrapper:
                    "border-[#E8D9A8] bg-[#FFFDF3]",
                icon:
                    "bg-[#FFF0B8] text-[#8A6400]",
                iconText: "•",
                hours:
                    "text-[#8A6400]",
            };
        }

        if (normalized === "rejected") {
            return {
                wrapper:
                    "border-[#E8D4CC] bg-[#FFF8F7]",
                icon:
                    "bg-[#FFD8D2] text-[#C0392B]",
                iconText: "!",
                hours:
                    "text-[#C0392B]",
            };
        }

        return {
            wrapper:
                "border-[#E4D8D2] bg-white",
            icon:
                "bg-[#EEF2F9] text-[#002B5B]",
            iconText: "•",
            hours:
                "text-[#002B5B]",
        };
    };
    //put api update edit 
    const handleSaveTimesheet = async (payload) => {
        const token =
            localStorage.getItem("token") ||
            localStorage.getItem("access_token") ||
            localStorage.getItem("accessToken");

        const employeeCode = data?.employee_code;
        const weekStart = payload?.week_start;

        if (!employeeCode) {
            throw new Error("Employee code is missing.");
        }

        if (!weekStart) {
            throw new Error("Week start date is missing.");
        }

        try {
            const response = await fetch(
                `${API_BASE_URL}/timesheet/admin/timesheet/employee/${encodeURIComponent(
                    employeeCode
                )}/week/edit?week_start=${encodeURIComponent(
                    weekStart
                )}`,
                {
                    method: "PUT",
                    headers: {
                        Accept: "application/json",
                        "Content-Type": "application/json",
                        ...(token
                            ? {
                                Authorization: `Bearer ${token}`,
                            }
                            : {}),
                    },
                    body: JSON.stringify({
                        days: Array.isArray(payload?.days)
                            ? payload.days.map((day) => ({
                                date: day.date,
                                hours: Number(day.hours || 0),
                                description:
                                    day.description || "",
                            }))
                            : [],
                    }),
                }
            );

            if (!response.ok) {
                let message =
                    `Failed to update timesheet (${response.status}).`;

                try {
                    const errorData = await response.json();

                    if (
                        typeof errorData?.detail ===
                        "string"
                    ) {
                        message = errorData.detail;
                    } else if (
                        typeof errorData?.message ===
                        "string"
                    ) {
                        message = errorData.message;
                    }
                } catch {
                    // Keep default error.
                }

                throw new Error(message);
            }

            setShowEditTimesheet(false);
            setTimesheetError("");
            setTimesheetSuccess(true);

            try {
                return await response.json();
            } catch {
                return null;
            }
        } catch (error) {
            console.error(
                "Timesheet update failed:",
                error
            );

            setTimesheetError(
                error?.message ||
                "Failed to update timesheet. Please try again."
            );

            throw error;
        }
    };

    /* =========================================================
       EXPORT CSV
    ========================================================= */

    const handleExportCSV = async () => {
        if (!employeeCode || !month || exportingCSV) {
            return;
        }

        try {
            setExportingCSV(true);
            setError("");

            const token =
                localStorage.getItem("token") ||
                localStorage.getItem("access_token") ||
                localStorage.getItem("accessToken");

            const url =
                `${API_BASE_URL}/timesheet/admin/dashboard/monthly/` +
                `${encodeURIComponent(employeeCode)}/export` +
                `?month=${encodeURIComponent(month)}`;

            const response = await fetch(url, {
                method: "GET",
                headers: {
                    Accept: "text/csv",
                    ...(token
                        ? {
                            Authorization: `Bearer ${token}`,
                        }
                        : {}),
                },
            });

            if (!response.ok) {
                let message = `Unable to export CSV (${response.status})`;

                try {
                    const errorData = await response.json();

                    if (typeof errorData?.detail === "string") {
                        message = errorData.detail;
                    }
                } catch {
                    // Ignore invalid error response
                }

                throw new Error(message);
            }

            const csvText = await response.text();

            // Parse the backend CSV without changing its data.
            const parseCSV = (csv) => {
                const rows = [];
                let row = [];
                let value = "";
                let insideQuotes = false;

                for (let i = 0; i < csv.length; i += 1) {
                    const char = csv[i];
                    const nextChar = csv[i + 1];

                    if (char === '"') {
                        if (insideQuotes && nextChar === '"') {
                            value += '"';
                            i += 1;
                        } else {
                            insideQuotes = !insideQuotes;
                        }
                    } else if (char === "," && !insideQuotes) {
                        row.push(value);
                        value = "";
                    } else if (char === "\n" && !insideQuotes) {
                        row.push(value);
                        rows.push(row);
                        row = [];
                        value = "";
                    } else if (char !== "\r") {
                        value += char;
                    }
                }

                if (value.length || row.length) {
                    row.push(value);
                    rows.push(row);
                }

                return rows.filter((item) =>
                    item.some(
                        (cell) =>
                            String(cell ?? "").trim() !== ""
                    )
                );
            };

            const csvRows = parseCSV(csvText);

            if (!csvRows.length) {
                throw new Error("The exported CSV is empty.");
            }

            const workbook = new ExcelJS.Workbook();
            workbook.creator = "MSS Techno";
            workbook.lastModifiedBy = "MSS Techno";

            const worksheet = workbook.addWorksheet(
                `${employeeCode} Timesheet`,
                {
                    views: [{ showGridLines: false }],
                }
            );

            const toExcelValue = (raw) => {
                const value = String(raw ?? "").trim();

                if (!value) return "";

                // Store YYYY-MM-DD as a real Excel date.
                if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
                    const [year, monthNumber, day] =
                        value.split("-").map(Number);

                    return new Date(
                        year,
                        monthNumber - 1,
                        day
                    );
                }

                if (
                    /^-?\d+(?:\.\d+)?$/.test(value) &&
                    !/^0\d+/.test(value)
                ) {
                    return Number(value);
                }

                return value;
            };

            csvRows.forEach((csvRow) => {
                worksheet.addRow(
                    csvRow.map(toExcelValue)
                );
            });

            // Base formatting for every used cell.
            worksheet.eachRow((row) => {
                row.eachCell({ includeEmpty: true }, (cell) => {
                    cell.font = {
                        name: "Aptos",
                        size: 10,
                        color: {
                            argb: "FF1F2937",
                        },
                    };

                    cell.alignment = {
                        vertical: "middle",
                        wrapText: false,
                    };

                    if (cell.value instanceof Date) {
                        cell.numFmt = "dd-mmm-yyyy";
                    }
                });
            });

            // ---------------------------------------------------------
            // PROFESSIONAL EXCEL FORMATTING
            // Keep the backend data unchanged. We only improve the
            // presentation of the downloaded workbook.
            // ---------------------------------------------------------

            const NAVY = "FF002B5B";
            const LIGHT_BLUE = "FFEAF1FC";
            const BORDER = "FFC8D8F2";
            const ROW_BORDER = "FFE1E7EF";
            const WHITE = "FFFFFFFF";
            const TEXT = "FF1F2937";
            const MUTED = "FF64748B";
            const LIGHT_GREEN = "FFE8F5E9";
            const GREEN = "FF27632A";
            const LIGHT_RED = "FFFFF1F0";
            const RED = "FFC0392B";
            const LIGHT_YELLOW = "FFFFF8DD";
            const YELLOW = "FF8A6400";

            const setCellBorder = (cell, color = ROW_BORDER) => {
                cell.border = {
                    top: { style: "thin", color: { argb: color } },
                    bottom: { style: "thin", color: { argb: color } },
                    left: { style: "thin", color: { argb: color } },
                    right: { style: "thin", color: { argb: color } },
                };
            };

            const styleHeaderRow = (rowNumber, lastColumn = 5) => {
                const row = worksheet.getRow(rowNumber);
                row.height = 25;

                for (let columnNumber = 1; columnNumber <= lastColumn; columnNumber += 1) {
                    const cell = row.getCell(columnNumber);

                    cell.fill = {
                        type: "pattern",
                        pattern: "solid",
                        fgColor: { argb: NAVY },
                    };

                    cell.font = {
                        name: "Aptos",
                        size: 10,
                        bold: true,
                        color: { argb: WHITE },
                    };

                    cell.alignment = {
                        vertical: "middle",
                        horizontal: "center",
                        wrapText: true,
                    };

                    setCellBorder(cell, NAVY);
                }
            };

            const styleDataRows = (
                firstRow,
                lastRow,
                lastColumn = 5
            ) => {
                for (
                    let rowNumber = firstRow;
                    rowNumber <= lastRow;
                    rowNumber += 1
                ) {
                    const row = worksheet.getRow(rowNumber);

                    const hasData = Array.from(
                        { length: lastColumn },
                        (_, index) => row.getCell(index + 1).value
                    ).some(
                        (value) =>
                            value !== undefined &&
                            value !== null &&
                            String(value).trim() !== ""
                    );

                    if (!hasData) continue;

                    row.height = 22;

                    for (let columnNumber = 1; columnNumber <= lastColumn; columnNumber += 1) {
                        const cell = row.getCell(columnNumber);

                        cell.font = {
                            name: "Aptos",
                            size: 10,
                            color: { argb: TEXT },
                        };

                        cell.fill = {
                            type: "pattern",
                            pattern: "solid",
                            fgColor: {
                                argb: rowNumber % 2 === 0 ? "FFFFFFFF" : "FFF8FAFD",
                            },
                        };

                        cell.alignment = {
                            vertical: "middle",
                            horizontal:
                                columnNumber === 1 ||
                                    columnNumber === 3 ||
                                    columnNumber === 4
                                    ? "center"
                                    : "left",
                            wrapText: false,
                        };

                        setCellBorder(cell);

                        if (cell.value instanceof Date) {
                            cell.numFmt = "dd-mmm-yyyy";
                        }
                    }
                }
            };

            // Base formatting for all cells.
            worksheet.eachRow((row) => {
                row.eachCell({ includeEmpty: true }, (cell) => {
                    cell.font = {
                        name: "Aptos",
                        size: 10,
                        color: { argb: TEXT },
                    };

                    cell.alignment = {
                        vertical: "middle",
                        wrapText: false,
                    };

                    if (cell.value instanceof Date) {
                        cell.numFmt = "dd-mmm-yyyy";
                    }
                });
            });

            // Locate the unlogged dates header/section.
            const unloggedHeaderRow = worksheet._rows.find(
                (row) =>
                    String(row.getCell(1).value ?? "")
                        .trim()
                        .toLowerCase()
                        .startsWith("unlogged date")
            );

            const unloggedHeaderNumber =
                unloggedHeaderRow?.number || null;

            // Locate an existing weekly header if the backend provides one.
            let weeklyHeaderRow = worksheet._rows.find(
                (row) =>
                    String(row.getCell(1).value ?? "")
                        .trim()
                        .toLowerCase() === "week #"
            );

            // The current backend CSV may omit the weekly column header and
            // leave one blank row before the weekly data. Reuse that blank
            // row for the visual header instead of changing the actual data.
            if (!weeklyHeaderRow) {
                const candidate = worksheet._rows.find((row) => {
                    if (unloggedHeaderNumber && row.number >= unloggedHeaderNumber) {
                        return false;
                    }

                    const first = String(row.getCell(1).value ?? "").trim();
                    const secondValue = row.getCell(2).value;
                    const second = String(secondValue ?? "").trim();
                    const fourth = String(row.getCell(4).value ?? "").trim();
                    const fifth = String(row.getCell(5).value ?? "").trim();

                    return (
                        /^\d+$/.test(first) &&
                        (secondValue instanceof Date || /^\d{4}-\d{2}-\d{2}$/.test(second)) &&
                        /^-?\d+(?:\.\d+)?$/.test(fourth) &&
                        fifth !== ""
                    );
                });

                if (candidate) {
                    const possibleHeaderRow = worksheet.getRow(
                        Math.max(1, candidate.number - 1)
                    );

                    const isBlank = Array.from(
                        { length: 5 },
                        (_, index) => possibleHeaderRow.getCell(index + 1).value
                    ).every(
                        (value) =>
                            value === undefined ||
                            value === null ||
                            String(value).trim() === ""
                    );

                    if (isBlank) {
                        possibleHeaderRow.values = [
                            "Week #",
                            "Week Start",
                            "Week End",
                            "Hours",
                            "Status",
                        ];
                        weeklyHeaderRow = possibleHeaderRow;
                    }
                }
            }

            const weeklyHeaderNumber = weeklyHeaderRow?.number || null;

            // ---------------------------------------------------------
            // EMPLOYEE SUMMARY
            // ---------------------------------------------------------
            const summaryEnd = weeklyHeaderNumber
                ? weeklyHeaderNumber - 1
                : Math.min(7, worksheet.rowCount);

            for (let rowNumber = 1; rowNumber <= summaryEnd; rowNumber += 1) {
                const row = worksheet.getRow(rowNumber);
                row.height = 24;

                const labelCell = row.getCell(1);
                const valueCell = row.getCell(2);

                labelCell.fill = {
                    type: "pattern",
                    pattern: "solid",
                    fgColor: { argb: LIGHT_BLUE },
                };

                labelCell.font = {
                    name: "Aptos",
                    size: 10,
                    bold: true,
                    color: { argb: NAVY },
                };

                labelCell.alignment = {
                    vertical: "middle",
                    horizontal: "left",
                };

                valueCell.fill = {
                    type: "pattern",
                    pattern: "solid",
                    fgColor: { argb: WHITE },
                };

                valueCell.font = {
                    name: "Aptos",
                    size: 10,
                    color: { argb: TEXT },
                };

                valueCell.alignment = {
                    vertical: "middle",
                    horizontal: "left",
                };

                setCellBorder(labelCell, BORDER);
                setCellBorder(valueCell, BORDER);
            }

            // ---------------------------------------------------------
            // WEEKLY STATUS
            // ---------------------------------------------------------
            if (weeklyHeaderNumber) {
                styleHeaderRow(weeklyHeaderNumber, 5);

                const weeklyDataStart = weeklyHeaderNumber + 1;
                const weeklyDataEnd = unloggedHeaderNumber
                    ? unloggedHeaderNumber - 1
                    : worksheet.rowCount;

                styleDataRows(
                    weeklyDataStart,
                    weeklyDataEnd,
                    5
                );

                // Status gets a subtle semantic color without changing data.
                for (
                    let rowNumber = weeklyDataStart;
                    rowNumber <= weeklyDataEnd;
                    rowNumber += 1
                ) {
                    const statusCell = worksheet.getRow(rowNumber).getCell(5);
                    const status = String(statusCell.value ?? "")
                        .trim()
                        .toLowerCase();

                    if (status === "approved") {
                        statusCell.fill = {
                            type: "pattern",
                            pattern: "solid",
                            fgColor: { argb: LIGHT_GREEN },
                        };
                        statusCell.font = {
                            name: "Aptos",
                            size: 10,
                            bold: true,
                            color: { argb: GREEN },
                        };
                    } else if (
                        status === "missing" ||
                        status === "rejected" ||
                        status === "action required"
                    ) {
                        statusCell.fill = {
                            type: "pattern",
                            pattern: "solid",
                            fgColor: { argb: LIGHT_RED },
                        };
                        statusCell.font = {
                            name: "Aptos",
                            size: 10,
                            bold: true,
                            color: { argb: RED },
                        };
                    } else if (status === "pending approval") {
                        statusCell.fill = {
                            type: "pattern",
                            pattern: "solid",
                            fgColor: { argb: LIGHT_YELLOW },
                        };
                        statusCell.font = {
                            name: "Aptos",
                            size: 10,
                            bold: true,
                            color: { argb: YELLOW },
                        };
                    }
                }
            }

            // ---------------------------------------------------------
            // UNLOGGED DATES
            // ---------------------------------------------------------
            if (unloggedHeaderNumber) {
                styleHeaderRow(unloggedHeaderNumber, 3);

                const unloggedDataStart = unloggedHeaderNumber + 1;
                styleDataRows(
                    unloggedDataStart,
                    worksheet.rowCount,
                    3
                );

                for (
                    let rowNumber = unloggedDataStart;
                    rowNumber <= worksheet.rowCount;
                    rowNumber += 1
                ) {
                    const row = worksheet.getRow(rowNumber);
                    row.getCell(1).alignment = {
                        vertical: "middle",
                        horizontal: "center",
                    };
                    row.getCell(2).alignment = {
                        vertical: "middle",
                        horizontal: "left",
                    };
                    row.getCell(3).alignment = {
                        vertical: "middle",
                        horizontal: "center",
                    };
                }
            }

            // Automatic widths. Generous widths prevent #### and clipping.
            const minimumWidths = {
                1: 22,
                2: 30,
                3: 24,
                4: 12,
                5: 20,
            };

            for (
                let columnNumber = 1;
                columnNumber <= worksheet.columnCount;
                columnNumber += 1
            ) {
                const column = worksheet.getColumn(columnNumber);
                let maxLength = 0;

                column.eachCell(
                    { includeEmpty: false },
                    (cell) => {
                        let displayValue = "";

                        if (cell.value instanceof Date) {
                            displayValue = "01-Sep-2026";
                        } else {
                            displayValue = String(cell.value ?? "");
                        }

                        maxLength = Math.max(
                            maxLength,
                            displayValue.length
                        );
                    }
                );

                column.width = Math.min(
                    Math.max(
                        maxLength + 4,
                        minimumWidths[columnNumber] || 12
                    ),
                    42
                );
            }

            worksheet.getColumn(1).width = Math.max(
                worksheet.getColumn(1).width || 0,
                22
            );
            worksheet.getColumn(2).width = Math.max(
                worksheet.getColumn(2).width || 0,
                30
            );
            worksheet.getColumn(3).width = Math.max(
                worksheet.getColumn(3).width || 0,
                24
            );

            // Keep the first 8 rows visible as the employee summary.
            worksheet.views = [
                {
                    state: "frozen",
                    ySplit: 8,
                    showGridLines: false,
                },
            ];

            worksheet.pageSetup = {
                orientation: "landscape",
                fitToPage: true,
                fitToWidth: 1,
                fitToHeight: 0,
                paperSize: 9,
                margins: {
                    left: 0.3,
                    right: 0.3,
                    top: 0.5,
                    bottom: 0.5,
                    header: 0.2,
                    footer: 0.2,
                },
            };

            // Repeat the table header when printing across pages.
            if (weeklyHeaderNumber) {
                worksheet.pageSetup.printTitlesRow = `${weeklyHeaderNumber}:${weeklyHeaderNumber}`;
            }
            // Preserve the backend filename, but change .csv to .xlsx.
            const contentDisposition =
                response.headers.get(
                    "Content-Disposition"
                ) ||
                response.headers.get(
                    "content-disposition"
                );

            let filename =
                `${employeeCode}_${month}_timesheet.xlsx`;

            if (contentDisposition) {
                const filenameMatch =
                    contentDisposition.match(
                        /filename\*?=(?:UTF-8'')?["']?([^;"']+)["']?/i
                    );

                if (filenameMatch?.[1]) {
                    filename =
                        decodeURIComponent(
                            filenameMatch[1]
                        ).replace(
                            /\.csv$/i,
                            ".xlsx"
                        );
                }
            }

            if (!/\.xlsx$/i.test(filename)) {
                filename += ".xlsx";
            }

            const buffer =
                await workbook.xlsx.writeBuffer();

            const excelBlob = new Blob(
                [buffer],
                {
                    type:
                        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                }
            );

            const downloadUrl =
                URL.createObjectURL(excelBlob);

            const link =
                document.createElement("a");

            link.href = downloadUrl;
            link.download = filename;

            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            setTimeout(() => {
                URL.revokeObjectURL(downloadUrl);
            }, 1000);
        } catch (err) {
            console.error(
                "Excel export error:",
                err
            );

            setError(
                err?.message ||
                "Failed to export employee Excel file."
            );
        } finally {
            setExportingCSV(false);
        }
    };

    /* =========================================================
       DRAWER
    ========================================================= */

    return (
        <>
            <style>
                {`
                    @keyframes employeeDrawerSlideIn {
                        from {
                            transform: translateX(100%);
                        }

                        to {
                            transform: translateX(0);
                        }
                    }
                `}
            </style>

            {/* BACKDROP */}

            <div
                className="
                    fixed
                    inset-0
                    z-[9998]
                    bg-black/10
                    backdrop-blur-[1px]
                "
                onClick={onClose}
            />

            {/* DRAWER */}

            <aside
                className="
                    fixed
                    right-0
                    top-0
                    z-[9999]
                    h-screen
                    w-full
                    max-w-[430px]
                    overflow-hidden
                    border-l
                    border-[#E5D6CE]
                    bg-[#F8F9FC]
                    shadow-2xl
                    animate-[employeeDrawerSlideIn_0.28s_ease-out]
                "
                onClick={(e) =>
                    e.stopPropagation()
                }
            >
                {/* =================================================
                    HEADER
                ================================================= */}

                <div
                    className="
                        flex
                        h-[44px]
                        items-center
                        justify-between
                        border-b
                        border-[#E5D6CE]
                        bg-white
                        px-6
                    "
                >
                    <h2
                        className="
                            text-[11px]
                            font-semibold
                            text-[#002B5B]
                        "
                    >
                        Employee Summary
                    </h2>

                    <button
                        type="button"
                        onClick={onClose}
                        className="
                            flex
                            h-6
                            w-6
                            items-center
                            justify-center
                            text-[22px]
                            font-light
                            leading-none
                            text-[#002B5B]
                            transition
                            hover:opacity-60
                        "
                        aria-label="Close"
                    >
                        ×
                    </button>
                </div>

                {/* =================================================
                    CONTENT
                ================================================= */}

                <div
                    className="
                        h-[calc(100vh-44px)]
                        overflow-y-auto
                        px-6
                        py-4
                    "
                >
                    {/* LOADING */}

                    {loading && (
                        <div
                            className="
                                flex
                                min-h-[400px]
                                items-center
                                justify-center
                            "
                        >
                            <div
                                className="
                                    h-7
                                    w-7
                                    animate-spin
                                    rounded-full
                                    border-2
                                    border-[#D9E0EC]
                                    border-t-[#002B5B]
                                "
                            />
                        </div>
                    )}

                    {/* ERROR */}

                    {!loading && error && (
                        <div
                            className="
                                rounded-md
                                border
                                border-red-200
                                bg-red-50
                                p-4
                            "
                        >
                            <p
                                className="
                                    text-xs
                                    font-semibold
                                    text-red-700
                                "
                            >
                                Unable to load summary
                            </p>

                            <p
                                className="
                                    mt-1
                                    text-[11px]
                                    text-red-600
                                "
                            >
                                {error}
                            </p>
                        </div>
                    )}

                    {/* DATA */}

                    {!loading &&
                        !error &&
                        data && (
                            <div
                                className="
                                    space-y-4
                                "
                            >
                                {/* =================================================
                                    PROFILE
                                ================================================= */}

                                <div
                                    className="
                                        flex
                                        items-center
                                        gap-3
                                        border-b
                                        border-[#E5D6CE]
                                        pb-4
                                    "
                                >
                                    {data.avatar_url ? (
                                        <img
                                            src={
                                                data.avatar_url.startsWith(
                                                    "http"
                                                )
                                                    ? data.avatar_url
                                                    : `${API_BASE_URL}${data.avatar_url}`
                                            }
                                            alt={
                                                data.employee_name ||
                                                employeeCode
                                            }
                                            className="
                                                h-11
                                                w-11
                                                shrink-0
                                                rounded-md
                                                object-cover
                                            "
                                        />
                                    ) : (
                                        <div
                                            className="
                                                flex
                                                h-11
                                                w-11
                                                shrink-0
                                                items-center
                                                justify-center
                                                rounded-md
                                                bg-[#E8EEF8]
                                                text-[13px]
                                                font-semibold
                                                text-[#002B5B]
                                            "
                                        >
                                            {getInitials(
                                                data.employee_name
                                            )}
                                        </div>
                                    )}

                                    <div
                                        className="
                                            min-w-0
                                        "
                                    >
                                        <p
                                            className="
                                                truncate
                                                text-[11px]
                                                font-semibold
                                                text-[#002B5B]
                                            "
                                        >
                                            {
                                                data.employee_name
                                            }
                                        </p>

                                        <p
                                            className="
                                                mt-0.5
                                                text-[10px]
                                                text-slate-500
                                            "
                                        >
                                            {data.role ||
                                                "Employee"}{" "}
                                            •{" "}
                                            {
                                                data.month_label
                                            }
                                        </p>
                                    </div>
                                </div>

                                {/* =================================================
                                    SUMMARY
                                ================================================= */}

                                <div
                                    className="
                                        grid
                                        grid-cols-3
                                        gap-2
                                    "
                                >
                                    <div
                                        className="
                                            rounded-[4px]
                                            border
                                            border-[#E5D6CE]
                                            bg-white
                                            px-2
                                            py-3
                                        "
                                    >
                                        <p
                                            className="
                                                text-[10px]
                                                uppercase
                                                text-[#002B5B]
                                            "
                                        >
                                            Worked
                                        </p>

                                        <p
                                            className="
                                                mt-1
                                                text-[12px]
                                                font-medium
                                                text-[#002B5B]
                                            "
                                        >
                                            {formatHours(
                                                data.worked_hours
                                            )}
                                        </p>
                                    </div>

                                    <div
                                        className="
                                            rounded-[4px]
                                            border
                                            border-[#E5D6CE]
                                            bg-white
                                            px-2
                                            py-3
                                        "
                                    >
                                        <p
                                            className="
                                                text-[10px]
                                                uppercase
                                                text-[#002B5B]
                                            "
                                        >
                                            Leave
                                        </p>

                                        <p
                                            className="
                                                mt-1
                                                text-[12px]
                                                font-medium
                                                text-[#002B5B]
                                            "
                                        >
                                            {
                                                data.leave_days ??
                                                0
                                            }
                                        </p>
                                    </div>

                                    <div
                                        className="
                                            rounded-[4px]
                                            border
                                            border-[#E5D6CE]
                                            bg-white
                                            px-2
                                            py-3
                                        "
                                    >
                                        <p
                                            className="
                                                text-[10px]
                                                uppercase
                                                text-[#002B5B]
                                            "
                                        >
                                            Holiday
                                        </p>

                                        <p
                                            className="
                                                mt-1
                                                text-[12px]
                                                font-medium
                                                text-[#002B5B]
                                            "
                                        >
                                            {
                                                data.holiday_count ??
                                                0
                                            }
                                        </p>
                                    </div>
                                </div>

                                {/* =================================================
                                    WEEKLY STATUS
                                ================================================= */}

                                <section>
                                    <h3
                                        className="
                                            mb-3
                                            text-[10px]
                                            font-medium
                                            uppercase
                                            tracking-wide
                                            text-[#002B5B]
                                        "
                                    >
                                        Weekly Status
                                    </h3>

                                    <div
                                        className="
                                            space-y-2
                                        "
                                    >
                                        {Array.isArray(
                                            data.weekly_status
                                        ) &&
                                            data.weekly_status
                                                .length > 0 ? (
                                            data.weekly_status.map(
                                                (
                                                    week
                                                ) => {
                                                    const style =
                                                        getWeekStatusStyle(
                                                            week.status
                                                        );

                                                    return (
                                                        <div
                                                            key={week.week_number}
                                                            onClick={() => setSelectedWeek(week)}
                                                            className={`
        flex
        cursor-pointer
        items-center
        justify-between
        rounded-[4px]
        border
        px-3
        py-2.5
        transition-all
        hover:shadow-sm
        ${selectedWeek?.week_number ===
                                                                    week.week_number
                                                                    ? "ring-1 ring-[#002B5B]"
                                                                    : ""
                                                                }
        ${style.wrapper}
    `}
                                                        >
                                                            <div
                                                                className="
                                                                    flex
                                                                    items-center
                                                                    gap-2
                                                                "
                                                            >
                                                                <span
                                                                    className={`
                                                                        flex
                                                                        h-5
                                                                        w-5
                                                                        items-center
                                                                        justify-center
                                                                        rounded-full
                                                                        text-[10px]
                                                                        font-bold
                                                                        ${style.icon}
                                                                    `}
                                                                >
                                                                    {
                                                                        style.iconText
                                                                    }
                                                                </span>

                                                                <div>
                                                                    <p
                                                                        className="
                                                                            text-[10px]
                                                                            font-semibold
                                                                            text-[#002B5B]
                                                                        "
                                                                    >
                                                                        Week{" "}
                                                                        {
                                                                            week.week_number
                                                                        }
                                                                    </p>
                                                                </div>
                                                            </div>

                                                            <span
                                                                className={`
                                                                    text-[10px]
                                                                    font-semibold
                                                                    ${style.hours}
                                                                `}
                                                            >
                                                                {formatHours(
                                                                    week.hours
                                                                )}{" "}
                                                                {
                                                                    week.status
                                                                }
                                                            </span>
                                                        </div>
                                                    );
                                                }
                                            )
                                        ) : (
                                            <p className="text-xs text-slate-500">
                                                No weekly status
                                                available.
                                            </p>
                                        )}
                                    </div>
                                </section>

                                {/* =================================================
                                    UNLOGGED DATES
                                ================================================= */}

                                <section>
                                    <div
                                        className="
                                            rounded-[5px]
                                            border
                                            border-[#C8D8F2]
                                            bg-[#EAF1FC]
                                            p-4
                                        "
                                    >
                                        <div
                                            className="
                                                mb-3
                                                flex
                                                items-center
                                                gap-2
                                            "
                                        >
                                            <span
                                                className="
                                                    text-[15px]
                                                    text-red-500
                                                "
                                            >
                                                ⚠
                                            </span>

                                            <h3
                                                className="
                                                    text-[10px]
                                                    font-bold
                                                    uppercase
                                                    tracking-wide
                                                    text-red-600
                                                "
                                            >
                                                Unlogged Dates
                                            </h3>
                                        </div>

                                        {Array.isArray(
                                            data.unlogged_dates
                                        ) &&
                                            data.unlogged_dates
                                                .length > 0 ? (
                                            <div
                                                className="
                                                    space-y-2
                                                "
                                            >
                                                {data.unlogged_dates.map(
                                                    (
                                                        item
                                                    ) => (
                                                        <div
                                                            key={
                                                                item.date
                                                            }
                                                            className="
                                                                flex
                                                                items-center
                                                                justify-between
                                                                gap-3
                                                                text-[10px]
                                                                text-[#002B5B]
                                                            "
                                                        >
                                                            <span>
                                                                {
                                                                    item.day_label
                                                                }
                                                            </span>

                                                            <span
                                                                className="
                                                                    shrink-0
                                                                    text-slate-600
                                                                "
                                                            >
                                                                {formatHours(
                                                                    item.hours
                                                                )}
                                                            </span>
                                                        </div>
                                                    )
                                                )}
                                            </div>
                                        ) : (
                                            <p
                                                className="
                                                    text-[10px]
                                                    text-[#27632A]
                                                "
                                            >
                                                No unlogged
                                                dates.
                                            </p>
                                        )}
                                    </div>
                                </section>

                                {/* =================================================
                                    BUTTONS
                                ================================================= */}

                                <div
                                    className="
                                        space-y-2
                                        pt-8
                                        pb-1
                                    "
                                >
                                    {/* EXPORT CSV */}

                                    <button
                                        type="button"
                                        onClick={handleExportCSV}
                                        disabled={exportingCSV}
                                        className="
        flex
        w-full
        items-center
        justify-center
        gap-2
        rounded-[3px]
        bg-black
        px-4
        py-3
        text-[10px]
        font-bold
        uppercase
        tracking-wide
        text-white
        transition
        hover:bg-[#17202A]
        active:scale-[0.99]
        disabled:cursor-not-allowed
        disabled:opacity-70
    "
                                    >
                                        {exportingCSV ? (
                                            <>
                                                <span
                                                    className="
                    h-3
                    w-3
                    animate-spin
                    rounded-full
                    border-2
                    border-white/40
                    border-t-white
                "
                                                />

                                                <span>EXPORTING...</span>
                                            </>
                                        ) : (
                                            <>
                                                <span className="text-[10px]">
                                                    ▣
                                                </span>

                                                <span>EXPORT CSV</span>
                                            </>
                                        )}
                                    </button>

                                    {/* EDIT */}

                                    <button
                                        type="button"
                                        disabled={!selectedWeek}
                                        onClick={() => {
                                            if (!selectedWeek) return;
                                            setShowEditTimesheet(true);
                                        }}
                                        className={`
        w-full
        rounded-[3px]
        border
        px-4
        py-3
        text-[10px]
        font-semibold
        uppercase
        tracking-wide
        transition
        ${selectedWeek
                                                ? "cursor-pointer border-[#E5D6CE] bg-white text-[#002B5B] hover:bg-[#F1F4FA]"
                                                : "cursor-not-allowed border-[#E5D6CE] bg-[#F3F3F3] text-[#A5A5A5]"
                                            }
    `}
                                    >
                                        EDIT TIMESHEET
                                    </button>
                                </div>
                            </div>
                        )}
                </div>
                {showEditTimesheet && selectedWeek && (
                    <EditTimesheet
                        employee={data}
                        selectedWeek={selectedWeek}
                        month={month}
                        onClose={() => setShowEditTimesheet(false)}
                        onSave={handleSaveTimesheet}
                    />
                )}
            </aside>
            {timesheetSuccess && (
                <div className="fixed inset-0 z-[10001] flex items-center justify-center bg-black/45 px-4 backdrop-blur-sm">
                    <div className="w-full max-w-[380px] rounded-2xl border border-[#E5D6CE] bg-white p-7 text-center shadow-2xl">
                        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#E7F6EA] text-2xl font-bold text-[#2E7D32]">
                            ✓
                        </div>

                        <h3 className="mt-4 text-base font-semibold text-[#002B5B]">
                            Timesheet Updated
                        </h3>

                        <p className="mt-2 text-xs leading-5 text-slate-500">
                            Timesheet has been updated successfully.
                        </p>

                        <button
                            type="button"
                            onClick={() =>
                                setTimesheetSuccess(false)
                            }
                            className="mt-6 rounded-md bg-[#006B3C] px-8 py-2.5 text-xs font-semibold text-white hover:bg-[#005A32]"
                        >
                            OK
                        </button>
                    </div>
                </div>
            )}
            {timesheetError && (
                <div className="fixed inset-0 z-[10002] flex items-center justify-center bg-black/45 px-4 backdrop-blur-sm">
                    <div className="w-full max-w-[380px] rounded-2xl border border-[#E5D6CE] bg-white p-7 text-center shadow-2xl">
                        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#FFF0EE] text-2xl font-bold text-[#C0392B]">
                            !
                        </div>

                        <h3 className="mt-4 text-base font-semibold text-[#002B5B]">
                            Update Failed
                        </h3>

                        <p className="mt-2 text-xs leading-5 text-slate-500">
                            {timesheetError}
                        </p>

                        <button
                            type="button"
                            onClick={() =>
                                setTimesheetError("")
                            }
                            className="mt-6 rounded-md border border-[#CCD3D2] bg-white px-8 py-2.5 text-xs font-semibold text-[#002B5B] hover:bg-[#F3F5F7]"
                        >
                            Close
                        </button>
                    </div>
                </div>
            )}
        </>
    );
}

export default EmployeeSummaryDrawer;