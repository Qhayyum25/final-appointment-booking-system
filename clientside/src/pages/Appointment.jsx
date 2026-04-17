import React, { useContext, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { AppContext } from "../context/AppContext";
import { assets } from "../assets/assets";
import RelatedDoctors from "../components/RelatedDoctors";
import MockPayment from "../components/MockPayment";
import { toast } from "react-toastify";
import axios from "axios";

const Appointment = () => {
  const { docId } = useParams();
  const { doctors, currencySymbol, backendUrl, token, getDoctorsData } =
    useContext(AppContext);
  const daysOfWeek = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];

  const navigate = useNavigate();

  const [docInfo, setDocInfo] = useState(null);
  const [docSlots, setDocSlots] = useState([]);
  const [slotIndex, setSlotIndex] = useState(0);
  const [slotTime, setSlotTime] = useState("");
  const [appointmentId, setAppointmentId] = useState(null);
  const [bookingDone, setBookingDone] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchDocInfo = async () => {
    try {
      if (!doctors || doctors.length === 0) {
        console.log("Doctors not loaded yet, fetching...");
        await getDoctorsData();
        return;
      }

      const foundDoc = doctors.find((doc) => doc._id === docId);
      if (foundDoc) {
        setDocInfo(foundDoc);
        setLoading(false);
      } else {
        toast.error("Doctor not found");
        navigate("/");
      }
    } catch (error) {
      console.log("Error fetching doctor:", error);
      toast.error("Error loading doctor information");
      setLoading(false);
    }
  };

  const getAvailableSlots = async () => {
    try {
      setDocSlots([]);

      if (!docInfo || !docInfo.slots_booked) {
        console.log("Doctor info not ready");
        return;
      }

      let today = new Date();

      for (let i = 0; i < 7; i++) {
        let currentDate = new Date(today);
        currentDate.setDate(today.getDate() + i);

        let endTime = new Date();
        endTime.setDate(today.getDate() + i);
        endTime.setHours(21, 0, 0, 0);

        if (today.getDate() === currentDate.getDate()) {
          currentDate.setHours(
            currentDate.getHours() > 10 ? currentDate.getHours() + 1 : 10
          );
          currentDate.setMinutes(currentDate.getMinutes() > 30 ? 30 : 0);
        } else {
          currentDate.setHours(10);
          currentDate.setMinutes(0);
        }

        let timeSlots = [];

        while (currentDate < endTime) {
          let formattedTime = currentDate.toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          });

          let day = currentDate.getDate();
          let month = currentDate.getMonth() + 1;
          let year = currentDate.getFullYear();

          const slotDate = day + "_" + month + "_" + year;
          const slotTime = formattedTime;

          const isSlotBooked =
            docInfo.slots_booked[slotDate] &&
            docInfo.slots_booked[slotDate].includes(slotTime);

          timeSlots.push({
            datetime: new Date(currentDate),
            time: formattedTime,
            booked: !!isSlotBooked,
          });

          currentDate.setMinutes(currentDate.getMinutes() + 30);
        }

        setDocSlots((prev) => [...prev, timeSlots]);
      }
    } catch (error) {
      console.log("Error getting slots:", error);
      toast.error("Error loading available slots");
    }
  };

  const bookAppointment = async () => {
    if (!token) {
      toast.warn("Please login to book an appointment");
      return navigate("/login?mode=login");
    }

    if (!slotTime) {
      toast.error("Please select a time slot");
      return;
    }

    try {
      const date = docSlots[slotIndex][0].datetime;

      let day = date.getDate();
      let month = date.getMonth() + 1;
      let year = date.getFullYear();

      const slotDate = day + "_" + month + "_" + year;

      const { data } = await axios.post(
        backendUrl + "/api/user/book-appointment",
        { docId, slotDate, slotTime },
        { headers: { token } }
      );

      if (data.success) {
        toast.success("Appointment created! Now proceed to payment.");
        setAppointmentId(data.appointmentId);
        setBookingDone(true);
        getDoctorsData();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.log(error);
      if (error.response?.status === 401) {
        toast.error("Session expired. Please login again.");
        navigate("/login?mode=login");
      } else {
        toast.error(error.message);
      }
    }
  };

  useEffect(() => {
    fetchDocInfo();
  }, [doctors, docId]);

  useEffect(() => {
    if (docInfo) {
      getAvailableSlots();
    }
  }, [docInfo]);

  useEffect(() => {
    if (!token) {
      navigate("/login");
    }
  }, [token, navigate]);

  if (!token) return null;

  // Loading state
  if (loading) {
    return (
      <div className="text-center mt-20">
        <p className="text-gray-600">Loading doctor information...</p>
      </div>
    );
  }

  // Error state
  if (!docInfo) {
    return (
      <div className="text-center mt-20">
        <p className="text-red-600">Doctor information not available</p>
        <button
          onClick={() => navigate("/")}
          className="mt-4 bg-primary text-white px-6 py-2 rounded"
        >
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div>
      {/* -------------------- Doctor Details -------------------- */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div>
          <img
            className="bg-primary w-full sm:max-w-72 rounded-lg"
            src={docInfo.image}
            alt=""
          />
        </div>

        <div className="flex-1 border border-gray-400 rounded-lg p-8 py-7 bg-white mx-2 sm:mx-0 mt-[-80px] sm:mt-0">
          <p className="flex items-center gap-2 text-2xl font-medium text-gray-900">
            {docInfo.name}
            <img className="w-5" src={assets.verified_icon} alt="" />
          </p>
          <div className="flex items-center gap-2 text-sm mt-1 text-gray-600">
            <p>
              {docInfo.degree} - {docInfo.speciality}
            </p>
            <button className="py-0.5 px-2 border text-xs rounded-full">
              {docInfo.experience}
            </button>
          </div>

          <div>
            <p className="flex items-center gap-1 text-sm font-medium text-gray-600 mt-3">
              About <img src={assets.info_icon} alt="" />
            </p>
            <p className="text-sm text-gray-500 max-w-[700px] mt-1">
              {docInfo.about}
            </p>
          </div>
          <p className="text-gray-500 font-medium mt-4">
            Appointment fee:{" "}
            <span className="text-gray-600">
              {currencySymbol}
              {docInfo.fees}
            </span>
          </p>
        </div>
      </div>

      {/* -------------------- Booking Slots -------------------- */}
      {!bookingDone ? (
        <div className="sm:ml-72 sm:pl-4 mt-4 font-medium text-gray-700">
          <p>Booking slots</p>
          {docSlots.length > 0 ? (
            <>
              <div className="flex gap-3 items-center w-full overflow-x-scroll mt-4">
                {docSlots.map((item, index) => (
                  <div
                    onClick={() => setSlotIndex(index)}
                    className={`text-center py-6 min-w-16 rounded-full cursor-pointer ${
                      slotIndex === index
                        ? "bg-primary text-white"
                        : "border border-gray-200"
                    }`}
                    key={index}
                  >
                    <p>{item[0] && daysOfWeek[item[0].datetime.getDay()]}</p>
                    <p>{item[0] && item[0].datetime.getDate()}</p>
                  </div>
                ))}
              </div>

              <div className="flex items-center gap-3 w-full overflow-x-scroll mt-4">
                {docSlots[slotIndex] &&
                  docSlots[slotIndex].map((item, index) => (
                    <div
                      key={index}
                      onClick={() => setSlotTime(item.time)}
                      className={`text-sm font-light flex-shrink-0 px-5 py-2 rounded-full cursor-pointer relative ${
                        item.time === slotTime
                          ? "bg-primary text-white"
                          : item.booked
                          ? "text-orange-600 border border-orange-300 bg-orange-50"
                          : "text-gray-400 border border-gray-300"
                      }`}
                    >
                      <p>{item.time.toLowerCase()}</p>
                      {item.booked && (
                        <span className="absolute -top-2 -right-2 bg-orange-500 text-white text-[10px] px-1 rounded-full">
                          Popular
                        </span>
                      )}
                    </div>
                  ))}
              </div>
              <button
                onClick={bookAppointment}
                className="bg-primary text-white text-sm font-light px-14 py-3 rounded-full my-6"
              >
                Book an appointment
              </button>
            </>
          ) : (
            <p className="text-gray-500 mt-4">No available slots</p>
          )}
        </div>
      ) : (
        <div className="sm:ml-72 sm:pl-4 mt-4 font-medium text-gray-700">
          <p className="text-lg font-semibold text-green-600 mb-4">
            ✅ Appointment Created! Now Proceed to Payment
          </p>
          <div className="max-w-md">
            <MockPayment
              amount={docInfo.fees}
              appointmentId={appointmentId}
              userId={docId}
              docId={docId}
              token={token}
              onSuccess={() => {
                toast.success("Payment successful!");
                getDoctorsData();
                navigate("/my-appointments");
              }}
            />
          </div>
        </div>
      )}

      {/* -------------------- Listing Related Doctors -------------------- */}
      <RelatedDoctors docId={docId} speciality={docInfo.speciality} />
    </div>
  );
};

export default Appointment;
