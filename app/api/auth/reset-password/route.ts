import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import bcrypt from 'bcryptjs';

export async function POST(req: Request) {
    try {
        const { email, otp, newPassword } = await req.json();

        if (!email || !otp || !newPassword) {
            return NextResponse.json({ message: 'All fields are required' }, { status: 400 });
        }

        await dbConnect();

        const user = await User.findOne({ email });
        if (!user) {
            return NextResponse.json({ message: 'User not found' }, { status: 404 });
        }

        // Check Expiry
        if (!user.otpExpiry || new Date() > new Date(user.otpExpiry)) {
            return NextResponse.json({ message: 'OTP has expired' }, { status: 400 });
        }

        // Verify OTP
        const isValid = await bcrypt.compare(otp, user.otp);
        if (!isValid) {
            return NextResponse.json({ message: 'Invalid OTP' }, { status: 400 });
        }

        // Hash New Password
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        // Update User
        user.password = hashedPassword;
        user.otp = undefined;      // Clear OTP
        user.otpExpiry = undefined;
        await user.save();

        return NextResponse.json({ message: 'Password updated successfully' }, { status: 200 });

    } catch (error) {
        console.error("Reset Password Error:", error);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}
