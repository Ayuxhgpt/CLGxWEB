import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import bcrypt from 'bcryptjs';

export async function POST(req: Request) {
    try {
        const { email, otp } = await req.json();

        if (!email || !otp) {
            return NextResponse.json({ message: 'Missing email or OTP' }, { status: 400 });
        }

        await dbConnect();

        const user = await User.findOne({ email });

        if (!user) {
            return NextResponse.json({ message: 'User not found' }, { status: 404 });
        }

        if (user.isVerified) {
            return NextResponse.json({ message: 'User already verified' }, { status: 200 });
        }

        // Verify OTP
        const isValid = await bcrypt.compare(otp, user.otpHash);
        if (!isValid) {
            return NextResponse.json({ message: 'Invalid OTP' }, { status: 400 });
        }

        // Check expiry
        if (!user.otpExpiresAt || user.otpExpiresAt < new Date()) {
            return NextResponse.json({ message: 'OTP expired. Please register again.' }, { status: 400 });
        }

        // Verify
        user.isVerified = true;
        user.otpHash = undefined;
        user.otpExpiresAt = undefined;
        user.otpSentAt = undefined;
        user.otp = undefined; // Cleanup legacy
        user.otpExpiry = undefined; // Cleanup legacy
        await user.save();

        return NextResponse.json({ message: 'Email verified successfully' }, { status: 200 });
    } catch (error) {
        console.error('Verification error:', error);
        return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
    }
}
