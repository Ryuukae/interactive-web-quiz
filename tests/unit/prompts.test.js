import { describe, it, expect, vi } from 'vitest';
import { confirmAction, showErrorMessage, showSuccessMessage } from '../../src/js/utils/prompts.js';

describe('prompts Utility Unit Tests', () => {

    it('should invoke window.confirm and return boolean decision', () => {
        const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true);

        const result = confirmAction('Are you sure?');
        expect(confirmSpy).toHaveBeenCalledWith('Are you sure?');
        expect(result).toBe(true);

        confirmSpy.mockRestore();
    });

    it('should format and invoke window.alert for showErrorMessage', () => {
        const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});

        showErrorMessage('Invalid QAD data block');
        expect(alertSpy).toHaveBeenCalledWith('[ERROR] Invalid QAD data block');

        alertSpy.mockRestore();
    });

    it('should format and invoke window.alert for showSuccessMessage', () => {
        const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});

        showSuccessMessage('Quiz exported successfully!');
        expect(alertSpy).toHaveBeenCalledWith('[SUCCESS] Quiz exported successfully!');

        alertSpy.mockRestore();
    });
});
