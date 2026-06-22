import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import { FiDownload, FiEye, FiUpload, FiEdit, FiTrash2, FiLoader } from "react-icons/fi";
import AddEmployee from "./AddEmployee";

const BASE_URL = "https://timesheet-api-790373899641.asia-south1.run.app";

function MyProfilePage() {
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

  console.log("employee_id:", employee_id);

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
    console.log("Fetching employee:", employee_id);
    console.log("TOKEN:", localStorage.getItem("token"));
    try {
      setLoading(true);
      const res = await axios.get(
        `${BASE_URL}/admin/users/${employee_id}`,
        getAuthHeaders()
      );

      console.log("Employee data response:", res.data);
      const data = res.data?.data ?? res.data;
      setEmployee(data);
      //setDocuments(data.documents || []);
    } catch (err) {
      console.error("Error fetching employee data:", err.response || err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    console.log("useEffect triggered");
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

  //fetch profile photo
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
      console.log("Deleting profile picture response:", res.data);
      setPopup({
        show: true,
        message: "Profile photo deleted successfully",
        type: "success"
      });
      setProfileUrl(null);
      setShowPhotoModal(false);
      fetchProfilePhoto();
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

            <FiLoader className="animate-spin text-4xl text-green-700" />

            <p className="text-gray-700 font-medium">
              Please wait...
            </p>

          </div>
        </div>
      )}
      <div className="p-6 bg-white min-h-screen">
        {!employee && (
          <div className="p-6 text-gray-500">Loading my profile...</div>
        )}

        {/* HEADER */}
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6">

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

          {documents.length ? (
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

      </div>
    </>
  );
}

export default MyProfilePage;