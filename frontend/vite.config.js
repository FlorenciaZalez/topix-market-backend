import { fileURLToPath, URL } from 'node:url';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
export default defineConfig({
    plugins: [react()],
    resolve: {
        alias: {
            api: fileURLToPath(new URL('./src/api', import.meta.url)),
            components: fileURLToPath(new URL('./src/components', import.meta.url)),
            context: fileURLToPath(new URL('./src/context', import.meta.url)),
            layouts: fileURLToPath(new URL('./src/layouts', import.meta.url)),
            pages: fileURLToPath(new URL('./src/pages', import.meta.url)),
            services: fileURLToPath(new URL('./src/services', import.meta.url)),
            types: fileURLToPath(new URL('./src/types/index.ts', import.meta.url)),
            utils: fileURLToPath(new URL('./src/utils', import.meta.url)),
        },
    },
    server: {
        port: 5173,
    },
});
