import { FaTimesCircle } from "react-icons/fa";
import type { Booking } from "../pages/AdminDashboard";
import { Link } from "react-router-dom";

interface LightEvent {
  _id: string;
  title: string;
  date: string;
}

interface UserBookingListItem extends Omit<Booking, 'eventId'> {
  eventId: LightEvent | null;
}

const UserBookingsList = ({
  booking,
  onCancel,
}: {
  booking: UserBookingListItem;
  onCancel: () => void;
}) => {
  return (
    <div
      key={booking._id}
      className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition border border-gray-100 flex flex-col"
    >
      <div className="p-6 border-b border-gray-50 grow">
        {booking.eventId ? (
          <>
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-lg font-bold text-gray-900 leading-tight">
                {booking.eventId.title}
              </h3>
              <div className="flex flex-col gap-1 items-end">
                <span
                  className={`px-2 py-1 text-[10px] font-black rounded uppercase tracking-wider ${
                    booking.status === "confirmed"
                      ? "bg-green-100 text-green-700"
                      : booking.status === "cancelled"
                      ? "bg-red-100 text-red-700"
                      : "bg-yellow-100 text-yellow-700"
                  }`}
                >
                  {booking.status}
                </span>
                {booking.status !== "cancelled" && (
                  <span
                    className={`px-2 py-1 text-[10px] font-black rounded uppercase tracking-wider ${
                      booking.paymentStatus === "paid"
                        ? "bg-blue-100 text-blue-700"
                        : "bg-gray-100 text-gray-700"
                    }`}
                  >
                    {booking.paymentStatus.replace("_", " ")}
                  </span>
                )}
              </div>
            </div>
            <div className="text-sm text-gray-500 mb-4 space-y-1">
              <p>
                <strong className="text-gray-700">Date:</strong>{" "}
                {new Date(booking.eventId.date).toLocaleDateString()}
              </p>
              <p>
                <strong className="text-gray-700">Amount:</strong>{" "}
                {booking.amount === 0 ? "Free" : `₹${booking.amount}`}
              </p>
              <p>
                <strong className="text-gray-700">Requested:</strong>{" "}
                {new Date(booking.booked_at).toLocaleDateString()}
              </p>
            </div>
          </>
        ) : (
          <p className="text-red-500 italic">
            Event details unavailable (might have been deleted)
          </p>
        )}
      </div>
      <div className="p-4 bg-gray-50 flex justify-between items-center shrink-0">
        {booking.eventId && booking.status !== "cancelled" ? (
          <>
            <Link
              to={`/events/${booking.eventId._id}`}
              className="text-gray-900 font-semibold text-sm hover:underline"
            >
              View Event
            </Link>
            <button
              onClick={onCancel}
              className="text-red-500 cursor-pointer font-semibold text-sm hover:text-red-700 transition flex items-center gap-1"
            >
              <FaTimesCircle /> Cancel
            </button>
          </>
        ) : (
          <div className="w-full text-center text-sm text-gray-500 italic">
            Booking Cancelled
          </div>
        )}
      </div>
    </div>
  );
};

export default UserBookingsList;
