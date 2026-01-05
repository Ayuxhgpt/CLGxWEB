
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';

dotenv.config({ path: '.env' });

const TEST_EMAIL = 'test_verify_auth@example.com';
const TEST_PASS = 'TestPass123!';
const BASE_URL = 'http://localhost:3000';

// Schema def simplified for query
const UserSchema = new mongoose.Schema({
    email: String,
    otpHash: String,
    otpSentAt: Date,
    resetTokenHash: String,
    isVerified: Boolean,
    isBlocked: Boolean,
    username: String,
}, { strict: false });

const User = mongoose.models.User || mongoose.model('User', UserSchema);

async function connectDB() {
    if (mongoose.connection.readyState >= 1) return;
    await mongoose.connect(process.env.MONGODB_URI as string);
}

async function cleanup() {
    await connectDB();
    await User.deleteOne({ email: TEST_EMAIL });
    console.log('🧹 Cleanup done.');
}

async function runTests() {
    try {
        await cleanup();
        console.log('🚀 Starting Verification Tests...');

        // 1. SIGNUP
        console.log('\n--- Test 1: Signup Flow ---');
        const signupRes = await fetch(`${BASE_URL}/api/register`, {
            method: 'POST',
            body: JSON.stringify({
                name: 'Test User',
                email: TEST_EMAIL,
                password: TEST_PASS,
                phone: '1234567890',
                username: 'test_verify_auth'
            }),
            headers: { 'Content-Type': 'application/json' }
        });
        const signupData = await signupRes.json();
        if (signupRes.status !== 201) throw new Error(`Signup failed: ${signupRes.status} ${JSON.stringify(signupData)}`);
        console.log('✅ Signup API successful');

        // Verify DB State
        let user = await User.findOne({ email: TEST_EMAIL });
        if (!user || user.isVerified) throw new Error('User should exist but be unverified');
        if (!user.otpHash) throw new Error('OTP hash should exist');
        console.log('✅ DB User created and unverified');

        // 2. VERIFY
        console.log('\n--- Test 2: Verify Flow ---');
        // We can't know the plain OTP since it's hashed. 
        // Hack: We manually update the user with a known hashed OTP for testing.
        const knownOtp = '123456';
        const hashedOtp = await bcrypt.hash(knownOtp, 10);
        await User.updateOne({ email: TEST_EMAIL }, { otpHash: hashedOtp });

        const verifyRes = await fetch(`${BASE_URL}/api/verify`, {
            method: 'POST',
            body: JSON.stringify({ email: TEST_EMAIL, otp: knownOtp }),
            headers: { 'Content-Type': 'application/json' }
        });
        if (verifyRes.status !== 200) throw new Error(`Verify failed: ${verifyRes.status}`);

        user = await User.findOne({ email: TEST_EMAIL });
        if (!user.isVerified) throw new Error('User should be verified now');
        if (user.otpHash) throw new Error('OTP fields should be cleared');
        console.log('✅ Verification successful. User verified in DB.');

        // 3. RESEND OTP (Rate Limit)
        console.log('\n--- Test 3: Resend OTP Flow ---');
        // Reset user to unverified for resend test
        await User.updateOne({ email: TEST_EMAIL }, {
            isVerified: false,
            otpSentAt: new Date() // Just sent
        });

        const resendFail = await fetch(`${BASE_URL}/api/auth/resend-code`, {
            method: 'POST',
            body: JSON.stringify({ email: TEST_EMAIL }),
            headers: { 'Content-Type': 'application/json' }
        });
        if (resendFail.status !== 429) throw new Error(`Resend should rate limit (got ${resendFail.status})`);
        console.log('✅ Resend Rate Limit working (got 429).');

        // Update time to allow resend
        await User.updateOne({ email: TEST_EMAIL }, {
            otpSentAt: new Date(Date.now() - 70000) // 70s ago
        });

        const resendSuccess = await fetch(`${BASE_URL}/api/auth/resend-code`, {
            method: 'POST',
            body: JSON.stringify({ email: TEST_EMAIL }),
            headers: { 'Content-Type': 'application/json' }
        });
        if (resendSuccess.status !== 200) throw new Error(`Resend should success (got ${resendSuccess.status})`);
        console.log('✅ Resend successful after cooldown.');

        user = await User.findOne({ email: TEST_EMAIL });
        if (!user.otpHash) throw new Error('New OTP should be generated');

        // 4. FORGOT PASSWORD
        console.log('\n--- Test 4: Forgot Password Flow ---');
        await User.updateOne({ email: TEST_EMAIL }, { isVerified: true }); // Make verified

        const forgotRes = await fetch(`${BASE_URL}/api/auth/forgot-password`, {
            method: 'POST',
            body: JSON.stringify({ email: TEST_EMAIL }),
            headers: { 'Content-Type': 'application/json' }
        });
        if (forgotRes.status !== 200) throw new Error(`Forgot Password failed: ${forgotRes.status}`);

        user = await User.findOne({ email: TEST_EMAIL });
        if (!user.resetTokenHash) throw new Error('Reset token should be generated');
        console.log('✅ Forgot password token generated.');

        // 5. RESET PASSWORD
        console.log('\n--- Test 5: Reset Password Flow ---');
        // Hack: Update with known token
        const knownToken = '654321';
        const hashedToken = await bcrypt.hash(knownToken, 10);
        await User.updateOne({ email: TEST_EMAIL }, {
            resetTokenHash: hashedToken,
            resetTokenExpiresAt: new Date(Date.now() + 600000)
        });

        const resetRes = await fetch(`${BASE_URL}/api/auth/reset-password`, {
            method: 'POST',
            body: JSON.stringify({
                email: TEST_EMAIL,
                otp: knownToken,
                newPassword: 'NewPassword123!'
            }),
            headers: { 'Content-Type': 'application/json' }
        });
        if (resetRes.status !== 200) throw new Error(`Reset Password failed: ${resetRes.status}`);

        user = await User.findOne({ email: TEST_EMAIL });
        if (user.resetTokenHash) throw new Error('Reset token should be cleared');
        const passMatch = await bcrypt.compare('NewPassword123!', user.password);
        if (!passMatch) throw new Error('Password was not updated');
        console.log('✅ Password reset successful.');

        console.log('\n🎉 ALL TESTS PASSED SUCCESSFULLY! 🎉');
    } catch (error) {
        console.error('\n❌ TEST FAILED:', error);
        process.exit(1);
    } finally {
        await cleanup();
        await mongoose.disconnect();
    }
}

runTests();
