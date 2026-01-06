import mongoose from 'mongoose';

const AuditLogSchema = new mongoose.Schema({
    // --- WHO (Context) ---
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true },
    userRole: { type: String, enum: ['guest', 'student', 'admin', 'super_admin'], default: 'guest' },
    sessionId: { type: String, index: true }, // For correlation
    ip: String,
    userAgent: String,

    // --- WHAT (Event) ---
    domain: { type: String, required: true, enum: ['AUTH', 'OTP', 'UPLOAD', 'ADMIN', 'SYSTEM'], index: true },
    action: { type: String, required: true }, // Formerly 'type'
    layer: { type: String, enum: ['frontend', 'backend', 'database', 'cloudinary'], default: 'backend' },

    // --- RESULT (State) ---
    result: { type: String, enum: ['SUCCESS', 'FAIL', 'RETRY'], required: true, index: true },
    errorCategory: { type: String, enum: ['NETWORK', 'TIMEOUT', 'VALIDATION', 'AUTH', 'PROVIDER', 'POLICY', 'UNKNOWN'] },
    errorCode: String,
    errorMessage: String,

    // --- TARGET (Object) ---
    targetType: { type: String, enum: ['user', 'note', 'image', 'auth', 'system', 'admin'] },
    targetId: { type: mongoose.Schema.Types.ObjectId },

    // --- TRACEABILITY & PERF ---
    requestId: { type: String, index: true },
    durationMs: Number,
    retryCount: { type: Number, default: 0 },

    // --- META ---
    metadata: { type: Object, default: {} },
    createdAt: { type: Date, default: Date.now, expires: '90d' }
});

// Prevent model recompilation error
export default mongoose.models.AuditLog || mongoose.model('AuditLog', AuditLogSchema);
