import { defineConfig } from 'vite';
import laravel from 'laravel-vite-plugin';
import react from '@vitejs/plugin-react';

export default defineConfig({
    plugins: [
        laravel({
            // Tambahin resources/css/app.css di sini biar tampilannya ke-load
            input: ['resources/css/app.css', 'resources/js/app.jsx'],
            refresh: true,
        }),
        react(),
    ],
});
