/**
 * Utility script to enforce strict version synchronization across JS files.
 * Replaces the `@version` JSDoc tag in staged files with the `package.json` version.
 * 
 * @module scripts/enforce-version-bump
 */

import fs from 'fs';
import path from 'path';

const packageJsonPath = path.resolve(process.cwd(), 'package.json');
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
const currentVersion = packageJson.version;

const files = process.argv.slice(2);

let hasErrors = false;

files.forEach(file => {
    const filePath = path.resolve(process.cwd(), file);
    try {
        const content = fs.readFileSync(filePath, 'utf8');
        const updatedContent = content.replace(/@version\s+[^\r\n]+/g, `@version ${currentVersion}`);
        
        if (content !== updatedContent) {
            fs.writeFileSync(filePath, updatedContent, 'utf8');
            console.log(`Updated @version to ${currentVersion} in ${file}`);
        }
    } catch (err) {
        console.error(`Error processing file ${file}:`, err);
        hasErrors = true;
    }
});

if (hasErrors) {
    process.exit(1);
}
