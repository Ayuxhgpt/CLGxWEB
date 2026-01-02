import mongoose from 'mongoose';

const AlbumSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Please provide an album title'],
    },
    description: {
        type: String,
        default: '',
    },
    year: {
        type: String,
        require: true,
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

export default mongoose.models.Album || mongoose.model('Album', AlbumSchema);
