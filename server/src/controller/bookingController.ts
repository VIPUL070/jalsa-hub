import type { RequestHandler } from "express";
import { Otp } from "../models/otp.js";
import { sendBookingEmail, sendOtpEmail } from "../utils/email.js";
import { Event } from "../models/events.js";
import { Booking } from "../models/bookings.js";

const generateOTP = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

const fireAndForgetOtpEmail = (email: string, otp: string, action: string) => {
    sendOtpEmail(email, otp, action).catch(err => {
        console.error(`Background OTP email failed for ${email} (${action}):`, err);
    });
};

const fireAndForgetBookingEmail = (email: string, name: string, bookingId: string) => {
    sendBookingEmail(email, name, bookingId).catch(err => {
        console.error(`Background booking email failed for ${email}:`, err);
    });
};

export const sendBookingOTP: RequestHandler = async (req, res) => {
    const otp = generateOTP();
    try {
        if (!req.user?.email) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        await Otp.findOneAndDelete({ email: req.user?.email, action: 'event_booking' });
        await Otp.create({
            email: req.user.email,
            otp,
            action: 'event_booking'
        })
        fireAndForgetOtpEmail(req.user.email, otp, 'event_booking');
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
            paymentStatus: 'non_paid',
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
    try {
        const { paymentStatus } = req.body;

        const booking = await Booking.findById(req.params.id).populate('eventId');

        if (!booking) {
            return res.status(404).json({ message: "Booking not Found" });
        }

        if (booking.status === 'confirmed') {
            return res.status(400).json({ message: "Booking is already confirmed" });
        }

        const event = await Event.findById(booking.eventId._id);
        if (!event) {
            return res.status(404).json({ message: "Associated event not found" });
        }
        
        const updateResult = await Event.updateOne(
            { _id: event._id, availableSeats: { $gt: 0 } },
            { $inc: { availableSeats: -1 } }
        );

        if (updateResult.modifiedCount === 0) {
            return res.status(400).json({ message: "Failed to secure seat. Event might be full." });
        }

        booking.status = 'confirmed';
        if (paymentStatus) {
            booking.paymentStatus = paymentStatus;
        }

        await booking.save();

        // email will be send on admin confirmation
          if (req.user?.email && req.user?.name) {
            fireAndForgetBookingEmail(
                req.user.email, 
                req.user.name, 
                booking._id.toString()
            );
        }


        return res.status(200).json({
            message: "Booking confirmed successfully",
            booking
        });

    } catch (error) {
        return res.status(500).json({
            message: 'Server Error',
            error: (error as Error).message
        });
    }
}

export const getMyBookings: RequestHandler = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({ message: "Unauthorized" });
        }
        const bookings = req.user.role === 'admin'
            ? await Booking.find().populate('eventId').populate('userId', 'name email').sort({ createdAt: -1 })
            : await Booking.find({ userId: req.user?._id }).populate('eventId').sort({ createdAt: -1 });

        res.status(200).json({
            message: "Bookings fetched successfully",
            bookings,
        })

    } catch (error) {
        return res.status(500).json({
            message: 'Server Error',
            error: (error as Error).message
        });
    }
}


export const cancelBooking: RequestHandler = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        const booking = await Booking.findById(req.params.id);
        if (!booking) {
            return res.status(404).json({
                message: "Booking not found"
            })
        }
        
        const userId = req.user?._id.toString();
        const userRole = req.user?.role;
        const isOwner = booking.userId.toString() === userId;
        const isAdmin = userRole === 'admin';

        if (!isOwner && !isAdmin) {
        return res.status(403).json({ message: "No permission to reject this booking" });
    }

        if (booking.status === 'cancelled') {
            return res.status(400).json({ message: "Booking already cancelled" });
        }

        const wasConfirmed = booking.status === 'confirmed';

        booking.status = 'cancelled'
        await booking.save();
        if (wasConfirmed) {
            await Event.updateOne(
                { _id: booking.eventId._id },          
                { $inc: { availableSeats: 1 } }
            );
        }
        res.status(200).json({
            message: "Booking cancelled successfully"
        });

    } catch (error) {
        return res.status(500).json({
            message: 'Server Error',
            error: (error as Error).message
        });
    }
}

