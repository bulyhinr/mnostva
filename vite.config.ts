import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      server: {
        port: 3000,
        host: '0.0.0.0',
      },
      plugins: [react()],
      define: {
        'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      },
      test: {
        environment: 'happy-dom',
        globals: true,
        setupFiles: './setupTests.ts',
        include: ['**/*.test.{ts,tsx}', '**/*.spec.{ts,tsx}'],
        exclude: ['**/node_modules/**', '**/dist/**', './backend/**'],
        clearMocks: true,
        mockReset: true,
        restoreMocks: true,
        poolOptions: {
            threads: {
                singleThread: true
            }
        }
      }
    };
});
