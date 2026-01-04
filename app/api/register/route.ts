import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import { sendVerificationEmail } from '@/lib/email';
import crypto from 'crypto';

export async function POST(req: Request) {
    try {
        const { name, email, password, year, phone, username } = await req.json();

        if (!name || !email || !password || !phone || !username) {
            return NextResponse.json(
                { message: 'Missing required fields' },
                { status: 400 }
            );
        }

        // Strict Email Regex
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return NextResponse.json(
                { message: 'Invalid email format' },
                { status: 400 }
            );
        }

        // Username Regex
        const usernameRegex = /^[a-z0-9_.]{3,20}$/;
        if (!usernameRegex.test(username)) {
            return NextResponse.json(
                { message: 'Invalid username format' },
                { status: 400 }
            );
        }

        const reserved = ['admin', 'administrator', 'root', 'support', 'help', 'faculty', 'college', 'pharma', 'pharmaelevate', 'mod', 'moderator'];
        if (reserved.includes(username.toLowerCase())) {
            return NextResponse.json(
                { message: 'Username is reserved' },
                { status: 400 }
            );
        }

        // Password Strength (Min 8 chars, at least one number)
        if (password.length < 8 || !/\d/.test(password)) {
            return NextResponse.json(
                { message: 'Password must be at least 8 characters long and contain a number' },
                { status: 400 }
            );
        }

        await dbConnect();

        // Check if user already exists
        let existingUser = await User.findOne({ email });

        // Check username uniqueness (distinct from email check)
        const existingUsername = await User.findOne({ username: username.toLowerCase() });
        if (existingUsername) {
            // If unverified and same email, we might be overwriting, but if different email has this username, it's taken.
            if (!existingUser || existingUsername._id.toString() !== existingUser._id.toString()) {
                return NextResponse.json({ message: 'Username is taken' }, { status: 400 });
            }
        }

        if (existingUser) {
            if (existingUser.isVerified) {
                return NextResponse.json(
                    { message: 'User already exists' },
                    { status: 400 }
                );
            }

            // Rate limit: Check if OTP was sent recently (using otpExpiry as proxy or updatedAt)
            // If otpExpiry is > 9 mins from now (assuming 10 min expiry), then it was just sent?
            // Better: Check updatedAt if avail, or just check if otpExpiry is far in future.
            // Simple check: Allow resend only after 1 minute.
            const lastUpdated = new Date(existingUser.updatedAt).getTime();
            const now = Date.now();
            if (now - lastUpdated < 60 * 1000) {
                return NextResponse.json(
                    { message: 'Please wait 1 minute before resending OTP' },
                    { status: 429 }
                );
            }
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Generate OTP (6 digits)
        const otp = crypto.randomInt(100000, 999999).toString();
        // Hash OTP for storage
        const hashedOtp = await bcrypt.hash(otp, 10);

        const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

        let userId = existingUser?._id;

        if (existingUser) {
            // Update existing unverified user
            existingUser.name = name;
            existingUser.username = username.toLowerCase(); // Update username
            existingUser.password = hashedPassword;
            existingUser.phone = phone;
            existingUser.year = year || '1st Year';
            existingUser.otp = hashedOtp;
            existingUser.otpExpiry = otpExpiry;
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
                otp: hashedOtp,
                otpExpiry,
            });
            userId = newUser._id;
        }

        // Send OTP
        await sendVerificationEmail(email, otp);

        return NextResponse.json(
            { message: 'User registered. Please verify your email.', userId, email },
            { status: 201 }
        );
    } catch (error) {
        console.error('Registration error:', error);
        return NextResponse.json(
            { message: 'Internal server error' },
            { status: 500 }
        );
    }
}
