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
      if (
        entry.name.includes("-win32.png") ||
        entry.name.includes("-darwin.png")
      ) {
        const linuxName = entry.name.replace(
          /-(win32|darwin)\.png$/,
          "-linux.png"
        );
        const linuxPath = path.join(directory, linuxName);
        fs.copyFileSync(fullPath, linuxPath);
        console.log(`  Synced: ${entry.name} -> ${linuxName}`);
      } else if (entry.name.includes("-linux.png")) {
        const winName = entry.name.replace(/-linux\.png$/, "-win32.png");
        const winPath = path.join(directory, winName);
        if (!fs.existsSync(winPath)) {
          fs.copyFileSync(fullPath, winPath);
          console.log(`  Synced: ${entry.name} -> ${winName}`);
        }
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
