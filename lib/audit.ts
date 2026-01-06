import dbConnect from '@/lib/db';
import AuditLog from '@/models/AuditLog';

interface AuditParams {
    domain: 'AUTH' | 'OTP' | 'UPLOAD' | 'ADMIN' | 'SYSTEM';
    action: string;
    result: 'SUCCESS' | 'FAIL' | 'RETRY';
    userId?: string;
    userRole?: string;
    sessionId?: string;
    layer?: 'frontend' | 'backend' | 'database' | 'cloudinary';
    targetType?: 'user' | 'note' | 'image' | 'auth' | 'system' | 'admin';
    targetId?: string;
    metadata?: any;
    errorCategory?: 'NETWORK' | 'TIMEOUT' | 'VALIDATION' | 'AUTH' | 'PROVIDER' | 'POLICY' | 'UNKNOWN';
    errorCode?: string;
    errorMessage?: string;
    requestId?: string;
    durationMs?: number;
    req?: Request;
    // Legacy support (optional mapping)
    actorId?: string;
    type?: string;
}

/**
 * Log a critical system event asynchronously (v4.0 Master Tracking).
 */
export async function logAudit(params: AuditParams) {
    // QA_MODE: If enabled, log everything. If disabled, skip non-critical or high-vol logs if needed.
    // For now, we log everything as this is a "Black Box".

    (async () => {
        try {
            await dbConnect();

            let ip = 'unknown';
            let userAgent = 'unknown';

            if (params.req) {
                ip = params.req.headers.get('x-forwarded-for') || 'unknown';
                userAgent = params.req.headers.get('user-agent') || 'unknown';
            }

            // Auto-generate Request ID if missing (Traceability)
            const requestId = params.requestId || `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

            await AuditLog.create({
                domain: params.domain,
                action: params.action || params.type, // Support legacy 'type'
                result: params.result,

                userId: params.userId || params.actorId || null,
                userRole: params.userRole || 'guest',
                sessionId: params.sessionId || 'nobrowser', // Simplified

                layer: params.layer || 'backend',
                errorCategory: params.errorCategory,
                errorCode: params.errorCode,
                errorMessage: params.errorMessage,

                targetType: params.targetType,
                targetId: params.targetId || null,

                requestId: requestId,
                durationMs: params.durationMs || 0,

                ip,
                userAgent,
                metadata: params.metadata || {}
            });

            // DEV LOGGING (QA_MODE Simulation)
            if (process.env.NODE_ENV !== 'production' || process.env.QA_MODE === 'true') {
                const icon = params.result === 'SUCCESS' ? '✅' : params.result === 'FAIL' ? '❌' : '🔁';
                console.log(`${icon} [AUDIT] ${params.domain}:${params.action} (${params.result})`);
                if (params.result === 'FAIL') console.error(`   -> ${params.errorCategory}: ${params.errorMessage}`);
            }

        } catch (error) {
            console.error('[AUDIT_LOG_FAILURE] Failed to save audit log:', error);
        }
    })();
}
