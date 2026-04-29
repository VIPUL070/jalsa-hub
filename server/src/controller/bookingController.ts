import type { RequestHandler } from "express";
import { Otp } from "../models/otp.js";
import { sendOtpEmail } from "../utils/email.js";
import { Event } from "../models/events.js";
import { Booking } from "../models/bookings.js";

const generateOTP = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

export const sendBookingOTP: RequestHandler = async (req, res) => {
    const otp = generateOTP();
    try {
        if (!req.user?.email) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        await Otp.findOneAndDelete({ email: req.user?.email, action: 'event_booking' });
        await Otp.create({})
        await sendOtpEmail(req.user?.email as string, otp, 'event_booking');
        res.status(200).json({
            message: 'OTP sent to email'
        })
    } catch (error) {
        res.status(500).json({
            message: (error as Error).message
        })
    }
}

export const bookEvent: RequestHandler = async (req, res) => {
    const { eventId, otp } = req.body;
    try {
        if (!req.user?._id || !req.user?.email) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        // 2. Verify OTP 
        const otpRecord = await Otp.findOne({ 
            email: req.user.email, 
            otp, 
            action: 'event_booking' 
        });

        if (!otpRecord) {
            return res.status(400).json({ message: "Invalid or expired OTP" });
        }

        // 3. Check Event Availability
        const event = await Event.findById(eventId);
        if (!event) {
            return res.status(404).json({ message: "Event not found" });
        }

        if (event.totalSeats <= 0) {
            return res.status(400).json({ message: "No seats available" });
        }

        // 4. Prevent Duplicate Bookings
        const existingBooking = await Booking.findOne({
            userId: req.user._id,
            eventId
        });

        if (existingBooking) {
            return res.status(400).json({ message: "You have already booked this event" });
        }

        // 5. Create Booking & Update Event Seats
        const booking = await Booking.create({
            userId: req.user._id,
            eventId,
            amount: event.ticketPrice,
            status: 'pending',
            paymentStatus: 'not_paid',
        });

        await Otp.deleteOne({ _id: otpRecord._id });

        res.status(201).json({
            message: "Booking initiated successfully",
        });

    } catch (error) {
        res.status(500).json({
            message: (error as Error).message
        });
    }
};

export const confirmBooking: RequestHandler = async (req, res) => {

}

export const getMyBookings: RequestHandler = async (req, res) => {

}

export const cancelBooking: RequestHandler = async (req, res) => {

}