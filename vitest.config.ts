import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    include: ['src/utils/__tests__/**/*.test.ts'],
    coverage: {
      provider: 'v8',
      thresholds: {
        global: { branches: 80, functions: 80, lines: 80, statements: 80 }
      },
      exclude: [
        'node_modules/',
        'src/utils/__tests__/**',
        '**/*.d.ts',
        '**/*.config.*'
      ]
    }
  }
});