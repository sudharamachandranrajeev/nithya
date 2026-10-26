import { createContext, useContext, useLayoutEffect, type ReactNode } from 'react';
import { themeNames, type ThemeName } from './tokens';

const ThemeContext = createContext<ThemeName>(themeNames[0]);

/** The theme a component renders under. */
export const useNithyaTheme = () => useContext(ThemeContext);

/**
 * Applies a palette to the document. Every colour in nithya.css reads the
 * `--n-*` variables that `[data-nithya-theme]` sets, so switching is one
 * attribute write and no re-render below this provider.
 */
export function NithyaTheme({ theme = themeNames[0], children }: { theme?: ThemeName; children: ReactNode }) {
  useLayoutEffect(() => {
    document.documentElement.dataset.nithyaTheme = theme;
  }, [theme]);
  return <ThemeContext.Provider value={theme}>{children}</ThemeContext.Provider>;
}
