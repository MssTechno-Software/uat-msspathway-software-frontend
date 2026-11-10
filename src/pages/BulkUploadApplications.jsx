import { useState, useRef, useEffect } from "react";
import * as XLSX from "xlsx";
import { FiUploadCloud, FiFileText, FiX, FiCheckCircle, FiAlertCircle, } from "react-icons/fi";
// Maximum accepted upload size is 30 MB.
const MAX_FILE_SIZE = 30 * 1024 * 1024;
// Columns written to the cleaned upload file.
const REQUIRED_COLUMNS = [
    "platform",
    "company_name",
    "role",
    "date_applied",
    "application_link",
    "notes",
];
// Fields that must exist in the uploaded sheet.
const REQUIRED_FIELDS = [
    "platform",
    "company_name",
    "role",
    "date_applied",
    "application_link",
];
// Normalize headers so spaces, underscores, and case do not affect matching.
const normalizeHeader = (value) => {
    return String(value ?? "")
        .trim()
        .toLowerCase()
        .replace(/[\s_-]+/g, "");
};
// Convert cell values to trimmed strings safely.
const normalize = (value) => {
    if (value === null || value === undefined) {
        return "";
    }
    return String(value).trim();
};
const HEADER_ALIASES = {
    platform: [
        "platform",
        "jobplatform",
        "applicationplatform",
        "source",
        "applicationsource",
    ],
    company_name: [
        "companyname",
        "company",
        "companytitle",
        "organization",
        "organizationname",
        "employer",
        "employername",
    ],
    role: [
        "role",
        "jobrole",
        "jobtitle",
        "position",
        "designation",
        "jobposition",
        "appliedrole",
    ],
    date_applied: [
        "dateapplied",
        "applieddate",
        "applicationdate",
        "dateofapplication",
        "appliedon",
    ],
    application_link: [
        "applicationlink",
        "applicationurl",
        "joblink",
        "joburl",
        "applylink",
        "applyurl",
        "careerlink",
        "careerslink",
        "link",
        "url",
    ],
    notes: [
        "notes",
        "note",
        "comments",
        "comment",
        "remarks",
        "remark",
        "description",
    ],
};
// Normalize accepted column names.
const NORMALIZED_HEADER_ALIASES = Object.fromEntries(Object.entries(HEADER_ALIASES).map(([canonical, aliases]) => [
    canonical,
    aliases.map(normalizeHeader),
]));
// Convert Excel and JavaScript dates to YYYY-MM-DD.
const formatDate = (value) => {
    if (value instanceof Date &&
        !Number.isNaN(value.getTime())) {
        const year = value.getFullYear();
        const month = String(value.getMonth() + 1).padStart(2, "0");
        const day = String(value.getDate()).padStart(2, "0");
        return `${year}-${month}-${day}`;
    }
    if (typeof value === "number" &&
        value > 0) {
        const parsed = XLSX.SSF.parse_date_code(value);
        if (parsed) {
            const month = String(parsed.m).padStart(2, "0");
            const day = String(parsed.d).padStart(2, "0");
            return `${parsed.y}-${month}-${day}`;
        }
    }
    return normalize(value);
};
const isEmptyRow = (row) => {
    return REQUIRED_COLUMNS.every((column) => normalize(row[column]) === "");
};
// Map uploaded headers to canonical fields, regardless of column order.
const getColumnMap = (headers) => {
    const normalizedHeaders = headers.map(normalizeHeader);
    const map = {};
    const missing = [];
    const matchedIndexes = new Set();
    for (const canonical of REQUIRED_COLUMNS) {
        const aliases = NORMALIZED_HEADER_ALIASES[canonical] || [normalizeHeader(canonical)];
        const index = normalizedHeaders.findIndex((header, headerIndex) => !matchedIndexes.has(headerIndex) &&
            aliases.includes(header));
        if (index === -1) {
            if (REQUIRED_FIELDS.includes(canonical)) {
                missing.push(canonical);
            }
            map[canonical] = -1;
        }
        else {
            map[canonical] = index;
            matchedIndexes.add(index);
        }
    }
    return { map, missing };
};
// Stop validation when required headers are missing.
const validateHeaders = (headers) => {
    const { map, missing } = getColumnMap(headers);
    const headerErrors = [];
    if (missing.length > 0) {
        headerErrors.push(`Missing required column(s): ${missing.join(", ")}`);
    }
    return { errors: headerErrors, map };
};
// Validate required values and prepare a consistent application object.
const validateRow = (row, rowNumber) => {
    const platform = normalize(row.platform);
    const companyName = normalize(row.company_name);
    const role = normalize(row.role);
    const dateApplied = formatDate(row.date_applied);
    const applicationLink = normalize(row.application_link);
    const notes = normalize(row.notes);
    const rowErrors = [];
    if (!platform) {
        rowErrors.push("Platform is required");
    }
    if (!companyName) {
        rowErrors.push("Company name is required");
    }
    if (!role) {
        rowErrors.push("Role is required");
    }
    if (!dateApplied) {
        rowErrors.push("Date is required");
    }
    if (!applicationLink) {
        rowErrors.push("Application link is required");
    }
    if (applicationLink &&
        !/^https:\/\//i.test(applicationLink)) {
        rowErrors.push("Enter valid link. Link must start with https://");
    }
    if (notes.length > 500) {
        rowErrors.push(`Notes cannot exceed 500 characters (${notes.length}/500)`);
    }
    return {
        rowNumber,
        errors: rowErrors,
        valid: rowErrors.length === 0,
        data: {
            platform,
            company_name: companyName,
            role,
            date_applied: dateApplied,
            application_link: applicationLink,
            notes,
        },
    };
};
// Handle file selection, validation, and upload preparation.
function BulkUploadApplications({ onBulkUpload, onUploadStateChange, }) {
    const [file, setFile] = useState(null);
    const [validRows, setValidRows] = useState([]);
    const [errors, setErrors] = useState([]);
    const [isValidating, setIsValidating] = useState(false);
    const errorSectionRef = useRef(null);
    // Build a new file containing only rows that passed validation.
    const createValidRowsFile = (sourceFile = file, sourceRows = validRows) => {
        if (!sourceFile ||
            sourceRows.length === 0) {
            return null;
        }
        const originalName = sourceFile.name ||
            "applications";
        const isCsv = originalName
            .toLowerCase()
            .endsWith(".csv");
        const rows = [
            REQUIRED_COLUMNS,
            ...sourceRows.map((row) => REQUIRED_COLUMNS.map((column) => row[column] ??
                "")),
        ];
        const worksheet = XLSX.utils.aoa_to_sheet(rows);
        if (isCsv) {
            const csvContent = XLSX.utils.sheet_to_csv(worksheet);
            return new File([csvContent], originalName, {
                type: "text/csv",
            });
        }
        const outputWorkbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(outputWorkbook, worksheet, "Applications");
        const outputArray = XLSX.write(outputWorkbook, {
            bookType: "xlsx",
            type: "array",
        });
        const baseName = originalName.replace(/\.(xlsx|xls)$/i, "");
        return new File([outputArray], `${baseName}_valid.xlsx`, {
            type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        });
    };
    // Read the selected file, validate its structure, and collect row errors.
    const validateFile = async (selectedFile) => {
        setIsValidating(true);
        setFile(selectedFile);
        setValidRows([]);
        setErrors([]);
        onUploadStateChange?.({
            count: 0,
            upload: null,
        });
        try {
            // Accept only supported spreadsheet and CSV extensions.
            const fileName = selectedFile.name.toLowerCase();
            const validExtension = fileName.endsWith(".xlsx") ||
                fileName.endsWith(".xls") ||
                fileName.endsWith(".csv");
            if (!validExtension) {
                setErrors([
                    {
                        row: null,
                        message: "Please upload an XLSX, XLS or CSV file.",
                    },
                ]);
                return;
            }
            // Reject files larger than 30 MB before reading them.
            if (selectedFile.size > MAX_FILE_SIZE) {
                setErrors([
                    {
                        row: null,
                        message: "File size must not exceed 30 MB.",
                    },
                ]);
                return;
            }
            if (selectedFile.size === 0) {
                setErrors([
                    {
                        row: null,
                        message: "The selected file is empty.",
                    },
                ]);
                return;
            }
            // Read the file as an array buffer for XLSX parsing.
            const buffer = await selectedFile.arrayBuffer();
            const workbook = XLSX.read(buffer, {
                type: "array",
                cellDates: true,
            });
            if (!workbook.SheetNames ||
                workbook.SheetNames
                    .length === 0) {
                setErrors([
                    {
                        row: null,
                        message: "No worksheet found in the file.",
                    },
                ]);
                return;
            }
            const worksheet = workbook.Sheets[workbook.SheetNames[0]];
            const sheetData = XLSX.utils.sheet_to_json(worksheet, {
                header: 1,
                defval: "",
                raw: true,
            });
            if (!sheetData.length) {
                setErrors([
                    {
                        row: null,
                        message: "The worksheet does not contain any data.",
                    },
                ]);
                return;
            }
            // Use the first row as headers and map columns dynamically.
            const headerRow = sheetData[0] || [];
            const { errors: headerErrors, map, } = validateHeaders(headerRow);
            if (headerErrors.length > 0) {
                setErrors(headerErrors.map((message) => ({
                    row: 1,
                    message,
                })));
                return;
            }
            // Validate each non-empty data row and retain its spreadsheet row number.
            const results = [];
            sheetData
                .slice(1)
                .forEach((values, index) => {
                    const row = {};
                    REQUIRED_COLUMNS.forEach((column) => {
                        const columnIndex = map[column];
                        if (columnIndex ===
                            undefined ||
                            columnIndex ===
                            -1) {
                            row[column] = "";
                        }
                        else {
                            row[column] =
                                values[columnIndex] ??
                                "";
                        }
                    });
                    if (isEmptyRow(row)) {
                        return;
                    }
                    results.push(validateRow(row, index + 2));
                });
            if (results.length === 0) {
                setErrors([
                    {
                        row: null,
                        message: "No application records found in the file.",
                    },
                ]);
                return;
            }
            const validationErrors = [];
            results.forEach((result) => {
                result.errors.forEach((message) => {
                    validationErrors.push({
                        row: result.rowNumber,
                        message,
                    });
                });
            });
            // Keep valid rows for upload and report errors for rejected rows.
            const successfulRows = results
                .filter((result) => result.valid)
                .map((result) => result.data);
            setValidRows(successfulRows);
            setErrors(validationErrors);
            // Update the parent upload action only when valid rows exist.
            if (successfulRows.length >
                0) {
                onUploadStateChange?.({
                    count: successfulRows.length,
                    upload: () => {
                        const uploadFile = createValidRowsFile(selectedFile, successfulRows);
                        if (!uploadFile) {
                            return;
                        }
                        onBulkUpload(uploadFile);
                    },
                });
            }
            else {
                onUploadStateChange?.({
                    count: 0,
                    upload: null,
                });
            }
        }
        catch {
            setErrors([
                {
                    row: null,
                    message: "Unable to read this file. Please check the Excel/CSV format.",
                },
            ]);
            onUploadStateChange?.({
                count: 0,
                upload: null,
            });
        }
        finally {
            setIsValidating(false);
        }
    };
    // Handle file-picker selection and allow the same file to be selected again.
    const handleFileChange = (event) => {
        const selectedFile = event.target.files?.[0];
        if (!selectedFile) {
            return;
        }
        validateFile(selectedFile);
        event.target.value = "";
    };
    // Support drag-and-drop file selection.
    const handleDrop = (event) => {
        event.preventDefault();
        const droppedFile = event.dataTransfer.files?.[0];
        if (!droppedFile) {
            return;
        }
        validateFile(droppedFile);
    };
    // Clear the selected file and reset validation and parent upload state.
    const removeFile = () => {
        setFile(null);
        setValidRows([]);
        setErrors([]);
        onUploadStateChange?.({
            count: 0,
            upload: null,
        });
    };
    // Bring validation errors into view after they appear.
    useEffect(() => {
        if (errors.length === 0 || !errorSectionRef.current) {
            return undefined;
        }

        const timeoutId = setTimeout(() => {
            errorSectionRef.current?.scrollIntoView({
                behavior: "smooth",
                block: "center",
            });
        }, 100);

        return () => clearTimeout(timeoutId);
    }, [errors]);
    return (<div className="space-y-5">

        <div className="text-center">

            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-green-100">
                <FiUploadCloud size={28} className="text-green-700" />
            </div>

            <h3 className="mt-4 text-lg font-semibold text-gray-800">
                Bulk Upload Applications
            </h3>

            <p className="mt-1 text-sm text-gray-500">
                Upload multiple applications using the
                application Excel template.
            </p>

        </div>

        <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">

            <p className="mb-2 text-xs font-semibold text-gray-700">
                Excel columns
            </p>

            <div className="flex flex-wrap gap-2">

                {REQUIRED_COLUMNS.map((column) => (<span key={column} className="rounded-lg border border-gray-200 bg-white px-2.5 py-1 text-xs text-gray-600">
                    {column}
                </span>))}

            </div>

            <p className="mt-3 text-xs text-gray-400">
                Column order does not matter. Supported
                column aliases are also accepted.
            </p>

        </div>

        <label className="block cursor-pointer">

            <div onDragOver={(event) => {
                event.preventDefault();
            }} onDrop={handleDrop} className="rounded-2xl border-2 border-dashed border-gray-300 bg-gray-50 p-8 text-center transition hover:border-green-500 hover:bg-green-50">

                <input type="file" accept=".xlsx,.xls,.csv" onChange={handleFileChange} className="hidden" />

                <FiUploadCloud size={38} className="mx-auto text-gray-400" />

                <p className="mt-3 text-sm font-medium text-gray-700">
                    Click to choose a file
                </p>

                <p className="mt-1 text-xs text-gray-400">
                    or drag & drop your Excel/CSV file
                </p>

                <p className="mt-1 text-xs text-gray-400">
                    XLSX, XLS or CSV
                </p>
            </div>
        </label>

        {file && (<div className="flex items-center justify-between rounded-xl border border-gray-200 bg-white px-4 py-3">

            <div className="flex min-w-0 items-center gap-3">

                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-green-100">

                    <FiFileText size={20} className="text-green-700" />

                </div>

                <div className="min-w-0">

                    <p className="truncate text-sm font-medium text-gray-700">
                        {file.name}
                    </p>

                    <p className="mt-0.5 text-xs text-gray-400">
                        {(file.size /
                            1024).toFixed(1)}{" "}
                        KB
                    </p>

                </div>

            </div>

            <button type="button" onClick={removeFile} className="ml-3 text-gray-400 transition hover:text-red-500" aria-label="Remove file">
                <FiX size={19} />
            </button>

        </div>)}

        {isValidating && (<div className="rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-600">
            Validating applications...
        </div>)}

        {!isValidating &&
            file &&
            validRows.length >
            0 && (<div className="rounded-xl border border-green-200 bg-green-50 p-4">

                <div className="flex items-center gap-2">

                    <FiCheckCircle size={19} className="text-green-700" />

                    <p className="text-sm font-semibold text-green-800">
                        Upload Ready
                    </p>

                </div>

                <p className="mt-2 text-xs text-green-700">
                    {validRows.length}{" "}
                    application
                    {validRows.length !==
                        1
                        ? "s"
                        : ""}{" "}
                    ready to upload.
                </p>

            </div>)}

        {!isValidating &&
            errors.length >
            0 && (<div ref={errorSectionRef} className="rounded-xl border border-red-200 bg-red-50 p-4">

                <div className="mb-3 flex items-center gap-2">

                    <FiAlertCircle size={19} className="text-red-600" />

                    <div>

                        <p className="text-sm font-semibold text-red-800">
                            Rejected
                        </p>

                        <p className="mt-0.5 text-xs text-red-700">
                            {errors.length}{" "}
                            validation
                            {errors.length !==
                                1
                                ? " errors"
                                : " error"}{" "}
                            found.
                        </p>

                    </div>

                </div>

                <div className="max-h-52 space-y-2 overflow-y-auto">

                    {errors.map((error, index) => (<div key={`${error.row}-${index}`} className="rounded-lg bg-white/70 px-3 py-2 text-xs text-red-700">

                        {error.row && (<span className="font-semibold">
                            Row{" "}
                            {error.row}
                            :{" "}
                        </span>)}

                        {error.message}

                    </div>))}

                </div>

            </div>)}

    </div>);
}
export default BulkUploadApplications;
