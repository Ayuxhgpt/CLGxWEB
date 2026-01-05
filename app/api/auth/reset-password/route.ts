import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import bcrypt from 'bcryptjs';
import { validatePassword } from '@/lib/validators/password';

export async function POST(req: Request) {
    try {
        const { email, otp, newPassword } = await req.json();

        if (!email || !otp || !newPassword) {
            return NextResponse.json({ message: 'All fields are required' }, { status: 400 });
        }

        // Validate Password Complexity
        const passwordValidation = validatePassword(newPassword);
        if (!passwordValidation.isValid) {
            return NextResponse.json({ message: passwordValidation.message }, { status: 400 });
        }

        await dbConnect();

        const user = await User.findOne({ email });
        // Generic error for both user not found and invalid OTP to prevent enumeration
        if (!user) {
            return NextResponse.json({ message: 'Invalid email or OTP' }, { status: 400 });
        }

        // Check Expiry
        if (!user.resetTokenExpiresAt || new Date() > new Date(user.resetTokenExpiresAt)) {
            return NextResponse.json({ message: 'OTP has expired' }, { status: 400 });
        }

        // Verify OTP against reset token hash
        const isValid = await bcrypt.compare(otp, user.resetTokenHash);
        if (!isValid) {
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

        return NextResponse.json({ message: 'Password updated successfully' }, { status: 200 });

    } catch (error) {
        console.error("Reset Password Error:", error);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}
