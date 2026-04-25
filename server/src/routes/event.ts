import { Router } from "express";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { adminMiddleware } from "../middleware/adminMiddleware.js";
import { createEvent, deleteEvent, getAllEvents, getEventById, updateEvent } from "../controller/eventController.js";

const router = Router();

//get event for all users
router.get('/', getAllEvents);

//get event for particular user based on id
router.get('/:id', authMiddleware, getEventById);

//create an event (for admin only)
router.post('/' , authMiddleware , adminMiddleware , createEvent);

//update an event (for admin only)
router.put('/:id' ,authMiddleware, adminMiddleware, updateEvent);

//delete an event (for admin only)
router.delete('/:id', authMiddleware, adminMiddleware, deleteEvent);


export default router;