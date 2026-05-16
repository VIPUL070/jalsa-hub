import nodemailer from 'nodemailer';
import dotenv from 'dotenv'
import type SMTPTransport from 'nodemailer/lib/smtp-transport/index.js';

dotenv.config();

const emailFrom = process.env.EMAIL_FROM || process.env.EMAIL_USER;
const brevoApiKey = process.env.BREVO_API_KEY;
const senderName = process.env.EMAIL_SENDER_NAME || 'Jalsa Hub';

const transporter = !brevoApiKey ? nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: Number(process.env.SMTP_PORT || 465),
    secure: (process.env.SMTP_SECURE || 'true') === 'true',
    pool: true,
    maxConnections: 3,
    maxMessages: 100,
    family: 4,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
} as SMTPTransport.Options) : null;

if (transporter) {
    transporter.verify().then(
        () => console.log('SMTP ready'),
        (err) => console.error('SMTP verify failed:', err.message),
    );
} else if (brevoApiKey) {
    console.log('Brevo email API ready');
} else {
    console.log('No email transport configured');
}

const parseEmailAddress = (value: string): { email: string; name?: string } => {
    const match = value.match(/^\s*(.*?)\s*<([^>]+)>\s*$/);
    if (match) {
        return { name: match[1] || senderName, email: match[2] || '' };
    }
    return { email: value.trim(), name: senderName };
};

const sendEmail = async (to: string, subject: string, html: string): Promise<void> => {
    if (!emailFrom) {
        throw new Error('EMAIL_FROM or EMAIL_USER is required to send email');
    }

    // Primary: Brevo HTTP API (works reliably on Render, no IPv6 issues)
    if (brevoApiKey) {
        const sender = parseEmailAddress(emailFrom);
        const response = await fetch('https://api.brevo.com/v3/smtp/email', {
            method: 'POST',
            headers: {
                'api-key': brevoApiKey,
                'Content-Type': 'application/json',
                'accept': 'application/json'
            },
            body: JSON.stringify({
                sender,
                to: [{ email: to }],
                subject,
                htmlContent: html
            })
        });

        if (!response.ok) {
            const body = await response.text();
            throw new Error(`Brevo email failed: ${response.status} ${body}`);
        }

        return;
    }

    // Fallback: SMTP (Gmail) — used for local dev or if Brevo key is missing
    if (!transporter) {
        throw new Error('No email transport configured');
    }

    await transporter.sendMail({
        from: emailFrom,
        to,
        subject,
        html
    });
};

export const sendBookingEmail = async (userEmail: string, userName: string, eventTitle: string): Promise<boolean> => {
    try {
        await sendEmail(
            userEmail,
            `Booking Confirmed: ${eventTitle}`,
            `
        <h2>Hi ${userName}!</h2>
        <p>Your booking for the event <strong>${eventTitle}</strong> is successfully confirmed.</p>
        <p>Thank you for choosing Jalsa Hub.</p>
      `
        );
        console.log('Email sent successfully to', userEmail);
        return true;
    } catch (error) {
        console.error('Error sending email:', error);
        return false;
    }
};

export const sendOtpEmail = async (userEmail: string, otp: string, type: string): Promise<boolean> => {
    try {
        const title = type === 'account_verification' ? 'Verify your Jalsa Hub Account' : 'Jalsa Hub Booking Verification';
        const msg = type === 'account_verification'
            ? 'Please use the following OTP to verify your new Jalsa Hub account.'
            : 'Please use the following OTP to verify and confirm your event booking.';

        await sendEmail(
            userEmail,
            title,
            `
                <div style="font-family: Arial, sans-serif; text-align: center; padding: 20px;">
                    <h2 style="color: #111;">${title}</h2>
                    <p style="color: #555; font-size: 16px;">${msg}</p>
                    <div style="margin: 20px auto; padding: 15px; font-size: 24px; font-weight: bold; background: #f4f4f4; width: max-content; letter-spacing: 5px;">
                        ${otp}
                    </div>
                    <p style="color: #999; font-size: 12px;">This code expires in 5 minutes. If you didn't request this, please ignore this email.</p>
                </div>
            `
        );
        console.log(`OTP email sent to ${userEmail} for ${type}`);
        return true;
    } catch (error) {
        console.error(`Error sending OTP email to ${userEmail} for ${type}`, error);
        return false;
    }
}