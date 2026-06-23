import { useEffect, useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

function PublicHoliday() {
  const [open, setOpen] = useState(false);

  const [holidayDate, setHolidayDate] = useState(null);
  const [holidayName, setHolidayName] = useState("");
  const [description, setDescription] = useState("");

  const [loading, setLoading] = useState(false);

  const [popupMessage, setPopupMessage] = useState("");
  const [popupType, setPopupType] = useState("success");
  const [showPopup, setShowPopup] = useState(false);

  const openPopup = (message, type = "success") => {
    setPopupMessage(message);
    setPopupType(type);
    setShowPopup(true);
  };

  /* OPEN MODAL */
  useEffect(() => {
    const handler = (e) => {
      if (e.detail === "open-holiday-modal") {
        setOpen(true);
      }
    };

    window.addEventListener("holiday-event", handler);

    return () =>
      window.removeEventListener(
        "holiday-event",
        handler
      );
  }, []);

  /* FORMAT DATE */
  const formatDate = (date) => {
    if (!date) return null;

    const year = date.getFullYear();
    const month = String(
      date.getMonth() + 1
    ).padStart(2, "0");

    const day = String(
      date.getDate()
    ).padStart(2, "0");

    return `${year}-${month}-${day}`;
  };

  /* ADD HOLIDAY */
  const addHoliday = async () => {
    if (
      !holidayDate ||
      !description
    ) {
      openPopup(
        "Please fill all required fields",
        "error"
      );

      return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      openPopup("Bad token.", "error");
      return;
    }

    try {
      setLoading(true);
      const payload = {
        holiday_date: formatDate(holidayDate),
        description: description,
      };

      const response = await fetch(
        `https://uat-msspathway-software-backend-81057313575.asia-south1.run.app/calendar/public-holiday?holiday_date=${payload.holiday_date}&description=${encodeURIComponent(payload.description)}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token.trim()}`,
          },
        }
      );

      if (!response.ok) {
        const errorText =
          await response.text();

        console.log(
          "Server Error:",
          errorText
        );

        throw new Error(
          "Failed to add public holiday"
        );
      }

      const data = await response.json();

      console.log("Success:", data);

      openPopup(
        "Public Holiday Added Successfully",
        "success"
      );

      window.dispatchEvent(
        new Event("timesheetSubmitted")
      );

      /* RESET */
      setOpen(false);
      setHolidayDate(null);
      setHolidayName("");
      setDescription("");

    } catch (error) {
      console.error(
        "Add Holiday Error:",
        error
      );
      openPopup(
        "Something went wrong",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {open && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center px-4">

          <div className="bg-white rounded-xl p-6 w-full max-w-md">

            <h3 className="font-semibold text-lg mb-4">
              Add Public Holiday
            </h3>

            <div className="space-y-4">

              {/* HOLIDAY DATE */}
              <div>
                <label className="block text-sm font-medium mb-1">
                  Holiday Date <span className="text-red-500">*</span>
                </label>

                <DatePicker
                  placeholderText="dd-mm-yyyy"
                  selected={holidayDate}
                  onChange={(date) =>
                    setHolidayDate(date)
                  }
                  dateFormat="dd-MM-yyyy"
                  wrapperClassName="w-full"
                  className="w-full border border-gray-300 p-2 rounded-xl text-sm hover:border-gray-200 outline-none"
                  shouldCloseOnSelect={true}
                  closeOnScroll={false}
                  onClickOutside={(e) =>
                    e.preventDefault()
                  }
                />
              </div>

              {/* DESCRIPTION */}
              <div>
                <label className="block text-sm font-medium mb-1">
                  Description <span className="text-red-500">*</span>
                </label>

                <textarea
                  value={description}
                  onChange={(e) =>
                    setDescription(
                      e.target.value
                    )
                  }
                  rows={3}
                  className="w-full border border-gray-300 p-2 rounded-xl text-sm hover:border-gray-200"
                />
              </div>

            </div>

            {/* BUTTONS */}
            <div className="flex justify-end gap-4 mt-6">

              <button
                onClick={() => setOpen(false)}
                className="text-sm text-gray-500 border border-gray-200 px-4 py-2 rounded-xl hover:bg-gray-50"
              >
                Cancel
              </button>

              <button
                onClick={addHoliday}
                disabled={loading}
                className="px-4 py-2 rounded-xl text-sm bg-green-800 text-white hover:bg-green-700"
              >
                {loading
                  ? "Adding..."
                  : "Add Holiday"}
              </button>

            </div>
          </div>
        </div>
      )}

      {/* POPUP */}
      {showPopup && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center px-4 z-50">

          <div className="bg-white w-full max-w-xs p-6 rounded-lg shadow-lg text-center">

            <h3
              className={`text-lg font-semibold mb-2 ${popupType === "error"
                ? "text-red-600"
                : "text-green-600"
                }`}
            >
              {popupType === "error"
                ? "Error"
                : "Success"}
            </h3>

            <p className="text-gray-600 text-sm">
              {popupMessage}
            </p>

            <button
              onClick={() =>
                setShowPopup(false)
              }
              className="mt-5 px-6 py-2 bg-green-800 text-white rounded-md hover:bg-green-700 text-sm"
            >
              OK
            </button>

          </div>
        </div>
      )}
    </>
  );
}

export default PublicHoliday;