import mongoose from 'mongoose';

const NoteSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Please provide a title for the note'],
        trim: true,
    },
    subject: {
        type: String,
        required: [true, 'Please specify the subject'],
    },
    semester: {
        type: String,
        required: [true, 'Please specify the semester'],
        enum: ['Semester 1', 'Semester 2', 'Semester 3', 'Semester 4', 'Semester 5', 'Semester 6', 'Semester 7', 'Semester 8'],
    },
    pdfUrl: {
        type: String,
        required: [true, 'PDF URL is required'],
    },
    publicId: {
        type: String,
        required: [true, 'Cloudinary Public ID is required for deletion'],
    },
    uploadedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending',
        index: true // For faster admin queries
    },
    statusUpdatedAt: {
        type: Date,
        default: Date.now
    },
    approvedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null
    },
    rejectionReason: {
        type: String,
        default: null
    },
    likes: {
        type: Number,
        default: 0
    },
    downloadCount: {
        type: Number,
        default: 0
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

export default mongoose.models.Note || mongoose.model('Note', NoteSchema);
