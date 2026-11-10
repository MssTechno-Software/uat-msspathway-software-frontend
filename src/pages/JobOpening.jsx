import React, { useCallback, useEffect, useMemo, useState } from "react";

import {
    Search,
    CalendarDays,
    RefreshCw,
    BriefcaseBusiness,
    Building2,
    MapPin,
    ChevronLeft,
    ChevronRight,
    ExternalLink,
    Clock3,
    AlertCircle,
    RotateCcw,
} from "lucide-react";
import ApiErrorModal from "../container/ApiErrorModal";
import { getApiErrorMessage } from "../utils/apiErrorHandler";

const dispatchSessionExpiredIfNeeded = (error) => {
    if (error?.response?.status !== 401 && error?.status !== 401) {
        return false;
    }

    window.dispatchEvent(new Event("session-expired"));
    return true;
};

const getJobApiErrorMessage = (error, fallbackMessage) => {
    dispatchSessionExpiredIfNeeded(error);
    return getApiErrorMessage(error, fallbackMessage);
};

const API_URL =
    "https://timesheet-api-790373899641.asia-south1.run.app/openings";

const PAGE_SIZE = 9;
const COUNTRY = "india";

const JobOpening = () => {
    // API DATA
    const [jobs, setJobs] = useState([]);
    const [totalJobs, setTotalJobs] = useState(0);

    // PAGINATION
    const [currentPage, setCurrentPage] = useState(1);

    // UI STATES
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [apiError, setApiError] = useState(null);
    const [showErrorFallback, setShowErrorFallback] = useState(false);

    // SEARCH / FILTERS

    const [search, setSearch] = useState("");
    const [searchQuery, setSearchQuery] = useState("");
    const [fromDate, setFromDate] = useState("");
    const [toDate, setToDate] = useState("");
    const [dateError, setDateError] = useState("");

    // DECODE API HTML ENTITIES

    const decodeHtml = (value) => {
        if (!value) return "";

        const textarea = document.createElement("textarea");
        textarea.innerHTML = String(value);

        return textarea.value;
    };

    // FETCH JOB OPENINGS
    const fetchJobs = useCallback(
        async () => {
            try {
                setLoading(true);
                setError("");
                setApiError(null);
                setShowErrorFallback(false);

                const params = new URLSearchParams({
                    page: String(currentPage),
                    page_size: String(PAGE_SIZE),
                    country: COUNTRY,
                });

                if (searchQuery.trim()) {
                    params.set("search", searchQuery.trim());
                }

                const response = await fetch(
                    `${API_URL}?${params.toString()}`
                );

                if (!response.ok) {
                    let responseData = null;

                    try {
                        responseData = await response.json();
                    } catch {
                        // Keep the HTTP status as the fallback when the response has no JSON body.
                    }

                    const requestError = new Error(
                        responseData?.detail ||
                        responseData?.message ||
                        responseData?.error ||
                        `Unable to fetch job openings. Server returned ${response.status}.`
                    );
                    requestError.response = {
                        status: response.status,
                        data: responseData,
                    };
                    throw requestError;
                }

                const data = await response.json();

                const jobPostings = Array.isArray(data?.job_postings)
                    ? data.job_postings
                    : [];

                setJobs(jobPostings);

                setTotalJobs(
                    Number(data?.total_job_postings) ||
                    Number(data?.total_jobs) ||
                    jobPostings.length
                );
            } catch (err) {
                const errorMessage = getJobApiErrorMessage(
                    err,
                    "Something went wrong while loading job openings."
                );

                setError(errorMessage);
                setApiError({
                    title: "Unable to Load Job Openings",
                    message: errorMessage,
                });
                setJobs([]);
            } finally {
                setLoading(false);
            }
        },
        [currentPage, searchQuery]
    );
    const retryJobFetch = async () => {
        setApiError(null);
        setShowErrorFallback(false);
        await fetchJobs();
    };

    // INITIAL / PAGE CHANGE FETCH
    useEffect(() => {
        const timer = setTimeout(() => {
            setCurrentPage(1);
            setSearchQuery(search.trim());
        }, 500);

        return () => clearTimeout(timer);
    }, [search]);
    useEffect(() => {
        fetchJobs();
    }, [fetchJobs]);
 
    // RESET FILTERS

    const handleResetFilters = () => {
        setSearch("");
        setFromDate("");
        setToDate("");
        setCurrentPage(1);
    };

    // SEARCH + DATE FILTER
    const filteredJobs = useMemo(() => {
        return jobs.filter((job) => {
            const postedDate = job?.date_posted
                ? new Date(job.date_posted)
                : null;

            let matchesFromDate = true;
            let matchesToDate = true;

            if (
                fromDate &&
                postedDate &&
                !Number.isNaN(postedDate.getTime())
            ) {
                const startDate = new Date(`${fromDate}T00:00:00`);
                matchesFromDate = postedDate >= startDate;
            }

            if (
                toDate &&
                postedDate &&
                !Number.isNaN(postedDate.getTime())
            ) {
                const endDate = new Date(`${toDate}T23:59:59`);
                matchesToDate = postedDate <= endDate;
            }

            if (!postedDate) {
                matchesFromDate = true;
                matchesToDate = true;
            }

            return matchesFromDate && matchesToDate;
        });
    }, [jobs, fromDate, toDate]);

    // PAGINATION

    const totalPages = Math.max(
        1,
        Math.ceil(totalJobs / PAGE_SIZE)
    );

    const canGoPrevious = currentPage > 1;
    const canGoNext = currentPage < totalPages;

    const handlePrevious = () => {
        if (canGoPrevious) {
            setCurrentPage((prev) => prev - 1);
        }
    };

    const handleNext = () => {
        if (canGoNext) {
            setCurrentPage((prev) => prev + 1);
        }
    };

    const handlePageChange = (page) => {
        if (page >= 1 && page <= totalPages) {
            setCurrentPage(page);
        }
    };

    // PAGE NUMBERS

    const pageNumbers = useMemo(() => {
        const pages = [];

        if (totalPages <= 5) {
            for (let i = 1; i <= totalPages; i++) {
                pages.push(i);
            }

            return pages;
        }

        if (currentPage <= 3) {
            return [1, 2, 3, 4, "...", totalPages];
        }

        if (currentPage >= totalPages - 2) {
            return [
                1,
                "...",
                totalPages - 3,
                totalPages - 2,
                totalPages - 1,
                totalPages,
            ];
        }

        return [
            1,
            "...",
            currentPage - 1,
            currentPage,
            currentPage + 1,
            "...",
            totalPages,
        ];
    }, [currentPage, totalPages]);

    // FORMAT DATE
    const formatDate = (dateValue) => {
        if (!dateValue) return "N/A";

        const date = new Date(dateValue);

        if (Number.isNaN(date.getTime())) {
            return "N/A";
        }

        return date.toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric",
        });
    };

    // SAFE VALUE
    const getValue = (value) => {
        if (
            value === null ||
            value === undefined ||
            String(value).trim() === ""
        ) {
            return "N/A";
        }

        return decodeHtml(String(value));
    };
    //apply link open logic
    const getApplyLink = (applyLink) => {
        if (!applyLink) return "#";

        if (applyLink.includes("careers.smartrecruiters.com/")) {
            return applyLink.replace(
                "careers.smartrecruiters.com/",
                "jobs.smartrecruiters.com/"
            );
        }

        return applyLink;
    };
    // JOB CARD
    const JobCard = ({ job, index }) => {
        const company = getValue(job?.company);
        const role = getValue(job?.role);
        const experience = getValue(job?.experience);
        const location = getValue(job?.location);

        const postedDate = formatDate(job?.date_posted);
        const lastDate = formatDate(job?.last_date_to_apply);

        const skills = Array.isArray(job?.skills)
            ? job.skills
                .filter(
                    (skill) =>
                        skill !== null &&
                        skill !== undefined &&
                        String(skill).trim() !== ""
                )
                .map((skill) => decodeHtml(skill))
            : [];

        return (
            <article
                className="group relative flex h-full min-h-[390px] flex-col overflow-hidden rounded-[20px] border border-slate-200 bg-white p-5 shadow-[0_2px_10px_rgba(15,23,42,0.04)] transition-[transform,box-shadow,border-color] duration-[700ms] ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-[3px] hover:border-[#4D8B4F]/25 hover:shadow-[0_10px_28px_rgba(15,23,42,0.08)]"
            >
                {/*VERY SUBTLE CARD ACCENT*/}

                <div className="pointer-events-none absolute inset-x-0 top-0 h-[3px] origin-left scale-x-0 bg-[#4D8B4F]/70 transition-transform duration-[900ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-x-100" />

                {/*TOP ROW*/}

                <div className="relative z-10 mb-5 flex items-center justify-between">
                    {/* NUMBER */}

                    <span
                        className="inline-flex h-8 min-w-8 items-center justify-center rounded-lg bg-[#eef4ff] px-2 text-xs font-semibold text-slate-700 transition-all duration-300 group-hover:bg-[#edf5ee] group-hover:text-[#315c38]"
                    >
                        {(currentPage - 1) * PAGE_SIZE + index + 1}
                    </span>

                    {/* POSTED DATE */}

                    <div
                        className="flex items-center gap-1.5 text-xs font-medium text-slate-500"
                    >
                        <CalendarDays
                            size={15}
                            strokeWidth={1.8}
                            className="transition-transform duration-300 group-hover:scale-110"
                        />

                        <span>{postedDate}</span>
                    </div>
                </div>

                {/* JOB TITLE*/}

                <h2
                    className="relative z-10 mb-3 min-h-[56px] line-clamp-2 text-[18px] font-bold leading-7 tracking-[-0.01em] text-slate-900 transition-colors duration-300 group-hover:text-[#234b2b]"
                    title={role}
                >
                    {role}
                </h2>

                {/* COMPANY */}

                <div
                    className="relative z-10 mb-5 flex min-w-0 items-center gap-2"
                >
                    <Building2
                        size={17}
                        strokeWidth={1.8}
                        className="shrink-0 text-[#4D8B4F] transition-transform duration-500 ease-out group-hover:scale-[1.04]"
                    />

                    <p
                        className="min-w-0 truncate text-[15px] font-semibold text-[#234b2b]"
                        title={company}
                    >
                        {company}
                    </p>
                </div>

                {/*SKILLS*/}

                <div className="relative z-10 mb-5 min-h-[54px]">
                    <p
                        className="mb-2 text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-400"
                    >
                        Skills
                    </p>

                    {skills.length > 0 ? (
                        <div className="flex flex-wrap gap-1.5">
                            {skills.slice(0, 5).map(
                                (skill, skillIndex) => (
                                    <span
                                        key={`${skill}-${skillIndex}`}
                                        className="rounded-md border border-[#4D8B4F]/[0.07] bg-[#f2f6f2] px-2.5 py-1 text-[11px] font-medium text-[#315c38] transition-all duration-200 group-hover:bg-[#edf4ee]"
                                    >
                                        {skill}
                                    </span>
                                )
                            )}

                            {skills.length > 5 && (
                                <span
                                    className="rounded-md bg-slate-100 px-2.5 py-1 text-[11px] font-medium text-slate-500"
                                >
                                    +{skills.length - 5}
                                </span>
                            )}
                        </div>
                    ) : (
                        <span className="text-sm text-slate-400">
                            N/A
                        </span>
                    )}
                </div>
                {/*EXPERIENCE + LOCATION */}

                <div className="relative z-10 mb-5 flex flex-wrap gap-2">

                    {/* EXPERIENCE */}

                    <span
                        className="inline-flex min-w-0 max-w-full items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-600 transition-all duration-300 group-hover:border-[#4D8B4F]/20 group-hover:bg-[#f7faf7]"
                        title={experience}
                    >
                        <BriefcaseBusiness
                            size={14}
                            className="shrink-0 text-slate-500"
                        />

                        <span className="min-w-0 max-w-[170px] truncate">
                            {experience}
                        </span>
                    </span>

                    {/* LOCATION */}

                    <span
                        className="inline-flex min-w-0 max-w-full items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-600 transition-all duration-300 group-hover:border-[#4D8B4F]/20 group-hover:bg-[#f7faf7]"
                        title={location}
                    >
                        <MapPin
                            size={14}
                            className="shrink-0 text-slate-500"
                        />
                        <span className="min-w-0 max-w-[170px] truncate">
                            {location}
                        </span>
                    </span>
                </div>


                {/* BOTTOM SECTION */}

                <div className="relative z-10 mt-auto">

                    {/* LAST DATE */}

                    <div
                        className="mb-4 flex items-center gap-2 text-xs text-slate-500"
                    >
                        <Clock3
                            size={14}
                            strokeWidth={1.8}
                            className="shrink-0"
                        />

                        <span>
                            Last date to apply:{" "}
                            <span className="font-semibold text-slate-700">
                                {lastDate}
                            </span>
                        </span>
                    </div>

                    {/*  APPLY BUTTON */}

                    {job?.apply_link ? (
                        <a
                            href={getApplyLink(job.apply_link)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#016630] px-5 py-3.5 text-sm font-semibold text-white shadow-sm transition-all duration-300 hover:bg-[#004b25] hover:shadow-md active:scale-[0.985]"
                        >
                            <span>Apply Now</span>

                            <ExternalLink
                                size={15}
                                strokeWidth={2}
                                className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                            />
                        </a>
                    ) : (
                        <button
                            type="button"
                            disabled
                            className="flex w-full cursor-not-allowed items-center justify-center rounded-xl bg-slate-200 px-5 py-3.5 text-sm font-semibold text-slate-400"
                        >
                            Apply Link N/A
                        </button>
                    )}
                </div>
            </article>
        );
    };

    // LOADING CARD

    const SkeletonCard = () => {
        return (
            <div
                className="min-h-[390px] animate-pulse rounded-[20px] border border-slate-200 bg-white p-5"
            >
                <div className="mb-6 flex items-center justify-between">
                    <div className="h-8 w-8 rounded-lg bg-slate-200" />

                    <div className="h-4 w-24 rounded bg-slate-200" />
                </div>

                <div className="mb-3 h-6 w-4/5 rounded bg-slate-200" />

                <div className="mb-5 h-6 w-3/5 rounded bg-slate-200" />

                <div className="mb-5 h-5 w-32 rounded bg-slate-200" />

                <div className="mb-5 flex gap-2">
                    <div className="h-8 w-28 rounded-full bg-slate-200" />
                    <div className="h-8 w-28 rounded-full bg-slate-200" />
                </div>

                <div className="mb-6 h-10 w-full rounded bg-slate-200" />

                <div className="mt-auto h-12 w-full rounded-xl bg-slate-200" />
            </div>
        );
    };
    // MAIN RETURN

    return (
        <>
            <div className="min-h-screen bg-white text-slate-900">
            <main className="min-w-0 flex-1">
                <div className="px-5 py-6 sm:px-7 lg:px-8">

                    {/* SEARCH BAR */}

                    <div
                        className="mb-7 flex items-center rounded-2xl max-w-xl border border-transparent bg-[#f3f4f6] px-4 shadow-sm transition-all duration-300 focus-within:bg-white focus-within:ring-2 focus-within:ring-[#4D8B4F]/10"
                    >
                        <Search
                            size={22}
                            className="shrink-0 text-slate-600"
                        />

                        <input
                            type="text"
                            value={search}
                            onChange={(e) => {
                                setSearch(e.target.value);
                            }}
                            placeholder="Search by company, role, or location..."
                            className="h-14 w-full bg-transparent px-4 text-[15px] text-slate-800 outline-none placeholder:text-slate-400"
                        />
                    </div>

                    {/* TITLE + FILTERS*/}

                    <div
                        className="mb-7 flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between"
                    >
                        {/* TITLE */}

                        <div>
                            <h1
                                className="text-3xl font-bold tracking-tight text-[#111827] sm:text-4xl"
                            >
                                Job Openings
                            </h1>

                            <p className="mt-1 text-sm text-slate-500">
                                Explore current opportunities
                            </p>
                        </div>

                        {/* FILTERS */}

                        <div
                            className="flex flex-col gap-3 sm:flex-row sm:items-center"
                        >
                            {/* FROM */}

                            <label
                                className="flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-3 py-2"
                            >
                                <span className="text-sm font-medium text-slate-600">
                                    From:
                                </span>

                                <input
                                    type="date"
                                    value={fromDate}
                                    max={toDate || undefined}
                                    onChange={(e) => {
                                        const value = e.target.value;

                                        setFromDate(value);
                                        setCurrentPage(1);

                                        if (toDate && value > toDate) {
                                            setDateError("From date cannot be later than To date.");
                                        } else {
                                            setDateError("");
                                        }
                                    }}
                                    className="bg-transparent text-sm text-slate-700 outline-none"
                                />
                            </label>

                            {/* TO */}

                            <label
                                className="flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-3 py-2"
                            >
                                <span className="text-sm font-medium text-slate-600">
                                    To:
                                </span>

                                <input
                                    type="date"
                                    value={toDate}
                                    min={fromDate || undefined}
                                    onChange={(e) => {
                                        const value = e.target.value;

                                        setToDate(value);
                                        setCurrentPage(1);

                                        if (fromDate && value < fromDate) {
                                            setDateError(
                                                "To date cannot be earlier than From date."
                                            );
                                        } else {
                                            setDateError("");
                                        }
                                    }}
                                    className="bg-transparent text-sm text-slate-700 outline-none"
                                />
                            </label>
                        </div>
                        {dateError && (
                            <div className="mt-2 flex items-center gap-2 text-sm text-red-600">
                                <AlertCircle size={15} />
                                <span>{dateError}</span>
                            </div>
                        )}
                    </div>

                    {/*RESULTS INFO */}

                    <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
                        <p className="text-sm text-slate-500">
                            Showing{" "}
                            <span className="font-semibold text-slate-700">
                                {filteredJobs.length}
                            </span>{" "}
                            jobs on this page
                            {" • "}
                            <span className="font-semibold text-slate-700">
                                {totalJobs}
                            </span>{" "}
                            total openings
                        </p>

                        {(search || fromDate || toDate) && (
                            <button
                                type="button"
                                onClick={handleResetFilters}
                                className="inline-flex items-center gap-2 text-sm font-medium text-[#4D8B4F] transition-colors hover:text-[#315c38]"
                            >
                                <RotateCcw size={15} />
                                Clear filters
                            </button>
                        )}
                    </div>

                    {/*  ERROR*/}

                    {error && !loading && showErrorFallback && (
                        <div
                            className="flex min-h-[55vh] flex-col items-center justify-center rounded-2xl border border-red-200 bg-red-50 px-6 py-12 text-center"
                        >
                            <AlertCircle
                                size={40}
                                className="mb-3 text-red-500"
                            />

                            <h3 className="text-lg font-semibold text-red-700">
                                Unable to load job openings
                            </h3>

                            <p className="mt-1 max-w-lg text-sm text-red-600">
                                {error}
                            </p>

                            <button
                                type="button"
                                onClick={() => fetchJobs()}
                                className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[#005c2d] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#004b25]"
                            >
                                <RefreshCw size={16} />
                                Try Again
                            </button>
                        </div>
                    )}

                    {/*  LOADING */}

                    {loading && !error && (
                        <div
                            className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3"
                        >
                            {Array.from({
                                length: PAGE_SIZE,
                            }).map((_, index) => (
                                <SkeletonCard
                                    key={index}
                                />
                            ))}
                        </div>
                    )}

                    {/* JOB CARDS */}

                    {!loading &&
                        !error &&
                        filteredJobs.length > 0 && (
                            <div
                                className="grid grid-cols-1 items-stretch gap-6 md:grid-cols-2 xl:grid-cols-3"
                            >
                                {filteredJobs.map(
                                    (job, index) => (
                                        <JobCard
                                            key={`${job?.apply_link ||
                                                job?.role
                                                }-${index}`}
                                            job={job}
                                            index={index}
                                        />
                                    )
                                )}
                            </div>
                        )}

                    {/* EMPTY*/}

                    {!loading &&
                        !error &&
                        filteredJobs.length === 0 && (
                            <div
                                className="flex min-h-[360px] flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white px-6 text-center"
                            >
                                <div
                                    className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#eef5ef] text-[#4D8B4F]"
                                >
                                    <BriefcaseBusiness
                                        size={30}
                                    />
                                </div>

                                <h3 className="text-xl font-semibold text-slate-800">
                                    No job openings found
                                </h3>

                                <p className="mt-2 max-w-md text-sm text-slate-500">
                                    Try changing your search or
                                    date filters.
                                </p>

                                {(search ||
                                    fromDate ||
                                    toDate) && (
                                        <button
                                            type="button"
                                            onClick={
                                                handleResetFilters
                                            }
                                            className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[#005c2d] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#004b25]"
                                        >
                                            <RotateCcw
                                                size={16}
                                            />
                                            Clear Search
                                        </button>
                                    )}
                            </div>
                        )}

                    {/* PAGINATION */}

                    {!loading &&
                        !error &&
                        totalJobs > 0 && (
                            <div
                                className="mt-8 flex flex-col gap-4 border-t border-slate-200 pt-6 sm:flex-row sm:items-center sm:justify-between"
                            >
                                {/* PAGE INFO */}

                                <p className="text-sm text-slate-500">
                                    Page{" "}
                                    <span className="font-semibold text-slate-800">
                                        {currentPage}
                                    </span>{" "}
                                    of{" "}
                                    <span className="font-semibold text-slate-800">
                                        {totalPages}
                                    </span>
                                </p>

                                {/* PAGINATION CONTROLS */}

                                <div className="flex items-center gap-1.5">

                                    {/* PREVIOUS */}

                                    <button
                                        type="button"
                                        onClick={
                                            handlePrevious
                                        }
                                        disabled={
                                            !canGoPrevious
                                        }
                                        className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-slate-300 bg-white text-slate-600 transition-all duration-200 hover:border-[#4D8B4F] hover:text-[#4D8B4F] disabled:cursor-not-allowed disabled:opacity-40"
                                        aria-label="Previous page"
                                    >
                                        <ChevronLeft
                                            size={18}
                                        />
                                    </button>

                                    {/* PAGE NUMBERS */}

                                    {pageNumbers.map(
                                        (page, index) => {
                                            if (
                                                page === "..."
                                            ) {
                                                return (
                                                    <span
                                                        key={`dots-${index}`}
                                                        className="flex h-10 w-8 items-center justify-center text-sm text-slate-400"
                                                    >
                                                        ...
                                                    </span>
                                                );
                                            }

                                            const isActive =
                                                page ===
                                                currentPage;

                                            return (
                                                <button
                                                    key={page}
                                                    type="button"
                                                    onClick={() =>
                                                        handlePageChange(
                                                            page
                                                        )
                                                    }
                                                    className={`inline-flex h-10 min-w-10 items-center cursor-pointer justify-center rounded-lg border px-3 text-sm font-medium transition-all duration-200 ${isActive ? "border-[#005c2d] bg-[#016630] text-white shadow-sm" : "border-slate-300 bg-white text-slate-600 hover:border-[#4D8B4F] hover:text-[#4D8B4F]"}`}
                                                >
                                                    {page}
                                                </button>
                                            );
                                        }
                                    )}

                                    {/* NEXT */}

                                    <button
                                        type="button"
                                        onClick={handleNext}
                                        disabled={!canGoNext}
                                        className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-slate-300 bg-white text-slate-600 transition-all duration-200 hover:border-[#4D8B4F] hover:text-[#4D8B4F] disabled:cursor-not-allowed disabled:opacity-40"
                                        aria-label="Next page"
                                    >
                                        <ChevronRight
                                            size={18}
                                        />
                                    </button>
                                </div>
                            </div>
                        )}
                </div>
            </main>
            </div>
            {apiError && (
                <ApiErrorModal
                    title={apiError.title}
                    message={apiError.message}
                    onRetry={retryJobFetch}
                    onClose={() => {
                        setApiError(null);
                        setShowErrorFallback(Boolean(error));
                    }}
                />
            )}
        </>
    );
};

export default JobOpening;