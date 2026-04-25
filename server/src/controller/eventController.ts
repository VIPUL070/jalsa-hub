import { type RequestHandler } from 'express';
import z from 'zod';
import { Event } from '../models/events.js';

export const getAllEvents: RequestHandler = async (req, res) => {
    try {
        const filters: any = {}
        if (req.query.category) filters.category = req.query.category;
        if (req.query.search) filters.title = { $regex: req.query.search, $options: 'i' };

        const events = await Event.find(filters).populate('createdBy', 'name email');
        res.status(200).json({
            message: "Events fetched successfully",
            events
        })
    }
    catch (error) {
        res.status(500).json({
            message: (error as Error).message
        })
    }
}

export const getEventById: RequestHandler = async (req, res) => {
    try {
        const userEvents = await Event.findById(req.params.id).populate('createdBy', 'name email');

        if (!userEvents) {
            return res.status(404).json({
                message: "Events not found"
            })
        }
        res.status(200).json({
            message: "Events fetched successfully",
            userEvents
        })

    } catch (error) {
        res.status(500).json({
            message: (error as Error).message
        })
    }
}

const eventsDetails = z.object({
    title: z.string().min(1),
    description: z.string().min(10),
    date: z.coerce.date(),
    location: z.string().min(1),
    category: z.string().min(1),
    totalSeats: z.number().int().positive(),
    availableSeats: z.number().int().nonnegative(),
    ticketPrice: z.number().nonnegative(),
    imageUrl: z.string().url(),
})

export const createEvent: RequestHandler = async (req, res) => {
    const validData = eventsDetails.safeParse(req.body);
    if (!validData.success) {
        return res.status(403).json({
            message: "Invalid event details"
        })
    }

    try {
        if (!req.user) {
            return res.status(401).json({ message: "User not authenticated" });
        }
        const event = await Event.create({
            ...validData.data,
            createdBy: req.user._id
        })

        res.status(200).json({
            message: "Event created Successfully",
            event
        })

    } catch (error) {
        res.status(500).json({
            message: (error as Error).message
        })
    }

}

export const updateEvent: RequestHandler = async (req, res) => {
    try {
        const event = await Event.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!event) return res.status(404).json({ message: 'Event not found' });
        res.status(200).json({
            message: "Event updated successfully",
            event
        });
    } catch (error) {
        res.status(500).json({
            message: (error as Error).message
        })
    }
}

export const deleteEvent: RequestHandler = async (req, res) => {
    try {
        const event = await Event.findByIdAndDelete(req.params.id);
        if (!event) return res.status(404).json({ message: 'Event not found' });
        res.status(200).json({ message: 'Event deleted successfully' });
    } catch (error) {
        res.status(500).json({
            message: (error as Error).message
        })
    }

}