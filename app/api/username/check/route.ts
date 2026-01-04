import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const username = searchParams.get('username');

        if (!username || username.length < 3) {
            return NextResponse.json({ available: false, error: 'Invalid length' }, { status: 400 });
        }

        // Regex check
        const regex = /^[a-z0-9_.]{3,20}$/;
        if (!regex.test(username)) {
            return NextResponse.json({ available: false, error: 'Invalid format' }, { status: 400 });
        }

        // Reserved List Check
        const reserved = ['admin', 'administrator', 'root', 'support', 'help', 'faculty', 'college', 'pharma', 'pharmaelevate', 'mod', 'moderator'];
        if (reserved.includes(username.toLowerCase())) {
            return NextResponse.json({ available: false, error: 'Username is reserved' }, { status: 400 });
        }

        await dbConnect();

        const existingUser = await User.findOne({ username: username.toLowerCase() }).select('_id');

        if (existingUser) {
            return NextResponse.json({ available: false });
        }

        return NextResponse.json({ available: true });

    } catch (error) {
        console.error('Username check error:', error);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}
