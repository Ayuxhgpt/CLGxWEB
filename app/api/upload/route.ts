import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import cloudinary from '@/lib/cloudinary';
import dbConnect from '@/lib/db';
import Image from '@/models/Image';
import { authOptions } from '@/lib/auth';

export async function POST(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const formData = await req.formData();
        const file = formData.get('file') as File | null;
        const albumId = formData.get('albumId') as string | null;
        const caption = formData.get('caption') as string | null;
        const explicitFolder = formData.get('folder') as string | null;

        if (!file) {
            return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
        }

        // 1. Size Limit (10MB)
        if (file.size > 10 * 1024 * 1024) {
            return NextResponse.json({ error: 'File size too large (Max 10MB)' }, { status: 400 });
        }

        // Determine folder & Validate Type
        let folder = explicitFolder ?? 'pharma_elevate_misc';

        if (albumId) {
            folder = 'pharma_elevate_albums';
            if (!file.type.startsWith('image/')) {
                return NextResponse.json({ error: 'Only images allowed for albums' }, { status: 400 });
            }
        }

        if (folder === 'pharma_elevate_notes') {
            if (file.type !== 'application/pdf') {
                return NextResponse.json({ error: 'Only PDF allowed for notes' }, { status: 400 });
            }
        }

        if (folder === 'pharma_elevate_profiles') {
            if (!file.type.startsWith('image/')) {
                return NextResponse.json({ error: 'Only images allowed for profile' }, { status: 400 });
            }
        }

        // Hardening: Validate Allowlist if explicit folder provided (optional but good)
        const allowedFolders = [
            'pharma_elevate_profiles',
            'pharma_elevate_notes',
            'pharma_elevate_misc',
            'pharma_elevate_albums'
        ];
        if (!allowedFolders.includes(folder)) {
            // Fallback to misc if invalid folder somehow passed
            folder = 'pharma_elevate_misc';
        }

        // Global Safety: Only allow Images and PDFs, strictly.
        // This prevents uploading scripts/executables even to 'misc'
        const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'application/pdf'];
        if (!allowedMimeTypes.includes(file.type)) {
            return NextResponse.json({ error: 'Invalid file type. Only Images and PDFs are allowed.' }, { status: 400 });
        }

        const buffer = Buffer.from(await file.arrayBuffer());

        // Upload to Cloudinary stream
        const uploadResult = await new Promise<any>((resolve, reject) => {
            cloudinary.uploader.upload_stream(
                { folder },
                (error, result) => {
                    if (error) reject(error);
                    else resolve(result);
                }
            ).end(buffer);
        });

        // If generic upload (no album), just return URL
        if (!albumId) {
            return NextResponse.json({
                url: uploadResult.secure_url,
                public_id: uploadResult.public_id
            }, { status: 200 });
        }

        await dbConnect();

        let newImage;
        try {
            newImage = await Image.create({
                imageUrl: uploadResult.secure_url,
                publicId: uploadResult.public_id,
                albumId,
                uploadedBy: (session.user as any).id,
                caption: caption || '',
                status: (session.user as any).role === 'admin' ? 'approved' : 'pending',
                statusUpdatedAt: new Date(),
            });
        } catch (dbError) {
            // ROLLBACK: Delete from Cloudinary if DB write fails
            console.error('DB Create Failed, Rolling back Cloudinary upload...');
            await cloudinary.uploader.destroy(uploadResult.public_id);
            throw dbError; // Re-throw to be caught by outer catch
        }

        return NextResponse.json(newImage, { status: 201 });
    } catch (error) {
        console.error('Upload error:', error);
        return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
    }
}
