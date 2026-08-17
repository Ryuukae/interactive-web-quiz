import fs from "fs";
import path from "path";

const e2eDir = path.join(process.cwd(), "tests", "e2e");

function processDirectory(directory) {
    const entries = fs.readdirSync(directory, { withFileTypes: true });
    for (const entry of entries) {
        const fullPath = path.join(directory, entry.name);
        if (entry.isDirectory()) {
            processDirectory(fullPath);
        } else if (entry.isFile() && entry.name.endsWith(".png")) {
            const newName = entry.name.replace(/-(win32|darwin)\.png$/, "-linux.png");
            if (newName !== entry.name) {
                const newPath = path.join(directory, newName);
                fs.renameSync(fullPath, newPath);
                console.log(`  Renamed: ${entry.name} -> ${newName}`);
            }
        }
    }
}

if (fs.existsSync(e2eDir)) {
    console.log("Scanning for snapshots to convert to Linux format...");
    processDirectory(e2eDir);
    console.log("Done. All snapshots converted.");
} else {
    console.error("ERROR: Could not find tests/e2e/ directory.");
    process.exit(1);
}
