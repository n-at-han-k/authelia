import { ButtonHTMLAttributes, useSyncExternalStore } from "react";

import { Moon, Sun } from "lucide-react";

import { buttonVariants } from "@components/ui/button";
import { useThemeContext } from "@contexts/ThemeContext";
import { ThemeNameDark, ThemeNameGrey, ThemeNameLight, ThemeNameOled } from "@themes/index";
import { cn } from "@utils/cn";

type ThemeToggleVariant = "default" | "ghost" | "outline";
type ThemeToggleSize = "default" | "icon";

const MediaQueryDarkMode = "(prefers-color-scheme: dark)";
const DarkFamily = new Set<string>([ThemeNameDark, ThemeNameGrey, ThemeNameOled]);

export interface ThemeToggleProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: ThemeToggleVariant;
    size?: ThemeToggleSize;
}

export const ThemeToggle = ({ className, size = "icon", variant = "outline", ...props }: ThemeToggleProps) => {
    const { setThemeName, themeName } = useThemeContext();
    const prefersDark = useSyncExternalStore(subscribePrefersDark, getPrefersDarkSnapshot, getPrefersDarkSnapshot);

    // Mirrors ThemeContext's resolution: dark-family themes are dark, "auto" follows the OS preference.
    const dark = DarkFamily.has(themeName) || (!ThemeIsLight(themeName) && prefersDark);

    return (
        <button
            type="button"
            onClick={() => setThemeName(dark ? ThemeNameLight : ThemeNameDark)}
            className={cn(buttonVariants({ size, variant }), className)}
            aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}
            {...props}
        >
            {dark ? <Sun className="size-4" /> : <Moon className="size-4" />}
            {size === "default" && <span>{dark ? "Light mode" : "Dark mode"}</span>}
        </button>
    );
};

function ThemeIsLight(name: string): boolean {
    return name === ThemeNameLight;
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
