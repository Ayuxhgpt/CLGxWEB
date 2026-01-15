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
                const result = await Note.updateOne(
                    { _id: id, status: 'pending' },
                    {
                        $set: {
                            status: 'approved',
                            approvedBy: userId,
                            statusUpdatedAt: new Date()
                        }
                    }
                );

                if (result.modifiedCount === 0) {
                    return NextResponse.json({ success: false, message: 'Note not found or already processed' }, { status: 409 });
                }

                logAudit({
                    domain: 'ADMIN',
                    action: 'NOTE_APPROVED',
                    result: 'SUCCESS',
                    userId: userId,
                    userRole: 'admin',
                    targetType: 'note',
                    targetId: id
                });
                return NextResponse.json({ success: true, message: 'Note Approved' });
            } else if (action === 'reject') {
                const result = await Note.updateOne(
                    { _id: id, status: 'pending' },
                    {
                        $set: {
                            status: 'rejected',
                            statusUpdatedAt: new Date()
                        }
                    }
                );

                if (result.modifiedCount === 0) {
                    return NextResponse.json({ success: false, message: 'Note not found or already processed' }, { status: 409 });
                }

                // 3.1 USER STRIKE SYSTEM
                const uploaderId = note.uploadedBy;
                if (uploaderId) {
                    const User = (await import('@/models/User')).default;
                    await User.updateOne(
                        { _id: uploaderId },
                        {
                            $inc: { strikes: 1 },
                            $set: { lastStrikeAt: new Date() }
                        }
                    );
                    // Check for ban threshold
                    const user = await User.findById(uploaderId);
                    if (user && user.strikes >= 3 && !user.isUploadBanned) {
                        user.isUploadBanned = true;
                        await user.save();
                        logAudit({
                            domain: 'ADMIN',
                            action: 'USER_UPLOAD_BANNED',
                            result: 'SUCCESS',
                            targetType: 'user',
                            targetId: uploaderId,
                            userId: userId,
                            userRole: 'admin',
                            metadata: { reason: 'Strike threshold reached (3)' }
                        });
                    }
                }

                logAudit({
                    domain: 'ADMIN',
                    action: 'NOTE_REJECTED',
                    result: 'SUCCESS',
                    userId: userId,
                    userRole: 'admin',
                    targetType: 'note',
                    targetId: id
                });
                return NextResponse.json({ success: true, message: 'Note Rejected & Strike Added' });
            } else if (action === 'delete') {
                // 2.2 SOFT DELETE
                await Note.findByIdAndUpdate(id, {
                    isDeleted: true,
                    deletedAt: new Date(),
                    deletedBy: userId
                });

                logAudit({
                    domain: 'ADMIN',
                    action: 'NOTE_SOFT_DELETED',
                    result: 'SUCCESS',
                    userId: userId,
                    userRole: 'admin',
                    targetType: 'note',
                    targetId: id
                });
                return NextResponse.json({ success: true, message: 'Note Moved to Trash' });
            } else if (action === 'restore') {
                // 2.2 RESTORE
                await Note.findByIdAndUpdate(id, {
                    isDeleted: false,
                    deletedBy: null
                });
                logAudit({
                    domain: 'ADMIN',
                    action: 'NOTE_RESTORED',
                    result: 'SUCCESS',
                    userId: userId,
                    userRole: 'admin',
                    targetType: 'note',
                    targetId: id
                });
                return NextResponse.json({ success: true, message: 'Note Restored' });
            }
        } else {
            // Default to Image logic
            const image = await Image.findById(id);
            if (!image) return NextResponse.json({ success: false, message: 'Image not found', errorCode: 'NOT_FOUND' }, { status: 404 });

            if (action === 'approve') {
                const result = await Image.updateOne(
                    { _id: id, status: 'pending' },
                    {
                        $set: {
                            status: 'approved',
                            statusUpdatedAt: new Date()
                        }
                    }
                );

                if (result.modifiedCount === 0) {
                    return NextResponse.json({ success: false, message: 'Image not found or already processed' }, { status: 409 });
                }

                logAudit({
                    domain: 'ADMIN',
                    action: 'IMAGE_APPROVED',
                    result: 'SUCCESS',
                    userId: userId,
                    userRole: 'admin',
                    targetType: 'image',
                    targetId: id
                });
                return NextResponse.json({ success: true, message: 'Approved' });
            } else if (action === 'reject') {
                const result = await Image.updateOne(
                    { _id: id, status: 'pending' },
                    {
                        $set: {
                            status: 'rejected',
                            statusUpdatedAt: new Date()
                        }
                    }
                );

                if (result.modifiedCount === 0) {
                    return NextResponse.json({ success: false, message: 'Image not found or already processed' }, { status: 409 });
                }

                // 3.1 USER STRIKE SYSTEM (Image)
                const uploaderId = image.uploadedBy;
                if (uploaderId) {
                    const User = (await import('@/models/User')).default;
                    await User.updateOne(
                        { _id: uploaderId },
                        {
                            $inc: { strikes: 1 },
                            $set: { lastStrikeAt: new Date() }
                        }
                    );
                    const user = await User.findById(uploaderId);
                    if (user && user.strikes >= 3 && !user.isUploadBanned) {
                        user.isUploadBanned = true;
                        await user.save();
                        logAudit({
                            domain: 'ADMIN',
                            action: 'USER_UPLOAD_BANNED',
                            result: 'SUCCESS',
                            targetType: 'user',
                            targetId: uploaderId,
                            userId: userId,
                            userRole: 'admin',
                            metadata: { reason: 'Strike threshold reached (3)' }
                        });
                    }
                }

                logAudit({
                    domain: 'ADMIN',
                    action: 'IMAGE_REJECTED',
                    result: 'SUCCESS',
                    userId: userId,
                    userRole: 'admin',
                    targetType: 'image',
                    targetId: id
                });
                return NextResponse.json({ success: true, message: 'Rejected & Strike Added' });
            } else if (action === 'delete') {
                // 2.2 SOFT DELETE
                await Image.findByIdAndUpdate(id, {
                    isDeleted: true,
                    deletedAt: new Date(),
                    deletedBy: userId
                });
                logAudit({
                    domain: 'ADMIN',
                    action: 'IMAGE_SOFT_DELETED',
                    result: 'SUCCESS',
                    userId: userId,
                    userRole: 'admin',
                    targetType: 'image',
                    targetId: id
                });
                return NextResponse.json({ success: true, message: 'Deleted (Soft)' });
            } else if (action === 'restore') {
                await Image.findByIdAndUpdate(id, {
                    isDeleted: false,
                    deletedBy: null
                });
                return NextResponse.json({ success: true, message: 'Restored' });
            }
        }

        return NextResponse.json({ success: false, message: 'Invalid action', errorCode: 'INVALID_ACTION' }, { status: 400 });
    } catch (error: any) {
        console.error(error);
        logAudit({
            domain: 'ADMIN',
            action: 'ADMIN_ACTION_FAILED',
            result: 'FAIL',
            errorCategory: 'UNKNOWN',
            errorMessage: error.message
        });
        return NextResponse.json({ success: false, message: 'Operation failed', errorCode: 'INTERNAL_ERROR' }, { status: 500 });
    }
}
