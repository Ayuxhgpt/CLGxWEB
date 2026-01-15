import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import dbConnect from '@/lib/db';
import Note from '@/models/Note';
import { authOptions } from '@/lib/auth';

import { logAudit } from '@/lib/audit';

export async function GET(req: Request) {
    const requestId = `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const startTime = Date.now();

    try {
        const { searchParams } = new URL(req.url);
        const semester = searchParams.get('semester');
        const subject = searchParams.get('subject');

        await dbConnect();

        const query: Record<string, unknown> = { status: 'approved', isDeleted: false }; // Public API only shows approved notes
        if (semester) query.semester = semester;
        if (subject) query.subject = subject;

        const notes = await Note.find(query).sort({ createdAt: -1 }).populate('uploadedBy', 'name');

        // Low-noise logging: Only log if search params exist or results are empty
        if ((semester || subject) && notes.length === 0) {
            logAudit({
                domain: 'SYSTEM',
                action: 'NOTE_SEARCH_EMPTY',
                result: 'SUCCESS',
                metadata: { semester, subject, count: 0 },
                requestId
            });
        }

        return NextResponse.json({ success: true, data: notes }, { status: 200 });
    } catch (error: any) {
        console.error('Notes fetch error:', error);
        logAudit({
            domain: 'SYSTEM',
            action: 'NOTE_FETCH_CRASH',
            result: 'FAIL',
            errorCategory: 'UNKNOWN',
            errorMessage: error.message,
            requestId,
            durationMs: Date.now() - startTime
        });
        return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
    }
}

export async function POST(req: Request) {
    // DEPRECATED: V3.0 - All uploads must go through /api/upload
    // This ensures atomic commit/rollback and unified metadata handling.
    return NextResponse.json({
        success: false,
        message: 'Endpoint Deprecated. Use /api/upload for all file submissions.',
        errorCode: 'ENDPOINT_GONE'
    }, { status: 410 });
}

export async function DELETE(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        const { searchParams } = new URL(req.url);
        const id = searchParams.get('id');

        if (!session || session.user.role !== 'admin') {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 403 });
        }

        if (!id) {
            return NextResponse.json({ message: 'Missing ID' }, { status: 400 });
        }

        await dbConnect();
        const note = await Note.findById(id);
        if (!note) return NextResponse.json({ message: 'Note not found' }, { status: 404 });

        // Cloudinary Cleanup
        if (note.publicId) {
            const cloudinary = (await import('@/lib/cloudinary')).default;
            await cloudinary.uploader.destroy(note.publicId, { resource_type: 'raw' });
        }

        await Note.findByIdAndDelete(id);

        return NextResponse.json({ success: true, message: 'Note deleted permanently' }, { status: 200 });
    } catch (error) {
        return NextResponse.json({ message: 'Error deleting note' }, { status: 500 });
    }
}
