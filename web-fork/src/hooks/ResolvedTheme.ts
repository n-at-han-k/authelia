import { useSyncExternalStore } from "react";

import { useThemeContext } from "@contexts/ThemeContext";
import { ThemeNameDark, ThemeNameGrey, ThemeNameLight, ThemeNameOled } from "@themes/index";

const MediaQueryDarkMode = "(prefers-color-scheme: dark)";
const DarkFamily = new Set<string>([ThemeNameDark, ThemeNameGrey, ThemeNameOled]);

// Resolves whether a dark theme is currently active, mirroring ThemeContext:
// dark-family themes are dark, and "auto" follows the OS preference.
export function useResolvedDark(): boolean {
    const { themeName } = useThemeContext();
    const prefersDark = useSyncExternalStore(subscribePrefersDark, getPrefersDarkSnapshot, getPrefersDarkSnapshot);

    return DarkFamily.has(themeName) || (themeName !== ThemeNameLight && prefersDark);
}

function subscribePrefersDark(listener: () => void): () => void {
    const query = globalThis.matchMedia?.(MediaQueryDarkMode);
    if (!query?.addEventListener) {
        return () => {};
    }
    query.addEventListener("change", listener);
    return () => query.removeEventListener("change", listener);
}

function getPrefersDarkSnapshot(): boolean {
    return globalThis.matchMedia?.(MediaQueryDarkMode).matches ?? false;
}
