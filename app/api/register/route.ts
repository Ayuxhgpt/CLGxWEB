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
                    errorCategory: 'VALIDATION',
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
                    errorCategory: 'VALIDATION',
                    errorMessage: 'User already exists and is verified',
                    requestId,
                    durationMs: Date.now() - startTime
                });
                return NextResponse.json(
                    { success: false, message: 'User already exists', errorCode: 'USER_EXISTS' },
                    { status: 400 }
                );
            }

            // ---------------------------------------------------------
            // OTP RATE LIMIT & SECURITY CHECK (STRICT)
            // ---------------------------------------------------------
            const now = new Date();
            const OTP_COOLDOWN_MS = 60 * 1000; // 60 seconds
            const MAX_OTP_ATTEMPTS = 5;

            if (existingUser.otpAttempts >= MAX_OTP_ATTEMPTS) {
                const ONE_HOUR = 60 * 60 * 1000;
                if (existingUser.otpSentAt && (now.getTime() - new Date(existingUser.otpSentAt).getTime() < ONE_HOUR)) {
                    logAudit({
                        domain: 'AUTH',
                        action: 'OTP_MAX_ATTEMPTS_HIT',
                        result: 'FAIL',
                        errorCategory: 'POLICY',
                        errorMessage: `User ${email} blocked due to max OTP attempts`,
                        requestId
                    });
                    return NextResponse.json({
                        success: false,
                        message: 'Too many attempts. Please try again later (1 hour lockout).',
                        errorCode: 'MAX_ATTEMPTS_EXCEEDED'
                    }, { status: 429 });
                } else {
                    // Reset if 1 hour passed
                    existingUser.otpAttempts = 0;
                }
            }

            if (existingUser.otpSentAt) {
                const lastSent = new Date(existingUser.otpSentAt).getTime();
                const diff = now.getTime() - lastSent;
                if (diff < OTP_COOLDOWN_MS) {
                    const waitSeconds = Math.ceil((OTP_COOLDOWN_MS - diff) / 1000);
                    logAudit({
                        domain: 'OTP',
                        action: 'OTP_RATE_LIMIT_HIT',
                        result: 'FAIL',
                        errorCategory: 'POLICY',
                        errorMessage: `Rate limit hit for ${email}`,
                        requestId
                    });
                    return NextResponse.json({
                        success: false,
                        message: `Please wait ${waitSeconds} seconds before retrying.`,
                        errorCode: 'RATE_LIMIT_EXCEEDED'
                    }, { status: 429 });
                }
            }
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Generate OTP (6 digits)

        // ---------------------------------------------------------
        // GENERATE & SAVE OTP
        // ---------------------------------------------------------
        // Secure OTP (6 digits)
        const otp = crypto.randomInt(100000, 999999).toString();
        const otpHash = await bcrypt.hash(otp, 10);
        const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes from now
        const otpSentAt = new Date();

        // Note: Removed duplicate OTP generation block that was here previously.

        let userId = existingUser?._id;

        if (existingUser) {
            existingUser.otpHash = otpHash;
            existingUser.otpExpiresAt = otpExpiresAt;
            existingUser.otpSentAt = otpSentAt;
            existingUser.otpAttempts = (existingUser.otpAttempts || 0) + 1;
            existingUser.username = username.toLowerCase();
            existingUser.phone = phone;
            existingUser.name = name;
            existingUser.password = hashedPassword;
            existingUser.year = year || '1st Year';
            await existingUser.save();
            userId = existingUser._id;
        } else {
            // Create new PENDING user
            const newUser = new User({
                name,
                username: username.toLowerCase(),
                email,
                phone,
                password: hashedPassword,
                year: year || '1st Year',
                role: 'student',
                otpHash,
                otpExpiresAt,
                otpSentAt,
                otpAttempts: 1,
                isVerified: false,
                otpDeliveryStatus: 'pending',
            });
            await newUser.save();
            userId = newUser._id;
        }

        logAudit({
            domain: 'OTP',
            action: 'OTP_GENERATED',
            result: 'SUCCESS',
            requestId,
            metadata: { email }
        });

        // Send OTP with Retry Logic (Gap A)
        try {
            let attempt = 0;
            const maxAttempts = 2;
            let emailSent = false;
            let lastError;

            while (attempt < maxAttempts && !emailSent) {
                try {
                    attempt++;
                    await sendVerificationEmail(email, otp);
                    emailSent = true;
                } catch (err) {
                    lastError = err;
                    if (attempt < maxAttempts) {
                        // Wait 3 seconds before retry
                        await new Promise(resolve => setTimeout(resolve, 3000));
                        logAudit({
                            domain: 'OTP',
                            action: 'OTP_SEND_RETRY',
                            result: 'RETRY',
                            errorCategory: 'PROVIDER',
                            errorMessage: (err as Error).message,
                            requestId
                        });
                    }
                }
            }

            if (!emailSent) {
                throw lastError || new Error('Failed to send email after retries');
            }

            logAudit({
                domain: 'OTP',
                action: 'OTP_SENT',
                result: 'SUCCESS',
                targetType: 'user',
                targetId: userId.toString(),
                requestId,
                durationMs: Date.now() - startTime
            });

            // Update delivery status
            await User.findByIdAndUpdate(userId, { otpDeliveryStatus: 'sent' });
        } catch (emailError: any) {
            console.error(`[AUTH-CRITICAL] Failed to send OTP email to ${email}.`, emailError);

            logAudit({
                domain: 'OTP',
                action: 'OTP_SEND_FAILED',
                result: 'FAIL',
                errorCategory: 'PROVIDER',
                errorMessage: emailError.message,
                targetType: 'user',
                targetId: userId.toString(),
                requestId,
                durationMs: Date.now() - startTime
            });

            // STRICT MODE: Rollback user creation if email fails.
            // We cannot leave users in state where they cannot verify.
            if (!existingUser) {
                await User.findByIdAndDelete(userId);
            } else {
                await User.findByIdAndUpdate(userId, { otpDeliveryStatus: 'failed' });
            }

            return NextResponse.json(
                { success: false, message: 'Failed to send verification email. Please try again later.', errorCode: 'EMAIL_SEND_FAILED' },
                { status: 500 }
            );
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
        if (process.env.QA_MODE === 'true') {
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
