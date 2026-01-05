import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import { sendVerificationEmail } from '@/lib/email';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';

export async function POST(req: Request) {
    try {
        const { email } = await req.json();

        if (!email) {
            return NextResponse.json({ message: 'Email is required' }, { status: 400 });
        }

        await dbConnect();

        const user = await User.findOne({ email });

        // GENERIC RESPONSE MSG
        const genericMessage = 'If an account exists with this email, you will receive a reset code.';

        if (!user) {
            // Return success even if user not found to prevent enumeration
            return NextResponse.json({ message: genericMessage }, { status: 200 });
        }

        // Rate Limiting: Check if a token was sent recently
        // We can reuse otpSentAt or resetTokenExpiresAt logic. 
        // Let's assume if a valid token exists and was created recently (e.g. < 60s ago), we deny.
        // Since we don't have resetTokenCreated, we can infer from ExpiresAt (10 mins)
        if (user.resetTokenExpiresAt) {
            const timeLeft = new Date(user.resetTokenExpiresAt).getTime() - Date.now();
            const timeElapsed = (10 * 60 * 1000) - timeLeft; // Assuming 10m expiry
            if (timeElapsed < 60 * 1000) {
                return NextResponse.json({ message: genericMessage }, { status: 200 }); // Still return generic success!
            }
        }

        // Generate OTP
        const otp = crypto.randomInt(100000, 999999).toString();
        const hashedOtp = await bcrypt.hash(otp, 10);
        const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 mins

        // Save OTP as Reset Token (Reusing logic but with specific fields)
        user.resetTokenHash = hashedOtp;
        user.resetTokenExpiresAt = otpExpiry;
        await user.save();

        // Send Email
        try {
            console.log(`[AUTH-FORGOT] Sending Reset OTP to ${email}`);
            await sendVerificationEmail(email, otp); // Using same email function for now
            console.log(`[AUTH-FORGOT] Reset OTP sent to ${email}`);

            return NextResponse.json({ message: genericMessage }, { status: 200 });

        } catch (emailError) {
            console.error(`[AUTH-CRITICAL] Failed to send Forgot Password OTP to ${email}`, emailError);
            return NextResponse.json({ message: 'Failed to send OTP. Please try again.' }, { status: 500 });
        }

    } catch (error) {
        console.error("Forgot Password Error:", error);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}
