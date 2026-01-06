import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { v2 as cloudinary } from 'cloudinary';
import { authOptions } from '@/lib/auth';

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

        const { folder, timestamp, upload_preset } = await req.json();

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
