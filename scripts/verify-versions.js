import fs from 'fs';
import path from 'path';

const packageJsonPath = path.resolve(process.cwd(), 'package.json');
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
const currentVersion = packageJson.version;

const srcDir = path.resolve(process.cwd(), 'src');

function getAllJsFiles(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(file => {
        file = path.join(dir, file);
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) {
            results = results.concat(getAllJsFiles(file));
        } else if (file.endsWith('.js')) {
            results.push(file);
        }
    });
    return results;
}

const jsFiles = getAllJsFiles(srcDir);
let hasErrors = false;

jsFiles.forEach(file => {
    const content = fs.readFileSync(file, 'utf8');
    const versionMatch = content.match(/@version\s+([^\r\n]+)/);

    const relativePath = path.relative(process.cwd(), file);

    if (!versionMatch) {
        console.error(`❌ [ERROR] Missing @version tag in ${relativePath}`);
        hasErrors = true;
    } else {
        const fileVersion = versionMatch[1].trim();
        if (fileVersion !== currentVersion) {
            console.error(`❌ [ERROR] Version mismatch in ${relativePath}: expected ${currentVersion}, got ${fileVersion}`);
            hasErrors = true;
        }
    }
});

if (hasErrors) {
    console.error(`\n🚨 Version verification failed! All files must have a @version tag matching package.json (${currentVersion}).`);
    process.exit(1);
} else {
    console.log(`✅ All ${jsFiles.length} files successfully matched version ${currentVersion}`);
}
