import mongoose from 'mongoose';

const AuditLogSchema = new mongoose.Schema({
    type: {
        type: String,
        required: true,
        index: true, // Optimizes filtering by event type
    },
    actorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: false, // Can be system actions
    },
    actorRole: {
        type: String,
        default: 'system',
    },
    targetType: {
        type: String,
        enum: ['user', 'note', 'image', 'auth', 'system', 'admin'],
    },
    targetId: {
        type: mongoose.Schema.Types.ObjectId,
        required: false,
    },
    metadata: {
        type: Object, // Flexible JSON storage for details
        default: {},
    },
    ip: String,
    userAgent: String,
    status: {
        type: String,
        enum: ['success', 'failure', 'pending'],
        default: 'success'
    },
    createdAt: {
        type: Date,
        default: Date.now,
        expires: '90d', // Auto-delete logs after 90 days to save space
    }
});

// Prevent model recompilation error
export default mongoose.models.AuditLog || mongoose.model('AuditLog', AuditLogSchema);
