import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import { sendVerificationEmail } from '@/lib/email';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';

import { logAudit } from '@/lib/audit';

export async function POST(req: Request) {
    const requestId = crypto.randomUUID();
    const startTime = Date.now();
    let identifier = 'unknown';

    try {
        const body = await req.json();
        identifier = body.email; // Note: Frontend sends 'email' even if it is a username

        // Log Request Start
        logAudit({
            domain: 'AUTH',
            action: 'PASSWORD_RESET_REQUEST',
            result: 'SUCCESS',
            requestId,
            metadata: { identifier }
        });

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
            logAudit({
                domain: 'AUTH',
                action: 'PASSWORD_RESET_IGNORED',
                result: 'SUCCESS',
                requestId,
                metadata: { identifier, reason: 'User not found' }
            });
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
                logAudit({
                    domain: 'AUTH',
                    action: 'PASSWORD_RESET_RATE_LIMIT',
                    result: 'FAIL',
                    requestId,
                    metadata: { identifier }
                });
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
            await sendVerificationEmail(targetEmail, otp);
            logAudit({
                domain: 'AUTH',
                action: 'PASSWORD_RESET_SENT',
                result: 'SUCCESS',
                targetType: 'user',
                targetId: user._id.toString(),
                requestId,
                durationMs: Date.now() - startTime
            });

            return NextResponse.json({ message: genericMessage }, { status: 200 });

        } catch (emailError: any) {
            console.error(`[AUTH-CRITICAL] Failed to send Forgot Password OTP to ${targetEmail}`, emailError);

            logAudit({
                domain: 'AUTH',
                action: 'PASSWORD_RESET_SEND_FAIL',
                result: 'FAIL',
                errorMessage: emailError.message,
                requestId,
                durationMs: Date.now() - startTime
            });

            // In dev modes without a proper email setup, this often fails.
            // We should be clearer about the error if possible, or at least standardized.
            return NextResponse.json(
                { success: false, message: 'Failed to send OTP. Email service may be unavailable.', errorCode: 'EMAIL_SEND_FAILED' },
                { status: 500 }
            );
        }

    } catch (error: any) {
        console.error("Forgot Password Error:", error);
        logAudit({
            domain: 'AUTH',
            action: 'PASSWORD_RESET_CRASH',
            result: 'FAIL',
            errorMessage: error.message,
            requestId,
            durationMs: Date.now() - startTime
        });
        return NextResponse.json(
            { success: false, message: 'Internal Server Error', errorCode: 'INTERNAL_ERROR' },
            { status: 500 }
        );
    }
}
