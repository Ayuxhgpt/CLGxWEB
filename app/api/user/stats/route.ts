import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import dbConnect from '@/lib/db';
import Image from '@/models/Image';
import Note from '@/models/Note';
import User from '@/models/User';
import { authOptions } from '@/lib/auth';

export async function GET(req: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || !session.user?.email) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        await dbConnect();

        // Stats Logic
        const [uploadsCount, notesCount] = await Promise.all([
            Image.countDocuments({ uploadedBy: (session.user as any).id }),
            Note.countDocuments({ uploadedBy: (session.user as any).id })
        ]);

        // Calculate reputation: 10 per image, 20 per note (more valuable)
        const reputation = (uploadsCount * 10) + (notesCount * 20);

        // Simple streak logic: If lastLogin was today or yesterday
        const user = await User.findById((session.user as any).id).select('lastLogin');
        let streak = 0;
        if (user?.lastLogin) {
            const lastLoginDate = new Date(user.lastLogin).toDateString();
            const today = new Date().toDateString();
            const yesterday = new Date(Date.now() - 86400000).toDateString();

            if (lastLoginDate === today || lastLoginDate === yesterday) {
                streak = 1; // Basic 'active' status for now
            }
        }

        // Fetch recent activity (Combined Images & Notes)
        const [recentImages, recentNotes] = await Promise.all([
            Image.find({ uploadedBy: (session.user as any).id })
                .sort({ createdAt: -1 })
                .limit(10), // Increased limit to 10 for a truly unified feed
            Note.find({ uploadedBy: (session.user as any).id })
                .sort({ createdAt: -1 })
                .limit(10) // Increased limit to 10 for a truly unified feed
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
            success: true,
            data: {
                uploads: uploadsCount + notesCount,
                notesSaved: notesCount,
                reputation: reputation,
                streak: streak,
                recentUploads: mergedActivity
            }
        }, { status: 200 });

    } catch (error) {
        console.error('Stats fetch error:', error);
        return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
    }
}
