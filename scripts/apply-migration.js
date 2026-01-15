const fs = require('fs');
const path = require('path');

const MAP_FILE = path.join(process.cwd(), 'migration-map.json');

// Files to update
const TARGET_FILES = [
    'data/collegeInfo.ts',
    'data/facultyList.ts',
    'app/page.tsx',
    'app/gallery/page.tsx',
    'app/college/page.tsx',
    'app/faculty/page.tsx'  // Just in case
];

async function main() {
    if (!fs.existsSync(MAP_FILE)) {
        console.error("❌ Migration map not found!");
        process.exit(1);
    }

    const map = JSON.parse(fs.readFileSync(MAP_FILE, 'utf-8'));
    console.log(`Loaded ${map.length} migration entries.`);

    for (const relativeFilePath of TARGET_FILES) {
        const filePath = path.join(process.cwd(), relativeFilePath);

        if (!fs.existsSync(filePath)) {
            console.warn(`⚠️ Skipping missing file: ${relativeFilePath}`);
            continue;
        }

        let content = fs.readFileSync(filePath, 'utf-8');
        let changes = 0;

        for (const entry of map) {
            // entry.originalPath is like "/assets/foo.jpg"
            const searchString = entry.originalPath;

            // Check if file contains string
            if (content.includes(searchString)) {
                content = content.split(searchString).join(entry.cloudinaryUrl);
                changes++;
            }
        }

        if (changes > 0) {
            fs.writeFileSync(filePath, content, 'utf-8');
            console.log(`✅ Updated ${relativeFilePath} (${changes} replacements)`);
        } else {
            console.log(`   No changes in ${relativeFilePath}`);
        }
    }
}

main();
