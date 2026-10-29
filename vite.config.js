import { copyFileSync, mkdirSync } from 'node:fs';
import { fileURLToPath, URL } from 'node:url';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const outDir = fileURLToPath(new URL('./mobile-www', import.meta.url));
const publicDir = fileURLToPath(new URL('./public', import.meta.url));

// Copy only the runtime assets used by AURA. Distribution files such as the
// downloadable APK must never be bundled inside a subsequent Android build.
function nativePublicAssets() {
    return {
        name: 'aura-native-public-assets',
        closeBundle() {
            mkdirSync(`${outDir}/images`, { recursive: true });
            for (const file of ['aura-hero.png', 'void-colossus.png']) {
                copyFileSync(`${publicDir}/images/${file}`, `${outDir}/images/${file}`);
            }
            copyFileSync(`${publicDir}/favicon.svg`, `${outDir}/favicon.svg`);
        },
    };
}

export default defineConfig({
    root: fileURLToPath(new URL('./mobile', import.meta.url)),
    publicDir: false,
    base: './',
    plugins: [react(), nativePublicAssets()],
    resolve: {
        alias: {
            'next/image': fileURLToPath(new URL('./mobile/next-image.jsx', import.meta.url)),
        },
    },
    build: {
        outDir,
        emptyOutDir: true,
        target: 'es2020',
    },
});
