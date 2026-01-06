import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import dbConnect from '@/lib/db';
import Image from '@/models/Image';
import cloudinary from '@/lib/cloudinary';
import { authOptions } from '@/lib/auth';
import { logAudit } from '@/lib/audit';

export async function POST(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== 'admin') {
        return NextResponse.json({ success: false, message: 'Unauthorized', errorCode: 'AUTH_REQUIRED' }, { status: 401 });
    }

    try {
        const { id, action, type } = await req.json(); // type: 'image' | 'note'
        await dbConnect();
        const userId = (session.user as any).id;

        if (type === 'note') {
            const Note = (await import('@/models/Note')).default;
            const note = await Note.findById(id);
            if (!note) return NextResponse.json({ success: false, message: 'Note not found', errorCode: 'NOT_FOUND' }, { status: 404 });

            if (action === 'approve') {
                note.status = 'approved';
                note.approvedBy = userId;
                note.statusUpdatedAt = new Date();
                await note.save();
                logAudit({ type: 'NOTE_APPROVED', actorId: userId, actorRole: 'admin', targetType: 'note', targetId: id });
                return NextResponse.json({ success: true, message: 'Note Approved' });
            } else if (action === 'reject') {
                note.status = 'rejected';
                note.statusUpdatedAt = new Date();
                await note.save();
                logAudit({ type: 'NOTE_REJECTED', actorId: userId, actorRole: 'admin', targetType: 'note', targetId: id });
                return NextResponse.json({ success: true, message: 'Note Rejected' });
            } else if (action === 'delete') {
                if (note.publicId) {
                    await cloudinary.uploader.destroy(note.publicId, { resource_type: 'raw' });
                }
                await Note.findByIdAndDelete(id);
                logAudit({ type: 'NOTE_DELETED', actorId: userId, actorRole: 'admin', targetType: 'note', targetId: id });
                return NextResponse.json({ success: true, message: 'Note Deleted Permanently' });
            }
        } else {
            // Default to Image logic
            const image = await Image.findById(id);
            if (!image) return NextResponse.json({ success: false, message: 'Image not found', errorCode: 'NOT_FOUND' }, { status: 404 });

            if (action === 'approve') {
                image.status = 'approved';
                image.statusUpdatedAt = new Date();
                await image.save();
                logAudit({ type: 'IMAGE_APPROVED', actorId: userId, actorRole: 'admin', targetType: 'image', targetId: id });
                return NextResponse.json({ success: true, message: 'Approved' });
            } else if (action === 'reject') {
                image.status = 'rejected';
                image.statusUpdatedAt = new Date();
                await image.save();
                logAudit({ type: 'IMAGE_REJECTED', actorId: userId, actorRole: 'admin', targetType: 'image', targetId: id });
                return NextResponse.json({ success: true, message: 'Rejected' });
            } else if (action === 'delete') {
                if (image.publicId) {
                    await cloudinary.uploader.destroy(image.publicId);
                }
                await Image.findByIdAndDelete(id);
                logAudit({ type: 'IMAGE_DELETED', actorId: userId, actorRole: 'admin', targetType: 'image', targetId: id });
                return NextResponse.json({ success: true, message: 'Deleted' });
            }
        }

        return NextResponse.json({ success: false, message: 'Invalid action', errorCode: 'INVALID_ACTION' }, { status: 400 });
    } catch (error: any) {
        console.error(error);
        logAudit({ type: 'ADMIN_ACTION_FAILED', status: 'failure', metadata: { error: error.message } });
        return NextResponse.json({ success: false, message: 'Operation failed', errorCode: 'INTERNAL_ERROR' }, { status: 500 });
    }
}
