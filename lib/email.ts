import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendVerificationEmail(email: string, otp: string) {
    // DEBUG: Log OTP to console for local testing (Re-enabled for debugging)
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
            html: `
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body { margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f4f4; }
                    .container { max-width: 600px; margin: 40px auto; background-color: #111111; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.2); }
                    .header { background-color: #10B981; padding: 30px 20px; text-align: center; }
                    .header h1 { color: #ffffff; margin: 0; font-size: 28px; font-weight: 700; }
                    .header p { color: #ecfdf5; margin: 5px 0 0; font-size: 16px; opacity: 0.9; }
                    .content { padding: 40px 30px; text-align: center; color: #cccccc; }
                    .otp-box { background-color: #1a1a1a; border: 1px solid #333; border-radius: 8px; padding: 20px; display: inline-block; margin: 30px 0; }
                    .otp-code { color: #10B981; font-size: 36px; font-weight: bold; letter-spacing: 8px; font-family: monospace; }
                    .warning { background-color: rgba(234, 179, 8, 0.1); border: 1px solid rgba(234, 179, 8, 0.2); color: #fbbf24; padding: 15px; border-radius: 8px; text-align: left; margin-top: 20px; font-size: 14px; }
                    .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; border-top: 1px solid #222; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>Email Verification</h1>
                        <p>Your verification code is ready</p>
                    </div>
                    <div class="content">
                        <p style="font-size: 18px; margin-bottom: 20px;">Hello!</p>
                        <p style="line-height: 1.6;">Thank you for using <strong>PharmaElevate</strong>. Please verify your email address using the code below:</p>
                        
                        <div class="otp-box">
                            <span class="otp-code">${otp}</span>
                        </div>
                        
                        <p style="font-size: 14px; color: #888;">Enter this code to complete your process.</p>
                        
                        <div class="warning">
                            <strong>⏱ Important:</strong> This code will expire in 10 minutes.
                        </div>
                    </div>
                    <div class="footer">
                        <p>&copy; ${new Date().getFullYear()} PharmaElevate. All rights reserved.</p>
                    </div>
                </div>
            </body>
            </html>
            `,
        });
        return { success: true, data };
    } catch (error) {
        console.error('Email error:', error);
        return { success: false, error };
    }
}
