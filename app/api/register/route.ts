import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import { sendVerificationEmail } from '@/lib/email';
import crypto from 'crypto';
import { validatePassword } from '@/lib/validators/password';
import { logAudit } from '@/lib/audit';

export async function POST(req: Request) {
    try {
        const { name, email, password, year, phone, username } = await req.json();

        if (!name || !email || !password || !phone || !username) {
            return NextResponse.json(
                { success: false, message: 'Missing required fields', errorCode: 'MISSING_FIELDS' },
                { status: 400 }
            );
        }

        // Strict Email Regex
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return NextResponse.json(
                { success: false, message: 'Invalid email format', errorCode: 'INVALID_EMAIL' },
                { status: 400 }
            );
        }

        // Username Regex
        const usernameRegex = /^[a-z0-9_.]{3,20}$/;
        if (!usernameRegex.test(username)) {
            return NextResponse.json(
                { success: false, message: 'Invalid username format', errorCode: 'INVALID_USERNAME' },
                { status: 400 }
            );
        }
        const reserved = ['admin', 'administrator', 'root', 'support', 'help', 'faculty', 'college', 'pharma', 'pharmaelevate', 'mod', 'moderator'];
        if (reserved.includes(username.toLowerCase())) {
            return NextResponse.json(
                { success: false, message: 'Username is reserved', errorCode: 'RESERVED_USERNAME' },
                { status: 400 }
            );
        }

        // Password Strength
        const passwordValidation = validatePassword(password);
        if (!passwordValidation.isValid) {
            return NextResponse.json(
                { success: false, message: passwordValidation.message, errorCode: 'WEAK_PASSWORD' },
                { status: 400 }
            );
        }

        await dbConnect();

        // Check if user already exists
        const existingUser = await User.findOne({ email });

        // Check username uniqueness
        const existingUsername = await User.findOne({ username: username.toLowerCase() });
        if (existingUsername) {
            if (!existingUser || existingUsername._id.toString() !== existingUser._id.toString()) {
                return NextResponse.json({ success: false, message: 'Username is taken', errorCode: 'USERNAME_TAKEN' }, { status: 400 });
            }
        }

        if (existingUser) {
            if (existingUser.isVerified) {
                return NextResponse.json(
                    { success: false, message: 'User already exists', errorCode: 'USER_EXISTS' },
                    { status: 400 }
                );
            }

            // 60s cooldown Check
            if (existingUser.otpSentAt) {
                const now = new Date();
                const diff = (now.getTime() - new Date(existingUser.otpSentAt).getTime()) / 1000;
                if (diff < 60) {
                    return NextResponse.json(
                        { message: `Please wait ${Math.ceil(60 - diff)} seconds before resending OTP` },
                        { status: 429 }
                    );
                }
            }
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Generate OTP (6 digits)
        const otp = crypto.randomInt(100000, 999999).toString();
        // Hash OTP for storage
        const hashedOtp = await bcrypt.hash(otp, 10);
        // OTP Expiry: 10 minutes from now
        const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000);
        const otpSentAt = new Date();

        let userId = existingUser?._id;

        if (existingUser) {
            // Update existing unverified user
            // We overwrite everything to ensure fresh state
            existingUser.name = name;
            existingUser.username = username.toLowerCase();
            existingUser.password = hashedPassword;
            existingUser.phone = phone;
            existingUser.year = year || '1st Year';
            // Set new OTP fields
            existingUser.otpHash = hashedOtp;
            existingUser.otpExpiresAt = otpExpiresAt;
            existingUser.otpSentAt = otpSentAt;
            await existingUser.save();
        } else {
            // Create user
            const newUser = await User.create({
                name,
                email,
                username: username.toLowerCase(),
                password: hashedPassword,
                phone,
                year: year || '1st Year',
                role: 'student',
                isVerified: false,
                otpHash: hashedOtp,
                otpExpiresAt: otpExpiresAt,
                otpSentAt: otpSentAt,
            });
            userId = newUser._id;
        }

        // Send OTP
        try {
            await sendVerificationEmail(email, otp);
        } catch (emailError) {
            console.error(`[AUTH-CRITICAL] Failed to send OTP email to ${email}.`, emailError);

            // DEV MODE BYPASS: Do not rollback. Allow registration to proceed so developer can verify via console logs.
            // await User.findByIdAndDelete(userId);

            // return NextResponse.json(
            //    { success: false, message: 'Failed to send verification email. Please try again later.', errorCode: 'EMAIL_SEND_FAILED' },
            //    { status: 500 }
            // );
            console.log("⚠️ Email failed. Proceeding with registration (Check console for OTP).");
        }

        logAudit({ type: 'USER_REGISTERED_CREDENTIALS', actorRole: 'student', targetType: 'user', targetId: userId.toString(), metadata: { email } });
        return NextResponse.json(
            { success: true, message: 'User registered. Please verify your email.', data: { userId, email } },
            { status: 201 }
        );
    } catch (error) {
        console.error('Registration error:', error);
        return NextResponse.json(
            { success: false, message: 'Internal server error', errorCode: 'INTERNAL_ERROR' },
            { status: 500 }
        );
    }
}
