import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import { sendVerificationEmail } from '@/lib/email';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';

export async function POST(req: Request) {
    try {
        const { email: identifier } = await req.json(); // We reuse 'email' field or rename it in frontend

        if (!identifier) {
            return NextResponse.json({ message: 'Email or Username is required' }, { status: 400 });
        }

        await dbConnect();

        const user = await User.findOne({
            $or: [
                { email: identifier },
                { username: identifier.toLowerCase() }
            ]
        });

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

        // Send Email (Always use user.email, not the identifier which could be a username)
        const targetEmail = user.email;

        try {
            console.log(`[AUTH-FORGOT] Sending Reset OTP to ${targetEmail}`);
            await sendVerificationEmail(targetEmail, otp);
            console.log(`[AUTH-FORGOT] Reset OTP sent to ${targetEmail}`);

            return NextResponse.json({ message: genericMessage }, { status: 200 });

        } catch (emailError: any) {
            console.error(`[AUTH-CRITICAL] Failed to send Forgot Password OTP to ${email}`, emailError);
            // In dev modes without a proper email setup, this often fails.
            // We should be clearer about the error if possible, or at least standardized.
            return NextResponse.json(
                { success: false, message: 'Failed to send OTP. Email service may be unavailable.', errorCode: 'EMAIL_SEND_FAILED' },
                { status: 500 }
            );
        }

    } catch (error) {
        console.error("Forgot Password Error:", error);
        return NextResponse.json(
            { success: false, message: 'Internal Server Error', errorCode: 'INTERNAL_ERROR' },
            { status: 500 }
        );
    }
}
