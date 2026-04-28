import mongoose from "mongoose"

const bookingSchema = new mongoose.Schema({
    userId : {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Event',
        required: true
    },
    status: {
        type: ['pending', 'confirmed', 'cancelled'],
        default: 'pending'
    },
    paymentStatus: {
        tyep: ['non_paid','paid'],
        default: 'non_paid'
    },
    amount: {
        type: Number,
        required: true
    }
}, {timestamps: true})

export const Booking = mongoose.model('Booking', bookingSchema)