import { useState, useEffect } from "react";
import api from "../utils/axios";
import { FaSearch } from "react-icons/fa";
import FeaturesRow from "../components/FeaturesRow";
import Events from "../components/Events";
import Footer from "../components/Footer";

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

const Home = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [search, setSearch] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);

  const fetchEvents = async () => {
    try {
      const { data } = await api.get(`/events?search=${search}`);
      if (Array.isArray(data)) {
        setEvents(data);
      } else if (data && Array.isArray(data.events)) {
        setEvents(data.events);
      } else {
        setEvents([]);
      }
    } catch (error) {
      console.error("Error fetching events:", error);
      setEvents([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchEvents();
    }, 400);
    return () => clearTimeout(timeoutId);
  }, [search]);

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <div className="relative bg-black text-white rounded-3xl overflow-hidden mb-12 shadow-2xl">
        <div className="absolute inset-0 opacity-80 bg-[url('/hero.avif')] bg-cover bg-center"></div>
        <div className="absolute inset-0 bg-linear-to-t from-black via-black/80 to-transparent"></div>
        <div className="relative p-10 md:p-20 text-center flex flex-col items-center z-10">
          <span className="bg-white/20 text-white backdrop-blur-md px-4 py-1.5 rounded-full text-xs font-bold tracking-widest uppercase mb-6 border border-white/20">
            Welcome to Jalsa Hub
          </span>
          <h1 className="text-5xl md:text-7xl font-black mb-6 leading-tight tracking-tight drop-shadow-lg">
            Find Your Next <br />
            <span className="text-transparent bg-clip-text bg-linear-to-r from-gray-200 to-gray-500">
              Unforgettable
            </span>{" "}
            Experience
          </h1>
          <p className="text-gray-300 text-lg md:text-xl mb-10 max-w-2xl mx-auto font-light leading-relaxed">
            Discover the best tech conferences, late-night music festivals, and
            hands-on workshops happening directly in your area. Secure your spot
            today.
          </p>

          <div className="w-full max-w-2xl mx-auto relative flex items-center shadow-2xl group">
            <FaSearch className="absolute left-6 text-gray-500 text-xl group-focus-within:text-black transition-colors" />
            <input
              type="text"
              placeholder="Search events by title..."
              className="w-full pl-16 pr-6 py-5 rounded-full text-lg text-black bg-white/95 backdrop-blur-sm border-2 border-transparent focus:border-gray-500 focus:outline-none transition-all placeholder-gray-400 font-medium"
              value={search}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setSearch(e.target.value)
              }
            />
          </div>
        </div>
      </div>

      {/* Why Choose Us / Features row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16 px-4">
        <FeaturesRow />
      </div>

      <div className="flex items-center justify-between mb-8 px-2 border-b border-gray-200 pb-4">
        <h2 className="text-3xl font-extrabold text-gray-900">
          Upcoming Events
        </h2>
        <div className="text-gray-500 font-medium">
          {events.length} results found
        </div>
      </div>

      {loading ? (
        <div className="text-center py-20 text-xl font-semibold text-gray-600">
          Loading events...
        </div>
      ) : events.length === 0 ? (
        <div className="text-center py-20 text-xl text-gray-500">
          No events found matching your search.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {events.map((event: Event) => (
            <Events key={event._id} event={event} />
          ))}
        </div>
      )}

      {/* Footer Section */}
      <Footer />
    </div>
  );
};

export default Home;
