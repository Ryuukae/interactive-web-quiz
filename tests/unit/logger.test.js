import { describe, it, expect, vi } from 'vitest';
import { createLogger } from '../../src/js/utils/logger.js';

describe('logger Utility Unit Tests', () => {

    it('should create a scoped logger instance with logging methods', () => {
        const logger = createLogger('TestScope');
        expect(typeof logger.trace).toBe('function');
        expect(typeof logger.debug).toBe('function');
        expect(typeof logger.info).toBe('function');
        expect(typeof logger.warn).toBe('function');
        expect(typeof logger.error).toBe('function');
    });

    it('should log messages formatted with scope and level', () => {
        const consoleSpy = vi.spyOn(console, 'info').mockImplementation(() => {});
        const logger = createLogger('ScopeA');

        logger.info('Test info message', { key: 'value' });
        expect(consoleSpy).toHaveBeenCalled();

        consoleSpy.mockRestore();
    });

    it('should log error messages cleanly without crashing', () => {
        const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
        const logger = createLogger('ErrorScope');

        expect(() => logger.error('Failure detected', new Error('Mock Error'))).not.toThrow();
        expect(consoleSpy).toHaveBeenCalled();

        consoleSpy.mockRestore();
    });
});
