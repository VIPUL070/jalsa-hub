import type { Request, Response } from "express";
import zod from 'zod'
import bcrypt from "bcryptjs";
import jwt from 'jsonwebtoken';
import { User } from "../models/user.js";
import { sendOtpEmail } from "../utils/email.js";
import { Otp } from "../models/otp.js";

const JWT_SECRET = process.env.JWT_SECRET as string

const registerSchema = zod.object({
    name: zod.string().min(1),
    email: zod.email(),
    password: zod.string().min(1)
});

const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

export const registerUser = async (req: Request, res: Response) => {
    const response = registerSchema.safeParse(req.body);

    if (!response.success) {
        return res.status(411).json({
            message: "Error in inputs"
        })
    }

    const { name, email, password } = response.data;

    try {
        const userExist = await User.findOne({
            $or: [{ email }, { name }]
        })

        if (userExist) {
            const field = userExist.email === email ? "email" : "username";
            return res.status(409).json({
                message: `User already exists with this ${field}`
            })
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt)

        const newUser = await User.create({
            name,
            email,
            password: hashedPassword
        })

        const otp = generateOTP();
        console.log(`OTP for ${email}: ${otp}`)
        await Otp.create({ email, otp, action: 'account_verification' })
        await sendOtpEmail(email, otp, 'account_verification');

        res.status(201).json({
            message: "User registered successfully. Please check your email to verify your account.",
            email,
        })

    } catch (error) {
        res.status(500).json({
            message: (error as Error).message
        })
    }
}

const loginSchema = zod.object({
    email: zod.email(),
    password: zod.string().min(1)
});

export const loginUser = async (req: Request, res: Response) => {
    const response = loginSchema.safeParse(req.body);

    if (!response.success) {
        return res.status(411).json({
            message: "Error in inputs"
        })
    }

    const { email, password } = response.data;

    try {
        const user = await User.findOne({ email })

        if (!user) {
            return res.status(400).json({
                message: "Invalid credentials"
            })
        }

        const isMatch = await bcrypt.compare(password, user.password)
        if (!isMatch) {
            return res.status(400).json({
                message: "Invalid credentials"
            })
        }

        if (!user.isVerified && user.role !== 'admin') {
            const otp = generateOTP();
            await Otp.findOneAndDelete({ email: user.email, action: 'account_verification' });
            await Otp.create({ email: user.email, otp, action: 'account_verification' });
            await sendOtpEmail(user.email, otp, 'account_verification');
            return res.status(403).json({
                message: 'Account not verified',
                needsVerification: true,
                email: user.email
            });
        }

        const token = jwt.sign({ userId: user._id, role: user.role }, JWT_SECRET, { expiresIn: '14d' })

        res.status(200).json({
            message: "Login successful",
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            token: token
        })

    } catch (error) {
        res.status(500).json({
            message: 'Server Error ' + (error as Error).message
        })
    }
}

const otpSchema = zod.object({
    email: zod.email(),
    otp: zod.string()
})

export const verifyOtp = async (req: Request, res: Response) => {
    const response = otpSchema.safeParse(req.body)

    if (!response.success) {
        return res.status(411).json({
            message: "Error in the data"
        })
    }

    const { email, otp } = response.data;

    try {
        const otpRecord = await Otp.findOne({ email, otp, action: 'account_verification' })

        if (!otpRecord) {
            return res.status(400).json({
                message: "Invalid or expired OTP"
            })
        }

        const user = await User.findOneAndUpdate({ email }, { isVerified: true }, { new: true });
        await Otp.deleteOne({ _id: otpRecord._id });

        const token = jwt.sign({ userId: user?._id, role: user?.role }, JWT_SECRET, { expiresIn: '14d' })

        res.status(200).json({
            message: "Account verified successfully. You can now log in.",
            _id: user?.id,
            name: user?.name,
            email: user?.email,
            role: user?.role,
            token: token
        });

    } catch (error) {
        res.status(500).json({
            message: (error as Error).message
        })
    }
}