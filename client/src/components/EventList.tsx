interface PopulatedEvent {
  _id: string;
  title: string;
  date: string;
  location: string;
  category: string;
  ticketPrice: number;
  imageUrl: string;
  availableSeats: number;
  totalSeats: number;
}

const EventList = ({ event, onClick }: { event: PopulatedEvent; onClick: () => void }) => {
  return (
    <li
      key={event._id}
      className="p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:bg-gray-50 transition border-b border-gray-100 last:border-0"
    >
      <div>
        <h4 className="font-bold text-gray-900 mb-1 leading-tight">
          {event.title}
        </h4>
        <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500">
          <span className="flex items-center gap-1 font-medium">
            <div className="w-2 h-2 rounded-full bg-blue-500"></div>
            {new Date(event.date).toLocaleDateString()}
          </span>
          <span className="flex items-center gap-1 font-medium">
            <div
              className={`w-2 h-2 rounded-full ${
                event.availableSeats > 0 ? "bg-green-500" : "bg-red-500"
              }`}
            ></div>
            {event.availableSeats}/{event.totalSeats} seats
          </span>
        </div>
      </div>
      <button
        onClick={onClick}
        className="w-full sm:w-auto text-red-500 hover:text-white hover:bg-red-500 border border-red-200 px-4 py-2 rounded-lg text-sm font-bold transition shadow-sm shrink-0 cursor-pointer"
      >
        Delete
      </button>
    </li>
  );
};

export default EventList;
