import { useParams } from "react-router-dom";
import { useCallback, useEffect, useRef, useState } from "react";
import axios from "axios";
import { FiDownload, FiEye, FiUpload, FiEdit, FiLoader } from "react-icons/fi";
import { API_BASE_URL } from "../api/axios";
import ApiErrorModal from "../container/ApiErrorModal";
import { getApiErrorMessage } from "../utils/apiErrorHandler";
import { getAccessToken } from "../services/authSession";

const BASE_URL = API_BASE_URL;

function MyProfilePage() {
  const { employee_id } = useParams();
  const [employee, setEmployee] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const [profilePreview, setProfilePreview] = useState(null);
  const [profileUrl, setProfileUrl] = useState(null);
  const [profileFile, setProfileFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [popup, setPopup] = useState({
    show: false,
    message: "",
    type: "",
    onConfirm: null
  });
  const [apiError, setApiError] = useState(null);
  const [employeeLoadError, setEmployeeLoadError] = useState("");
  const [documentsError, setDocumentsError] = useState("");
  const [profilePhotoError, setProfilePhotoError] = useState("");
  const [profilePhotoLoading, setProfilePhotoLoading] = useState(true);
  const pendingRequests = useRef(0);

  const getAuthHeaders = useCallback(() => {
    const token = getAccessToken();
    return {
      headers: {
        Authorization: token ? `Bearer ${token}` : "",
      },
    };
  }, []);

  // Keep the loader active while any parallel request is still running.
  const startLoading = useCallback(() => {
    pendingRequests.current += 1;
    setLoading(true);
  }, []);

  const stopLoading = useCallback(() => {
    pendingRequests.current = Math.max(0, pendingRequests.current - 1);
    if (pendingRequests.current === 0) {
      setLoading(false);
    }
  }, []);

  // Keep the existing session-expired flow for every 401 response.
  const handleUnauthorized = useCallback((error) => {
    if (error?.response?.status === 401) {
      window.dispatchEvent(new Event("session-expired"));
    }
  }, []);
  // FETCH EMPLOYEE data
  const fetchEmployee = useCallback(async () => {
    if (!employee_id) return;

    startLoading();
    setEmployeeLoadError("");

    try {
      const res = await axios.get(
        `${BASE_URL}/admin/users/${employee_id}`,
        getAuthHeaders()
      );

      const data = res.data?.data ?? res.data;

      if (!data || data?.detail) {
        throw new Error(
          typeof data?.detail === "string"
            ? data.detail
            : "Employee profile not found."
        );
      }

      setEmployee(data);
    } catch (err) {
      handleUnauthorized(err);

      const responseMessage =
        err?.response?.data?.detail ||
        err?.response?.data?.message;
      const message =
        (typeof responseMessage === "string" && responseMessage.trim()) ||
        (err?.response?.status === 404
          ? "Employee profile not found."
          : !err?.response && !err?.request && err?.message
            ? err.message
            : getApiErrorMessage(
                err,
                "Unable to load employee profile. Please try again."
              ));

      setEmployee(null);
      setEmployeeLoadError(message);
      setApiError({
        title: err?.response?.status === 404
          ? "Profile Not Found"
          : "Unable to Load Profile",
        message,
        retryAction: "employee"
      });
    } finally {
      stopLoading();
    }
  }, [employee_id, getAuthHeaders, handleUnauthorized, startLoading, stopLoading]);

  useEffect(() => {
    if (employee_id) fetchEmployee();
  }, [employee_id, fetchEmployee]);

  // FETCH DOCUMENTS
  const fetchDocuments = useCallback(async () => {
    if (!employee_id) return;

    startLoading();
    setDocumentsError("");

    try {
      const res = await axios.get(
        `${BASE_URL}/documents/employees/${employee_id}/documents`,
        getAuthHeaders()
      );
      const nextDocuments = res.data?.documents || [];
      setDocuments(Array.isArray(nextDocuments) ? nextDocuments : []);
    } catch (err) {
      handleUnauthorized(err);
      setDocuments([]);
      setDocumentsError(
        getApiErrorMessage(err, "Unable to load documents. Please try again.")
      );
    } finally {
      stopLoading();
    }
  }, [employee_id, getAuthHeaders, handleUnauthorized, startLoading, stopLoading]);

  useEffect(() => {
    if (employee_id) fetchDocuments();
  }, [employee_id, fetchDocuments]);

  // Fetch the profile photo; the initials remain visible if this request fails.
  const fetchProfilePhoto = useCallback(async () => {
    if (!employee_id) return;

    startLoading();
    setProfilePhotoLoading(true);
    setProfilePhotoError("");

    try {
      const res = await axios.get(
        `${BASE_URL}/documents/employees/${employee_id}/profile-picture-view`,
        {
          responseType: "blob",
          headers: {
            Authorization: `Bearer ${getAccessToken()}`,
          },
        }
      );
      const url = URL.createObjectURL(res.data);
      setProfileUrl(url);
      setProfilePhotoError("");
    } catch (err) {
      handleUnauthorized(err);
      setProfileUrl("");
      setProfilePhotoError(
        getApiErrorMessage(err, "Profile photo unavailable. Please try again.")
      );
    } finally {
      setProfilePhotoLoading(false);
      stopLoading();
    }
  }, [employee_id, handleUnauthorized, startLoading, stopLoading]);

  useEffect(() => {
    if (employee_id) {
      fetchProfilePhoto();
    }
  }, [employee_id, fetchProfilePhoto]);

  // VIEW DOCUMENT
  const handleView = async (doc) => {
    startLoading();

    try {
      const res = await axios.get(
        `${BASE_URL}/documents/files/view`,
        {
          params: { file_id: doc.file_id },
          headers: {
            Authorization: `Bearer ${getAccessToken()}`,
          },
        }
      );
      const viewUrl = res.data?.view_url;

      if (!viewUrl) {
        throw new Error("Document view link is unavailable.");
      }

      window.open(viewUrl, "_blank");
      setPopup({
        show: true,
        message: "Document opened in new tab",
        type: "success"
      });
      await fetchDocuments();
    } catch (err) {
      handleUnauthorized(err);
      setApiError({
        title: "Unable to Open Document",
        message: getApiErrorMessage(err, "Failed to open document. Please try again."),
        retryAction: "viewDocument",
        document: doc
      });
    } finally {
      stopLoading();
    }
  };

  // DOWNLOAD DOCUMENT
  const handleDownload = async (doc) => {
    startLoading();

    try {
      const res = await axios.get(
        `${BASE_URL}/documents/files/download`,
        {
          params: { file_id: doc.file_id },
          headers: {
            Authorization: `Bearer ${getAccessToken()}`,
          }
        }
      );
      const downloadUrl = res.data?.download_url;

      if (!downloadUrl) {
        throw new Error("Document download link is unavailable.");
      }

      const link = document.createElement("a");
      link.href = downloadUrl;
      link.setAttribute("download", doc.original_name);

      document.body.appendChild(link);
      link.click();
      link.remove();
      setPopup({
        show: true,
        message: "Download started",
        type: "success"
      });
      await fetchDocuments();
    } catch (err) {
      handleUnauthorized(err);
      setApiError({
        title: "Unable to Download Document",
        message: getApiErrorMessage(err, "Failed to download document. Please try again."),
        retryAction: "downloadDocument",
        document: doc
      });
    } finally {
      stopLoading();
    }
  };

  const handleProfileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const allowed = ["png", "jpg", "jpeg"];
    const ext = file.name.split(".").pop().toLowerCase();

    if (!allowed.includes(ext)) {
      setPopup({
        show: true,
        message: "Invalid file type",
        type: "error"
      });
      return;
    }

    setProfileFile(file);
    setProfilePreview(URL.createObjectURL(file));
  };

  const profileImage = profileFile
    ? profilePreview
    : profileUrl;

  const initials = `${employee?.first_name?.charAt(0) || ""}${employee?.last_name?.charAt(0) || ""}`.toUpperCase();

  /* UPLOAD PROFILE PHOTO */
  const handleUploadProfile = async () => {
    if (!profileFile) {
      setPopup({
        show: true,
        message: "Please select an image",
        type: "error"
      });
      return;
    }

    startLoading();

    try {
      const formData = new FormData();
      formData.append("file", profileFile);

      await axios.post(
        `${BASE_URL}/documents/employees/${employee_id}/profile-picture`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${getAccessToken()}`,
          },
        }
      );

      setPopup({
        show: true,
        message: "Profile photo uploaded successfully",
        type: "success"
      });

      setShowPhotoModal(false);
      setProfilePreview("");
      setProfileFile(null);
      await fetchProfilePhoto();
    } catch (err) {
      handleUnauthorized(err);
      setApiError({
        title: "Profile Photo Upload Failed",
        message: getApiErrorMessage(err, "Failed to upload profile photo. Please try again."),
        retryAction: "uploadProfile"
      });
    } finally {
      stopLoading();
    }
  };

  /* DELETE PROFILE PHOTO */
  const handleDeleteProfile = async () => {
    startLoading();

    try {
      await axios.delete(
        `${BASE_URL}/documents/employees/${employee_id}/profile-picture`,
        {
          ...getAuthHeaders(),
          params: { gcs_path: profileUrl }
        }
      );
      setPopup({
        show: true,
        message: "Profile photo deleted successfully",
        type: "success"
      });
      setProfileUrl(null);
      setShowPhotoModal(false);
      await fetchProfilePhoto();
    } catch (err) {
      handleUnauthorized(err);
      setApiError({
        title: "Profile Photo Delete Failed",
        message: getApiErrorMessage(err, "Failed to delete profile photo. Please try again."),
        retryAction: "deleteProfile"
      });
    } finally {
      stopLoading();
    }
  };

  const handleApiErrorRetry = () => {
    const retryAction = apiError?.retryAction;
    const document = apiError?.document;
    setApiError(null);

    if (retryAction === "employee") fetchEmployee();
    if (retryAction === "viewDocument" && document) handleView(document);
    if (retryAction === "downloadDocument" && document) handleDownload(document);
    if (retryAction === "uploadProfile") handleUploadProfile();
    if (retryAction === "deleteProfile") handleDeleteProfile();
  };

  return (
    <>
      {apiError && (
        <ApiErrorModal
          title={apiError.title}
          message={apiError.message}
          onRetry={apiError.retryAction ? handleApiErrorRetry : undefined}
          onClose={() => setApiError(null)}
        />
      )}

      {loading && (
        <div className="fixed inset-0 bg-black/40 z-9999 flex items-center justify-center">

          <div className="p-6 flex flex-col items-center gap-3">

            <FiLoader className="animate-spin text-4xl text-green-700" />

            <p className="text-gray-700 font-medium">
              Please wait...
            </p>

          </div>
        </div>
      )}
      <div className="p-6 bg-white min-h-screen">
        {!employee ? (
          <div className="flex min-h-[55vh] items-center justify-center px-4">
            {employeeLoadError ? (
              !apiError && <div
                role="alert"
                className="w-full max-w-md rounded-2xl border border-red-200 bg-red-50 p-8 text-center shadow-sm"
              >
                <h2 className="text-lg font-semibold text-red-600">
                  Profile details unavailable
                </h2>
                <p className="mt-2 text-sm leading-6 text-red-600">
                  {employeeLoadError}
                </p>
                <button
                  type="button"
                  onClick={fetchEmployee}
                  className="mt-5 rounded-lg bg-green-800 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-green-700"
                >
                  Try Again
                </button>
              </div>
            ) : (
              <p className="text-sm text-gray-500">Loading profile details...</p>
            )}
          </div>
        ) : (
          <>
        {/* HEADER */}
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6">

          {/* PROFILE IMAGE */}
          <div className="relative">

            {profileImage ? (
              <img
                src={profileImage}
                alt="Employee profile"
                onError={() => {
                  if (!profileFile) {
                    setProfileUrl("");
                    setProfilePhotoError("Unable to display the profile photo.");
                  }
                }}
                className="w-24 h-24 sm:w-28 sm:h-28 rounded-full object-cover shadow"
              />
            ) : (
              <div
                className="
                  w-24 h-24 sm:w-28 sm:h-28
                  rounded-full bg-gray-100 text-black-600
                  flex items-center justify-center
                  text-4xl font-bold
                  shadow
                "
              >
                {initials}
              </div>
            )}

            <button
              onClick={() => setShowPhotoModal(true)}
              className="absolute bottom-0 right-0 bg-white p-3 rounded-full shadow cursor-pointer"
            >
              {profileUrl ? <FiEdit /> : <FiUpload />}
            </button>

            {profilePhotoError && !profilePhotoLoading && !profileImage && (
              <button
                type="button"
                onClick={fetchProfilePhoto}
                className="mt-2 block max-w-[140px] text-xs font-medium text-red-600 underline underline-offset-2"
              >
                Photo unavailable. Retry
              </button>
            )}
          </div>

          {/* TEXT */}
          <div className="text-center sm:text-left">
            <h1 className="text-2xl sm:text-4xl font-bold mt-5">
              {employee?.first_name} {employee?.last_name}
            </h1>

            <p className="text-sm sm:text-lg text-gray-600 mt-1">
              {employee?.designation}
            </p>
          </div>
        </div>

        {/* CARDS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
          <div className="bg-white p-4 rounded-xl shadow-sm">
            <p className="text-xs text-gray-400">EMPLOYEE ID</p>
            <p className="font-semibold">{employee?.employee_id || "No Employee ID"}</p>
          </div>

          <div className="bg-white p-4 rounded-xl shadow-sm">
            <p className="text-xs text-gray-400">EMAIL</p>
            <p className="font-semibold break-all">{employee?.email || "No Email"}</p>
          </div>

          <div className="bg-white p-4 rounded-xl shadow-sm">
            <p className="text-xs text-gray-400">MOBILE</p>
            <p className="font-semibold">{employee?.mobile || "No Mobile"}</p>
          </div>

          <div className="bg-white p-4 rounded-xl shadow-sm">
            <p className="text-xs text-gray-400">AADHAAR NUMBER </p>
            <p className="font-semibold">{employee?.aadhaar_number || "No Aadhaar Number"}</p>
          </div>

          <div className="bg-white p-4 rounded-xl shadow-sm">
            <p className="text-xs text-gray-400">ROLE</p>
            <p className="font-semibold">
              {employee?.role
                ? employee.role.charAt(0).toUpperCase() +
                employee.role.slice(1).toLowerCase()
                : "No Role"}
            </p>
          </div>

          <div className="bg-white p-4 rounded-xl shadow-sm">
            <p className="text-xs text-gray-400">LOCATION</p>
            <p className="font-semibold break-all">{employee?.location || "No Location"}</p>
          </div>

          <div className="bg-white p-4 rounded-xl shadow-sm">
            <p className="text-xs text-gray-400">REPORTING TO EMPLOYEE</p>
            <p className="font-semibold">{employee?.reporting_to
              ? `${employee.reporting_to} - ${employee.reporting_to_name}`
              : "No Reporting Manager"}</p>
          </div>

          <div className="bg-white p-4 rounded-xl shadow-sm">
            <p className="text-xs text-gray-400">START DATE</p>
            <p className="font-semibold">{employee?.start_date || "No Start Date"}</p>
          </div>

          <div className="bg-white p-4 rounded-xl shadow-sm">
            <p className="text-xs text-gray-400">END DATE</p>
            <p className="font-semibold">{employee?.end_date ? employee?.end_date : "Currently Working"}</p>
          </div>
        </div>

        {/* DOCUMENTS */}
        <div className="mt-8 bg-white rounded-xl shadow-sm overflow-hidden">

          <div className="p-4 sm:p-6 bg-gray-100">
            <div>
              <h2 className="text-lg font-semibold">
                Documents
              </h2>
            </div>
          </div>

          {documentsError ? (
            <div className="p-6 text-gray-500" role="status">
              <p>{documentsError}</p>
              <button
                type="button"
                onClick={fetchDocuments}
                className="mt-3 rounded-lg bg-green-800 px-4 py-2 text-white hover:bg-green-700"
              >
                Try Again
              </button>
            </div>
          ) : documents.length ? (
            documents.map((doc, i) => {
              const fileName = doc.original_name || "document";
              const fileType = fileName.split(".").pop().toUpperCase();

              return (
                <div
                  key={i}
                  className="flex items-center justify-between px-6 py-4 border-b border-gray-200 hover:bg-gray-50"
                >
                  <div className="flex items-center gap-4">

                    {/* FILE ICON */}
                    <div className="w-10 h-10 bg-green-800 text-green-800 flex items-center justify-center rounded-lg">
                      📄
                    </div>

                    {/* FILE INFO */}
                    <div>
                      <p className="text-sm font-semibold text-gray-800">
                        {fileName}
                      </p>

                      <p className="text-sm text-gray-400 flex items-center gap-2">
                        {fileType} • {doc.created_at
                          ? new Date(doc.created_at).toLocaleDateString()
                          : "Recently added"}
                      </p>
                    </div>
                  </div>
                  {/*right side actions */}
                  <div className="flex items-center gap-4 text-gray-500">
                    <FiEye
                      className="cursor-pointer hover:text-green-700"
                      onClick={() => handleView(doc)} />
                    <FiDownload
                      className="cursor-pointer hover:text-green-700"
                      onClick={() => handleDownload(doc)} />
                  </div>
                </div>
              );
            })
          ) : (
            <p className="p-6 text-gray-400">No documents available</p>
          )}
        </div>

        {/* PROFILE PHOTO MODAL */}
        {showPhotoModal && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">

            <div className="bg-white p-6 rounded-2xl w-96 shadow-xl relative">
              <h2 className="text-lg font-semibold mb-4 text-center">
                Upload Profile Photo
              </h2>

              {/* CLICK AREA */}
              <div className="border-2 border-dashed border-gray-300 p-6 rounded-xl text-center cursor-pointer hover:bg-gray-50">
                <input
                  type="file"
                  id="profileUpload"
                  className="hidden"
                  onChange={handleProfileChange}
                />

                <label htmlFor="profileUpload" className="cursor-pointer">
                  <p className="text-gray-500">Click here to add photo</p>
                  <p className="text-xs text-gray-400 mt-1">
                    JPG, PNG, JPEG, DOC supported
                  </p>
                </label>
              </div>

              {/* PREVIEW */}
              {profilePreview && (
                <img
                  src={profilePreview}
                  className="w-24 h-24 rounded-full mx-auto mt-4 object-cover"
                />
              )}

              {/* ACTIONS */}
              <div className="flex justify-between mt-6">

                {/* DELETE BUTTON */}
                {profileUrl && (
                  <button
                    onClick={handleDeleteProfile}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg cursor-pointer"
                  >
                    Delete
                  </button>
                )}

                <div className="flex gap-2 ml-auto">
                  <button
                    onClick={() => setShowPhotoModal(false)}
                    className="px-4 py-2 bg-gray-200 rounded-lg cursor-pointer"
                  >
                    Cancel
                  </button>

                  <button
                    onClick={handleUploadProfile}
                    className="px-4 py-2 bg-green-800 text-white rounded-lg cursor-pointer"
                  >
                    Upload
                  </button>
                </div>
              </div>

            </div>
          </div>
        )}

        {popup.show && (
          <div className="fixed inset-0 flex items-center justify-center bg-black/40 bg-opacity-40 z-50 px-2">
            <div className="bg-white rounded-xl shadow-lg p-6 w-80 text-center">
              <p className={`text-lg font-semibold mb-4
                  ${popup.type === "success" && "text-green-600"}
                  ${popup.type === "error" && "text-red-600"}
                  ${popup.type === "confirm" && "text-gray-800"}
              `}>
                {popup.message}
              </p>
              {/* BUTTONS */}
              <div className="flex justify-center gap-3">
                {popup.type === "confirm" ? (
                  <>
                    <button
                      onClick={async () => {
                        await popup.onConfirm();
                      }}
                      className="px-4 py-2 bg-red-600 text-white rounded cursor-pointer"
                    >
                      Yes
                    </button>

                    <button
                      onClick={() => setPopup({ show: false })}
                      className="px-4 py-2 bg-gray-300 rounded cursor-pointer"
                    >
                      Cancel
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => setPopup({ show: false })}
                    className="px-4 py-2 bg-green-800 text-white rounded-2xl hover:bg-green-700 cursor-pointer"
                  >
                    OK
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

          </>
        )}
      </div>
    </>
  );
}

export default MyProfilePage;