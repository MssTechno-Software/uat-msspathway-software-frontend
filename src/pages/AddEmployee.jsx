import { useState, useEffect } from "react";
import {
  FiUser,
  FiMail,
  FiPhone,
  FiBriefcase,
  FiChevronDown,
  FiLock,
  FiEye,
  FiEyeOff,
  FiMapPin
} from "react-icons/fi";

function AddEmployee({ onClose, onSave, editingEmployee }) {
  const [showPassword, setShowPassword] = useState(false);
  const [isCurrentlyWorking, setIsCurrentlyWorking] = useState(false);
  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    aadhaar_no: "",
    email: "",
    countryCode: "+91",
    mobile: "",
    designation: "",
    startDate: "",
    endDate: "",
    photo: "",
    password: "",
    reporting_to: "",
    hr: "",
    role: "Employee",
    location: ""
  });

  const [showRoleDropdown, setShowRoleDropdown] = useState(false);
  const [showReportingDropdown, setShowReportingDropdown] = useState(false);
  const [showHrDropdown, setShowHrDropdown] = useState(false);
  const [employeeIds, setEmployeeIds] = useState([]);
  const [showCountryDropdown, setShowCountryDropdown] = useState(false);

  const countryOptions = [
    { code: "+91", label: "IN" },
    { code: "+1", label: "CA" }
  ];

  /* Fetch employee IDs for dropdowns */
  useEffect(() => {
    const fetchEmployeeIds = async () => {
      try {
        const res = await fetch("https://uat-msspathway-software-backend-81057313575.asia-south1.run.app/employee-ids", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`
          }
        });
        const data = await res.json();
        setEmployeeIds(data.data || data);
      } catch (error) {
        console.error("Error fetching employee IDs:", error);
      }
    };

    fetchEmployeeIds();
  }, []);

  useEffect(() => {
    if (editingEmployee) {
      setForm({
        first_name: editingEmployee.first_name || "",
        last_name: editingEmployee.last_name || "",
        email: editingEmployee.email || "",
        countryCode:
          editingEmployee.mobile?.startsWith("+1")
            ? "+1"
            : "+91",

        mobile:
          editingEmployee.mobile
            ?.replace(/^\+91/, "")
            ?.replace(/^\+1/, "") || "",
        designation: editingEmployee.designation || "",
        password: "",
        reporting_to: editingEmployee.reporting_to || "",
        hr: editingEmployee.HR || "",
        aadhaar_no: editingEmployee.aadhaar_number || "",
        role:
          editingEmployee.role
            ? editingEmployee.role.charAt(0).toUpperCase() +
            editingEmployee.role.slice(1).toLowerCase()
            : "Employee",
        startDate: editingEmployee.start_date?.split("T")[0] || "",
        endDate: editingEmployee.end_date?.split("T")[0] || "",
        location: editingEmployee.location || ""
      });

      setIsCurrentlyWorking(!editingEmployee.end_date);
    }
  }, [editingEmployee]);

  const handleChange = (e) => {
    let { name, value } = e.target;

    if (name === "mobile") {
      value = value.replace(/\D/g, "").slice(0, 10);
    }

    value = value.replace(/\s+/g, " ");

    setForm((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const isEdit = !!editingEmployee;

  const submit = () => {
    // First Name
    if (!form.first_name?.trim()) {
      return onSave({ error: true, message: "First name is required" });
    }

    // Last Name
    if (!form.last_name?.trim()) {
      return onSave({ error: true, message: "Last name is required" });
    }

    // Aadhaar
    if (!form.aadhaar_no?.trim()) {
      return onSave({ error: true, message: "Aadhaar is required" });
    }
    if (!/^\d{12}$/.test(form.aadhaar_no)) {
      return onSave({ error: true, message: "Aadhaar must contain 12 digits" });
    }

    // Email
    if (!form.email?.trim()) {
      return onSave({ error: true, message: "Email is required" });
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      return onSave({ error: true, message: "Enter valid email address" });
    }

    // Mobile
    if (!form.mobile?.trim()) {
      return onSave({
        error: true,
        message: "Mobile is required"
      });
    }

    const mobile = form.mobile.replace(/\D/g, "");

    if (mobile.length !== 10) {
      return onSave({
        error: true,
        message: "Mobile number must be 10 digits"
      });
    }
    // Designation
    if (!form.designation?.trim()) {
      return onSave({ error: true, message: "Designation is required" });
    }

    // Start Date
    if (!form.startDate) {
      return onSave({ error: true, message: "Start date is required" });
    }

    // End Date: must be after start date if provided
    if (form.endDate && form.startDate) {
      if (new Date(form.endDate) < new Date(form.startDate)) {
        return onSave({ error: true, message: "End date cannot be before start date" });
      }
    }

    // Password — only required when adding, optional on edit
    if (!isEdit && !form.password?.trim()) {
      return onSave({ error: true, message: "Password is required" });
    }

    // Role
    if (!form.role?.trim()) {
      return onSave({ error: true, message: "Role is required" });
    }

    // Location
    if (!form.location?.trim()) {
      return onSave({ error: true, message: "Location is required" });
    }
    const employeeData = {
      ...form,
      mobile: `${form.countryCode}${form.mobile}`
    };
    console.log("FORM BEFORE SEND:", form);
    onSave(employeeData);
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-start sm:items-center justify-center z-50 p-2 sm:p-4 overflow-y-auto">

      <div className="bg-white w-full max-w-lg sm:max-w-xl md:max-w-2xl rounded-2xl shadow-xl flex flex-col max-h-[95vh] overflow-hidden my-4">

        {/* HEADER */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3 p-4 sm:p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl sm:text-2xl font-semibold text-gray-800 wrap-break-word">
              {editingEmployee ? "Update Employee" : "Add New Employee"}
            </h2>
          </div>
        </div>

        {/* BODY */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-5 flex-1 min-h-0">

          {/*Name*/}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700">
                First Name <span className="text-red-500">*</span>
              </label>
              <input
                name="first_name"
                value={form.first_name}
                onChange={handleChange}
                className="w-full mt-2 py-3 px-3 border border-gray-200 bg-gray-50 rounded-xl outline-none"
                placeholder="Enter first name"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">
                Last Name <span className="text-red-500">*</span>
              </label>
              <input
                name="last_name"
                value={form.last_name}
                onChange={handleChange}
                className="w-full mt-2 py-3 px-3 border border-gray-200 bg-gray-50 rounded-xl outline-none"
                placeholder="Enter last name"
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700">
              Aadhaar Number <span className="text-red-500">*</span>
            </label>

            <input
              name="aadhaar_no"
              value={form.aadhaar_no}
              onChange={handleChange}
              maxLength={12}
              className="w-full mt-2 py-3 px-3 border border-gray-200 bg-gray-50 rounded-xl outline-none"
              placeholder="Enter 12-digit Aadhaar"
            />
          </div>

          {/* EMAIL */}
          <div>
            <label className="text-sm font-medium text-gray-700">
              Email Address <span className="text-red-500">*</span>
            </label>

            <div className="flex items-center border border-gray-200 bg-gray-50 rounded-xl mt-2 px-3">
              <FiMail className="text-gray-400 mr-2" />
              <input
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="example@gmail.com"
                className="w-full py-3 outline-none text-sm"
              />
            </div>
          </div>

          {/* MOBILE + DESIGNATION */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

            <div>
              <label className="text-sm font-medium text-gray-700">
                Mobile Number <span className="text-red-500">*</span>
              </label>

              <div className="flex border border-gray-200 bg-gray-50 rounded-xl mt-2 relative overflow-visible">

                {/* Country Code */}
                <div className="relative">

                  <div
                    onClick={() => setShowCountryDropdown(!showCountryDropdown)}
                    className="flex items-center justify-between px-3 py-3 border-r border-gray-200 cursor-pointer w-30"
                  >
                    <div className="flex items-center text-sm font-medium">
                      <span>
                        {form.countryCode === "+91" ? "IN" : "CA"}
                      </span>

                      <span className="ml-2">
                        {form.countryCode}
                      </span>
                    </div>

                    <FiChevronDown
                      className={`transition-transform ${showCountryDropdown ? "rotate-180" : ""
                        }`}
                    />
                  </div>

                  {showCountryDropdown && (
                    <div className="absolute left-0 top-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg w-30 z-50">

                      {countryOptions.map((country) => (
                        <div
                          key={country.code}
                          onClick={() => {
                            setForm({
                              ...form,
                              countryCode: country.code
                            });
                            setShowCountryDropdown(false);
                          }}
                          className="flex items-center justify-between px-4 py-3 hover:bg-gray-100 cursor-pointer"
                        >
                          <span className="font-medium">
                            {country.label}
                          </span>

                          <span className="text-gray-500">
                            {country.code}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Mobile Input */}
                <div className="flex items-center flex-1 px-3">
                  <FiPhone className="text-gray-400 mr-2" />

                  <input
                    name="mobile"
                    value={form.mobile}
                    onChange={handleChange}
                    placeholder="Enter mobile number"
                    className="w-full py-3 outline-none text-sm bg-transparent"
                  />
                </div>

              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">
                Designation <span className="text-red-500">*</span>
              </label>

              <div className="flex items-center border border-gray-200 bg-gray-50 rounded-xl mt-2 px-3">
                <FiBriefcase className="text-gray-400 mr-2" />
                <input
                  name="designation"
                  value={form.designation}
                  onChange={handleChange}
                  placeholder="e.g. Developer"
                  className="w-full py-3 outline-none text-sm"
                />
              </div>
            </div>

          </div>

          {/*start date*/}
          <div>
            <label className="text-sm font-medium text-gray-700">
              Start Date <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              name="startDate"
              value={form.startDate}
              onChange={handleChange}
              className="w-full mt-2 py-3 px-3 border border-gray-200 bg-gray-50 rounded-xl outline-none"
            />
          </div>
          {/*end date + currently working toggle*/}
          <div>
            <label className="text-sm font-medium text-gray-700">
              End Date
            </label>
            <div className="flex items-center gap-2 mt-2">
              <input
                type="checkbox"
                checked={isCurrentlyWorking}
                onChange={() => {
                  setIsCurrentlyWorking(!isCurrentlyWorking);
                  setForm({ ...form, endDate: "" });
                }}
                className="accent-green-700 cursor-pointer"
              />
              <label className="text-sm text-gray-600">
                Currently Working
              </label>
            </div>
            <input
              type="date"
              name="endDate"
              value={form.endDate}
              onChange={handleChange}
              disabled={isCurrentlyWorking}
              className="w-full mt-2 py-3 px-3 border border-gray-200 bg-gray-50 rounded-xl outline-none"
            />
          </div>

          {/* REPORTING + HR */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

            {/* Reporting To */}
            <div className="relative">
              <label className="text-sm font-medium text-gray-700">
                Reporting To (Employee ID)
              </label>

              <div
                onClick={() => setShowReportingDropdown(!showReportingDropdown)}
                className="flex items-center justify-between border border-gray-200 bg-gray-50 rounded-xl mt-2 px-3 py-3 cursor-pointer select-none"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <FiUser className="text-gray-400 mr-2" />
                  <span className="text-sm text-gray-700 truncate max-w-45 sm:max-w-full">{form.reporting_to || "Select Reporting Manager"}</span>
                </div>
                <FiChevronDown
                  className={`text-gray-500 transition-transform duration-200 
                  ${showReportingDropdown ? "rotate-180" : ""}`}
                />
              </div>
              {showReportingDropdown && (
                <div className="absolute z-10 mt-2 w-full bg-white border border-gray-200 rounded-xl shadow max-h-52 overflow-y-auto">
                  {employeeIds.map((tz) => (
                    <label key={tz} className="flex items-center px-3 py-2 hover:bg-gray-100 cursor-pointer">
                      <input
                        type="radio"
                        checked={form.reporting_to === tz}
                        onChange={() => {
                          setForm({ ...form, reporting_to: tz });
                          setShowReportingDropdown(false);
                        }
                        }
                        className="mr-2 accent-green-700"
                      />
                      {tz}
                    </label>
                  ))}
                </div>
              )}
            </div>

            {/* HR Employee ID */}
            <div className="relative">
              <label className="text-sm font-medium text-gray-700">
                HR Employee ID
              </label>

              <div
                onClick={() => setShowHrDropdown(!showHrDropdown)}
                className="flex items-center justify-between border border-gray-200 bg-gray-50 rounded-xl mt-2 px-3 py-3 cursor-pointer select-none"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <FiUser className="text-gray-400 mr-2" />
                  <span className="text-sm text-gray-700 truncate max-w-45 sm:max-w-full">{form.hr || "Select Employee ID"}</span>
                </div>
                <FiChevronDown
                  className={`text-gray-500 transition-transform duration-200 
                  ${showHrDropdown ? "rotate-180" : ""}`}
                />
              </div>
              {showHrDropdown && (
                <div className="absolute z-10 mt-2 w-full bg-white border border-gray-200 rounded-xl shadow max-h-52 overflow-y-auto">
                  {employeeIds.map((tz) => (
                    <label key={tz} className="flex items-center px-3 py-2 hover:bg-gray-100 cursor-pointer">
                      <input
                        type="radio"
                        checked={form.hr === tz}
                        onChange={() => {
                          setForm({ ...form, hr: tz });
                          setShowHrDropdown(false);
                        }}
                        className="mr-2 accent-green-700"
                      />
                      {tz}
                    </label>
                  ))}
                </div>
              )}
            </div>

          </div>

          {/*Password*/}
          <div>
            <label className="text-sm font-medium text-gray-700">
              {editingEmployee ? "Update Password (optional)" : "Password"}
              {!editingEmployee && <span className="text-red-500">*</span>}
            </label>

            <div className="flex items-center border border-gray-200 bg-gray-50 rounded-xl mt-2 px-3">

              <FiLock className="text-gray-400 mr-2" />

              <input
                type={showPassword ? "text" : "password"} //toggle
                name="password"
                value={form.password || ""}
                onChange={handleChange}
                placeholder="Enter password"
                className="w-full py-3 outline-none text-sm"
              />

              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-gray-500 ml-2"
              >
                {showPassword ? <FiEyeOff /> : <FiEye />}
              </button>

            </div>
          </div>

          {/* ROLE DROPDOWN */}
          <div className="relative">
            <label className="text-sm font-medium text-gray-700">
              Role <span className="text-red-500">*</span>
            </label>

            <div
              onClick={() => setShowRoleDropdown(!showRoleDropdown)}
              className="flex items-center justify-between border border-gray-200 bg-gray-50 rounded-xl mt-2 px-3 py-3 cursor-pointer"
            >
              <span className="text-sm text-gray-700">{form.role}</span>
              <FiChevronDown
                className={`transition ${showRoleDropdown ? "rotate-180" : ""}`}
              />
            </div>

            {showRoleDropdown && (
              <div className="absolute z-10 mt-2 w-full bg-white border border-gray-200 rounded-xl shadow">

                {["Employee", "Admin"].map((r) => (
                  <label
                    key={r}
                    className="flex items-center gap-3 px-3 py-3 hover:bg-gray-100 cursor-pointer"
                  >

                    <input
                      type="radio"
                      name="role"
                      value={r}
                      checked={form.role === r}
                      onChange={() => {
                        setForm({ ...form, role: r });
                        setShowRoleDropdown(false);
                      }}
                      className="w-4 h-4 text-green-700 cursor-pointer"
                    />

                    <span className="text-sm text-gray-700">
                      {r}
                    </span>

                  </label>
                ))}

              </div>
            )}
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700">
              Location <span className="text-red-500">*</span>
            </label>
            <div className="flex items-center border border-gray-200 bg-gray-50 rounded-xl mt-2 px-3">
              <FiMapPin className="text-gray-400 mr-2" />
              <input
                name="location"
                value={form.location}
                onChange={handleChange}
                placeholder="City, Country"
                className="w-full py-3 text-sm outline-none"
              />
            </div>
          </div>
        </div>

        {/* FOOTER */}
        <div className="sticky bottom-0 flex flex-col-reverse sm:flex-row justify-end items-stretch sm:items-center gap-3 sm:gap-4 p-4 sm:p-6 border-t border-gray-200 bg-white z-10">
          <button onClick={onClose} className="w-full sm:w-auto text-gray-600 cursor-pointer hover:bg-gray-100 px-6 py-2 rounded-lg transition">
            Cancel
          </button>

          <button
            onClick={submit}
            className="w-full sm:w-auto bg-green-800 hover:bg-green-700 text-white px-6 py-2 rounded-lg shadow cursor-pointer"
          >
            {editingEmployee ? "Update" : "Save"}
          </button>
        </div>

      </div>
    </div>
  );
}

export default AddEmployee;