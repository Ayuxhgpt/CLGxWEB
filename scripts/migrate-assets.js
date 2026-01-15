const fs = require('fs');
const path = require('path');
const cloudinary = require('cloudinary').v2;
const dotenv = require('dotenv');

console.log("🚀 Starting Migration Script...");

dotenv.config({ path: '.env' });

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const ASSETS_DIR = path.join(process.cwd(), 'public', 'assets');
const MAP_FILE = path.join(process.cwd(), 'migration-map.json');

interface MigrationEntry {
    originalPath: string;
    cloudinaryUrl: string;
    publicId: string;
    type: 'faculty' | 'college' | 'system' | 'gallery' | 'docs';
}

const migrationMap: MigrationEntry[] = [];

async function uploadFile(file: string, folder: string, type: MigrationEntry['type']) {
    const filePath = path.join(ASSETS_DIR, file);
    const fileBase = path.parse(file).name; // Filename without extension

    // Sanitize public_id: remove spaces, special chars
    const safePublicId = `${folder}/${fileBase.replace(/[^a-zA-Z0-9]/g, '_')}`;

    console.log(`Uploading ${file} to ${safePublicId}...`);

    try {
        // Upload
        const result = await cloudinary.uploader.upload(filePath, {
            public_id: safePublicId,
            resource_type: 'auto', // Auto-detect image vs raw (pdf)
            overwrite: true
        });

        console.log(`✅ Success: ${result.secure_url}`);

        migrationMap.push({
            originalPath: `/assets/${file}`, // Path as used in code
            cloudinaryUrl: result.secure_url,
            publicId: result.public_id,
            type: type
        });

    } catch (error) {
        console.error(`❌ Failed to upload ${file}:`, error);
        process.exit(1); // Fail strict
    }
}

async function main() {
    if (!fs.existsSync(ASSETS_DIR)) {
        console.error("Assets directory not found.");
        return;
    }

    const files = fs.readdirSync(ASSETS_DIR);

    for (const file of files) {
        if (file === 'temp') continue; // Skip temp files

        // HEURISTICS FOR SORTING
        let folder = 'pharmaelevate/system';
        let type: MigrationEntry['type'] = 'system';

        const lower = file.toLowerCase();

        if (lower.endsWith('.pdf')) {
            folder = 'pharmaelevate/docs';
            type = 'docs';
        } else if (
            lower.includes('building') ||
            lower.includes('scp') ||
            lower.includes('lab') ||
            lower.includes('pic1')
        ) {
            folder = 'pharmaelevate/college';
            type = 'college';
        } else if (
            // Faculty names usually CamelCase or Specific names
            // Exclude obvious system icons or generic names if any
            !lower.includes('icon') &&
            !lower.includes('logo') &&
            !lower.includes('pfp') // exclude profile pics? or treat as system?
        ) {
            // Assume it's faculty if it looks like a name
            // Our list has names like "AzraNisha.jpg", "AnuradhaSingh.jpg"
            folder = 'pharmaelevate/faculty';
            type = 'faculty';
        } else if (lower.includes('pfp')) {
            // pfp files (adipfp, ayupfp...) - maybe system or placeholder?
            folder = 'pharmaelevate/system';
            type = 'system';
        }

        await uploadFile(file, folder, type);
    }

    fs.writeFileSync(MAP_FILE, JSON.stringify(migrationMap, null, 2));
    console.log(`\n🎉 Migration Complete. Map saved to ${MAP_FILE}`);
}

main();
