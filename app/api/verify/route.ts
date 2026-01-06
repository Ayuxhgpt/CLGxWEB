import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import bcrypt from 'bcryptjs';
import { logAudit } from '@/lib/audit';

export async function POST(req: Request) {
    try {
        const { email, otp } = await req.json();

        if (!email || !otp) {
            return NextResponse.json({ success: false, message: 'Missing email or OTP', errorCode: 'MISSING_FIELDS' }, { status: 400 });
        }

        await dbConnect();

        const user = await User.findOne({ email });

        if (!user) {
            return NextResponse.json({ success: false, message: 'User not found', errorCode: 'USER_NOT_FOUND' }, { status: 404 });
        }

        if (user.isVerified) {
            return NextResponse.json({ success: true, message: 'User already verified' }, { status: 200 });
        }

        // Verify OTP
        const isValid = await bcrypt.compare(otp, user.otpHash);
        if (!isValid) {
            return NextResponse.json({ success: false, message: 'Invalid OTP', errorCode: 'INVALID_OTP' }, { status: 400 });
        }

        // Check expiry
        if (!user.otpExpiresAt || user.otpExpiresAt < new Date()) {
            return NextResponse.json({ success: false, message: 'OTP expired. Please register again.', errorCode: 'OTP_EXPIRED' }, { status: 400 });
        }

        // Verify
        user.isVerified = true;
        user.otpHash = undefined;
        user.otpExpiresAt = undefined;
        user.otpSentAt = undefined;
        user.otp = undefined; // Cleanup legacy
        user.otpExpiry = undefined; // Cleanup legacy
        await user.save();

        logAudit({ type: 'USER_VERIFIED', actorId: user._id.toString(), actorRole: 'student', targetType: 'user', metadata: { email } });
        return NextResponse.json({ success: true, message: 'Email verified successfully' }, { status: 200 });
    } catch (error) {
        console.error('Verification error:', error);
        return NextResponse.json({ success: false, message: 'Internal server error', errorCode: 'INTERNAL_ERROR' }, { status: 500 });
    }
}
