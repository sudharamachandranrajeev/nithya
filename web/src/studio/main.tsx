import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { themeNames, type ThemeName } from '../nithya';
import { App } from './App';

// ?mode=4&theme=ember opens a screen directly; the README screenshots use it.
const query = new URLSearchParams(location.search);
const theme = query.get('theme');

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App
      initialMode={Number(query.get('mode') ?? 0)}
      initialTheme={themeNames.includes(theme as ThemeName) ? (theme as ThemeName) : undefined}
    />
  </StrictMode>,
);
