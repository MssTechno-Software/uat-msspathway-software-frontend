import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import { FiDownload, FiEye, FiEdit, FiTrash2, FiUpload, FiX, FiPenTool, FiLink, FiLoader } from "react-icons/fi";
import AddClient from "./AddClient";

const BASE_URL = "https://uat-msspathway-software-backend-81057313575.asia-south1.run.app";

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
  const [loading, setLoading] = useState(false);
  const [popup, setPopup] = useState({
    show: false,
    message: "",
    type: "",
    onConfirm: null
  });
  const getAuthHeaders = () => {
    const token = localStorage.getItem("token");
    return {
      headers: {
        Authorization: token ? `Bearer ${token}` : "",
      },
    };
  };

  const fetchClient = async () => {
    console.log("Fetching client ID:", client_id);
    try {
      setLoading(true);
      const res = await axios.get(
        `${BASE_URL}/clients/clients/${client_id}`,
        getAuthHeaders()
      );

      console.log("CLIENT DATA:", res.data);
      setClient(res.data);

    } catch (err) {
      console.error("API ERROR:", err.response?.data || err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (client_id) {
      fetchClient();
    }
  }, [client_id]);

  /*fetch documents*/
  const fetchDocuments = async () => {
    try {
      setLoading(true);
      const res = await axios.get(
        `${BASE_URL}/documents/clients/${client_id}/documents`,
        getAuthHeaders()
      );
      console.log("Documents API Response:", res.data);
      setDocuments(res.data.documents || []);
    } catch (err) {
      console.error("Error fetching documents:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (client_id) {
      fetchDocuments();
    }
  }, [client_id]);

  /*fetch link*/
  const fetchLinks = async () => {
    try {
      setLoading(true);
      const res = await axios.get(
        `${BASE_URL}/clients/clients/${client_id}/source-links`,
        getAuthHeaders()
      );
      console.log("Links API Response:", res.data);

      setLinks(res.data.source_links || []);

    } catch (err) {
      console.error("Error fetching links:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (client_id) {
      fetchLinks();
    }
  }, [client_id]);

  /*fetch profile photo*/
  const fetchProfilePhotoView = async () => {
    console.log("Fetching profile photo for client ID:", client_id);
    try {
      setLoading(true);
      const res = await axios.get(
        `${BASE_URL}/documents/clients/${client_id}/profile-picture-view`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          responseType: "blob",
        }
      );
      console.log("Profile View Response:", res.data);
      const imageURL = URL.createObjectURL(res.data);
      setProfileUrl(imageURL);

    } catch (err) {
      console.error("Profile photo fetch failed:", err);
      setProfileUrl("");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (client_id) {
      fetchProfilePhotoView();
    }
  }, [client_id]);

  if (!client) {
    return <div className="p-6">Loading client details...</div>;
  }

  /*update client*/
  const handleUpdate = async (updatedData) => {
    console.log("Updating client with data:", updatedData);
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


      for (let pair of formData.entries()) {
        console.log(pair[0], pair[1]);
      }
      const response = await axios.put(
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
      console.log("Update response:", response.data);

      await fetchClient();

      setPopup({
        show: true,
        message: "Client updated successfully",
        type: "success"
      });

      setShowEdit(false);

    } catch (error) {
      console.error("UPDATE ERROR:", error.response?.data || error.message);

      setPopup({
        show: true,
        message: "Update failed",
        type: "error"
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

      for (let pair of formData.entries()) {
        console.log(pair[0], pair[1]);
      }

      const response = await axios.post(
        `${BASE_URL}/documents/clients/${client_id}/upload-documents`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`
          }
        }
      );
      console.log("Upload response:", response.data);

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
      console.error("Upload error:", err.response?.data || err.message);
      setPopup({
        show: true,
        message:
          err.response?.data?.detail?.[0]?.msg ||
          err.response?.data?.detail?.[0] ||
          "Upload failed",
        type: "error"
      });
    } finally {
      setLoading(false);
    }
  };

  /*view document*/
  const handleView = async (doc) => {
    console.log("Viewing document:", doc);
    try {
      setLoading(true);
      console.log("VIEW FILE ID:", doc.file_id);
      const res = await axios.get(
        `${BASE_URL}/documents/files/view`,
        {
          params: { file_id: doc.file_id },
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      console.log("Document View response received:", res.data);
      const viewUrl = res.data.view_url;
      window.open(viewUrl, "_blank");
      setPopup({
        show: true,
        message: "Document opened in new tab",
        type: "success"
      });
      fetchDocuments();

    } catch (err) {
      console.error("View error:", err.response?.data || err.message);
      setPopup({
        show: true,
        message: "Failed to open document",
        type: "error"
      });
    } finally {
      setLoading(false);
    }
  };

  /*download document*/
  const handleDownload = async (doc) => {
    console.log("Downloading document:", doc);
    try {
      setLoading(true);
      console.log("DOWNLOAD FILE ID:", doc.file_id);
      const res = await axios.get(
        `${BASE_URL}/documents/files/download`,
        {
          params: { file_id: doc.file_id },
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      console.log("Download response received:", res.data);
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
      console.error("Download error:", err.response?.data || err.message);
      setPopup({
        show: true,
        message: "Failed to download document",
        type: "error"
      });
    } finally {
      setLoading(false);
    }
  };

  /*delete document*/
  const handleDelete = (doc) => {
    console.log("Deleting document:", doc);
    const gcsPath = doc.url;
    console.log("DELETE PATH:", gcsPath);

    setPopup({
      show: true,
      message: "Are you sure you want to delete this document?",
      type: "confirm",
      onConfirm: async () => {
        try {
          setLoading(true);
          const res = await axios.delete(
            `${BASE_URL}/documents/clients/${client_id}/documents`,
            {
              params: {
                file_id: doc.file_id
              },
              headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`
              }
            }
          );
          console.log("Delete response:", res.data);

          setPopup({
            show: true,
            message: "Document deleted successfully",
            type: "success"
          });
          fetchDocuments();

        } catch (err) {
          console.error("Delete error:", err.response?.data);
          setPopup({
            show: true,
            message:
              err.response?.data?.detail?.[0]?.msg ||
              "Delete failed",
            type: "error"
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
      const res = await axios.post(
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
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            "Content-Type": "application/json"
          }
        }
      );

      console.log("Add link response:", res.data);

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
      console.error("FULL ERROR:", err.response?.data);
      setPopup({
        show: true,
        message:
          err.response?.data?.detail?.[0]?.msg ||
          "Failed to add link",
        type: "error"
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
          const res = await axios.delete(
            `${BASE_URL}/clients/clients/${client_id}/delete-source-link`,
            {
              ...getAuthHeaders(),
              params: {
                link: linkUrl,
              }
            });
          console.log("Delete response:", res.data);
          setPopup({
            show: true,
            message: "Link deleted successfully",
            type: "success"
          });

          fetchLinks();

        } catch (err) {
          console.error("DELETE ERROR:", err.response?.data);
          setPopup({
            show: true,
            message: "Failed to delete link",
            type: "error"
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
    console.log("Uploading profile photo:", profileFile);
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

      for (let pair of formData.entries()) {
        console.log(pair[0], pair[1]);
      }
      console.log("Uploading profile photo for client ID:", client_id);

      const res = await axios.post(
        `${BASE_URL}/documents/clients/${client_id}/profile-picture`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      console.log("Profile photo upload response:", res.data);

      setProfileFile(null);
      setProfilePreview("");
      fetchProfilePhotoView();
      setShowPhotoModal(false);
      fetchProfilePhotoView();
      setPopup({
        show: true,
        message: "Profile photo uploaded successfully",
        type: "success"
      });

    } catch (err) {
      console.error("Upload error:", err.response?.data);
      setPopup({
        show: true,
        message: "Upload failed",
        type: "error"
      });
    } finally {
      setLoading(false);
    }
  };

  /*delete profile photo*/
  const handleDeleteProfile = async () => {
    console.log("Deleting profile photo for client ID:", client_id);
    try {
      setLoading(true);
      console.log("Delete request sent for profile photo:", profileUrl);
      const res = await axios.delete(
        `${BASE_URL}/documents/clients/${client_id}/profile-picture`,
        {
          ...getAuthHeaders(),
          params: { gcs_path: profileUrl }
        }
      );
      console.log("Profile photo delete response:", res.data);

      setProfileUrl("");
      setPopup({
        show: true,
        message: "Profile photo deleted successfully",
        type: "success"
      });

      setShowPhotoModal(false);
      fetchProfilePhotoView();

    } catch (err) {
      console.error("Delete error:", err.response?.data);
      setPopup({
        show: true,
        message: "Delete failed",
        type: "error"
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
              className="absolute bottom-0 right-0 bg-white p-2 rounded-full shadow cursor-pointer"
            >
              {profileUrl ? <FiEdit /> : <FiUpload />}
            </button>

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

        {/* DOCUMENTS LIST */}
        {documents?.length ? (
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
        ) : (
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

        {/* LINKS LIST */}
        {links?.length ? (
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
        ) : (
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