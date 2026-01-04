const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

// Define User Schema inline to avoid TS compilation issues for this script
const UserSchema = new mongoose.Schema({
    email: String,
    role: String
});
const User = mongoose.models.User || mongoose.model('User', UserSchema);

async function promoteAdmin() {
    const email = process.argv[2];

    if (!email) {
        console.error('❌ Please provide an email address.');
        console.log('Usage: node scripts/promote-admin.js <email>');
        process.exit(1);
    }

    try {
        if (!process.env.DATABASE_URL) {
            throw new Error("DATABASE_URL is missing from .env");
        }

        await mongoose.connect(process.env.DATABASE_URL);
        console.log('✅ Connected to Database');

        const user = await User.findOne({ email: email });

        if (!user) {
            console.error(`❌ User with email ${email} not found.`);
            process.exit(1);
        }

        user.role = 'admin';
        await user.save();

        console.log(`\n🎉 SUCCESS! User '${user.email}' is now an ADMIN.`);
        console.log(`👉 You can now access: http://localhost:3000/admin`);

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await mongoose.disconnect();
    }
}

promoteAdmin();
