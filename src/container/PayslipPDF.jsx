import React from "react";
import { FiDownload } from "react-icons/fi";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const PayslipPDF = ({
  employee,
  selectedMonth,
  onDownloaded,
  className = "",
}) => {
  const downloadPDF = async () => {
    if (!employee) return;

    if (!employee.payslipGenerated) {
      return;
    }

    const doc = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
      compress: true,
    });

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();

    // ============================================================
    // MSS TECHNO PALETTE
    // ============================================================
    const GREEN = [77, 139, 79];
    const BROWN = [107, 45, 26];
    const DARK_BROWN = [75, 31, 18];
    const IVORY = [248, 246, 242];
    const WHITE = [255, 255, 255];
    const BORDER = [178, 178, 178];
    const LIGHT_BORDER = [210, 210, 210];
    const TEXT = [55, 55, 55];
    const MUTED = [105, 105, 105];
    const LIGHT_BROWN = [248, 240, 236];

    const margin = 10;
    const contentWidth = pageWidth - margin * 2;

    const text = (value) => {
      if (
        value === null ||
        value === undefined ||
        value === ""
      ) {
        return "—";
      }

      return String(value);
    };

    /*
      jsPDF's built-in Helvetica font does not reliably render ₹.
      Therefore Rs. is used in the generated PDF.
    */
    const money = (value) => {
      const amount = Number(value || 0);

      return `Rs. ${amount.toLocaleString("en-IN", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`;
    };

    const month = String(selectedMonth || "").toUpperCase();

    // ============================================================
    // LOAD MSS TECHNO LOGO
    // ============================================================
    const loadLogo = () =>
      new Promise((resolve) => {
        try {
          const image = new Image();

          image.onload = () => {
            try {
              const canvas = document.createElement("canvas");

              canvas.width =
                image.naturalWidth || image.width;

              canvas.height =
                image.naturalHeight || image.height;

              const context = canvas.getContext("2d");

              if (!context) {
                resolve(null);
                return;
              }

              context.drawImage(image, 0, 0);

              resolve(
                canvas.toDataURL("image/png")
              );
            } catch {
              resolve(null);
            }
          };

          image.onerror = () => resolve(null);

          /*
            Put your MSS logo here:
            public/MSSLogowithoutbg.png
          */
          image.src = "/MSSLogowithoutbg.png";
        } catch {
          resolve(null);
        }
      });

    const logoData = await loadLogo();

    // ============================================================
    // WHITE A4 PAGE
    // ============================================================
    doc.setFillColor(...WHITE);
    doc.rect(
      0,
      0,
      pageWidth,
      pageHeight,
      "F"
    );

    // Reference-style outer border.
    doc.setDrawColor(...LIGHT_BORDER);
    doc.setLineWidth(0.3);

    doc.rect(
      6,
      6,
      pageWidth - 12,
      pageHeight - 12
    );

    // ============================================================
    // HEADER
    // ============================================================
    doc.setTextColor(...DARK_BROWN);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);

    doc.text(
      "Payslip",
      margin,
      17
    );

    doc.setTextColor(...TEXT);
    doc.setFontSize(8.5);

    doc.text(
      month,
      margin,
      23
    );

    // MSS Techno logo.
    if (logoData) {
      try {
        doc.addImage(
          logoData,
          "PNG",
          pageWidth - margin - 29,
          9,
          29,
          18,
          undefined,
          "FAST"
        );
      } catch {
        // Continue without image if browser/PDF cannot render it.
      }
    }

    doc.setTextColor(...BROWN);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7.2);

    doc.text(
      "MSS TECHNO",
      pageWidth - margin,
      30,
      {
        align: "right",
      }
    );

    // ============================================================
    // EMPLOYEE NAME STRIP
    // ============================================================
    doc.setFillColor(...IVORY);
    doc.setDrawColor(...BORDER);
    doc.setLineWidth(0.3);

    doc.rect(
      margin,
      34,
      contentWidth,
      8,
      "FD"
    );

    doc.setTextColor(...DARK_BROWN);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8.2);

    doc.text(
      text(employee.name),
      margin + 3,
      39.2
    );

    doc.setTextColor(...MUTED);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(6.7);

    doc.text(
      `${text(employee.id)}  •  ${text(employee.designation)}`,
      pageWidth - margin - 3,
      39.2,
      {
        align: "right",
      }
    );

    // ============================================================
    // EMPLOYEE / PAYMENT / ROLE DETAILS
    // ============================================================
    autoTable(doc, {
      startY: 43,

      margin: {
        left: margin,
        right: margin,
      },

      tableWidth: contentWidth,
      theme: "grid",

      styles: {
        font: "helvetica",
        fontSize: 6.7,
        textColor: TEXT,
        lineColor: BORDER,
        lineWidth: 0.22,
        cellPadding: 1.8,
        minCellHeight: 5.6,
        valign: "middle",
      },

      headStyles: {
        fillColor: GREEN,
        textColor: WHITE,
        fontStyle: "bold",
        fontSize: 7,
        cellPadding: 1.8,
        halign: "left",
      },

      columnStyles: {
        0: {
          cellWidth: contentWidth * 0.17,
          fontStyle: "bold",
        },

        1: {
          cellWidth: contentWidth * 0.17,
        },

        2: {
          cellWidth: contentWidth * 0.17,
          fontStyle: "bold",
        },

        3: {
          cellWidth: contentWidth * 0.17,
        },

        4: {
          cellWidth: contentWidth * 0.16,
          fontStyle: "bold",
        },

        5: {
          cellWidth: contentWidth * 0.16,
        },
      },

      head: [
        [
          {
            content: "Employee Details",
            colSpan: 2,
          },

          {
            content: "Payment & Leave Details",
            colSpan: 2,
          },

          {
            content: "Role Details",
            colSpan: 2,
          },
        ],
      ],

      body: [
        [
          "Employee ID",
          text(employee.id),

          "Pay Period",
          text(selectedMonth),

          "Department",
          text(employee.department),
        ],

        [
          "Employee Name",
          text(employee.name),

          "Working Days",
          text(employee.workingDays),

          "Designation",
          text(employee.designation),
        ],

        [
          "Hours",
          text(employee.hours),

          "Paid Days",
          text(employee.paidDays),

          "LOP Days",
          text(employee.lopDays),
        ],

        [
          "Leave Days",
          text(employee.leaveDays),

          "Salary Status",
          employee.payrollStatus === "Processed"
            ? "Processed"
            : "Approved",

          "Employee Status",
          employee.hrStatus === "Approved"
            ? "HR Approved"
            : "Payroll",
        ],
      ],
    });

    // ============================================================
    // EARNINGS + DEDUCTIONS
    // ============================================================
    const salaryStart =
      doc.lastAutoTable.finalY + 4;

    autoTable(doc, {
      startY: salaryStart,

      margin: {
        left: margin,
        right: margin,
      },

      tableWidth: contentWidth,
      theme: "grid",

      styles: {
        font: "helvetica",
        fontSize: 6.9,
        textColor: TEXT,
        lineColor: BORDER,
        lineWidth: 0.22,
        cellPadding: 2,
        minCellHeight: 6.1,
        valign: "middle",
      },

      headStyles: {
        fillColor: GREEN,
        textColor: WHITE,
        fontStyle: "bold",
        fontSize: 7.1,
        cellPadding: 2,
      },

      columnStyles: {
        0: {
          cellWidth: contentWidth * 0.28,
        },

        1: {
          cellWidth: contentWidth * 0.20,
          halign: "right",
        },

        2: {
          cellWidth: contentWidth * 0.32,
        },

        3: {
          cellWidth: contentWidth * 0.20,
          halign: "right",
        },
      },

      head: [
        [
          "Earnings",
          "Current",
          "Deductions",
          "Amount",
        ],
      ],

      body: [
        [
          "Basic Salary",
          money(employee.basic),
          "Provident Fund",
          money(employee.pf),
        ],

        [
          "HRA",
          money(employee.hra),
          "Professional Tax",
          money(employee.professionalTax),
        ],

        [
          "Allowances",
          money(employee.allowances),
          "LOP",
          money(employee.lop),
        ],

        [
          "Gross Salary",
          money(employee.gross),
          "Total Deductions",
          money(employee.deductions),
        ],
      ],

      didParseCell: (data) => {
        if (
          data.section === "body" &&
          data.row.index === 3
        ) {
          data.cell.styles.fontStyle = "bold";
          data.cell.styles.fillColor = IVORY;
        }

        if (
          data.section === "body" &&
          data.row.index === 3 &&
          (
            data.column.index === 2 ||
            data.column.index === 3
          )
        ) {
          data.cell.styles.fillColor = LIGHT_BROWN;
        }
      },
    });

    // ============================================================
    // TOTALS
    // ============================================================
    const totalsY =
      doc.lastAutoTable.finalY + 4;

    const half = contentWidth / 2;
    const totalsH = 9;

    doc.setDrawColor(...BORDER);
    doc.setLineWidth(0.25);

    doc.setFillColor(...IVORY);

    doc.rect(
      margin,
      totalsY,
      half,
      totalsH,
      "FD"
    );

    doc.setFillColor(...LIGHT_BROWN);

    doc.rect(
      margin + half,
      totalsY,
      half,
      totalsH,
      "FD"
    );

    doc.setTextColor(...TEXT);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7);

    doc.text(
      "Total Earnings",
      margin + 3,
      totalsY + 5.8
    );

    doc.text(
      money(employee.gross),
      margin + half - 3,
      totalsY + 5.8,
      {
        align: "right",
      }
    );

    doc.text(
      "Total Deductions",
      margin + half + 3,
      totalsY + 5.8
    );

    doc.text(
      money(employee.deductions),
      pageWidth - margin - 3,
      totalsY + 5.8,
      {
        align: "right",
      }
    );

    // ============================================================
    // NET PAY
    // ============================================================
    const netY =
      totalsY + totalsH + 4;

    const netLabelW = 40;
    const netValueW = 55;

    const netX =
      pageWidth -
      margin -
      netLabelW -
      netValueW;

    doc.setFillColor(...GREEN);

    doc.rect(
      netX,
      netY,
      netLabelW,
      11,
      "F"
    );

    doc.setFillColor(...WHITE);
    doc.setDrawColor(...BORDER);

    doc.rect(
      netX + netLabelW,
      netY,
      netValueW,
      11,
      "FD"
    );

    doc.setTextColor(...WHITE);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);

    doc.text(
      "NET PAY",
      netX + 5,
      netY + 7
    );

    doc.setTextColor(...DARK_BROWN);
    doc.setFontSize(10);

    doc.text(
      money(employee.netPay),
      netX +
        netLabelW +
        netValueW -
        4,
      netY + 7,
      {
        align: "right",
      }
    );

    // ============================================================
    // PAYROLL SUMMARY
    // ============================================================
    const summaryY =
      netY + 16;

    const summaryWidth =
      contentWidth * 0.72;

    autoTable(doc, {
      startY: summaryY,

      margin: {
        left: margin,
      },

      tableWidth: summaryWidth,
      theme: "grid",

      styles: {
        font: "helvetica",
        fontSize: 6.6,
        textColor: TEXT,
        lineColor: BORDER,
        lineWidth: 0.22,
        cellPadding: 1.8,
        minCellHeight: 5.6,
      },

      headStyles: {
        fillColor: BROWN,
        textColor: WHITE,
        fontStyle: "bold",
        fontSize: 6.8,
      },

      columnStyles: {
        0: {
          cellWidth: summaryWidth * 0.25,
          fontStyle: "bold",
        },

        1: {
          cellWidth: summaryWidth * 0.25,
        },

        2: {
          cellWidth: summaryWidth * 0.25,
          fontStyle: "bold",
        },

        3: {
          cellWidth: summaryWidth * 0.25,
        },
      },

      head: [
        [
          "Payroll Summary",
          "Value",
          "Attendance",
          "Value",
        ],
      ],

      body: [
        [
          "Pay Period",
          text(selectedMonth),
          "Working Days",
          text(employee.workingDays),
        ],

        [
          "Gross Salary",
          money(employee.gross),
          "Paid Days",
          text(employee.paidDays),
        ],

        [
          "Total Deductions",
          money(employee.deductions),
          "Leave Days",
          text(employee.leaveDays),
        ],

        [
          "Net Pay",
          money(employee.netPay),
          "LOP Days",
          text(employee.lopDays),
        ],
      ],

      didParseCell: (data) => {
        if (
          data.section === "body" &&
          data.row.index === 3
        ) {
          data.cell.styles.fontStyle = "bold";
          data.cell.styles.fillColor = IVORY;
        }
      },
    });

    // ============================================================
    // FOOTER
    // ============================================================
    const footerY =
      pageHeight - 18;

    doc.setDrawColor(...LIGHT_BORDER);
    doc.setLineWidth(0.2);

    doc.line(
      margin,
      footerY - 4,
      pageWidth - margin,
      footerY - 4
    );

    doc.setTextColor(...MUTED);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(6.2);

    doc.text(
      "This payslip is generated from the MSS Techno payroll system.",
      margin,
      footerY
    );

    doc.text(
      `Generated for ${text(employee.name)} • ${selectedMonth}`,
      pageWidth - margin,
      footerY,
      {
        align: "right",
      }
    );

    doc.setTextColor(...BROWN);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(6.5);

    doc.text(
      "MSS TECHNO",
      margin,
      footerY + 6
    );

    // ============================================================
    // FILE NAME + DOWNLOAD
    // ============================================================
    const safeName = String(employee.name || "Employee")
      .replace(/[^a-z0-9]+/gi, "-")
      .replace(/^-|-$/g, "");

    const safeMonth = String(selectedMonth || "")
      .replace(/\s+/g, "-");

    doc.save(
      `${safeName}-${safeMonth}-MSS-Techno-Payslip.pdf`
    );

    if (typeof onDownloaded === "function") {
      onDownloaded(employee);
    }
  };

  return (
    <button
      type="button"
      onClick={downloadPDF}
      disabled={!employee?.payslipGenerated}
      className={
        className ||
        "w-9 h-9 shrink-0 rounded-lg border border-emerald-200 text-emerald-700 bg-emerald-50 flex items-center justify-center hover:bg-emerald-100 disabled:opacity-50 disabled:cursor-not-allowed"
      }
      title="Download Payslip PDF"
    >
      <FiDownload size={14} />
    </button>
  );
};

export default PayslipPDF;
