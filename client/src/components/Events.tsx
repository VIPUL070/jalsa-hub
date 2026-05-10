import { FaCalendarAlt, FaMapMarkerAlt } from "react-icons/fa";
import { Link } from "react-router-dom";

interface Event {
  _id: string;
  title: string;
  date: Date;
  location: string;
  category: string;
  imageUrl?: string;
  ticketPrice: number;
  availableSeats: number;
  totalSeats: number;
}

const Events = ({ event }: { event: Event }) => {
  return (
    <div
      className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl transition flex flex-col"
    >
      <div className="h-48 bg-gray-200 overflow-hidden relative">
        {event.imageUrl ? (
          <img
            src={event.imageUrl}
            alt={event.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-200 text-gray-600 font-bold text-2xl">
            {event.category || "Event"}
          </div>
        )}
        <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-bold shadow-sm">
          {event.ticketPrice === 0 ? (
            <span className="text-green-600">FREE</span>
          ) : (
            <span className="text-gray-900">₹{event.ticketPrice}</span>
          )}
        </div>
      </div>
      <div className="p-6 flex grow flex-col">
        <div className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
          {event.category}
        </div>
        <h2 className="text-xl font-bold text-gray-800 mb-3">{event.title}</h2>
        <div className="flex flex-col gap-2 mb-4 text-gray-600 text-sm">
          <div className="flex items-center gap-2">
            <FaCalendarAlt className="text-gray-400" />
            <span>
              {new Date(event.date).toLocaleDateString(undefined, {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <FaMapMarkerAlt className="text-gray-400" />
            <span>{event.location}</span>
          </div>
        </div>
        <div className="mt-auto">
          <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
            <div
              className="bg-gray-700 h-2 rounded-full"
              style={{
                width: `${(event.availableSeats / event.totalSeats) * 100}%`,
              }}
            ></div>
          </div>
          <p className="text-xs text-gray-500 mb-4">
            {event.availableSeats} of {event.totalSeats} seats remaining
          </p>
          <Link
            to={`/events/${event._id}`}
            className="block w-full text-center bg-gray-100 hover:bg-gray-200 text-gray-900 font-semibold py-2 rounded-lg transition"
          >
            View Details
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Events;
