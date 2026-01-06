import dbConnect from '@/lib/db';
import AuditLog from '@/models/AuditLog';

interface AuditParams {
    type: string;
    actorId?: string;
    actorRole?: string;
    targetType?: 'user' | 'note' | 'image' | 'auth' | 'system' | 'admin';
    targetId?: string;
    metadata?: any;
    status?: 'success' | 'failure' | 'pending';
    req?: Request; // Optional current request for IP/UA extraction
}

/**
 * Log a critical system event asynchronously.
 * Does NOT block the main thread (fire-and-forget).
 */
export async function logAudit(params: AuditParams) {
    // Fire and forget - don't await this in the main API flow
    (async () => {
        try {
            await dbConnect();

            let ip = 'unknown';
            let userAgent = 'unknown';

            if (params.req) {
                ip = params.req.headers.get('x-forwarded-for') || 'unknown';
                userAgent = params.req.headers.get('user-agent') || 'unknown';
            }

            await AuditLog.create({
                type: params.type,
                actorId: params.actorId || null,
                actorRole: params.actorRole || 'system',
                targetType: params.targetType,
                targetId: params.targetId || null,
                metadata: params.metadata || {},
                status: params.status || 'success',
                ip,
                userAgent
            });

        } catch (error) {
            console.error('[AUDIT_LOG_FAILURE] Failed to save audit log:', error);
            // We do not throw here to prevent bringing down the main app
        }
    })();
}
