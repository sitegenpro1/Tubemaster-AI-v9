import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    // 1. Load env from local .env files (for local dev)
    const env = loadEnv(mode, '.', '');

    // 2. Prioritize System Environment Variables (Vercel Dashboard)
    // If running on Vercel, process.env.VITE_... will be present.
    // If running locally, env.VITE_... will be present from loaded files.
    const groqKey = process.env.VITE_GROQ_API_KEY || env.VITE_GROQ_API_KEY || '';
    const openRouterKey = process.env.VITE_OPENROUTER_API_KEY || env.VITE_OPENROUTER_API_KEY || '';

    return {
      base: './', 
      server: {
        port: 3000,
        host: '0.0.0.0',
      },
      plugins: [react()],
      resolve: {
        alias: {
          '@': path.resolve('.'),
        }
      },
      build: {
        target: 'esnext',
        minify: 'esbuild'
      },
      // 3. Define global constant replacements
      // This "bakes" the API keys into the code at build time.
      define: {
        'process.env.VITE_GROQ_API_KEY': JSON.stringify(groqKey),
        'process.env.VITE_OPENROUTER_API_KEY': JSON.stringify(openRouterKey),
        // Keep general process.env for other needs, but the specific keys above take precedence
        'process.env': {
           ...env,
           NODE_ENV: JSON.stringify(mode)
        }
      }
    };
});
