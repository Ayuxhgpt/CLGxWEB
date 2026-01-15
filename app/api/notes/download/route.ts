import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Note from '@/models/Note';

import { logAudit } from '@/lib/audit';

export async function GET(req: Request) {
    const requestId = `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    try {
        const { searchParams } = new URL(req.url);
        const id = searchParams.get('id');

        if (!id) {
            logAudit({
                domain: 'SYSTEM',
                action: 'DOWNLOAD_FAIL_MISSING_ID',
                result: 'FAIL',
                errorCategory: 'VALIDATION',
                errorMessage: 'Missing note ID',
                requestId
            });
            return NextResponse.json({ message: 'Missing note ID' }, { status: 400 });
        }

        await dbConnect();

        const note = await Note.findById(id);
        if (!note) {
            logAudit({
                domain: 'SYSTEM',
                action: 'DOWNLOAD_FAIL_NOT_FOUND',
                result: 'FAIL',
                errorCategory: 'VALIDATION',
                errorMessage: 'Note not found',
                requestId,
                metadata: { noteId: id }
            });
            return NextResponse.json({ message: 'Note not found' }, { status: 404 });
        }

        // Increment download count
        note.downloadCount = (note.downloadCount || 0) + 1;
        await note.save();

        logAudit({
            domain: 'SYSTEM',
            action: 'NOTE_DOWNLOADED',
            result: 'SUCCESS',
            requestId,
            targetType: 'note',
            targetId: id,
            metadata: { title: note.title, publicId: note.publicId }
        });

        // Redirect to actual PDF URL (or return it)
        return NextResponse.redirect(note.pdfUrl);

    } catch (error: any) {
        console.error('Download error:', error);
        logAudit({
            domain: 'SYSTEM',
            action: 'DOWNLOAD_CRASH',
            result: 'FAIL',
            errorCategory: 'UNKNOWN',
            errorMessage: error.message,
            requestId
        });
        return NextResponse.json({ message: 'Error processing download' }, { status: 500 });
    }
}
