import React, { useState } from "react";
import { Download } from "lucide-react";

const TimesheetExport = ({
  timesheet,
  employee,
  activeEmployeeCode,
  year,
  month,
  monthValue,
  monthLabel,
  isFinalized,
}) => {
  const [exportError, setExportError] = useState("");

  const handleExport = async () => {
    setExportError("");

    try {
      const XLSX = await import("xlsx-js-style");

      const C = {
        green: "4D8B4F",
        greenLight: "EAF4E8",
        greenSoft: "F1F7EF",
        brown: "6B2D1A",
        brownLight: "F5E8E3",
        champagne: "EADBC8",
        rejected: "A63D2F",
        rejectedLight: "F8D9D5",
        yellow: "8A6D3B",
        yellowLight: "FFF6DC",
        leave: "23658A",
        leaveLight: "DCECF8",
        holiday: "8A432D",
        holidayLight: "F7E1DA",
        grey: "666666",
        greyLight: "EEEEEE",
        ivory: "F8F6F2",
        white: "FFFFFF",
        border: "D9D9D9",
      };

      const headers = [
        "Employee",
        "Employee Code",
        "Date",
        "Day",
        "Hours",
        "Status",
        "Leave Type",
        "Holiday",
        "Month Finalized",
      ];

      const getDateForDay = (year, monthIndex, day) =>
        `${year}-${String(monthIndex + 1).padStart(2, "0")}-${String(
          day
        ).padStart(2, "0")}`;

      const rows = Object.keys(timesheet).map((day) => {
        const data = timesheet[day];

        const dateValue =
          data?.date || getDateForDay(year, month, day);

        const formattedDate = dateValue
          ? new Date(dateValue).toLocaleDateString("en-GB", {
              day: "2-digit",
              month: "short",
              year: "numeric",
            })
          : "";

        const dayName = dateValue
          ? new Date(dateValue).toLocaleDateString("en-US", {
              weekday: "long",
            })
          : "";
            
        return [
          employee?.name || "",
          employee?.code ||
            employee?.employee_code ||
            activeEmployeeCode ||
            "",
          formattedDate,
          dayName,
          Number(data?.hours || 0),
          data?.status || "",
          data?.leaveType || "",
          data?.holidayName || "",
          isFinalized ? "Yes" : "No",
        ];
      });

      const totalHours = rows.reduce(
        (total, row) => total + Number(row[4] || 0),
        0
      );

      const exportData = [
        [
          "MSS TECHNO",
          "",
          "",
          "TIMESHEET REPORT",
          "",
          "",
          "",
          monthLabel,
          "",
        ],

        [
          "PEOPLE  |  PROCESS  |  PROGRESS",
          "",
          "",
          "WORK HOURS  •  ATTENDANCE  •  LEAVE  •  HOLIDAYS",
          "",
          "",
          "",
          "Monthly Timesheet",
          "",
        ],

        [],

        [
          "◷",
          "TOTAL HOURS",
          "",
          "▣",
          "REPORT MONTH",
          "",
          "▤",
          "MONTH STATUS",
          "",
        ],

        [
          "",
          totalHours,
          "",
          "",
          monthLabel,
          "",
          "",
          isFinalized ? "FINALIZED" : "OPEN",
          "",
        ],

        [],

        headers,
        ...rows,

        [
          "TOTAL HOURS",
          "",
          "",
          "",
          totalHours,
          "",
          "",
          "",
          "",
        ],
      ];

      const worksheet = XLSX.utils.aoa_to_sheet(exportData);

      worksheet["!cols"] = [
        { wch: 23 },
        { wch: 19 },
        { wch: 17 },
        { wch: 15 },
        { wch: 12 },
        { wch: 17 },
        { wch: 19 },
        { wch: 25 },
        { wch: 20 },
      ];

      worksheet["!freeze"] = {
        xSplit: 0,
        ySplit: 7,
      };

      worksheet["!autofilter"] = {
        ref: `A7:I${rows.length + 7}`,
      };

      const border = {
        top: {
          style: "thin",
          color: { rgb: C.border },
        },
        bottom: {
          style: "thin",
          color: { rgb: C.border },
        },
        left: {
          style: "thin",
          color: { rgb: C.border },
        },
        right: {
          style: "thin",
          color: { rgb: C.border },
        },
      };

      // TOP AREA

      for (let r = 0; r < 2; r++) {
        for (let c = 0; c < 9; c++) {
          const address = XLSX.utils.encode_cell({
            r,
            c,
          });

          if (!worksheet[address]) {
            worksheet[address] = {
              t: "s",
              v: "",
            };
          }

          worksheet[address].fill = {
            fgColor: {
              rgb: r === 0 ? C.white : C.ivory,
            },
          };
        }
      }

      // BRAND

      worksheet["A1"].s = {
        font: {
          bold: true,
          sz: 15,
          color: {
            rgb: C.white,
          },
        },
        fill: {
          fgColor: {
            rgb: C.brown,
          },
        },
        alignment: {
          horizontal: "left",
          vertical: "center",
        },
      };

      // TITLE

      worksheet["D1"].s = {
        font: {
          bold: true,
          sz: 22,
          color: {
            rgb: C.green,
          },
        },
        fill: {
          fgColor: {
            rgb: C.white,
          },
        },
        alignment: {
          horizontal: "center",
          vertical: "center",
        },
      };

      // MONTH

      worksheet["H1"].s = {
        font: {
          bold: true,
          sz: 13,
          color: {
            rgb: C.brown,
          },
        },
        fill: {
          fgColor: {
            rgb: C.champagne,
          },
        },
        alignment: {
          horizontal: "center",
          vertical: "center",
        },
        border,
      };

      // SUBTITLE

      worksheet["A2"].s = {
        font: {
          sz: 9,
          color: {
            rgb: C.grey,
          },
        },
        fill: {
          fgColor: {
            rgb: C.ivory,
          },
        },
      };

      worksheet["D2"].s = {
        font: {
          bold: true,
          sz: 9,
          color: {
            rgb: C.grey,
          },
        },
        fill: {
          fgColor: {
            rgb: C.white,
          },
        },
        alignment: {
          horizontal: "center",
          vertical: "center",
        },
      };

      worksheet["H2"].s = {
        font: {
          sz: 9,
          color: {
            rgb: C.grey,
          },
        },
        fill: {
          fgColor: {
            rgb: C.ivory,
          },
        },
        alignment: {
          horizontal: "center",
          vertical: "center",
        },
      };

      // CARD BACKGROUNDS

      for (let r = 3; r <= 4; r++) {
        for (let c = 0; c <= 2; c++) {
          const address = XLSX.utils.encode_cell({
            r,
            c,
          });

          worksheet[address].fill = {
            fgColor: {
              rgb: C.greenSoft,
            },
          };

          worksheet[address].border = border;
        }
      }

      for (let r = 3; r <= 4; r++) {
        for (let c = 3; c <= 5; c++) {
          const address = XLSX.utils.encode_cell({
            r,
            c,
          });

          worksheet[address].fill = {
            fgColor: {
              rgb: C.brownLight,
            },
          };

          worksheet[address].border = border;
        }
      }

      for (let r = 3; r <= 4; r++) {
        for (let c = 6; c <= 8; c++) {
          const address = XLSX.utils.encode_cell({
            r,
            c,
          });

          worksheet[address].fill = {
            fgColor: {
              rgb: C.champagne,
            },
          };

          worksheet[address].border = border;
        }
      }

      // CARD 1

      worksheet["A4"].s = {
        font: {
          bold: true,
          sz: 22,
          color: {
            rgb: C.green,
          },
        },
        fill: {
          fgColor: {
            rgb: C.greenSoft,
          },
        },
        alignment: {
          horizontal: "center",
          vertical: "center",
        },
        border,
      };

      worksheet["B4"].s = {
        font: {
          bold: true,
          sz: 10,
          color: {
            rgb: C.grey,
          },
        },
        fill: {
          fgColor: {
            rgb: C.greenSoft,
          },
        },
        alignment: {
          horizontal: "left",
          vertical: "center",
        },
        border,
      };

      worksheet["B5"].s = {
        font: {
          bold: true,
          sz: 18,
          color: {
            rgb: C.green,
          },
        },
        fill: {
          fgColor: {
            rgb: C.greenSoft,
          },
        },
        border,
      };

      // CARD 2

      worksheet["D4"].s = {
        font: {
          bold: true,
          sz: 22,
          color: {
            rgb: C.brown,
          },
        },
        fill: {
          fgColor: {
            rgb: C.brownLight,
          },
        },
        alignment: {
          horizontal: "center",
          vertical: "center",
        },
        border,
      };

      worksheet["E4"].s = {
        font: {
          bold: true,
          sz: 10,
          color: {
            rgb: C.grey,
          },
        },
        fill: {
          fgColor: {
            rgb: C.brownLight,
          },
        },
        border,
      };

      worksheet["E5"].s = {
        font: {
          bold: true,
          sz: 14,
          color: {
            rgb: C.brown,
          },
        },
        fill: {
          fgColor: {
            rgb: C.brownLight,
          },
        },
        border,
      };

      // CARD 3

      worksheet["G4"].s = {
        font: {
          bold: true,
          sz: 22,
          color: {
            rgb: C.brown,
          },
        },
        fill: {
          fgColor: {
            rgb: C.champagne,
          },
        },
        alignment: {
          horizontal: "center",
          vertical: "center",
        },
        border,
      };

      worksheet["H4"].s = {
        font: {
          name: "Aptos",
          bold: true,
          sz: 10,
          color: {
            rgb: C.brown,
          },
        },
        fill: {
          patternType: "solid",
          fgColor: {
            rgb: C.champagne,
          },
          bgColor: {
            rgb: C.champagne,
          },
        },
        alignment: {
          horizontal: "left",
          vertical: "center",
          wrapText: true,
        },
        border,
      };

      worksheet["H5"].s = {
        font: {
          bold: true,
          sz: 16,
          color: {
            rgb: isFinalized ? C.green : C.brown,
          },
        },
        fill: {
          patternType: "solid",
          fgColor: {
            rgb: isFinalized ? C.greenLight : C.champagne,
          },
          bgColor: {
            rgb: isFinalized ? C.greenLight : C.champagne,
          },
        },
        alignment: {
          horizontal: "left",
          vertical: "center",
        },
        border,
      };

      // TABLE HEADER

      const headerStyle = {
        font: {
          bold: true,
          sz: 11,
          color: {
            rgb: C.white,
          },
        },
        fill: {
          fgColor: {
            rgb: C.green,
          },
        },
        alignment: {
          horizontal: "center",
          vertical: "center",
          wrapText: true,
        },
        border: {
          top: {
            style: "thin",
            color: { rgb: C.white },
          },
          bottom: {
            style: "thin",
            color: { rgb: C.white },
          },
          left: {
            style: "thin",
            color: { rgb: C.white },
          },
          right: {
            style: "thin",
            color: { rgb: C.white },
          },
        },
      };

      for (let col = 0; col < headers.length; col++) {
        const address = XLSX.utils.encode_cell({
          r: 6,
          c: col,
        });

        if (worksheet[address]) {
          worksheet[address].s = headerStyle;
        }
      }

      // DATA ROWS

      rows.forEach((row, rowIndex) => {
        const excelRow = rowIndex + 8;

        for (let col = 0; col < headers.length; col++) {
          const address = XLSX.utils.encode_cell({
            r: excelRow - 1,
            c: col,
          });

          const cell = worksheet[address];

          if (!cell) continue;

          cell.border = border;

          cell.alignment = {
            vertical: "center",
            horizontal:
              col === 2 ||
              col === 4 ||
              col === 8
                ? "center"
                : "left",
            wrapText: true,
          };

          if (rowIndex % 2 === 1) {
            cell.fill = {
              fgColor: {
                rgb: C.ivory,
              },
            };
          }
        }

        // STATUS — REFERENCE IMAGE COLORS
        // Never allow default/black status text
        const statusCell = worksheet[`F${excelRow}`];

        if (statusCell) {
          const status = String(row[5] || '')
            .trim()
            .toLowerCase();

          const statusStyles = {
            approved: { text: '218A3A', bg: 'E2F3E5' },
            submitted: { text: '9A6700', bg: 'FFF1C2' },
            pending: { text: '9A6700', bg: 'FFF1C2' },
            rejected: { text: 'B42318', bg: 'F9D9D6' },
            unlogged: { text: '8A6D00', bg: 'FFF4B8' },
            leave: { text: '1769AA', bg: 'D9EBFA' },
            holiday: { text: '8A432D', bg: 'F7DED1' },
            weekend: { text: '666666', bg: 'E8E8E8' },
          };

          const style = statusStyles[status] || {
            text: '666666',
            bg: 'EEEEEE',
          };

          statusCell.font = {
            name: 'Aptos',
            sz: 11,
            bold: true,
            color: { rgb: style.text },
          };

          statusCell.fill = {
            patternType: 'solid',
            fgColor: { rgb: style.bg },
            bgColor: { rgb: style.bg },
          };

          statusCell.alignment = {
            horizontal: 'center',
            vertical: 'center',
          };

          statusCell.border = border;
        }

        // HOURS

        const hoursCell = worksheet[`E${excelRow}`];

        if (hoursCell) {
          hoursCell.font = {
            bold: true,
            color: {
              rgb: C.green,
            },
          };

          hoursCell.alignment = {
            horizontal: "center",
            vertical: "center",
          };
        }

        // FINALIZED

        const finalizedCell = worksheet[`I${excelRow}`];

        if (finalizedCell) {
          finalizedCell.font = {
            bold: true,
            color: {
              rgb: row[8] === "Yes" ? C.green : C.grey,
            },
          };

          finalizedCell.alignment = {
            horizontal: "center",
            vertical: "center",
          };
        }
      });

      // TOTAL ROW

      const totalRowNumber = rows.length + 8;

      for (let col = 0; col < headers.length; col++) {
        const address = XLSX.utils.encode_cell({
          r: totalRowNumber - 1,
          c: col,
        });

        if (!worksheet[address]) {
          worksheet[address] = {
            t: "s",
            v: "",
          };
        }

        worksheet[address].fill = {
          fgColor: {
            rgb: C.greenLight,
          },
        };

        worksheet[address].border = border;

        worksheet[address].alignment = {
          horizontal: "center",
          vertical: "center",
        };
      }

      worksheet[`A${totalRowNumber}`] = {
        t: "s",
        v: "TOTAL HOURS",
        s: {
          font: {
            bold: true,
            sz: 12,
            color: {
              rgb: C.green,
            },
          },
          fill: {
            fgColor: {
              rgb: C.greenLight,
            },
          },
          alignment: {
            horizontal: "center",
            vertical: "center",
          },
          border,
        },
      };

      worksheet[`E${totalRowNumber}`] = {
        t: "n",
        v: totalHours,
        s: {
          font: {
            bold: true,
            sz: 14,
            color: {
              rgb: C.green,
            },
          },
          fill: {
            fgColor: {
              rgb: C.greenLight,
            },
          },
          alignment: {
            horizontal: "center",
            vertical: "center",
          },
          border,
        },
      };

      worksheet["!rows"] = [
        { hpt: 34 },
        { hpt: 22 },
        { hpt: 8 },
        { hpt: 28 },
        { hpt: 30 },
        { hpt: 8 },
        { hpt: 32 },
      ];

      worksheet["!rows"][totalRowNumber - 1] = {
        hpt: 30,
      };

      // MERGES

      worksheet["!merges"] = [
        {
          s: { r: 0, c: 0 },
          e: { r: 0, c: 2 },
        },
        {
          s: { r: 0, c: 3 },
          e: { r: 0, c: 6 },
        },
        {
          s: { r: 0, c: 7 },
          e: { r: 0, c: 8 },
        },
        {
          s: { r: 1, c: 0 },
          e: { r: 1, c: 2 },
        },
        {
          s: { r: 1, c: 3 },
          e: { r: 1, c: 6 },
        },
        {
          s: { r: 1, c: 7 },
          e: { r: 1, c: 8 },
        },
        {
          s: { r: 3, c: 0 },
          e: { r: 4, c: 0 },
        },
        {
          s: { r: 3, c: 1 },
          e: { r: 3, c: 2 },
        },
        {
          s: { r: 4, c: 1 },
          e: { r: 4, c: 2 },
        },
        {
          s: { r: 3, c: 3 },
          e: { r: 4, c: 3 },
        },
        {
          s: { r: 3, c: 4 },
          e: { r: 3, c: 5 },
        },
        {
          s: { r: 4, c: 4 },
          e: { r: 4, c: 5 },
        },
        {
          s: { r: 3, c: 6 },
          e: { r: 4, c: 6 },
        },
        {
          s: { r: 3, c: 7 },
          e: { r: 3, c: 8 },
        },
        {
          s: { r: 4, c: 7 },
          e: { r: 4, c: 8 },
        },
      ];

      const workbook = XLSX.utils.book_new();

      XLSX.utils.book_append_sheet(
        workbook,
        worksheet,
        "Timesheet"
      );

      const safeEmployeeName = String(
        employee?.name || "Employee"
      )
        .replace(/[^\w\s-]/g, "")
        .trim()
        .replace(/\s+/g, "_");

      const fileName = `${safeEmployeeName}_${monthValue}_Timesheet.xlsx`;

      XLSX.writeFile(workbook, fileName);
    } catch {
      // Show a clear message when workbook generation or download fails.
      setExportError("Unable to export the timesheet. Please try again.");
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={handleExport}
        className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
      >
        <Download size={16} />
        Export CSV
      </button>
      {exportError && (
        <p role="alert" className="mt-2 text-sm text-red-600">
          {exportError}
        </p>
      )}
    </>
  );
};

export default TimesheetExport;