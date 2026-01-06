/**
 * Log an audit event from the frontend.
 * @param event The audit event data (domain, action, result, etc.)
 */
export async function logFrontendAudit(event: {
    domain: 'AUTH' | 'OTP' | 'UPLOAD' | 'ADMIN' | 'SYSTEM';
    action: string;
    result: 'SUCCESS' | 'FAIL' | 'RETRY';
    errorCategory?: 'NETWORK' | 'TIMEOUT' | 'VALIDATION' | 'AUTH' | 'PROVIDER' | 'UNKNOWN';
    errorMessage?: string;
    metadata?: any;
}) {
    try {
        await fetch('/api/audit/log', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(event),
        });
    } catch (err) {
        console.error("Failed to send frontend audit log", err);
    }
}
