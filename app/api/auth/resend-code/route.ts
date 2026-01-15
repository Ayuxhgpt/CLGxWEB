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
    let email = 'unknown';

    try {
        const body = await req.json();
        email = body.email;

        // Log Request Start
        logAudit({
            domain: 'OTP',
            action: 'OTP_RESEND_REQUEST',
            result: 'SUCCESS',
            requestId,
            metadata: { email }
        });

        if (!email) {
            logAudit({
                domain: 'OTP',
                action: 'OTP_RESEND_FAIL',
                result: 'FAIL',
                errorCategory: 'VALIDATION',
                errorMessage: 'Missing email',
                requestId,
                durationMs: Date.now() - startTime
            });
            return NextResponse.json({ message: 'Email is required' }, { status: 400 });
        }

        await dbConnect();

        const user = await User.findOne({ email });

        if (!user) {
            // Anti-enumeration: Return success even if user not found
            logAudit({
                domain: 'OTP',
                action: 'OTP_RESEND_IGNORED',
                result: 'SUCCESS', // Success from client perspective
                requestId,
                metadata: { email, reason: 'User not found' }
            });
            return NextResponse.json({ message: 'If an account exists, a new OTP has been sent.' }, { status: 200 });
        }

        if (user.isVerified) {
            logAudit({
                domain: 'OTP',
                action: 'OTP_RESEND_IGNORED',
                result: 'SUCCESS',
                requestId,
                metadata: { email, reason: 'Already verified' }
            });
            return NextResponse.json({ message: 'If an account exists, a new OTP has been sent.' }, { status: 200 });
        }

        // Rate Limit Check (60s)
        if (user.otpSentAt) {
            const now = new Date();
            const diff = (now.getTime() - new Date(user.otpSentAt).getTime()) / 1000;
            if (diff < 60) {
                logAudit({
                    domain: 'OTP',
                    action: 'OTP_RATE_LIMIT_HIT',
                    result: 'FAIL',
                    errorCategory: 'POLICY',
                    errorMessage: 'Resend cooldown active',
                    requestId,
                    metadata: { email, waitSeconds: Math.ceil(60 - diff) }
                });
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
            await sendVerificationEmail(email, otp);

            logAudit({
                domain: 'OTP',
                action: 'OTP_RESENT',
                result: 'SUCCESS',
                targetType: 'user',
                targetId: user._id.toString(),
                requestId,
                durationMs: Date.now() - startTime
            });
        } catch (emailError: any) {
            console.error(`[AUTH-RESEND] Failed to send email to ${email}`, emailError);

            logAudit({
                domain: 'OTP',
                action: 'OTP_RESEND_FAIL',
                result: 'FAIL',
                errorCategory: 'PROVIDER',
                errorMessage: emailError.message,
                requestId,
                durationMs: Date.now() - startTime
            });

            // We don't rollback the DB update here because the user still exists. 
            // But the client will get an error.
            return NextResponse.json({ message: 'Failed to send email' }, { status: 500 });
        }

        return NextResponse.json({ message: 'OTP sent successfully.' }, { status: 200 });

    } catch (error: any) {
        console.error("Resend OTP Error:", error);
        logAudit({
            domain: 'OTP',
            action: 'OTP_RESEND_CRASH',
            result: 'FAIL',
            errorCategory: 'UNKNOWN',
            errorMessage: error.message,
            requestId,
            durationMs: Date.now() - startTime
        });
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}
