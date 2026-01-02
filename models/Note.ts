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
    uploadedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    likes: {
        type: Number,
        default: 0
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

export default mongoose.models.Note || mongoose.model('Note', NoteSchema);
