import { defineConfig } from 'vite';

export default defineConfig({
    test: {
        globals: true,
        environment: 'node',
        coverage: {
            provider: 'v8',
            reporter: ['text', 'json', 'html'],
            thresholds: {
                statements: 80,
                branches: 80,
                functions: 80,
                lines: 80
            }
        }
    }
});
