import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendVerificationEmail(email: string, otp: string) {
    // DEBUG: Log OTP to console for local testing
    if (process.env.NODE_ENV !== 'production') {
        console.log(`\n================================`);
        console.log(`📧 SENDING EMAIL TO: ${email}`);
        console.log(`🔐 OTP CODE: ${otp}`);
        console.log(`================================\n`);
    }

    try {
        const data = await resend.emails.send({
            from: 'onboarding@resend.dev',
            to: email,
            subject: 'Verify your PharmaElevate Account',
            html: `<p>Your verification code is: <strong>${otp}</strong></p><p>This code will expire in 10 minutes.</p>`,
        });
        return { success: true, data };
    } catch (error) {
        console.error('Email error:', error);
        return { success: false, error };
    }
}
