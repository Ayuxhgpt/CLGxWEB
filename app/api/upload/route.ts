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
 * Tracks Atomic Lifecycle: Upload -> DB -> Rollback
 */
export async function POST(req: Request) {
    const requestId = `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const startTime = Date.now();

    // 1. Auth Check
    const session = await getServerSession(authOptions);
    if (!session) {
        logAudit({
            domain: 'UPLOAD',
            action: 'UPLOAD_UNAUTHORIZED',
            result: 'FAIL',
            errorCategory: 'AUTH',
            errorMessage: 'User not logged in',
            requestId
        });
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
            semester,
            type // Added type field for general uploads if needed
        } = body;

        // 2. Validate Payload
        if (!secure_url || !public_id) {
            logAudit({
                domain: 'UPLOAD',
                action: 'UPLOAD_INVALID_PAYLOAD',
                result: 'FAIL',
                errorCategory: 'VALIDATION',
                errorMessage: 'Missing Cloudinary secure_url or public_id',
                userId: (session.user as any).id,
                requestId
            });
            return NextResponse.json({ success: false, message: 'Missing Cloudinary result data', errorCode: 'INVALID_PAYLOAD' }, { status: 400 });
        }

        const userId = (session.user as any).id;
        const userRole = (session.user as any).role;

        // 3. Log Start
        logAudit({
            domain: 'UPLOAD',
            action: 'UPLOAD_STARTED',
            result: 'SUCCESS',
            userId: userId,
            userRole: userRole,
            requestId,
            metadata: { public_id, folder, albumId, title }
        });

        await dbConnect();

        // ---------------------------------------------------------
        // HANDLE NOTES (PDF)
        // ---------------------------------------------------------
        if (folder === 'pharma_elevate_notes' || type === 'note') {
            if (!title || !subject || !semester) {
                logAudit({
                    domain: 'UPLOAD',
                    action: 'UPLOAD_VALIDATION_FAIL',
                    result: 'FAIL',
                    errorCategory: 'VALIDATION',
                    errorMessage: 'Missing fields for note',
                    userId: userId,
                    requestId
                });
                return NextResponse.json({ success: false, message: 'Missing required metadata for notes', errorCode: 'MISSING_FIELDS' }, { status: 400 });
            }

            try {
                const isAdmin = userRole === 'admin';

                logAudit({
                    domain: 'UPLOAD',
                    action: 'DB_SAVE_ATTEMPT',
                    result: 'SUCCESS',
                    userId: userId,
                    requestId,
                    metadata: { type: 'note', title }
                });

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
                    domain: 'UPLOAD',
                    action: 'UPLOAD_COMPLETED',
                    result: 'SUCCESS',
                    userId: userId,
                    targetType: 'note',
                    targetId: newNote._id.toString(),
                    requestId,
                    durationMs: Date.now() - startTime,
                    metadata: { title, publicId: public_id }
                });

                return NextResponse.json({ success: true, message: 'Note uploaded successfully', data: newNote }, { status: 201 });

            } catch (dbError: any) {
                console.error('DB Note Create Failed, Rolling back Cloudinary upload...', dbError);

                logAudit({
                    domain: 'UPLOAD',
                    action: 'DB_SAVE_FAIL',
                    result: 'FAIL',
                    errorCategory: 'DATABASE',
                    errorMessage: dbError.message,
                    userId: userId,
                    requestId,
                    metadata: { publicId: public_id }
                });

                // ATOMIC ROLLBACK: Remove orphan file from Cloudinary
                try {
                    await cloudinary.uploader.destroy(public_id, { resource_type: 'raw' });
                    logAudit({
                        domain: 'UPLOAD',
                        action: 'ROLLBACK_SUCCESS',
                        result: 'SUCCESS',
                        userId: userId,
                        requestId,
                        metadata: { publicId: public_id, reason: 'DB Save Failed' }
                    });
                } catch (rollbackError: any) {
                    console.error("CRITICAL: Rollback failed for", public_id, rollbackError);
                    logAudit({
                        domain: 'UPLOAD',
                        action: 'ROLLBACK_FAIL',
                        result: 'FAIL',
                        errorCategory: 'UNKNOWN', // Critical Orphan File
                        errorMessage: rollbackError.message,
                        userId: userId,
                        requestId,
                        metadata: { public_id, originalError: dbError.message }
                    });
                }

                throw dbError; // Re-throw to hit outer catch if needed, or return error response
                return NextResponse.json({ success: false, message: 'Database save failed', errorCode: 'DB_ERROR' }, { status: 500 });
            }
        }

        // ---------------------------------------------------------
        // HANDLE IMAGES / ALBUMS
        // ---------------------------------------------------------
        if (albumId || type === 'image') {
            try {
                logAudit({
                    domain: 'UPLOAD',
                    action: 'DB_SAVE_ATTEMPT',
                    result: 'SUCCESS',
                    userId: userId,
                    requestId,
                    metadata: { type: 'image', albumId }
                });

                const newImage = await Image.create({
                    imageUrl: secure_url,
                    publicId: public_id,
                    albumId,
                    uploadedBy: userId,
                    caption: caption || '',
                    status: userRole === 'admin' ? 'approved' : 'pending',
                    statusUpdatedAt: new Date(),
                });

                logAudit({
                    domain: 'UPLOAD',
                    action: 'UPLOAD_COMPLETED',
                    result: 'SUCCESS',
                    userId: userId,
                    targetType: 'image',
                    targetId: newImage._id.toString(),
                    requestId,
                    durationMs: Date.now() - startTime,
                    metadata: { albumId, publicId: public_id }
                });

                return NextResponse.json({ success: true, message: 'Image uploaded successfully', data: newImage }, { status: 201 });

            } catch (dbError: any) {
                console.error('DB Image Create Failed, Rolling back Cloudinary upload...');

                logAudit({
                    domain: 'UPLOAD',
                    action: 'DB_SAVE_FAIL',
                    result: 'FAIL',
                    errorCategory: 'DATABASE',
                    errorMessage: dbError.message,
                    userId: userId,
                    requestId
                });

                // ATOMIC ROLLBACK
                try {
                    await cloudinary.uploader.destroy(public_id);
                    logAudit({
                        domain: 'UPLOAD',
                        action: 'ROLLBACK_SUCCESS',
                        result: 'SUCCESS',
                        userId: userId,
                        requestId,
                        metadata: { publicId: public_id }
                    });
                } catch (rollbackError: any) {
                    logAudit({
                        domain: 'UPLOAD',
                        action: 'ROLLBACK_FAIL',
                        result: 'FAIL',
                        errorCategory: 'UNKNOWN',
                        errorMessage: rollbackError.message,
                        userId: userId,
                        requestId
                    });
                }

                return NextResponse.json({ success: false, message: 'Database save failed', errorCode: 'DB_ERROR' }, { status: 500 });
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
            domain: 'UPLOAD',
            action: 'UPLOAD_CRASH',
            result: 'FAIL',
            errorCategory: 'UNKNOWN',
            errorMessage: error.message,
            requestId,
            durationMs: Date.now() - startTime
        });
        return NextResponse.json({ success: false, message: 'Failed to process metadata', errorCode: 'INTERNAL_ERROR' }, { status: 500 });
    }
}
