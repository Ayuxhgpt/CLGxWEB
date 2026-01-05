import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import cloudinary from '@/lib/cloudinary';
import dbConnect from '@/lib/db';
import Image from '@/models/Image';
import Note from '@/models/Note';
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

        // Metadata for Notes
        const title = formData.get('title') as string | null;
        const subject = formData.get('subject') as string | null;
        const semester = formData.get('semester') as string | null;

        if (!file) {
            return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
        }

        // 1. Size Limit (10MB)
        if (file.size > 10 * 1024 * 1024) {
            return NextResponse.json({ error: 'File size too large (Max 10MB)' }, { status: 400 });
        }

        // Determine folder & Validate Type
        let folder = explicitFolder ?? 'pharma_elevate_misc';

        // NOTE SPECIFIC VALIDATION
        if (folder === 'pharma_elevate_notes' || file.type === 'application/pdf') {
            folder = 'pharma_elevate_notes'; // Enforce folder
            if (file.type !== 'application/pdf') {
                return NextResponse.json({ error: 'Only PDF allowed for notes' }, { status: 400 });
            }
            if (!title || !subject || !semester) {
                return NextResponse.json({ error: 'Missing required metadata (title, subject, semester) for notes' }, { status: 400 });
            }
        }
        else if (albumId) {
            folder = 'pharma_elevate_albums';
            if (!file.type.startsWith('image/')) {
                return NextResponse.json({ error: 'Only images allowed for albums' }, { status: 400 });
            }
        }
        else if (folder === 'pharma_elevate_profiles') {
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
                { folder, resource_type: file.type === 'application/pdf' ? 'auto' : 'image' }, // 'auto' for PDFs to be safe, though 'image' often works for PDFs in Cloudinary, 'raw' or 'auto' is better. Notes: Cloudinary usually treats PDF as image if you want previews, but let's stick to default behavior or auto.
                (error, result) => {
                    if (error) reject(error);
                    else resolve(result);
                }
            ).end(buffer);
        });

        // CONNECT DB ONCE
        await dbConnect();

        // ---------------------------------------------------------
        // HANDLE NOTES (PDF)
        // ---------------------------------------------------------
        if (folder === 'pharma_elevate_notes') {
            try {
                // ATOMIC-LIKE SAVE
                const isAdmin = (session.user as any).role === 'admin';
                const newNote = await Note.create({
                    title,
                    subject,
                    semester,
                    pdfUrl: uploadResult.secure_url,
                    uploadedBy: (session.user as any).id,
                    status: isAdmin ? 'approved' : 'pending',
                    approvedBy: isAdmin ? (session.user as any).id : null,
                    statusUpdatedAt: new Date(),
                    // Cloudinary public_id could be useful to store for deletion, Note model doesn't seemingly have it explicitly in previous read? 
                    // Let's check Note model again. It didn't have publicId. 
                    // Ideally we SHOULD add it. 
                    // But for now, we just save what we can. 
                    // Wait, if we don't save publicId, we can't delete it later easily if admin deletes note.
                    // For this specific 'Integrity' task, the rollback relies on uploadResult.public_id which we HAVE here.
                    // So immediate rollback works. Future deletion might be issue without persistent public_id, but that's a separate refactor.
                });

                return NextResponse.json(newNote, { status: 201 });

            } catch (dbError) {
                console.error('DB Note Create Failed, Rolling back Cloudinary upload...');
                // ROLLBACK
                await cloudinary.uploader.destroy(uploadResult.public_id);
                throw dbError;
            }
        }

        // ---------------------------------------------------------
        // HANDLE IMAGES / ALBUMS
        // ---------------------------------------------------------

        // If generic upload (no album and not a note/profile specific flow we track in DB?), just return URL?
        // Original code: "If generic upload (no album), just return URL"
        // But what about 'pharma_elevate_profiles'? Usually those are User updates, generic upload might not create Image doc?
        // Let's stick to original logic: if !albumId (and not note), return URL.

        if (!albumId) {
            return NextResponse.json({
                url: uploadResult.secure_url,
                public_id: uploadResult.public_id
            }, { status: 200 });
        }

        // Album Image Logic
        try {
            const newImage = await Image.create({
                imageUrl: uploadResult.secure_url,
                publicId: uploadResult.public_id,
                albumId,
                uploadedBy: (session.user as any).id,
                caption: caption || '',
                status: (session.user as any).role === 'admin' ? 'approved' : 'pending',
                statusUpdatedAt: new Date(),
            });

            return NextResponse.json(newImage, { status: 201 });

        } catch (dbError) {
            // ROLLBACK
            console.error('DB Image Create Failed, Rolling back Cloudinary upload...');
            await cloudinary.uploader.destroy(uploadResult.public_id);
            throw dbError;
        }

    } catch (error) {
        console.error('Upload error:', error);
        return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
    }
}
