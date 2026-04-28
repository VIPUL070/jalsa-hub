import { Router } from "express";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { adminMiddleware } from "../middleware/adminMiddleware.js";
import { bookEvent, cancelBooking, confirmBooking, getMyBookings, sendBookingOTP } from "../controller/bookingController.js";

const router = Router();

router.post('/', authMiddleware , bookEvent);
router.post('send-otp', authMiddleware, sendBookingOTP);
router.get('/my', authMiddleware , getMyBookings);
router.patch('/:id/confirm', authMiddleware, adminMiddleware, confirmBooking);
router.delete('/:id', authMiddleware, cancelBooking)

export default router;