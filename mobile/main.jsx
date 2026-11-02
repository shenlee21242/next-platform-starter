import { createRoot } from 'react-dom/client';
import '@fontsource/plus-jakarta-sans/400.css';
import '@fontsource/plus-jakarta-sans/500.css';
import '@fontsource/plus-jakarta-sans/600.css';
import '@fontsource/plus-jakarta-sans/700.css';
import '@fontsource/cinzel/500.css';
import '@fontsource/cinzel/600.css';
import '@fontsource/cinzel/700.css';
import AuraApp from '../components/aura-app';
import '../styles/globals.css';

document.documentElement.classList.add('aura-native');

createRoot(document.getElementById('root')).render(<AuraApp />);
