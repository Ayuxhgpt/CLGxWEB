import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Album from '@/models/Album';
import Image from '@/models/Image';

interface RouteParams {
    params: Promise<{
        id: string;
    }>;
}

export async function GET(req: Request, { params }: RouteParams) {
    try {
        await dbConnect();
        const { id } = await params;
        const album = await Album.findById(id);

        if (!album) {
            return NextResponse.json({ error: 'Album not found' }, { status: 404 });
        }

        // Fetch approved images (or all if admin? Simple MVP: fetch all approved)
        // TODO: Add logic to show unapproved to admins
        const images = await Image.find({ albumId: id, status: 'approved' }).sort({ createdAt: -1 });

        return NextResponse.json({ album, images });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch details' }, { status: 500 });
    }
}
