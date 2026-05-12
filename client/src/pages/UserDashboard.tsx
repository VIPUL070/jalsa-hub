import { useContext, useEffect, useState } from "react";
import { FaTicketAlt } from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext, type AuthContextType } from "../context/AuthContext";
import api from "../utils/axios";
import type { AxiosError } from "axios";
import UserBookingsList from "../components/UserBookingsList";

interface PopulatedEvent {
  _id: string;
  title: string;
  date: string;
  location: string;
  category: string;
  ticketPrice: number;
  imageUrl: string;
}

interface Booking {
  _id: string;
  userId: string;
  eventId: PopulatedEvent | null;
  status: "pending" | "confirmed" | "cancelled";
  paymentStatus: "non_paid" | "paid";
  amount: number;
  booked_at: string;
  createdAt: string;
  updatedAt: string;
}

interface ApiResponse {
  message: string;
  bookings: Booking[];
}

const UserDashboard = () => {
  const { user, loading: authLoading } = useContext(
    AuthContext
  ) as AuthContextType;
  const navigate = useNavigate();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchBookings = async () => {
    try {
      const { data } = await api.get<ApiResponse>("/bookings/my");
      setBookings(data?.bookings ?? []);
    } catch (error) {
      console.error("Error fetching bookings", error);
      setBookings([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      navigate("/login");
      return;
    }

    (async () => {
      try {
        const { data } = await api.get<ApiResponse>("/bookings/my");
        setBookings(data?.bookings ?? []);
      } catch (error) {
        console.error("Error fetching bookings", error);
        setBookings([]);
      } finally {
        setLoading(false);
      }
    })();
  }, [user, navigate, authLoading]);

  const cancelBooking = async (id: string) => {
    if (
      window.confirm("Are you sure you want to cancel this booking request?")
    ) {
      try {
        await api.delete(`/bookings/${id}`);
        fetchBookings();
      } catch (error) {
        const err = error as AxiosError<{ message: string }>;
        alert(err.response?.data?.message || "Error cancelling booking");
      }
    }
  };

  if (loading)
    return (
      <div className="text-center py-20 text-xl font-semibold">
        Loading dashboard...
      </div>
    );

  return (
    <div className="max-w-6xl mx-auto">
      <div className="bg-white rounded-2xl shadow-sm p-6 sm:p-8 mb-8 border border-gray-100 flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-4 sm:gap-6">
        <div className="w-20 h-20 bg-gray-200 text-gray-900 rounded-full flex items-center justify-center text-3xl font-bold uppercase tracking-widest shrink-0">
          {user?.name?.charAt(0)}
        </div>
        <div className="flex flex-col items-center sm:items-start">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mb-2">
            Welcome, {user?.name ?? "Guest"}!
          </h1>
          <p className="text-gray-500 flex items-center justify-center sm:justify-start gap-2">
            <span className="w-2 h-2 rounded-full bg-green-500"></span> User
            Dashboard
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-800 flex items-center gap-2 sm:gap-3">
          <FaTicketAlt className="text-gray-700" /> My Bookings requests
        </h2>
      </div>

      {bookings.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm p-12 text-center border border-gray-100">
          <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <FaTicketAlt className="text-gray-300 text-3xl" />
          </div>
          <p className="text-xl text-gray-500 mb-6 mt-4 font-medium">
            You haven't booked any events yet.
          </p>
          <Link
            to="/"
            className="inline-block bg-gray-900 hover:bg-black text-white font-bold py-3 px-8 rounded-lg transition shadow-md"
          >
            Browse Events
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {bookings.map((booking) => (
            <UserBookingsList key={booking._id} booking={booking} onCancel={() => cancelBooking(booking._id)}  />
          ))}
        </div>
      )}
    </div>
  );
};

export default UserDashboard;
