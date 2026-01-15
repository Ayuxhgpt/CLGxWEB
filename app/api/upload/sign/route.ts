import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { v2 as cloudinary } from 'cloudinary';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/db';

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
});

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { folder, timestamp, upload_preset, fileHash } = await req.json();

        // 1.1 DUPLICATE FILE PROTECTION (Gap B)
        if (fileHash) {
            // Check if hash exists in Notes or Images (non-deleted)
            const Note = (await import('@/models/Note')).default;
            const Image = (await import('@/models/Image')).default;

            await dbConnect();

            const existingNote = await Note.findOne({ fileHash, isDeleted: false });
            if (existingNote) {
                return NextResponse.json({ error: 'Duplicate file detected. This file has already been uploaded.' }, { status: 409 });
            }

            const existingImage = await Image.findOne({ fileHash, isDeleted: false });
            if (existingImage) {
                return NextResponse.json({ error: 'Duplicate file detected. This file has already been uploaded.' }, { status: 409 });
            }
        }

        // Security: Validate folder allowlist
        const allowedFolders = [
            'pharma_elevate_profiles',
            'pharma_elevate_notes',
            'pharma_elevate_misc',
            'pharma_elevate_albums'
        ];

        if (!allowedFolders.includes(folder)) {
            return NextResponse.json({ error: 'Invalid folder' }, { status: 400 });
        }

        const paramsToSign = {
            timestamp,
            folder,
            access_mode: 'public',
            // upload_preset, // Optional if using signed upload without preset
        };

        const signature = cloudinary.utils.api_sign_request(
            paramsToSign,
            process.env.CLOUDINARY_API_SECRET!
        );

        return NextResponse.json({
            signature,
            timestamp,
            cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
            api_key: process.env.CLOUDINARY_API_KEY,
        });

    } catch (error) {
        console.error('Sign error:', error);
        return NextResponse.json({ error: 'Failed to generate signature' }, { status: 500 });
    }
}
