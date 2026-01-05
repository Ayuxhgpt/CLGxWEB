import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import dbConnect from '@/lib/db';
import Image from '@/models/Image';
import Note from '@/models/Note';
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
        const notesCount = await Note.countDocuments({ 'uploadedBy': session.user.id });

        // Fetch recent activity (Real Data)
        const recentUploads = await Image.find({ 'uploadedBy': session.user.id })
            .sort({ createdAt: -1 })
            .limit(5)
            .select('title status createdAt url type'); // Ensure type field exists or is derived

        return NextResponse.json({
            uploads: uploadsCount,
            notesSaved: notesCount,
            streak: 1, // Gamification placeholder
            recentUploads: recentUploads
        }, { status: 200 });

    } catch (error) {
        console.error('Stats fetch error:', error);
        return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
    }
}
