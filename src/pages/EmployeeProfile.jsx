import { useParams } from "react-router-dom";
import { use, useEffect, useState } from "react";
import axios from "axios";
import { FiDownload, FiEye, FiUpload, FiEdit, FiTrash2, FiLoader } from "react-icons/fi";
import AddEmployee from "./AddEmployee";

const BASE_URL = "https://uat-msspathway-software-backend-81057313575.asia-south1.run.app";

function EmployeeProfile() {
  const { employee_id } = useParams();
  const [employee, setEmployee] = useState(null);
  const [showEdit, setShowEdit] = useState(false);
  const [documents, setDocuments] = useState([]);
  const [showDocModal, setShowDocModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const [profilePreview, setProfilePreview] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [profileUrl, setProfileUrl] = useState(null);
  const [profileFile, setProfileFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(false);
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

  // FETCH EMPLOYEE data
  const fetchEmployee = async () => {
    console.log("Fetching employee data for ID:", employee_id);
    try {
      setLoading(true);
      const res = await axios.get(
        `${BASE_URL}/admin/users/${employee_id}`,
        getAuthHeaders()
      );

      console.log("Employee data response:", res.data);
      const data = res.data?.data ?? res.data;
      setEmployee(data);
    } catch (err) {
      console.error("Error fetching employee data:", err.response || err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (employee_id) fetchEmployee();
  }, [employee_id]);

  // FETCH DOCUMENTS
  const fetchDocuments = async () => {
    try {
      setLoading(true);
      const res = await axios.get(
        `${BASE_URL}/documents/employees/${employee_id}/documents`,
        getAuthHeaders()
      );
      console.log("Documents response:", res.data);
      setDocuments(res.data.documents || []);
    } catch (err) {
      console.error("Error fetching documents:", err.response || err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (employee_id) fetchDocuments();
  }, [employee_id]);

  //fetch profile photo if exists
  const fetchProfilePhoto = async () => {
    console.log("Fetching profile photo for employee ID:", employee_id);
    try {
      setLoading(true);
      const res = await axios.get(
        `${BASE_URL}/documents/employees/${employee_id}/profile-picture-view`,
        {
          responseType: "blob",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      console.log("Profile photo response:", res.data);
      const url = URL.createObjectURL(res.data);
      setProfileUrl(url);
    } catch (err) {
      console.error("Error fetching profile photo:", err);
      setProfileUrl("");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (employee_id) {
      fetchProfilePhoto();
    }
  }, [employee_id]);

  if (!employee) {
    return <div className="p-6">Loading employee details...</div>;
  }

  const handleUpdateEmployee = () => {
    console.log("Updating employee data for ID:", employee_id);
    setEmployee((prev) => ({
      ...prev,
      first_name: prev.first_name || "",
      last_name: prev.last_name || "",
      email: prev.email || "",
      mobile: prev.mobile || "",
      aadhaar_number: prev.aadhaar_number || "",
      role: prev.role || "",
      location: prev.location || "",
      start_date: prev.start_date || "",
      end_date: prev.end_date || ""
    }));
    setPopup({
      show: true,
      message: "Employee data updated successfully",
      type: "success"
    });
    setShowEdit(true);
  };

  // UPLOAD documents
  const handleUpload = async () => {
    if (!selectedFile) {
      return setPopup({
        show: true,
        message: "Please select a file to upload",
        type: "error"
      });
    }
    try {
      setLoading(true);
      const formData = new FormData();
      formData.append("files", selectedFile);
      formData.append("employee_id", employee_id);

      for (let pair of formData.entries()) {
        console.log(pair[0], pair[1]);
      }

      const response = await axios.post(
        `${BASE_URL}/documents/employees/${employee_id}/upload-documents`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
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
      fetchDocuments();
    } catch (err) {
      console.error("Error uploading document:", err.response || err.message);
      setPopup({
        show: true,
        message: "Failed to upload document",
        type: "error"
      });
    } finally {
      setLoading(false);
    }
  };

  //VIEW documnets
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
      console.log("Document view response:", res.data);
      const viewUrl = res.data.view_url;
      window.open(viewUrl, "_blank");
      setPopup({
        show: true,
        message: "Document opened in new tab",
        type: "success"
      });
      fetchDocuments();
    } catch (err) {
      console.error("Error viewing document:", err.response || err.message);
      setPopup({
        show: true,
        message: "Failed to open document",
        type: "error"
      });
    } finally {
      setLoading(false);
    }
  };

  // DOWNLOAD documents
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
          }
        }
      );
      console.log("Download response:", res.data);
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
      console.error("Full error:", err.response || err);
      setPopup({
        show: true,
        message: "Failed to download document",
        type: "error"
      });
    } finally {
      setLoading(false);
    }
  };

  // DELETE documents
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
            `${BASE_URL}/documents/employees/${employee_id}/documents`,
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
          console.error("Full error:", err.response || err);
          setPopup({
            show: true,
            message: "Failed to delete document",
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
      setPreviewUrl(URL.createObjectURL(file));
    } else {
      setPreviewUrl("");
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

    try {
      setLoading(true);
      const formData = new FormData();
      formData.append("file", profileFile);
      console.log("PROFILE FILE:", profileFile);
      console.log("Uploading profile photo for employee ID:", employee_id);

      const res = await axios.post(
        `${BASE_URL}/documents/employees/${employee_id}/profile-picture`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      console.log("Profile upload response:", res.data);

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
      console.error("Profile upload error:", err.response || err);
      setPopup({
        show: true,
        message: "Failed to upload profile photo",
        type: "error"
      });
    } finally {
      setLoading(false);
    }
  };

  /* DELETE PROFILE PHOTO */
  const handleDeleteProfile = async () => {
    try {
      setLoading(true);
      const res = await axios.delete(
        `${BASE_URL}/documents/employees/${employee_id}/profile-picture`,
        {
          ...getAuthHeaders(),
          params: { gcs_path: profileUrl }
        }
      );
      console.log("Profile photo delete response:", res.data);
      setPopup({
        show: true,
        message: "Profile photo deleted successfully",
        type: "success"
      });
      setProfileUrl(null);
      setShowPhotoModal(false);
    } catch (err) {
      console.error("Profile delete error:", err.response || err);
      setPopup({
        show: true,
        message: "Failed to delete profile photo",
        type: "error"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {(loading || pageLoading) && (
        <div className="fixed inset-0 bg-black/40 z-9999 flex items-center justify-center">

          <div className="p-6 flex flex-col items-center gap-3">

            <FiLoader className="animate-spin text-4xl text-green-800" />

            <p className="text-gray-800 font-medium">
              Please wait...
            </p>

          </div>
        </div>
      )}
      <div className="w-full min-w-0 p-2 sm:p-4 md:p-6 bg-white min-h-screen overflow-x-hidden">
        {/* HEADER */}
        <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start gap-4 w-full min-w-0">
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
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold wrap-break-word">
                {[employee.first_name, employee.last_name].join(" ")}
              </h1>
              <p className="text-base sm:text-lg font-semibold mt-1">
                {employee.designation || "No Designation"}
              </p>
            </div>
          </div>

          <button
            onClick={() => setShowEdit(true)}
            className="w-full sm:w-auto flex items-center justify-center gap-2 bg-green-800 hover:bg-green-700 text-white px-5 py-2 rounded-xl shadow-md cursor-pointer"
          >
            <FiEdit />
            Update Employee
          </button>
        </div>

        {/* CARDS */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 mt-4 w-full min-w-0">
          <div className="bg-white p-4 rounded-xl shadow-sm w-full min-w-0 overflow-hidden">
            <p className="text-xs text-gray-400">EMPLOYEE ID</p>
            <p className="font-semibold">{employee.employee_id || "No Employee ID"}</p>
          </div>

          <div className="bg-white p-4 rounded-xl shadow-sm w-full min-w-0 overflow-hidden">
            <p className="text-xs text-gray-400">EMAIL</p>
            <p className="font-semibold break-all">{employee.email || "No Email"}</p>
          </div>

          <div className="bg-white p-4 rounded-xl shadow-sm w-full min-w-0 overflow-hidden">
            <p className="text-xs text-gray-400">MOBILE</p>
            <p className="font-semibold">{employee.mobile || "No Mobile"}</p>
          </div>

          <div className="bg-white p-4 rounded-xl shadow-sm w-full min-w-0 overflow-hidden">
            <p className="text-xs text-gray-400">AADHAAR NUMBER </p>
            <p className="font-semibold">{employee.aadhaar_number || "No Aadhaar Number"}</p>
          </div>

          <div className="bg-white p-4 rounded-xl shadow-sm w-full min-w-0 overflow-hidden">
            <p className="text-xs text-gray-400">ROLE</p>
            <p className="font-semibold">
              {employee.role
                ? employee.role.charAt(0).toUpperCase() + employee.role.slice(1).toLowerCase()
                : "No Role"}
            </p>
          </div>

          <div className="bg-white p-4 rounded-xl shadow-sm w-full min-w-0 overflow-hidden">
            <p className="text-xs text-gray-400">LOCATION</p>
            <p className="font-semibold break-all">{employee.location || "No Location"}</p>
          </div>

          <div className="bg-white p-4 rounded-xl shadow-sm w-full min-w-0 overflow-hidden">
            <p className="text-xs text-gray-400">REPORTING TO EMPLOYEE</p>
            <p className="font-semibold">{employee.reporting_to
              ? `${employee.reporting_to} - ${employee.reporting_to_name}`
              : "No Reporting Manager"}</p>
          </div>

          <div className="bg-white p-4 rounded-xl shadow-sm w-full min-w-0 overflow-hidden">
            <p className="text-xs text-gray-400">START DATE</p>
            <p className="font-semibold">{employee.start_date || "No Start Date"}</p>
          </div>

          <div className="bg-white p-4 rounded-xl shadow-sm w-full min-w-0 overflow-hidden">
            <p className="text-xs text-gray-400">END DATE</p>
            <p className="font-semibold">{employee.end_date ? employee.end_date : "Currently Working"}</p>
          </div>
        </div>

        {/* DOCUMENTS */}
        <div className="mt-8 bg-white rounded-xl shadow-sm overflow-hidden">

          <div className="p-4 sm:p-6 bg-gray-100 flex flex-col sm:flex-row justify-between sm:items-center gap-4">
            <div>
              <h2 className="text-lg font-semibold">
                Document Repository
              </h2>
              <p className="text-sm text-gray-400">
                Employee documents
              </p>
            </div>

            <button
              onClick={() => setShowDocModal(true)}
              className="w-full sm:w-auto flex items-center justify-center gap-2 bg-green-800 text-white px-4 py-2 rounded-lg cursor-pointer hover:bg-green-700"
            >
              <FiUpload /> Upload
            </button>
          </div>

          {documents.length ? (
            documents.map((doc, i) => {
              const fileName = doc.original_name || "document";
              const fileType = fileName.split(".").pop().toUpperCase();

              return (
                <div
                  key={i}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-4 sm:px-6 py-4 border-b border-gray-200 hover:bg-gray-50"
                >
                  <div className="flex items-start sm:items-center gap-4 w-full">

                    {/* FILE ICON */}
                    <div className="w-10 h-10 bg-green-800 text-green-800 flex items-center justify-center rounded-lg shrink-0">
                      📄
                    </div>

                    {/* FILE INFO */}
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-gray-800">
                        {fileName}
                      </p>

                      <p className="text-sm text-gray-400 flex flex-wrap items-center gap-2">
                        {fileType} • {" "} {doc.created_at
                          ? new Date(doc.created_at).toLocaleDateString()
                          : "Recently added"}
                      </p>
                    </div>
                  </div>
                  {/*right side actions */}
                  <div className="flex items-center gap-4 text-gray-500 self-end sm:self-auto">
                    <FiEye
                      className="cursor-pointer hover:text-green-700"
                      onClick={() => handleView(doc)} />
                    <FiDownload
                      className="cursor-pointer hover:text-green-700"
                      onClick={() => handleDownload(doc)} />
                    <FiTrash2
                      className="cursor-pointer hover:text-green-700"
                      onClick={() => handleDelete(doc)} />
                  </div>
                </div>
              );
            })
          ) : (
            <p className="p-6 text-gray-400">No documents available</p>
          )}
        </div>

        {/* UPLOAD MODAL */}
        {showDocModal && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 px-2">

            <div className="bg-white w-96 rounded-2xl shadow-xl p-6 relative">

              <h2 className="text-xl font-semibold mb-4">
                Upload Document
              </h2>

              {/* DROP AREA */}
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

              {/* PREVIEW */}
              {selectedFile && (
                <div className="mt-4">
                  <p className="text-sm font-medium break-all">{selectedFile.name}</p>

                  {previewUrl && (
                    <img
                      src={previewUrl}
                      alt="preview"
                      className="w-20 h-20 mt-2 rounded object-cover"
                    />
                  )}
                </div>
              )}

              {/* ACTIONS */}
              <div className="flex flex-col sm:flex-row justify-end gap-3 mt-6">
                <button
                  onClick={() => setShowDocModal(false)}
                  className="px-4 py-2 bg-gray-200 rounded-lg cursor-pointer"
                >
                  Cancel
                </button>

                <button
                  onClick={handleUpload}
                  className="px-4 py-2 bg-green-800 text-white rounded-lg cursor-pointer"
                >
                  Upload
                </button>
              </div>

            </div>
          </div>
        )}

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
              <div className="flex flex-col sm:flex-row justify-between gap-3 mt-6">

                {/* DELETE BUTTON */}
                {profileUrl && (
                  <button
                    onClick={handleDeleteProfile}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg cursor-pointer"
                  >
                    Delete
                  </button>
                )}

                <div className="flex flex-col sm:flex-row gap-2 sm:ml-auto">
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
          <AddEmployee
            editingEmployee={employee}
            onClose={() => setShowEdit(false)}
            onSave={async (formData) => {
              // Catch validation errors bubbled up from AddEmployee's submit()
              if (formData.error) {
                setPopup({
                  show: true,
                  message: formData.message,
                  type: "error"
                });
                return;
              }

              // First Name
              if (!formData.first_name?.trim()) {
                return setPopup({ show: true, message: "First name is required", type: "error" });
              }

              // Last Name
              if (!formData.last_name?.trim()) {
                return setPopup({ show: true, message: "Last name is required", type: "error" });
              }

              // Aadhaar
              if (!formData.aadhaar_no?.trim()) {
                return setPopup({ show: true, message: "Aadhaar number is required", type: "error" });
              }
              if (!/^\d{12}$/.test(formData.aadhaar_no.replace(/\s/g, ""))) {
                return setPopup({ show: true, message: "Aadhaar must contain 12 digits", type: "error" });
              }

              // Email
              if (!formData.email?.trim()) {
                return setPopup({ show: true, message: "Email is required", type: "error" });
              }
              if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
                return setPopup({ show: true, message: "Enter a valid email address", type: "error" });
              }

              // Mobile
              if (!formData.mobile?.trim()) {
                return setPopup({ show: true, message: "Mobile number is required", type: "error" });
              }
              const mobile = formData.mobile.replace(/\s+/g, "");
              if (!/^\+?\d{10,15}$/.test(mobile)) {
                return setPopup({ show: true, message: "Enter a valid mobile number", type: "error" });
              }

              // Designation
              if (!formData.designation?.trim()) {
                return setPopup({ show: true, message: "Designation is required", type: "error" });
              }

              // Start Date
              if (!formData.startDate) {
                return setPopup({ show: true, message: "Start date is required", type: "error" });
              }

              // End Date must be after start date if provided
              if (formData.endDate && formData.startDate) {
                if (new Date(formData.endDate) < new Date(formData.startDate)) {
                  return setPopup({ show: true, message: "End date cannot be before start date", type: "error" });
                }
              }

              // Reporting Manager
              if (!formData.reporting_to?.trim()) {
                return setPopup({ show: true, message: "Reporting manager is required", type: "error" });
              }

              // HR
              if (!formData.hr?.trim()) {
                return setPopup({ show: true, message: "HR ID is required", type: "error" });
              }

              // Role
              if (!formData.role?.trim()) {
                return setPopup({ show: true, message: "Role is required", type: "error" });
              }

              // Location
              if (!formData.location?.trim()) {
                return setPopup({ show: true, message: "Location is required", type: "error" });
              }

              try {
                setLoading(true);
                const data = new FormData();
                data.append("first_name", formData.first_name.trim());
                data.append("last_name", formData.last_name.trim());
                data.append("email", formData.email.trim());
                data.append("mobile", formData.mobile.trim());
                data.append("designation", formData.designation.trim());
                data.append("aadhaar_number", formData.aadhaar_no.trim());
                data.append("role", formData.role.toLowerCase());
                data.append("location", formData.location.trim());
                data.append("reporting_to", formData.reporting_to);
                data.append("HR", formData.hr);
                data.append("start_date", formData.startDate);

                // Only send password if filled in — optional on edit
                if (formData.password?.trim()) {
                  data.append("password", formData.password.trim());
                }

                if (formData.endDate) {
                  data.append("end_date", formData.endDate);
                } else {
                  data.append("end_date", "currently working");
                }

                for (let [k, v] of data.entries()) {
                  console.log(k, v);
                }

                await axios.put(
                  `${BASE_URL}/admin/users/${employee_id}`,
                  data,
                  {
                    headers: {
                      Authorization: `Bearer ${localStorage.getItem("token")}`,
                      "Content-Type": "multipart/form-data"
                    }
                  }
                );

                await fetchEmployee();
                setPopup({
                  show: true,
                  message: "Employee updated successfully",
                  type: "success"
                });
                setShowEdit(false);

              } catch (err) {
                console.log("FULL BACKEND ERROR:", err.response?.data);
                setPopup({
                  show: true,
                  message:
                    err.response?.data?.detail ||
                    err.response?.data?.message ||
                    "Update failed",
                  type: "error"
                });
              } finally {
                setLoading(false);
              }
            }}
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

      </div>
    </>
  );
}

export default EmployeeProfile;