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
    // Populate uploadedBy and albumId for context
    const pending = await Image.find({ isApproved: false })
        .populate('uploadedBy', 'name')
        .populate('albumId', 'title')
        .sort({ createdAt: -1 });

    return NextResponse.json(pending);
}
