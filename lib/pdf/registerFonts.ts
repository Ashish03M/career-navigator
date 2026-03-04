import { Font } from "@react-pdf/renderer";

const isNode = typeof process !== "undefined" && process.versions != null && process.versions.node != null;
const fontPath = (filename: string) => {
    return isNode ? `${process.cwd()}/public/fonts/${filename}` : `/fonts/${filename}`;
};

let registered = false;

/**
 * Lazily register PDF fonts. Safe to call multiple times — only registers once.
 * Call this inside generateBrandedPdf() instead of at module load time.
 */
export function ensureFontsRegistered(): void {
    if (registered) return;

    Font.register({
        family: "SairaCondensed",
        fonts: [
            { src: fontPath("SairaCondensed-Regular.ttf"), fontWeight: 400 },
            { src: fontPath("SairaCondensed-Bold.ttf"), fontWeight: 700 },
        ],
    });

    Font.register({
        family: "Kanit",
        fonts: [
            { src: fontPath("Kanit-Regular.ttf"), fontWeight: 400 },
            { src: fontPath("Kanit-SemiBold.ttf"), fontWeight: 600 },
        ],
    });

    Font.registerHyphenationCallback((word) => [word]);

    registered = true;
}
