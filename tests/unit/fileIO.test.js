import { describe, it, expect, vi } from 'vitest';
import { downloadQuizJson, downloadQuizTxt, isValidFileExtension, readTextFileAsync } from '../../src/js/utils/fileIO.js';

describe('fileIO Utility Unit Tests', () => {

    it('should correctly validate file extensions for .json, .txt, and .qad', () => {
        expect(isValidFileExtension('quiz.json')).toBe(true);
        expect(isValidFileExtension('quiz.txt')).toBe(true);
        expect(isValidFileExtension('quiz.qad')).toBe(true);
        expect(isValidFileExtension('quiz.pdf')).toBe(false);
        expect(isValidFileExtension('quiz.exe')).toBe(false);
    });

    it('should trigger JSON file download without error', () => {
        const createObjectURLSpy = vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:mock-url');
        const revokeObjectURLSpy = vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => {});

        const mockData = [{ question: "Test?", answers: [{ text: "Yes", correct: true }] }];
        expect(() => downloadQuizJson(mockData, 'test-quiz.json')).not.toThrow();

        createObjectURLSpy.mockRestore();
        revokeObjectURLSpy.mockRestore();
    });

    it('should trigger TXT file download without error', () => {
        const createObjectURLSpy = vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:mock-url');
        const revokeObjectURLSpy = vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => {});

        const mockText = "Q=Test?\nA=Yes\nD=No";
        expect(() => downloadQuizTxt(mockText, 'test-quiz.txt')).not.toThrow();

        createObjectURLSpy.mockRestore();
        revokeObjectURLSpy.mockRestore();
    });

    it('should read text file content asynchronously', async () => {
        const mockFile = new Blob(["Q=Async Test?\nA=Ans\nD=Dist"], { type: 'text/plain' });
        const content = await readTextFileAsync(mockFile);
        expect(content).toContain("Q=Async Test?");
    });
});
