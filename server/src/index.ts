import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import authRouter from './routes/auth.js';
import eventRouter from './routes/event.js';
import bookingRouter from './routes/booking.js';

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());

app.use('/api/auth', authRouter);
app.use('/api/events', eventRouter );
app.use('/api/bookings', bookingRouter );

const PORT = process.env.PORT || 5000;

const URL = process.env.DB_URL
mongoose.connect(`${URL}/jalsa_hub`)
.then(() => {
    console.log("DB connected")
})
.catch((err) => {
    console.log("Error connecting to DB:", err);
})

app.listen(PORT , () => {
    console.log(`App listening on port ${PORT}`)
})
