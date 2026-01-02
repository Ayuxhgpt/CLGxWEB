import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import dbConnect from '@/lib/db';
import Album from '@/models/Album';
import { authOptions } from '../auth/[...nextauth]/route'; // Adjust path if needed for auth options

export async function GET() {
    await dbConnect();
    try {
        const albums = await Album.find({}).sort({ createdAt: -1 });
        return NextResponse.json(albums);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch albums' }, { status: 500 });
    }
}

export async function POST(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== 'admin') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const { title, description, year } = await req.json();
        await dbConnect();

        const album = await Album.create({
            title,
            description,
            year,
            createdBy: (session.user as any).id,
        });

        return NextResponse.json(album, { status: 201 });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to create album' }, { status: 500 });
    }
}
