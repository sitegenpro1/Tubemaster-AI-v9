import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    // Load env file based on `mode` in the current working directory.
    // Set the third parameter to '' to load all env regardless of the `VITE_` prefix.
    const env = loadEnv(mode, (process as any).cwd(), '');
    
    // Construct a process.env object to polyfill in the browser
    const processEnv = {
      ...env,
      // Google Gemini Key (Check various naming conventions)
      'API_KEY': env.API_KEY || env.GEMINI_API_KEY || env.VITE_GEMINI_API_KEY || env.VITE_GOOGLE_API_KEY || '',
      // Groq Key
      'GROQ_API_KEY': env.GROQ_API_KEY || env.VITE_GROQ_API_KEY || '',
      // OpenRouter Key
      'OPENROUTER_API_KEY': env.OPENROUTER_API_KEY || env.VITE_OPENROUTER_API_KEY || '',
      'NODE_ENV': mode
    };

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
      define: {
        // This replaces process.env in the code with the object defined above
        'process.env': JSON.stringify(processEnv)
      }
    };
});