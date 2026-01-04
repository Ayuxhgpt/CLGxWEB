import mongoose from 'mongoose';

const ImageSchema = new mongoose.Schema({
    imageUrl: {
        type: String,
        required: true,
    },
    publicId: {
        type: String,
        required: true,
    },
    albumId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Album',
        required: true,
    },
    uploadedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    caption: {
        type: String,
        default: '',
    },
    // isApproved: { type: Boolean, default: false }, // Deprecated
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending',
    },
    statusUpdatedAt: {
        type: Date,
    },
    rejectionReason: {
        type: String,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

export default mongoose.models.Image || mongoose.model('Image', ImageSchema);
