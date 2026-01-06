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
        const uploadsCount = await Image.countDocuments({ uploadedBy: (session.user as any).id });
        const notesCount = await Note.countDocuments({ uploadedBy: (session.user as any).id });

        // Fetch recent activity (Combined Images & Notes)
        const [recentImages, recentNotes] = await Promise.all([
            Image.find({ uploadedBy: (session.user as any).id })
                .sort({ createdAt: -1 })
                .limit(5),
            Note.find({ uploadedBy: (session.user as any).id })
                .sort({ createdAt: -1 })
                .limit(5)
        ]);

        const mergedActivity = [
            ...recentImages.map(img => ({
                _id: img._id,
                title: img.caption || "Untitled Image",
                status: img.status,
                createdAt: img.createdAt,
                url: img.imageUrl,
                type: 'image'
            })),
            ...recentNotes.map(note => ({
                _id: note._id,
                title: note.title,
                status: note.status,
                createdAt: note.createdAt,
                url: note.pdfUrl,
                type: 'note'
            }))
        ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
            .slice(0, 5);

        return NextResponse.json({
            uploads: uploadsCount + notesCount,
            notesSaved: notesCount,
            streak: 1, // Gamification placeholder
            recentUploads: mergedActivity
        }, { status: 200 });

    } catch (error) {
        console.error('Stats fetch error:', error);
        return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
    }
}
