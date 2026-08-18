/**
 * Utility script to synchronize all JS files with the package.json version.
 *
 * @module scripts/sync-versions
 * @version 1.5.1
 * @author Adam Ross DeStafeno
 */

import fs from "fs";
import path from "path";

const packageJsonPath = path.resolve(process.cwd(), "package.json");
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf8"));
const currentVersion = packageJson.version;

const srcDir = path.resolve(process.cwd(), "src");

function getAllJsFiles(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach((file) => {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      results = results.concat(getAllJsFiles(file));
    } else if (file.endsWith(".js")) {
      results.push(file);
    }
  });
  return results;
}

const files = getAllJsFiles(srcDir);
let hasErrors = false;
let updatedCount = 0;

files.forEach((filePath) => {
  try {
    const content = fs.readFileSync(filePath, "utf8");
    const updatedContent = content.replace(
      /@version\s+[^\r\n]+/g,
      `@version ${currentVersion}`
    );

    if (content !== updatedContent) {
      fs.writeFileSync(filePath, updatedContent, "utf8");
      console.log(
        `✅ Updated @version to ${currentVersion} in ${path.relative(process.cwd(), filePath)}`
      );
      updatedCount++;
    }
  } catch (err) {
    console.error(`❌ Error processing file ${filePath}:`, err);
    hasErrors = true;
  }
});

if (hasErrors) {
  process.exit(1);
} else {
  console.log(
    `\n🎉 Synchronization complete. ${updatedCount} file(s) were updated to version ${currentVersion}.`
  );
}
