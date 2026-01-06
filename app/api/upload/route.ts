import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import cloudinary from '@/lib/cloudinary';
import dbConnect from '@/lib/db';
import Image from '@/models/Image';
import Note from '@/models/Note';
import { authOptions } from '@/lib/auth';
import { logAudit } from '@/lib/audit';

/**
 * PharmaElevate v3.0 - Metadata Upload API
 * Backend no longer receives file blobs.
 * Receives Cloudinary results + metadata from frontend.
 */
export async function POST(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session) {
        return NextResponse.json({ success: false, message: 'Unauthorized', errorCode: 'AUTH_REQUIRED' }, { status: 401 });
    }

    try {
        const body = await req.json();
        const {
            secure_url,
            public_id,
            folder,
            albumId,
            caption,
            title,
            subject,
            semester
        } = body;

        if (!secure_url || !public_id) {
            return NextResponse.json({ success: false, message: 'Missing Cloudinary result data', errorCode: 'INVALID_PAYLOAD' }, { status: 400 });
        }

        await dbConnect();
        const userId = (session.user as any).id;

        // ---------------------------------------------------------
        // HANDLE NOTES (PDF)
        // ---------------------------------------------------------
        if (folder === 'pharma_elevate_notes') {
            if (!title || !subject || !semester) {
                return NextResponse.json({ success: false, message: 'Missing required metadata for notes', errorCode: 'MISSING_FIELDS' }, { status: 400 });
            }

            try {
                const isAdmin = (session.user as any).role === 'admin';
                const newNote = await Note.create({
                    title,
                    subject,
                    semester,
                    pdfUrl: secure_url,
                    publicId: public_id, // v3 Hardening: Storing publicId for cleanup
                    uploadedBy: userId,
                    status: isAdmin ? 'approved' : 'pending',
                    approvedBy: isAdmin ? userId : null,
                    statusUpdatedAt: new Date(),
                });

                logAudit({
                    type: 'NOTE_CREATED',
                    actorId: userId,
                    actorRole: (session.user as any).role,
                    targetType: 'note',
                    targetId: newNote._id.toString(),
                    metadata: { title, subject, semester, publicId: public_id }
                });

                return NextResponse.json({ success: true, message: 'Note uploaded successfully', data: newNote }, { status: 201 });

            } catch (dbError: any) {
                console.error('DB Note Create Failed, Rolling back Cloudinary upload...');

                // ATOMIC ROLLBACK: Remove orphan file from Cloudinary
                await cloudinary.uploader.destroy(public_id, { resource_type: 'raw' });

                logAudit({
                    type: 'UPLOAD_ROLLBACK',
                    actorId: userId,
                    targetType: 'note',
                    status: 'failure',
                    metadata: { publicId: public_id, error: dbError.message }
                });

                throw dbError;
            }
        }

        // ---------------------------------------------------------
        // HANDLE IMAGES / ALBUMS
        // ---------------------------------------------------------
        if (albumId) {
            try {
                const newImage = await Image.create({
                    imageUrl: secure_url,
                    publicId: public_id,
                    albumId,
                    uploadedBy: userId,
                    caption: caption || '',
                    status: (session.user as any).role === 'admin' ? 'approved' : 'pending',
                    statusUpdatedAt: new Date(),
                });

                logAudit({
                    type: 'IMAGE_UPLOADED',
                    actorId: userId,
                    actorRole: (session.user as any).role,
                    targetType: 'image',
                    targetId: newImage._id.toString(),
                    metadata: { albumId, publicId: public_id }
                });

                return NextResponse.json({ success: true, message: 'Image uploaded successfully', data: newImage }, { status: 201 });

            } catch (dbError: any) {
                console.error('DB Image Create Failed, Rolling back Cloudinary upload...');
                // ATOMIC ROLLBACK
                await cloudinary.uploader.destroy(public_id);

                logAudit({
                    type: 'UPLOAD_ROLLBACK',
                    actorId: userId,
                    targetType: 'image',
                    status: 'failure',
                    metadata: { publicId: public_id, error: dbError.message }
                });

                throw dbError;
            }
        }

        // ---------------------------------------------------------
        // GENERIC / PROFILE UPLOAD
        // ---------------------------------------------------------
        return NextResponse.json({
            success: true,
            message: 'Metadata processed',
            data: { url: secure_url, public_id: public_id }
        }, { status: 200 });

    } catch (error: any) {
        console.error('Metadata API error:', error);
        logAudit({
            type: 'UPLOAD_FAILED',
            actorId: (session.user as any).id,
            status: 'failure',
            metadata: { error: error.message }
        });
        return NextResponse.json({ success: false, message: 'Failed to process metadata', errorCode: 'INTERNAL_ERROR' }, { status: 500 });
    }
}
