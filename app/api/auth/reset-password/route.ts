import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import bcrypt from 'bcryptjs';
import { validatePassword } from '@/lib/validators/password';

import { logAudit } from '@/lib/audit';
import crypto from 'crypto';

export async function POST(req: Request) {
    const requestId = crypto.randomUUID();
    const startTime = Date.now();
    let email = 'unknown';

    try {
        const body = await req.json();
        email = body.email;
        const { otp, newPassword } = body;

        if (!email || !otp || !newPassword) {
            logAudit({
                domain: 'AUTH',
                action: 'PASSWORD_RESET_EXECUTE_FAIL',
                result: 'FAIL',
                errorMessage: 'Missing fields',
                requestId,
                metadata: { email }
            });
            return NextResponse.json({ message: 'All fields are required' }, { status: 400 });
        }

        // Validate Password Complexity
        const passwordValidation = validatePassword(newPassword);
        if (!passwordValidation.isValid) {
            logAudit({
                domain: 'AUTH',
                action: 'PASSWORD_RESET_EXECUTE_FAIL',
                result: 'FAIL',
                errorMessage: passwordValidation.message,
                requestId,
                metadata: { email }
            });
            return NextResponse.json({ message: passwordValidation.message }, { status: 400 });
        }

        await dbConnect();

        const user = await User.findOne({ email }).select('+resetTokenHash +resetTokenExpiresAt');
        // Generic error for both user not found and invalid OTP to prevent enumeration
        if (!user) {
            logAudit({
                domain: 'AUTH',
                action: 'PASSWORD_RESET_EXECUTE_FAIL',
                result: 'FAIL',
                errorMessage: 'User not found (Generic msg sent)',
                requestId,
                metadata: { email }
            });
            return NextResponse.json({ message: 'Invalid email or OTP' }, { status: 400 });
        }

        // Check Expiry
        if (!user.resetTokenExpiresAt || new Date() > new Date(user.resetTokenExpiresAt)) {
            logAudit({
                domain: 'AUTH',
                action: 'PASSWORD_RESET_EXECUTE_FAIL',
                result: 'FAIL',
                errorMessage: 'OTP Expired',
                requestId,
                metadata: { email }
            });
            return NextResponse.json({ message: 'OTP has expired' }, { status: 400 });
        }

        // Verify OTP against reset token hash
        const isValid = await bcrypt.compare(otp, user.resetTokenHash);
        if (!isValid) {
            logAudit({
                domain: 'AUTH',
                action: 'PASSWORD_RESET_EXECUTE_FAIL',
                result: 'FAIL',
                errorMessage: 'Invalid OTP',
                requestId,
                metadata: { email }
            });
            return NextResponse.json({ message: 'Invalid email or OTP' }, { status: 400 });
        }

        // Hash New Password
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        // Update User
        user.password = hashedPassword;
        user.resetTokenHash = undefined;    // Clear Token
        user.resetTokenExpiresAt = undefined;
        // Also clear invalid old OTP fields just in case
        user.otp = undefined;
        user.otpExpiry = undefined;

        await user.save();

        logAudit({
            domain: 'AUTH',
            action: 'PASSWORD_RESET_SUCCESS',
            result: 'SUCCESS',
            targetType: 'user',
            targetId: user._id.toString(),
            requestId,
            durationMs: Date.now() - startTime,
            metadata: { email }
        });

        return NextResponse.json({ message: 'Password updated successfully' }, { status: 200 });

    } catch (error: any) {
        console.error("Reset Password Error:", error);
        logAudit({
            domain: 'AUTH',
            action: 'PASSWORD_RESET_EXECUTE_CRASH',
            result: 'FAIL',
            errorMessage: error.message,
            requestId,
            durationMs: Date.now() - startTime
        });
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}
