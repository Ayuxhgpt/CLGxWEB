import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import dbConnect from '@/lib/db';
import Image from '@/models/Image';
import cloudinary from '@/lib/cloudinary';
import { authOptions } from '@/lib/auth';

export async function POST(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== 'admin') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const { id, action, type } = await req.json(); // type: 'image' | 'note'
        await dbConnect();

        if (type === 'note') {
            const Note = (await import('@/models/Note')).default;
            const note = await Note.findById(id);
            if (!note) return NextResponse.json({ error: 'Note not found' }, { status: 404 });

            if (action === 'approve') {
                note.status = 'approved';
                note.approvedBy = (session.user as any).id;
                note.statusUpdatedAt = new Date();
                await note.save();
                return NextResponse.json({ message: 'Note Approved' });
            } else if (action === 'reject' || action === 'delete') {
                // Rejecting distinct from deleting, but for now specific "Delete" action creates rejection state? 
                // Or "Delete" removes it?
                // Plan said: "Admin reject -> Hidden". 
                // Let's implement 'reject' as status change, 'delete' as hard delete.
                // The current frontend uses 'delete' for rejection button.
                // Let's map action 'delete' to status 'rejected' for soft delete/hiding.

                note.status = 'rejected';
                note.statusUpdatedAt = new Date();
                // Optionally add rejectionReason if passed
                await note.save();

                // If it's a HARD delete request, then we destroy. 
                // But generally "Reject" is better for audit.
                // For now, let's treat 'delete' action from UI as 'rejected' status for Notes to be safe.
                return NextResponse.json({ message: 'Note Rejected' });
            }
        } else {
            // Default to Image logic
            const image = await Image.findById(id);
            if (!image) return NextResponse.json({ error: 'Image not found' }, { status: 404 });

            if (action === 'approve') {
                image.status = 'approved';
                image.statusUpdatedAt = new Date();
                await image.save();
                return NextResponse.json({ message: 'Approved' });
            } else if (action === 'reject') {
                image.status = 'rejected';
                image.statusUpdatedAt = new Date();
                await image.save();
                return NextResponse.json({ message: 'Rejected' });
            } else if (action === 'delete') {
                // Delete from Cloudinary
                if (image.publicId) {
                    await cloudinary.uploader.destroy(image.publicId);
                }
                // Delete from DB
                await Image.findByIdAndDelete(id);
                return NextResponse.json({ message: 'Deleted' });
            }
        }

        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Operation failed' }, { status: 500 });
    }
}
