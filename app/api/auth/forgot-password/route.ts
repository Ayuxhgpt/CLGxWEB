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
        if (!user) {
            // Return success even if user not found to prevent enumeration
            return NextResponse.json({ message: 'If an account exists, an OTP has been sent.' }, { status: 200 });
        }

        // Generate OTP
        const otp = crypto.randomInt(100000, 999999).toString();
        const hashedOtp = await bcrypt.hash(otp, 10);
        const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 mins

        // Save OTP
        user.otp = hashedOtp;
        user.otpExpiry = otpExpiry;
        await user.save();

        // Send Email
        // Send Email
        try {
            console.log(`[AUTH-FORGOT] Sending Reset OTP to ${email}`);
            await sendVerificationEmail(email, otp);
            console.log(`[AUTH-FORGOT] Reset OTP sent to ${email}`);

            return NextResponse.json({ message: 'OTP sent to your email' }, { status: 200 });

        } catch (emailError) {
            console.error(`[AUTH-CRITICAL] Failed to send Forgot Password OTP to ${email}`, emailError);
            return NextResponse.json({ message: 'Failed to send OTP. Please try again.' }, { status: 500 });
        }

    } catch (error) {
        console.error("Forgot Password Error:", error);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}
