const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config({ path: '.env.local' }); // Try .env.local first
require('dotenv').config({ path: '.env' });      // Fallback

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
    console.error('Please define the MONGODB_URI environment variable');
    process.exit(1);
}

const UserSchema = new mongoose.Schema({
    email: String,
    password: String,
}, { strict: false });

const User = mongoose.model('User', UserSchema);

async function resetPassword() {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('Connected to MongoDB');

        const email = 'student@test.com';
        const newPassword = 'password123';
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        const result = await User.findOneAndUpdate(
            { email: email },
            { $set: { password: hashedPassword } },
            { new: true }
        );

        if (result) {
            console.log(`✅ Password for ${email} has been reset to: ${newPassword}`);
        } else {
            console.log(`❌ User ${email} not found.`);
        }

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await mongoose.disconnect();
        console.log('Disconnected');
    }
}

resetPassword();
