import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import dbConnect from '@/lib/db';
import Image from '@/models/Image';
import { authOptions } from '@/lib/auth';

export async function GET(req: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || !session.user?.email) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        await dbConnect();

        // Stats Logic
        const uploadsCount = await Image.countDocuments({ 'uploadedBy': session.user.id });

        // Placeholder for future stats like 'notesSaved'
        const notesSaved = 0;

        return NextResponse.json({
            uploads: uploadsCount,
            notesSaved: notesSaved,
            streak: 1 // Gamification placeholder
        }, { status: 200 });

    } catch (error) {
        console.error('Stats fetch error:', error);
        return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
    }
}
