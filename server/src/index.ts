import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import path from 'path';
import { fileURLToPath } from 'url';
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

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const clientDistPath = path.resolve(__dirname, '../../client/dist');

app.use(express.static(clientDistPath));
app.get(/^(?!\/api).*/, (_req, res) => {
    res.sendFile(path.join(clientDistPath, 'index.html'));
});

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
