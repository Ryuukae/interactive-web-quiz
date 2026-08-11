import { defineConfig } from 'vite';

export default defineConfig({
    test: {
        globals: true,
        environment: 'node',
        include: ['tests/unit/**/*.test.js', 'tests/integration/**/*.test.js'],
        exclude: ['tests/e2e/**'],
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
