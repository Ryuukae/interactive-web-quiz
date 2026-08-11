import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { exportJSON, readFile } from '../../src/js/utils/fileIO.js';

describe('fileIO Utility Unit Tests', () => {

    beforeEach(() => {
        globalThis.document = {
            createElement: () => ({
                href: '',
                download: '',
                click: () => {}
            }),
            body: {
                appendChild: () => {},
                removeChild: () => {}
            }
        };
        globalThis.URL = {
            createObjectURL: () => 'blob:mock-url',
            revokeObjectURL: () => {}
        };
        globalThis.Blob = class MockBlob {
            constructor(content, options) {
                this.content = content;
                this.options = options;
            }
        };
    });

    it('should export JSON data without crashing', () => {
        const mockData = [{ question: "Test?", answers: [{ text: "Yes", correct: true }] }];
        expect(() => exportJSON(mockData, 'test-quiz.json')).not.toThrow();
    });

    it('should abort JSON export if payload is empty', () => {
        expect(() => exportJSON([], 'test-quiz.json')).not.toThrow();
    });

    it('should read file content asynchronously using FileReader', async () => {
        class MockFileReader {
            readAsText(file) {
                setTimeout(() => {
                    if (this.onload) {
                        this.onload({ target: { result: 'Q=Test?\nA=Ans\nD=Dist' }, loaded: 20 });
                    }
                }, 10);
            }
        }
        globalThis.FileReader = MockFileReader;

        const mockFile = { name: 'test.txt', size: 20 };
        const content = await readFile(mockFile);
        expect(content).toBe('Q=Test?\nA=Ans\nD=Dist');
    });
});
