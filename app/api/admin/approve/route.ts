import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import dbConnect from '@/lib/db';
import Image from '@/models/Image';
import cloudinary from '@/lib/cloudinary';
import { authOptions } from '../../auth/[...nextauth]/route';

export async function POST(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== 'admin') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const { id, action } = await req.json();
        const imageId = id;
        await dbConnect();

        const image = await Image.findById(imageId);
        if (!image) return NextResponse.json({ error: 'Image not found' }, { status: 404 });

        if (action === 'approve') {
            image.isApproved = true;
            await image.save();
            return NextResponse.json({ message: 'Approved' });
        } else if (action === 'delete') {
            // Delete from Cloudinary
            await cloudinary.uploader.destroy(image.publicId);
            // Delete from DB
            await Image.findByIdAndDelete(imageId);
            return NextResponse.json({ message: 'Deleted' });
        }

        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    } catch (error) {
        return NextResponse.json({ error: 'Operation failed' }, { status: 500 });
    }
}
