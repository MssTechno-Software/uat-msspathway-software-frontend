import { useParams } from "react-router-dom";
import { useCallback, useEffect, useState } from "react";
import axios from "axios";
import { FiDownload, FiEye, FiEdit, FiTrash2, FiUpload, FiLink, FiLoader } from "react-icons/fi";
import AddClient from "./AddClient";
import ApiErrorModal from "../container/ApiErrorModal";
import { API_BASE_URL } from "../api/axios";
import { getApiErrorMessage } from "../utils/apiErrorHandler";
import { getAccessToken } from "../services/authSession";

const BASE_URL = API_BASE_URL;

const getClientRequestErrorMessage = (error, fallbackMessage) => {
  if (error?.response?.status === 401) {
    window.dispatchEvent(new Event("session-expired"));
  }

  const responseData = error?.response?.data;
  const detail = responseData?.detail;

  if (typeof detail === "string" && detail.trim()) {
    return detail;
  }

  if (Array.isArray(detail)) {
    const messages = detail
      .map((item) => (typeof item === "string" ? item : item?.msg))
      .filter(Boolean);

    if (messages.length > 0) {
      return messages.join(", ");
    }
  }

  if (typeof responseData?.message === "string" && responseData.message.trim()) {
    return responseData.message;
  }

  if (!error?.response && !error?.request && error?.message) {
    return error.message;
  }

  return getApiErrorMessage(error, fallbackMessage);
};

function ClientProfile() {
  const { client_id } = useParams();
  const [client, setClient] = useState(null);
  const [showEdit, setShowEdit] = useState(false);
  const [documents, setDocuments] = useState([]);
  const [showDocModal, setShowDocModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [linkName, setLinkName] = useState("");
  const [linkURL, setLinkURL] = useState("");
  const [links, setLinks] = useState([]);
  const [previewURL, setPreviewURL] = useState("");
  const [profileFile, setProfileFile] = useState(null);
  const [profilePreview, setProfilePreview] = useState("");
  const [profileUrl, setProfileUrl] = useState("");
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  // Keep action loading separate from the independent profile fetches.
  const [loading, setLoading] = useState(false);
  const [clientLoading, setClientLoading] = useState(true);
  const [clientError, setClientError] = useState("");
  const [documentsLoading, setDocumentsLoading] = useState(true);
  const [documentsError, setDocumentsError] = useState("");
  const [linksLoading, setLinksLoading] = useState(true);
  const [linksError, setLinksError] = useState("");
  const [profilePhotoLoading, setProfilePhotoLoading] = useState(true);
  const [profilePhotoError, setProfilePhotoError] = useState("");
  const [apiError, setApiError] = useState(null);
  const [popup, setPopup] = useState({
    show: false,
    message: "",
    type: "",
    onConfirm: null
  });
  const getAuthHeaders = useCallback(() => {
    const token = getAccessToken();
    return {
      headers: {
        Authorization: token ? `Bearer ${token}` : "",
      },
    };
  }, []);

  // Load core client details; a failure here gets a main-page fallback.
  const fetchClient = useCallback(async () => {
    setClientLoading(true);
    setClientError("");

    try {
      const res = await axios.get(
        `${BASE_URL}/clients/clients/${client_id}`,
        getAuthHeaders()
      );
      setClient(res.data);
    } catch (err) {
      const message = getClientRequestErrorMessage(
        err,
        "Unable to load client details."
      );
      setClientError(message);
      // Show the shared API modal first; the inline fallback appears after it is closed.
      setApiError((current) => current || {
        title: "Unable to Load Client Details",
        message,
        retryAction: "client",
      });
    } finally {
      setClientLoading(false);
    }
  }, [client_id, getAuthHeaders]);

  useEffect(() => {
    if (client_id) {
      fetchClient();
    } else {
      setClientLoading(false);
      setClientError("Client ID is missing.");
    }
  }, [client_id, fetchClient]);

  // Load documents independently so a document API failure does not hide the profile.
  const fetchDocuments = useCallback(async () => {
    setDocumentsLoading(true);
    setDocumentsError("");

    try {
      const res = await axios.get(
        `${BASE_URL}/documents/clients/${client_id}/documents`,
        getAuthHeaders()
      );
      setDocuments(Array.isArray(res.data?.documents) ? res.data.documents : []);
    } catch (err) {
      const message = getClientRequestErrorMessage(
        err,
        "Unable to load client documents."
      );
      // A documents request can fail independently; show the fallback in this section.
      setDocumentsError(message);
    } finally {
      setDocumentsLoading(false);
    }
  }, [client_id, getAuthHeaders]);

  useEffect(() => {
    if (client_id) {
      fetchDocuments();
    } else {
      setDocumentsLoading(false);
    }
  }, [client_id, fetchDocuments]);

  // Load source links independently from the documents and main profile.
  const fetchLinks = useCallback(async () => {
    setLinksLoading(true);
    setLinksError("");

    try {
      const res = await axios.get(
        `${BASE_URL}/clients/clients/${client_id}/source-links`,
        getAuthHeaders()
      );
      setLinks(Array.isArray(res.data?.source_links) ? res.data.source_links : []);
    } catch (err) {
      const message = getClientRequestErrorMessage(
        err,
        "Unable to load client links."
      );
      // Keep link-loading errors in the links section instead of opening the main modal.
      setLinksError(message);
    } finally {
      setLinksLoading(false);
    }
  }, [client_id, getAuthHeaders]);

  useEffect(() => {
    if (client_id) {
      fetchLinks();
    } else {
      setLinksLoading(false);
    }
  }, [client_id, fetchLinks]);

  // Load the profile photo separately; initials remain available as a fallback.
  const fetchProfilePhotoView = useCallback(async () => {
    setProfilePhotoLoading(true);
    setProfilePhotoError("");

    try {
      const res = await axios.get(
        `${BASE_URL}/documents/clients/${client_id}/profile-picture-view`,
        {
          headers: {
            Authorization: `Bearer ${getAccessToken()}`,
          },
          responseType: "blob",
        }
      );
      setProfileUrl(URL.createObjectURL(res.data));
    } catch (err) {
      const message = getClientRequestErrorMessage(
        err,
        "Unable to load the profile photo."
      );
      // The avatar initials and local retry control are the fallback for photo-load errors.
      setProfilePhotoError(message);
    } finally {
      setProfilePhotoLoading(false);
    }
  }, [client_id]);

  useEffect(() => {
    if (client_id) {
      fetchProfilePhotoView();
    } else {
      setProfilePhotoLoading(false);
    }
  }, [client_id, fetchProfilePhotoView]);

  // Release temporary preview URLs when a file changes or the page unmounts.
  useEffect(() => {
    return () => {
      if (previewURL?.startsWith("blob:")) {
        URL.revokeObjectURL(previewURL);
      }
    };
  }, [previewURL]);

  useEffect(() => {
    return () => {
      if (profilePreview?.startsWith("blob:")) {
        URL.revokeObjectURL(profilePreview);
      }
    };
  }, [profilePreview]);

  useEffect(() => {
    return () => {
      if (profileUrl?.startsWith("blob:")) {
        URL.revokeObjectURL(profileUrl);
      }
    };
  }, [profileUrl]);

  const handleApiErrorRetry = () => {
    const retryAction = apiError?.retryAction;
    setApiError(null);

    if (retryAction === "client") fetchClient();
    if (retryAction === "documents") fetchDocuments();
    if (retryAction === "links") fetchLinks();
    if (retryAction === "photo") fetchProfilePhotoView();
  };

  const apiErrorModal = apiError ? (
    <ApiErrorModal
      title={apiError.title}
      message={apiError.message}
      onRetry={apiError.retryAction ? handleApiErrorRetry : undefined}
      onClose={() => setApiError(null)}
    />
  ) : null;

  if (!client) {
    return (
      <>
        <div className="min-h-screen bg-white p-4 sm:p-6">
          {clientLoading ? (
            <div className="flex min-h-[240px] flex-col items-center justify-center gap-3 text-gray-600">
              <FiLoader className="animate-spin text-3xl text-green-800" />
              <p className="text-sm font-medium">Loading client details...</p>
            </div>
          ) : clientError ? (
            !apiError && (
              <div className="flex min-h-[55vh] items-center justify-center px-4">
                <div
                  role="alert"
                  className="w-full max-w-md rounded-2xl border border-red-200 bg-red-50 p-8 text-center shadow-sm"
                >
                  <h2 className="text-lg font-semibold text-red-600">
                    Profile details unavailable
                  </h2>
                  <p className="mt-2 text-sm leading-6 text-red-600">
                    {clientError}
                  </p>
                  <button
                    type="button"
                    onClick={fetchClient}
                    className="mt-5 rounded-lg bg-green-800 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-green-700"
                  >
                    Try Again
                  </button>
                </div>
              </div>
            )
          ) : null}
        </div>
        {apiErrorModal}
      </>
    );
  }

  /*update client*/
  const handleUpdate = async (updatedData) => {
    try {
      setLoading(true);
      // REQUIRED VALIDATIONS
      if (!updatedData.name?.trim()) {
        return setPopup({
          show: true,
          message: "Name is required",
          type: "error"
        });
      }

      if (!updatedData.mobile?.trim()) {
        return setPopup({
          show: true,
          message: "Mobile number is required",
          type: "error"
        });
      }

      if (!/^(\+91\d{10}|\+1\d{10})$/.test(updatedData.mobile)) {
        return setPopup({
          show: true,
          message: "Enter a valid Indian (+91) or Canadian (+1) mobile number",
          type: "error"
        });
      }

      if (!updatedData.email?.trim()) {
        return setPopup({
          show: true,
          message: "Email is required",
          type: "error"
        });
      }

      if (
        !/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(
          updatedData.email
        )
      ) {
        return setPopup({
          show: true,
          message: "Enter valid email",
          type: "error"
        });
      }

      if (!updatedData.password) {
        return setPopup({
          show: true,
          message: "Password is required",
          type: "error"
        });
      }

      if (!updatedData.tech?.length) {
        return setPopup({
          show: true,
          message: "Technology is required",
          type: "error"
        });
      }

      if (!updatedData.status) {
        return setPopup({
          show: true,
          message: "Status is required",
          type: "error"
        });
      }

      if (!updatedData.employeeId) {
        return setPopup({
          show: true,
          message: "Employee ID is required",
          type: "error"
        });
      }

      if (!updatedData.role?.trim()) {
        return setPopup({
          show: true,
          message: "Role is required",
          type: "error"
        });
      }

      if (!updatedData.aadhaar?.trim()) {
        return setPopup({
          show: true,
          message: "Aadhaar number is required",
          type: "error"
        });
      }

      if (
        !/^\d{12}$/.test(
          updatedData.aadhaar.replace(/\s/g, "")
        )
      ) {
        return setPopup({
          show: true,
          message: "Aadhaar must contain 12 digits",
          type: "error"
        });
      }

      if (!updatedData.location?.trim()) {
        return setPopup({
          show: true,
          message: "Location is required",
          type: "error"
        });
      }

      if (!updatedData.startDate) {
        return setPopup({
          show: true,
          message: "Start date is required",
          type: "error"
        });
      }
      const statusMap = {
        Active: "A",
        Completed: "C",
        Pause: "P",
        Terminate: "T"
      };
      const formData = new FormData();

      formData.append("client_name", updatedData.name);
      formData.append("mobile", updatedData.mobile);
      formData.append("email", updatedData.email);
      formData.append("password", updatedData.password || "");
      formData.append("technology", updatedData.tech.join(","));
      formData.append("status", statusMap[updatedData.status]);
      formData.append("employee_id", String(updatedData.employeeId));
      formData.append("professional_role", updatedData.role);
      formData.append("aadhaar_number", updatedData.aadhaar);
      formData.append("location", updatedData.location);
      formData.append("start_date", updatedData.startDate);
      formData.append(
        "end_date",
        updatedData.endDate || ""
      );
      formData.append("notes", updatedData.notes);


      await axios.put(
        `${BASE_URL}/clients/update-client/${client_id}`,
        formData,
        {
          ...getAuthHeaders(),
          headers: {
            ...getAuthHeaders().headers,
            "Content-Type": "multipart/form-data"
          }
        }
      );

      await fetchClient();

      setPopup({
        show: true,
        message: "Client updated successfully",
        type: "success"
      });

      setShowEdit(false);

    } catch (error) {
      setApiError({
        title: "Unable to Update Client",
        message: getClientRequestErrorMessage(error, "Update failed."),
      });
    } finally {
      setLoading(false);
    }
  };

  /*upload document*/
  const handleUploadDocument = async () => {
    if (!selectedFile) {
      return setPopup({
        show: true,
        message: "Please select a file",
        type: "error"
      });
    }

    try {
      setLoading(true);
      const formData = new FormData();
      formData.append("files", selectedFile);
      formData.append("client_id", client_id);


      await axios.post(
        `${BASE_URL}/documents/clients/${client_id}/upload-documents`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${getAccessToken()}`
          }
        }
      );

      setPopup({
        show: true,
        message: "Document uploaded successfully",
        type: "success"
      });
      setShowDocModal(false);
      setSelectedFile(null);
      setPreviewURL(null);
      fetchDocuments();

    } catch (err) {
      setApiError({
        title: "Document Upload Failed",
        message: getClientRequestErrorMessage(err, "Document upload failed."),
      });
    } finally {
      setLoading(false);
    }
  };

  /*view document*/
  const handleView = async (doc) => {
    try {
      setLoading(true);
      const res = await axios.get(
        `${BASE_URL}/documents/files/view`,
        {
          params: { file_id: doc.file_id },
          headers: {
            Authorization: `Bearer ${getAccessToken()}`,
          },
        }
      );
      const viewUrl = res.data.view_url;
      window.open(viewUrl, "_blank");
      setPopup({
        show: true,
        message: "Document opened in new tab",
        type: "success"
      });
      fetchDocuments();

    } catch (err) {
      setApiError({
        title: "Unable to Open Document",
        message: getClientRequestErrorMessage(err, "Failed to open document."),
      });
    } finally {
      setLoading(false);
    }
  };

  /*download document*/
  const handleDownload = async (doc) => {
    try {
      setLoading(true);
      const res = await axios.get(
        `${BASE_URL}/documents/files/download`,
        {
          params: { file_id: doc.file_id },
          headers: {
            Authorization: `Bearer ${getAccessToken()}`,
          },
        }
      );
      const downloadUrl = res.data.download_url;

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
      fetchDocuments();

    } catch (err) {
      setApiError({
        title: "Unable to Download Document",
        message: getClientRequestErrorMessage(err, "Failed to download document."),
      });
    } finally {
      setLoading(false);
    }
  };

  /*delete document*/
  const handleDelete = (doc) => {

    setPopup({
      show: true,
      message: "Are you sure you want to delete this document?",
      type: "confirm",
      onConfirm: async () => {
        try {
          setLoading(true);
          await axios.delete(
            `${BASE_URL}/documents/clients/${client_id}/documents`,
            {
              params: {
                file_id: doc.file_id
              },
              headers: {
                Authorization: `Bearer ${getAccessToken()}`
              }
            }
          );

          setPopup({
            show: true,
            message: "Document deleted successfully",
            type: "success"
          });
          fetchDocuments();

        } catch (err) {
          setApiError({
            title: "Unable to Delete Document",
            message: getClientRequestErrorMessage(err, "Document delete failed."),
          });
        } finally {
          setLoading(false);
        }
      }
    });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const allowed = ["pdf", "png", "jpg", "jpeg", "doc", "docx"];
    const ext = file.name.split(".").pop().toLowerCase();

    if (!allowed.includes(ext)) {
      setPopup({
        show: true,
        message: "Invalid file type",
        type: "error"
      });
      return;
    }

    setSelectedFile(file);

    if (file.type.startsWith("image")) {
      setPreviewURL(URL.createObjectURL(file));
    } else {
      setPreviewURL("");
    }
  };

  /*Add link*/
  const handleAddLink = async () => {
    if (!linkName || !linkURL) {
      return setPopup({
        show: true,
        message: "Please enter link name and URL",
        type: "error"
      });
    }

    try {
      setLoading(true);
      await axios.post(
        `${BASE_URL}/clients/clients/${client_id}/add-source-links`,
        {
          links: [
            {
              link: linkURL,
              link_type: linkName
            }
          ]
        },
        {
          headers: {
            Authorization: `Bearer ${getAccessToken()}`,
            "Content-Type": "application/json"
          }
        }
      );


      setPopup({
        show: true,
        message: "Link added successfully",
        type: "success"
      });

      setShowLinkModal(false);
      setLinkName("");
      setLinkURL("");
      fetchLinks();

    } catch (err) {
      setApiError({
        title: "Unable to Add Link",
        message: getClientRequestErrorMessage(err, "Failed to add link."),
      });
    } finally {
      setLoading(false);
    }
  };

  /*delete link*/
  const handleDeleteLink = async (linkUrl) => {
    setPopup({
      show: true,
      message: "Are you sure you want to delete this link?",
      type: "confirm",
      onConfirm: async () => {
        try {
          setLoading(true);
          await axios.delete(
            `${BASE_URL}/clients/clients/${client_id}/delete-source-link`,
            {
              ...getAuthHeaders(),
              params: {
                link: linkUrl,
              }
            });
          setPopup({
            show: true,
            message: "Link deleted successfully",
            type: "success"
          });

          fetchLinks();

        } catch (err) {
          setApiError({
            title: "Unable to Delete Link",
            message: getClientRequestErrorMessage(err, "Failed to delete link."),
          });
        } finally {
          setLoading(false);
        }
      }
    });
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

  const initials = `${client?.client_name
    ?.split(" ")[0]
    ?.charAt(0) || ""}${client?.client_name
      ?.split(" ")[1]
      ?.charAt(0) || ""}`.toUpperCase();

  /*add or update profile photo*/
  const handleUploadProfile = async () => {
    if (!profileFile) {
      setPopup({
        show: true,
        message: "Please select an image",
        type: "error"
      });
      return;
    }

    try {
      setLoading(true);
      const formData = new FormData();
      formData.append("file", profileFile);


      await axios.post(
        `${BASE_URL}/documents/clients/${client_id}/profile-picture`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${getAccessToken()}`,
          },
        }
      );

      setProfileFile(null);
      setProfilePreview("");
      await fetchProfilePhotoView();
      setShowPhotoModal(false);
      setPopup({
        show: true,
        message: "Profile photo uploaded successfully",
        type: "success"
      });

    } catch (err) {
      setApiError({
        title: "Profile Photo Upload Failed",
        message: getClientRequestErrorMessage(err, "Upload failed."),
      });
    } finally {
      setLoading(false);
    }
  };

  /*delete profile photo*/
  const handleDeleteProfile = async () => {
    try {
      setLoading(true);
      await axios.delete(
        `${BASE_URL}/documents/clients/${client_id}/profile-picture`,
        {
          ...getAuthHeaders(),
          params: { gcs_path: profileUrl }
        }
      );

      setProfileUrl("");
      setProfilePhotoError("");
      setPopup({
        show: true,
        message: "Profile photo deleted successfully",
        type: "success"
      });

      setShowPhotoModal(false);

    } catch (err) {
      setApiError({
        title: "Profile Photo Delete Failed",
        message: getClientRequestErrorMessage(err, "Profile photo delete failed."),
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 bg-white min-h-screen">
      {/* FULL SCREEN LOADER */}
      {loading && (
        <div className="fixed inset-0 bg-black/40 z-9999 flex items-center justify-center">

          <div className="p-6 flex flex-col items-center gap-3">

            <FiLoader className="animate-spin text-4xl text-green-800" />

            <p className="text-gray-800 font-medium">
              Please wait...
            </p>

          </div>
        </div>
      )}

      {/* HEADER */}
      <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start gap-6">

        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 text-center sm:text-left">

          {/* PROFILE IMAGE */}
          <div className="relative">

            {profileImage ? (
              <img
                src={profileImage}
                alt="Client profile"
                onError={() => {
                  setProfilePhotoError("Unable to display the profile photo.");
                  if (profileFile) {
                    setProfileFile(null);
                    setProfilePreview("");
                  } else {
                    setProfileUrl("");
                  }
                }}
                className="w-24 h-24 sm:w-28 sm:h-28 rounded-full object-cover shadow"
              />
            ) : (
              <div
                className="
                  w-24 h-24 sm:w-28 sm:h-28
                  rounded-full bg-gray-100 text-gray-600
                  flex items-center justify-center
                  text-4xl font-bold
                  shadow
                "
                aria-label="Client profile photo fallback"
              >
                {initials || "?"}
              </div>
            )}

            {profilePhotoLoading && (
              <div className="absolute inset-0 flex items-center justify-center rounded-full bg-white/70" aria-label="Loading profile photo">
                <FiLoader className="animate-spin text-2xl text-green-800" />
              </div>
            )}

            <button
              type="button"
              onClick={() => setShowPhotoModal(true)}
              className="absolute bottom-0 right-0 z-10 bg-white p-2 rounded-full shadow cursor-pointer"
              aria-label="Edit client profile photo"
            >
              {profileUrl ? <FiEdit /> : <FiUpload />}
            </button>

            {profilePhotoError && !profilePhotoLoading && !profileImage && (
              <button
                type="button"
                onClick={fetchProfilePhotoView}
                className="mt-2 block max-w-[140px] text-xs font-medium text-red-600 underline underline-offset-2"
              >
                Photo unavailable. Retry
              </button>
            )}

          </div>

          <div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-800">
              {client.client_name || "No Name"}
            </h1>

            <p className="text-base sm:text-lg font-bold mt-1">
              {client.professional_role || "No Role"}
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowEdit(true)}
          className="w-full sm:w-auto flex items-center justify-center gap-2 bg-green-800 hover:bg-green-700 text-white px-5 py-2 rounded-xl shadow-md cursor-pointer"
        >
          <FiEdit />
          Update Client
        </button>
      </div>

      {/* CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mt-6">

        <div className="bg-white p-4 rounded-xl shadow-sm min-w-0 overflow-hidden">
          <p className="text-xs text-gray-400">EMAIL</p>
          <p className="font-semibold break-all">
            {client.email || "No Email"}
          </p>
        </div>

        <div className="bg-white p-4 rounded-xl shadow-sm min-w-0 overflow-hidden">
          <p className="text-xs text-gray-400">MOBILE</p>
          <p className="font-semibold">
            {client.mobile || "No Mobile"}
          </p>
        </div>

        <div className="bg-white p-4 rounded-xl shadow-sm min-w-0 overflow-hidden">
          <p className="text-xs text-gray-400">AADHAAR NUMBER</p>
          <p className="font-semibold break-all">
            {client.aadhaar_number || "No AADHAR Number"}
          </p>
        </div>

        <div className="bg-white p-4 rounded-xl shadow-sm min-w-0 overflow-hidden">
          <p className="text-xs text-gray-400">LOCATION</p>
          <p className="font-semibold break-all">
            {client.location || "No Location"}
          </p>
        </div>

        <div className="bg-white p-4 rounded-xl shadow-sm min-w-0 overflow-hidden">
          <p className="text-xs text-gray-400">TECHNOLOGY STACKS</p>
          <p className="font-semibold break-all">
            {client.technology || "No Technology Stacks"}
          </p>
        </div>

        <div className="bg-white p-4 rounded-xl shadow-sm min-w-0 overflow-hidden">
          <p className="text-xs text-gray-400">ASSIGNED TO</p>
          <p className="font-semibold">
            {client.employee_id ? `${client.employee_id} - ${client.employee_name}` : "No Assigned Employee"}
          </p>
        </div>

        {/* START DATE */}
        <div className="bg-white p-4 rounded-xl shadow-sm">
          <p className="text-xs text-gray-400">START DATE</p>
          <p className="font-semibold">
            {client.start_date
              ? new Date(client.start_date).toLocaleDateString()
              : "No Start Date"}
          </p>
        </div>

        {/* END DATE */}
        <div className="bg-white p-4 rounded-xl shadow-sm">
          <p className="text-xs text-gray-400">END DATE</p>
          <p className="font-semibold">
            {client.end_date &&
              !isNaN(new Date(client.end_date))
              ? new Date(client.end_date).toLocaleDateString()
              : "Currently In Process"}
          </p>
        </div>
      </div>

      {/* DOCUMENTS */}
      <div className="mt-8 bg-white rounded-xl shadow-sm overflow-hidden">

        {/* HEADER */}
        <div className="p-4 sm:p-6 bg-gray-100 flex flex-col sm:flex-row justify-between sm:items-center gap-4">

          <div>
            <h2 className="text-lg font-semibold text-gray-800">
              Document Repository
            </h2>

            <p className="text-sm text-gray-400">
              Verified compliance documents and professional records
            </p>
          </div>

          <button
            onClick={() => setShowDocModal(true)}
            className="w-full sm:w-auto flex items-center justify-center gap-2 bg-green-800 hover:bg-green-700 text-white px-4 py-2 rounded-lg shadow-md cursor-pointer"
          >
            <FiUpload />
            Upload
          </button>
        </div>

        {documentsError && (
          <div className="p-6 text-gray-500" role="status">
            <p>{documentsError}</p>
            <button
              type="button"
              onClick={fetchDocuments}
              disabled={documentsLoading}
              className="mt-3 rounded-lg bg-green-800 px-4 py-2 text-white hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {documentsLoading ? "Retrying..." : "Try Again"}
            </button>
          </div>
        )}

        {documentsLoading ? (
          <div className="flex items-center justify-center gap-2 px-6 py-10 text-sm text-gray-500" role="status">
            <FiLoader className="animate-spin text-lg text-green-800" />
            Loading documents...
          </div>
        ) : documents.length > 0 ? (
          documents.map((doc, i) => {
            const fileName = doc.original_name || "document";
            const fileType = fileName.split(".").pop().toUpperCase();

            return (
              <div
                key={i}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-4 sm:px-6 py-4 border-b border-gray-100 last:border-none hover:bg-gray-50 transition"
              >

                {/* Left Side*/}
                <div className="flex items-start sm:items-center gap-4 w-full">

                  <div className="w-10 h-10 bg-green-800 text-green-800 flex items-center justify-center rounded-lg">
                    📄
                  </div>

                  <div>
                    <p className="text-sm font-semibold text-gray-800">
                      {fileName}
                    </p>

                    <p className="text-sm text-gray-400 flex flex-wrap items-center gap-2">
                      {fileType} •{" "}
                      {doc.created_at
                        ? new Date(doc.created_at).toLocaleDateString()
                        : "Recently added"}
                    </p>
                  </div>
                </div>

                {/* RIGHT */}
                <div className="flex items-center gap-4 text-gray-500 self-end sm:self-auto">

                  <FiEye
                    className="cursor-pointer hover:text-green-700"
                    onClick={() => handleView(doc)}
                  />

                  <FiDownload
                    className="cursor-pointer hover:text-green-700"
                    onClick={() => handleDownload(doc)}
                  />

                  <FiTrash2
                    className="cursor-pointer hover:text-green-700"
                    onClick={() => handleDelete(doc)}
                  />
                </div>
              </div>
            );
          })

        ) : documentsError ? null : (
          <p className="p-6 text-gray-400">No documents available</p>
        )}
      </div>

      {/* LINKS */}
      <div className="mt-8 bg-white rounded-xl shadow-sm overflow-hidden">

        {/* HEADER */}
        <div className="p-4 sm:p-6 bg-gray-100 flex flex-col sm:flex-row justify-between sm:items-center gap-4">

          <div>
            <h2 className="text-lg font-semibold text-gray-800">
              Important Links
            </h2>

            <p className="text-sm text-gray-400">
              External resources and client-related links
            </p>
          </div>

          <button
            onClick={() => setShowLinkModal(true)}
            className="w-full sm:w-auto flex items-center justify-center gap-2 bg-green-800 hover:bg-green-700 text-white px-4 py-2 rounded-lg shadow-md cursor-pointer"
          >
            <FiLink />
            Add Link
          </button>
        </div>

        {linksError && (
          <div className="p-6 text-gray-500" role="status">
            <p>{linksError}</p>
            <button
              type="button"
              onClick={fetchLinks}
              disabled={linksLoading}
              className="mt-3 rounded-lg bg-green-800 px-4 py-2 text-white hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {linksLoading ? "Retrying..." : "Try Again"}
            </button>
          </div>
        )}

        {linksLoading ? (
          <div className="flex items-center justify-center gap-2 px-6 py-10 text-sm text-gray-500" role="status">
            <FiLoader className="animate-spin text-lg text-green-800" />
            Loading links...
          </div>
        ) : links.length > 0 ? (
          links.map((link, i) => {
            let name = link.link_type || "Untitled";
            let url = link.link || "#";

            return (
              <div
                key={i}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-4 sm:px-6 py-4 border-b border-gray-100 last:border-none hover:bg-gray-50"
              >
                <div className="min-w-0 w-full">
                  <p
                    className="text-md font-semibold text-gray-800 break-all whitespace-normal"
                    title={name}
                  >
                    {name.length > 100 ? `${name.substring(0, 100)}...` : name}
                  </p>

                  <a
                    href={url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-sm text-green-700 underline break-all"
                  >
                    {url}
                  </a>
                </div>

                <div className="flex items-center gap-4 text-gray-500 self-end sm:self-auto">
                  <FiTrash2
                    className="cursor-pointer hover:text-green-700"
                    onClick={() => handleDeleteLink(link.link)}
                  />
                </div>
              </div>
            );
          })

        ) : linksError ? null : (
          <p className="p-6 text-gray-400">No links available</p>
        )}
      </div>

      {/* DOCUMENT MODAL */}
      {showDocModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 px-2">

          <div className="bg-white w-96 max-w-md rounded-2xl shadow-xl p-6 relative">

            <h2 className="text-xl font-semibold mb-4">
              Upload Document
            </h2>

            <div className="border-2 border-dashed border-gray-300 p-6 rounded-xl text-center cursor-pointer hover:bg-gray-50">
              <input
                type="file"
                onChange={handleFileChange}
                className="hidden"
                id="fileUpload"
              />

              <label htmlFor="fileUpload" className="cursor-pointer">
                <p className="text-gray-500">
                  Click to upload or drag file
                </p>

                <p className="text-xs text-gray-400 mt-1">
                  PDF, DOC, JPG, PNG, JPEG supported
                </p>
              </label>
            </div>

            {selectedFile && (
              <div className="mt-4">
                <p className="text-sm font-medium break-all">
                  {selectedFile.name}
                </p>

                {previewURL && (
                  <img
                    src={previewURL}
                    alt="preview"
                    className="w-20 h-20 mt-2 rounded object-cover"
                  />
                )}
              </div>
            )}

            <div className="flex flex-col sm:flex-row justify-end gap-3 mt-6">

              <button
                onClick={() => setShowDocModal(false)}
                className="px-4 py-2 bg-gray-200 rounded-lg cursor-pointer"
              >
                Cancel
              </button>

              <button
                onClick={handleUploadDocument}
                className="px-4 py-2 bg-green-800 text-white rounded-lg cursor-pointer"
              >
                Upload
              </button>
            </div>
          </div>
        </div>
      )}

      {showLinkModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">

          <div className="bg-white w-96 rounded-2xl shadow-xl p-6 relative">

            <h2 className="text-xl font-semibold mb-4 border-b border-gray-200 pb-3 cursor-pointer">
              Add Link
            </h2>

            {/* INPUTS */}
            <label className="text-sm font-semibold mb-1 px-2 block">
              Link Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              placeholder="Enter link name"
              value={linkName}
              onChange={(e) => setLinkName(e.target.value)}
              className="w-full border border-gray-200 p-3 rounded-2xl mb-3 hover:border-gray-200"
            />

            <label className="text-sm font-semibold mb-1 px-2 block">
              URL <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              placeholder="Enter URL"
              value={linkURL}
              onChange={(e) => setLinkURL(e.target.value)}
              className="w-full border border-gray-200 p-3 rounded-2xl hover:border-gray-200"
            />

            {/* ACTIONS */}
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setShowLinkModal(false)}
                className="px-4 py-2 bg-gray-200 rounded-2xl border border-gray-200 hover:bg-gray-300 cursor-pointer"
              >
                Cancel
              </button>

              <button
                onClick={handleAddLink}
                className="px-4 py-2 bg-green-800 text-white rounded-2xl hover:bg-green-700 cursor-pointer"
              >
                Add
              </button>
            </div>

          </div>
        </div>
      )}

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
                  JPG, PNG, JPEG supported
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

      {showEdit && (
        <AddClient
          editingClient={{
            ...client,
            technology: client.technology || "",
            status: client.status || "A",
            employee_id: client.employee_id || "",
            notes: client.notes || ""
          }}
          onClose={() => setShowEdit(false)}
          onAdd={handleUpdate}
          setPopup={setPopup}
        />
      )}

      {apiErrorModal}

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
                    className="px-4 py-2 bg-gray-300 rounded border border-gray-300 cursor-pointer"
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
    </div>
  );
}

export default ClientProfile;