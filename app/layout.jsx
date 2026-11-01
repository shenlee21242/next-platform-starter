import '@fontsource/plus-jakarta-sans/400.css';
import '@fontsource/plus-jakarta-sans/500.css';
import '@fontsource/plus-jakarta-sans/600.css';
import '@fontsource/plus-jakarta-sans/700.css';
import '@fontsource/cinzel/500.css';
import '@fontsource/cinzel/600.css';
import '@fontsource/cinzel/700.css';
import '../styles/globals.css';

export const metadata = {
    title: 'AURA — Your Real-Life RPG',
    description: 'Turn daily discipline into an epic journey. Complete real quests, grow your character, and level up your life with AURA.',
};

export default function RootLayout({ children }) {
    return (
        <html lang="en">
            <head>
                <link rel="icon" href="/favicon.svg" sizes="any" />
                <meta name="theme-color" content="#0c0e13" />
            </head>
            <body>{children}</body>
        </html>
    );
}
