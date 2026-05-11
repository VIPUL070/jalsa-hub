import type { Booking } from "../pages/AdminDashboard";

const BookingList = ({
  booking,
  handleCancel,
  handleConfirm,
}: {
  booking: Booking;
  handleCancel: () => void;
  handleConfirm: () => void;
}) => {
  return (
    <li
      key={booking._id}
      className={`p-6 hover:bg-gray-50 transition border-l-4 ${
        booking.status === "pending"
          ? "border-l-yellow-400"
          : booking.status === "confirmed"
          ? "border-l-green-400"
          : "border-l-red-400"
      }`}
    >
      <div className="flex justify-between items-start mb-3">
        <h4 className="font-bold text-gray-900 text-lg leading-tight">
          {booking.eventId?.title || "Deleted Event"}
        </h4>
        <div className="flex flex-col gap-1 items-end shrink-0 ml-4">
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
        </div>
      </div>
      <div className="bg-gray-50 rounded-lg p-3 mb-3 border border-gray-100 text-sm">
        <p className="text-gray-700 flex items-center gap-2 mb-1">
          <span className="font-bold w-16 text-gray-500 uppercase text-xs">
            User:
          </span>
          <span className="font-semibold">{booking.userId?.name}</span>
          <span className="text-gray-400">({booking.userId?.email})</span>
        </p>
        <p className="text-gray-700 flex items-center gap-2 mb-1">
          <span className="font-bold w-16 text-gray-500 uppercase text-xs">
            Amount:
          </span>
          <span
            className={`font-semibold ${
              booking.amount === 0 ? "text-green-600" : ""
            }`}
          >
            {booking.amount === 0 ? "Free" : `₹${booking.amount}`}
          </span>
        </p>
        <p className="text-gray-700 flex items-center gap-2 mb-1">
          <span className="font-bold w-16 text-gray-500 uppercase text-xs">
            Date:
          </span>
          <span>{new Date(booking.booked_at).toLocaleString()}</span>
        </p>
      </div>

      {booking.status === "pending" && (
        <div className="flex flex-wrap mt-2 gap-3">
          <button
            onClick={handleConfirm}
            className="flex-1 bg-green-50 text-green-700 hover:bg-green-600 hover:text-white border border-green-200 text-xs font-bold py-2.5 px-3 rounded-lg shadow-sm transition cursor-pointer"
          >
            ✓ Approve Paid
          </button>
          <button
            onClick={handleCancel}
            className="flex-1 bg-red-50 text-red-600 hover:bg-red-500 hover:text-white border border-red-200 text-xs font-bold py-2.5 px-3 rounded-lg transition cursor-pointer"
          >
            ✕ Reject
          </button>
        </div>
      )}
    </li>
  );
};

export default BookingList;
