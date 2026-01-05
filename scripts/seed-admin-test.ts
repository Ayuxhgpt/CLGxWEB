
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import path from 'path';

// Load env vars
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
    console.error('Please define the MONGODB_URI environment variable inside .env');
    process.exit(1);
}

const UserSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String },
    role: { type: String, default: 'student' },
    isVerified: { type: Boolean, default: false },
    isBlocked: { type: Boolean, default: false },
    // Minimal fields to satisfy strict mode if any
}, { strict: false });

const User = mongoose.models.User || mongoose.model('User', UserSchema);

async function seed() {
    try {
        await mongoose.connect(MONGODB_URI as string);
        console.log('Connected to DB');

        const password = await bcrypt.hash('password123', 10);

        const users = [
            {
                name: 'Test Student',
                email: 'student@test.com',
                password,
                role: 'student',
                isVerified: true
            },
            {
                name: 'Test Admin',
                email: 'admin@test.com',
                password,
                role: 'admin',
                isVerified: true
            },
            {
                name: 'Test Admin 2',
                email: 'admin2@test.com',
                password,
                role: 'admin',
                isVerified: true
            },
            {
                name: 'Test Super Admin',
                email: 'super@test.com',
                password,
                role: 'admin',
                isVerified: true
            }
        ];

        for (const u of users) {
            const existing = await User.findOne({ email: u.email });
            if (existing) {
                await User.updateOne({ email: u.email }, u);
                console.log(`Updated ${u.email}`);
            } else {
                await User.create(u);
                console.log(`Created ${u.email}`);
            }
        }

        console.log('\n--- SEED COMPLETE ---');
        console.log('Use these credentials to test (Password: password123):');
        console.log('1. student@test.com (Student)');
        console.log('2. admin@test.com (Standard Admin)');
        console.log('3. admin2@test.com (Standard Admin - Spare)');
        console.log('4. super@test.com (Super Admin - REQUIRES ENV CONFIG)\n');

        console.log('IMPORTANT: To test Super Admin features, add this to your .env:');
        console.log('SUPER_ADMIN_EMAIL=super@test.com');

    } catch (error) {
        console.error(error);
    } finally {
        await mongoose.disconnect();
    }
}

seed();
