import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import dbConnect from '@/lib/db';
import Image from '@/models/Image';
import { authOptions } from '@/lib/auth';

export async function GET() {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== 'admin') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();
    await dbConnect();

    // Fetch pending images
    const pendingImages = await Image.find({ isApproved: false })
        .populate('uploadedBy', 'name')
        .populate('albumId', 'title')
        .sort({ createdAt: -1 })
        .lean();

    // Fetch pending notes
    const Note = (await import('@/models/Note')).default;
    const pendingNotes = await Note.find({ status: 'pending' })
        .populate('uploadedBy', 'name')
        .sort({ createdAt: -1 })
        .lean();

    // Add type tags for the frontend
    const images = pendingImages.map((img: any) => ({ ...img, type: 'image' }));
    const notes = pendingNotes.map((note: any) => ({ ...note, type: 'note' }));

    return NextResponse.json({ images, notes });
}
