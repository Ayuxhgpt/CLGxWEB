import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import bcrypt from 'bcryptjs';
import { logAudit } from '@/lib/audit';

export async function POST(req: Request) {
    try {
        const { email, otp } = await req.json();

        // Generate a simple request ID for logging purposes, if not provided by a middleware
        const requestId = crypto.randomUUID();

        if (!email || !otp) {
            logAudit({
                domain: 'AUTH',
                action: 'OTP_VERIFY_FAIL',
                result: 'FAIL',
                errorCategory: 'VALIDATION',
                errorMessage: 'Missing email or OTP',
                requestId,
                metadata: { email, otpProvided: !!otp }
            });
            return NextResponse.json({ success: false, message: 'Missing email or OTP', errorCode: 'MISSING_FIELDS' }, { status: 400 });
        }

        await dbConnect();

        // Fetch user with sensitive OTP fields
        const user = await User.findOne({ email }).select('+otpHash +otpExpiresAt +otpAttempts');

        if (!user) {
            logAudit({
                domain: 'AUTH',
                action: 'USER_VERIFY_FAIL',
                result: 'FAIL',
                errorCategory: 'VALIDATION',
                errorMessage: 'User not found during verification',
                requestId,
                metadata: { email }
            });
            return NextResponse.json({ success: false, message: 'User not found', errorCode: 'USER_NOT_FOUND' }, { status: 404 });
        }

        if (user.isVerified) {
            logAudit({
                domain: 'AUTH',
                action: 'OTP_VERIFY_ALREADY_VERIFIED',
                result: 'SUCCESS',
                requestId,
                metadata: { email, userId: user._id.toString() }
            });
            return NextResponse.json({ success: true, message: 'User already verified' }, { status: 200 });
        }

        // Check Max Attempts Lockout
        if (user.otpAttempts > 5) {
            logAudit({
                domain: 'AUTH',
                action: 'OTP_VERIFY_LOCKED',
                result: 'FAIL',
                errorCategory: 'POLICY',
                errorMessage: 'User locked out due to max OTP attempts',
                requestId,
                metadata: { email }
            });
            return NextResponse.json({ success: false, message: 'Account locked due to too many failed attempts. Please request a new OTP after 1 hour.', errorCode: 'ACCOUNT_LOCKED' }, { status: 403 });
        }

        // Check Expiry
        if (!user.otpExpiresAt || user.otpExpiresAt < new Date()) {
            logAudit({
                domain: 'AUTH',
                action: 'OTP_EXPIRED',
                result: 'FAIL',
                errorCategory: 'TIMEOUT',
                errorMessage: 'OTP expired',
                requestId,
                metadata: { email }
            });
            return NextResponse.json({ success: false, message: 'OTP has expired. Please request a new one.', errorCode: 'OTP_EXPIRED' }, { status: 400 });
        }

        // Verify Hash
        const isValid = await bcrypt.compare(otp, user.otpHash);
        if (!isValid) {
            // Increment attempts on failure
            user.otpAttempts = (user.otpAttempts || 0) + 1;
            await user.save();

            logAudit({
                domain: 'AUTH',
                action: 'OTP_INVALID',
                result: 'FAIL',
                errorCategory: 'VALIDATION',
                errorMessage: 'Invalid OTP',
                requestId,
                metadata: { email, currentAttempts: user.otpAttempts }
            });

            return NextResponse.json({ success: false, message: 'Invalid OTP', errorCode: 'INVALID_OTP' }, { status: 400 });
        }

        // Success: Reset and Verify
        user.isVerified = true;
        user.otpHash = undefined;
        user.otpExpiresAt = undefined;
        user.otpSentAt = undefined;
        user.otpAttempts = 0; // Reset
        user.otp = undefined; // Cleanup legacy
        user.otpExpiry = undefined; // Cleanup legacy
        await user.save();

        logAudit({
            domain: 'AUTH',
            action: 'USER_VERIFIED',
            result: 'SUCCESS',
            requestId,
            metadata: { email, userId: user._id.toString() }
        });
        return NextResponse.json({ success: true, message: 'Email verified successfully' }, { status: 200 });
    } catch (error) {
        console.error('Verification error:', error);
        // Log internal server errors
        logAudit({
            domain: 'AUTH',
            action: 'OTP_VERIFY_ERROR',
            result: 'FAIL',
            errorCategory: 'UNKNOWN',
            errorMessage: error instanceof Error ? error.message : 'Unknown internal server error',
            metadata: { error: error instanceof Error ? error.stack : String(error) }
        });
        return NextResponse.json({ success: false, message: 'Internal server error', errorCode: 'INTERNAL_ERROR' }, { status: 500 });
    }
}
