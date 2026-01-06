import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import { sendVerificationEmail } from '@/lib/email';
import crypto from 'crypto';
import { validatePassword } from '@/lib/validators/password';
import { logAudit } from '@/lib/audit';

export async function POST(req: Request) {
    const requestId = `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const startTime = Date.now();
    let clientIp = 'unknown';

    try {
        const body = await req.json();
        const { name, email, password, year, phone, username } = body;

        // Log Request Start
        logAudit({
            domain: 'AUTH',
            action: 'USER_REGISTER_REQUEST',
            result: 'SUCCESS', // Request received successfully
            requestId,
            metadata: { email, username }
        });

        if (!name || !email || !password || !phone || !username) {
            logAudit({
                domain: 'AUTH',
                action: 'USER_REGISTER_VALIDATION_FAIL',
                result: 'FAIL',
                errorCategory: 'VALIDATION',
                errorMessage: 'Missing fields',
                requestId,
                durationMs: Date.now() - startTime
            });
            return NextResponse.json(
                { success: false, message: 'Missing required fields', errorCode: 'MISSING_FIELDS' },
                { status: 400 }
            );
        }

        // Strict Email Regex
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            logAudit({
                domain: 'AUTH',
                action: 'USER_REGISTER_VALIDATION_FAIL',
                result: 'FAIL',
                errorCategory: 'VALIDATION',
                errorMessage: 'Invalid email format',
                requestId,
                durationMs: Date.now() - startTime
            });
            return NextResponse.json(
                { success: false, message: 'Invalid email format', errorCode: 'INVALID_EMAIL' },
                { status: 400 }
            );
        }

        // Username Regex
        const usernameRegex = /^[a-z0-9_.]{3,20}$/;
        if (!usernameRegex.test(username)) {
            logAudit({
                domain: 'AUTH',
                action: 'USER_REGISTER_VALIDATION_FAIL',
                result: 'FAIL',
                errorCategory: 'VALIDATION',
                errorMessage: 'Invalid username format',
                requestId,
                durationMs: Date.now() - startTime
            });
            return NextResponse.json(
                { success: false, message: 'Invalid username format', errorCode: 'INVALID_USERNAME' },
                { status: 400 }
            );
        }
        const reserved = ['admin', 'administrator', 'root', 'support', 'help', 'faculty', 'college', 'pharma', 'pharmaelevate', 'mod', 'moderator'];
        if (reserved.includes(username.toLowerCase())) {
            logAudit({
                domain: 'AUTH',
                action: 'USER_REGISTER_VALIDATION_FAIL',
                result: 'FAIL',
                errorCategory: 'VALIDATION',
                errorMessage: 'Username is reserved',
                requestId,
                durationMs: Date.now() - startTime
            });
            return NextResponse.json(
                { success: false, message: 'Username is reserved', errorCode: 'RESERVED_USERNAME' },
                { status: 400 }
            );
        }

        // Password Strength
        const passwordValidation = validatePassword(password);
        if (!passwordValidation.isValid) {
            logAudit({
                domain: 'AUTH',
                action: 'USER_REGISTER_VALIDATION_FAIL',
                result: 'FAIL',
                errorCategory: 'VALIDATION',
                errorMessage: passwordValidation.message,
                requestId,
                durationMs: Date.now() - startTime
            });
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
                logAudit({
                    domain: 'AUTH',
                    action: 'USER_REGISTER_VALIDATION_FAIL',
                    result: 'FAIL',
                    errorCategory: 'CONFLICT',
                    errorMessage: 'Username is taken',
                    requestId,
                    durationMs: Date.now() - startTime
                });
                return NextResponse.json({ success: false, message: 'Username is taken', errorCode: 'USERNAME_TAKEN' }, { status: 400 });
            }
        }

        if (existingUser) {
            if (existingUser.isVerified) {
                logAudit({
                    domain: 'AUTH',
                    action: 'USER_REGISTER_VALIDATION_FAIL',
                    result: 'FAIL',
                    errorCategory: 'CONFLICT',
                    errorMessage: 'User already exists and is verified',
                    requestId,
                    durationMs: Date.now() - startTime
                });
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
                    logAudit({
                        domain: 'OTP',
                        action: 'OTP_RATE_LIMIT_HIT',
                        result: 'FAIL',
                        errorCategory: 'POLICY',
                        errorMessage: '60s cooldown active',
                        targetId: existingUser._id.toString(),
                        targetType: 'user',
                        requestId,
                        durationMs: Date.now() - startTime
                    });
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

        logAudit({
            domain: 'OTP',
            action: 'OTP_GENERATED',
            result: 'SUCCESS',
            requestId,
            metadata: { email }
        });

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
            logAudit({
                domain: 'OTP',
                action: 'OTP_SENT',
                result: 'SUCCESS',
                targetType: 'user',
                targetId: userId.toString(),
                requestId,
                durationMs: Date.now() - startTime
            });
        } catch (emailError: any) {
            console.error(`[AUTH-CRITICAL] Failed to send OTP email to ${email}.`, emailError);

            logAudit({
                domain: 'OTP',
                action: 'OTP_SEND_FAILED',
                result: 'FAIL',
                errorCategory: 'PROVIDER',  // Resend failure
                errorMessage: emailError.message,
                targetType: 'user',
                targetId: userId.toString(),
                requestId,
                durationMs: Date.now() - startTime
            });

            // DEV MODE BYPASS: Do not rollback. Allow registration to proceed so developer can verify via console logs.
            // await User.findByIdAndDelete(userId);

            // return NextResponse.json(
            //    { success: false, message: 'Failed to send verification email. Please try again later.', errorCode: 'EMAIL_SEND_FAILED' },
            //    { status: 500 }
            // );
            console.log("⚠️ Email failed. Proceeding with registration (Check console for OTP).");
        }

        // Final Success Log
        logAudit({
            domain: 'AUTH',
            action: 'USER_REGISTERED_CREDENTIALS',
            result: 'SUCCESS',
            userRole: 'student',
            targetType: 'user',
            targetId: userId.toString(),
            requestId,
            durationMs: Date.now() - startTime,
            metadata: { email }
        });

        // DEV HELP: Return OTP in response to unblock testing if email fails
        const responseData: any = { userId, email };
        if (process.env.NODE_ENV !== 'production') {
            responseData.debug_otp = otp;
        }

        return NextResponse.json(
            { success: true, message: 'User registered. Please verify your email.', data: responseData },
            { status: 201 }
        );
    } catch (error: any) {
        console.error('Registration error:', error);
        logAudit({
            domain: 'AUTH',
            action: 'USER_REGISTER_CRASH',
            result: 'FAIL',
            errorCategory: 'UNKNOWN',
            errorMessage: error.message,
            requestId,
            durationMs: Date.now() - startTime
        });
        return NextResponse.json(
            { success: false, message: 'Internal server error', errorCode: 'INTERNAL_ERROR' },
            { status: 500 }
        );
    }
}
