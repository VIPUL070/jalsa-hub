import mongoose from "mongoose";
import { required } from "zod/mini";

const otpSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true
    },
    otp: {
        type: String,
        required: true
    },
    action: {
        type: String,
        enum : ['account_verification', 'event_booking'],
        required: true
    },
    createdAt : {
        type: Date,
        default: Date.now,
        expires : 300    //after 5 mins
    }
},{ timestamps: true });

export const Otp = mongoose.model('OTP', otpSchema);