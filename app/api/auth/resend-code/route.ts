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
            // Anti-enumeration: Return success even if user not found
            return NextResponse.json({ message: 'If an account exists, a new OTP has been sent.' }, { status: 200 });
        }

        if (user.isVerified) {
            // Anti-enumeration: Return success even if already verified
            // Optimally, we could send an email saying "You are already verified", 
            // but for now, generic success is safe.
            return NextResponse.json({ message: 'If an account exists, a new OTP has been sent.' }, { status: 200 });
        }

        // Rate Limit Check (60s)
        if (user.otpSentAt) {
            const now = new Date();
            const diff = (now.getTime() - new Date(user.otpSentAt).getTime()) / 1000;
            if (diff < 60) {
                return NextResponse.json(
                    { message: `Please wait ${Math.ceil(60 - diff)} seconds before resending.` },
                    { status: 429 }
                );
            }
        }

        // Generate New OTP
        const otp = crypto.randomInt(100000, 999999).toString();
        const hashedOtp = await bcrypt.hash(otp, 10);
        const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 mins
        const otpSentAt = new Date();

        // Update User
        user.otpHash = hashedOtp;
        user.otpExpiresAt = otpExpiresAt;
        user.otpSentAt = otpSentAt;

        // Remove old deprecated fields if they exist, just to be clean
        user.otp = undefined;
        user.otpExpiry = undefined;

        await user.save();

        // Send Email
        try {
            console.log(`[AUTH-RESEND] Sending OTP to ${email}`);
            await sendVerificationEmail(email, otp);
            console.log(`[AUTH-RESEND] OTP sent to ${email}`);
        } catch (emailError) {
            console.error(`[AUTH-RESEND] Failed to send email to ${email}`, emailError);
            // We don't rollback the DB update here because the user still exists. 
            // But the client will get an error.
            return NextResponse.json({ message: 'Failed to send email' }, { status: 500 });
        }

        return NextResponse.json({ message: 'OTP sent successfully.' }, { status: 200 });

    } catch (error) {
        console.error("Resend OTP Error:", error);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}
