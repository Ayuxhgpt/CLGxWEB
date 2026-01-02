import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import dbConnect from '@/lib/db';
import Note from '@/models/Note';
import { authOptions } from '@/lib/auth';

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const semester = searchParams.get('semester');
        const subject = searchParams.get('subject');

        await dbConnect();

        const query: Record<string, unknown> = {};
        if (semester) query.semester = semester;
        if (subject) query.subject = subject;

        const notes = await Note.find(query).sort({ createdAt: -1 }).populate('uploadedBy', 'name');

        return NextResponse.json(notes, { status: 200 });
    } catch (error) {
        console.error('Notes fetch error:', error);
        return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || session.user.role !== 'admin') {
            return NextResponse.json({ message: 'Unauthorized. Admin only.' }, { status: 403 });
        }

        const { title, subject, semester, pdfUrl } = await req.json();

        if (!title || !subject || !semester || !pdfUrl) {
            return NextResponse.json({ message: 'Missing fields' }, { status: 400 });
        }

        await dbConnect();

        const newNote = await Note.create({
            title,
            subject,
            semester,
            pdfUrl,
            uploadedBy: session.user.id, // Handle potential ID field differences
        });

        return NextResponse.json({ message: 'Note created', note: newNote }, { status: 201 });
    } catch (error) {
        console.error('Note creation error:', error);
        return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
    }
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
        await Note.findByIdAndDelete(id);

        return NextResponse.json({ message: 'Note deleted' }, { status: 200 });
    } catch (error) {
        return NextResponse.json({ message: 'Error deleting note' }, { status: 500 });
    }
}
