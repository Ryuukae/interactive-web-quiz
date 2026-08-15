import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { execSync } from 'child_process';
import path from 'path';
import fs from 'fs';
import os from 'os';

describe('Versioning Scripts Integration Tests', () => {
    let tempDir;
    let srcDir;
    let packageJsonPath;
    const verifyScriptPath = path.resolve(process.cwd(), 'scripts/verify-versions.js');
    const enforceScriptPath = path.resolve(process.cwd(), 'scripts/enforce-version-bump.js');

    beforeAll(() => {
        // Create a base temporary directory for tests
        tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'version-scripts-test-'));
        srcDir = path.join(tempDir, 'src');
        packageJsonPath = path.join(tempDir, 'package.json');
    });

    afterAll(() => {
        // Cleanup the temporary directory
        if (fs.existsSync(tempDir)) {
            fs.rmSync(tempDir, { recursive: true, force: true });
        }
    });

    beforeEach(() => {
        // Reset the environment before each test
        if (fs.existsSync(srcDir)) {
            fs.rmSync(srcDir, { recursive: true, force: true });
        }
        if (fs.existsSync(packageJsonPath)) {
            fs.unlinkSync(packageJsonPath);
        }
        
        fs.mkdirSync(srcDir, { recursive: true });
        
        // Write a dummy package.json
        fs.writeFileSync(packageJsonPath, JSON.stringify({ version: '1.5.0' }));
    });

    describe('verify-versions.js', () => {
        it('should exit with 0 when all files match package.json version', () => {
            fs.writeFileSync(path.join(srcDir, 'valid.js'), `
                /**
                 * @version 1.5.0
                 */
                console.log('test');
            `);

            try {
                const output = execSync(`node "${verifyScriptPath}"`, { cwd: tempDir, encoding: 'utf8' });
                expect(output).toContain('✅ All 1 files successfully matched version 1.5.0');
            } catch (error) {
                expect.fail('Script should not have thrown an error');
            }
        });

        it('should exit with 1 when a file is missing the @version tag', () => {
            fs.writeFileSync(path.join(srcDir, 'missing.js'), `
                /**
                 * Description without version
                 */
                console.log('test');
            `);

            try {
                execSync(`node "${verifyScriptPath}"`, { cwd: tempDir, encoding: 'utf8', stdio: 'pipe' });
                expect.fail('Script should have thrown an error');
            } catch (error) {
                expect(error.status).toBe(1);
                expect(error.stderr).toContain('❌ [ERROR] Missing @version tag');
            }
        });

        it('should exit with 1 when a file version mismatches package.json', () => {
            fs.writeFileSync(path.join(srcDir, 'mismatch.js'), `
                /**
                 * @version 1.0.0
                 */
                console.log('test');
            `);

            try {
                execSync(`node "${verifyScriptPath}"`, { cwd: tempDir, encoding: 'utf8', stdio: 'pipe' });
                expect.fail('Script should have thrown an error');
            } catch (error) {
                expect(error.status).toBe(1);
                expect(error.stderr).toContain('❌ [ERROR] Version mismatch');
                expect(error.stderr).toContain('expected 1.5.0, got 1.0.0');
            }
        });
    });

    describe('enforce-version-bump.js', () => {
        it('should update the @version tag in target files to match package.json', () => {
            const testFilePath = path.join(srcDir, 'update.js');
            fs.writeFileSync(testFilePath, `
                /**
                 * @version 1.0.0
                 */
                console.log('test');
            `);

            // Note: enforce-version-bump takes relative file paths as arguments
            try {
                const output = execSync(`node "${enforceScriptPath}" src/update.js`, { cwd: tempDir, encoding: 'utf8' });
                expect(output).toContain('Updated @version to 1.5.0');
                
                // Verify the file was actually changed
                const updatedContent = fs.readFileSync(testFilePath, 'utf8');
                expect(updatedContent).toContain('@version 1.5.0');
                expect(updatedContent).not.toContain('@version 1.0.0');
            } catch (error) {
                expect.fail('Script should not have thrown an error');
            }
        });

        it('should do nothing if the @version tag is already correct', () => {
            const testFilePath = path.join(srcDir, 'correct.js');
            fs.writeFileSync(testFilePath, `
                /**
                 * @version 1.5.0
                 */
                console.log('test');
            `);

            try {
                const output = execSync(`node "${enforceScriptPath}" src/correct.js`, { cwd: tempDir, encoding: 'utf8' });
                // Script shouldn't output the "Updated" log since it didn't change anything
                expect(output).not.toContain('Updated @version');
                
                const updatedContent = fs.readFileSync(testFilePath, 'utf8');
                expect(updatedContent).toContain('@version 1.5.0');
            } catch (error) {
                expect.fail('Script should not have thrown an error');
            }
        });
    });
});
