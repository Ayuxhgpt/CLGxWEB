import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Note from '@/models/Note';

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json({ message: 'Missing note ID' }, { status: 400 });
        }

        await dbConnect();

        const note = await Note.findById(id);
        if (!note) {
            return NextResponse.json({ message: 'Note not found' }, { status: 404 });
        }

        // Increment download count
        note.downloadCount = (note.downloadCount || 0) + 1;
        await note.save();

        // Redirect to actual PDF URL (or return it)
        return NextResponse.redirect(note.pdfUrl);

    } catch (error) {
        console.error('Download error:', error);
        return NextResponse.json({ message: 'Error processing download' }, { status: 500 });
    }
}
