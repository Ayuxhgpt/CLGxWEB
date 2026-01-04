import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please provide a name'],
        maxlength: [60, 'Name cannot be more than 60 characters'],
    },
    email: {
        type: String,
        required: [true, 'Please provide an email'],
        unique: true,
    },
    password: {
        type: String,
        required: [false, 'Password is optional for social login'],
    },
    provider: {
        type: String,
        default: 'credentials',
    },
    providerId: {
        type: String,
    },
    phone: {
        type: String,
        required: [false, 'Phone is optional initially'],
    },
    isVerified: {
        type: Boolean,
        default: false,
    },
    otp: {
        type: String,
    },
    otpExpiry: {
        type: Date,
    },
    role: {
        type: String,
        enum: ['student', 'admin', 'faculty'],
        default: 'student',
    },
    year: {
        type: String,
        default: '1st Year',
    },
    branch: {
        type: String,
        default: 'B.Pharm',
    },
    bio: {
        type: String,
        maxlength: [300, 'Bio cannot exceed 300 characters'],
    },
    image: {
        type: String,
    },
    socials: {
        instagram: { type: String },
        linkedin: { type: String },
        twitter: { type: String },
    },
    isBlocked: {
        type: Boolean,
        default: false,
    },
    lastLogin: {
        type: Date,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

export default mongoose.models.User || mongoose.model('User', UserSchema);
