/**
 * Utility to strip Markdown and LaTeX from a string.
 * Used for clean text previews in cards/meta tags.
 */
export function stripMarkdownAndLatex(text: string | null | undefined): string {
    if (!text) return '';

    let clean = text;

    // 1. Remove LaTeX Display Math: $$ ... $$ or \[ ... \]
    clean = clean.replace(/\$\$[\s\S]*?\$\$/g, '');
    clean = clean.replace(/\\\[[\s\S]*?\\\]/g, '');

    // 2. Remove LaTeX Inline Math: $ ... $ or \( ... \)
    clean = clean.replace(/\$.*?\$/g, '');
    clean = clean.replace(/\\\([\s\S]*?\\\)/g, '');

    // 3. Remove LaTeX Commands: \command{...}{...} or \command[...]{...} or \command
    // This refined regex attempts to catch the command and its immediate arguments
    clean = clean.replace(/\\[a-zA-Z*]+(?:\[.*?\])?(?:\{.*?\})*/g, '');

    // 4. Remove Markdown Links: [text](url) -> text
    clean = clean.replace(/\[(.*?)\]\(.*?\)/g, '$1');

    // 5. Remove Markdown Formatting: **, *, __, _, ~~
    clean = clean.replace(/(\*\*|__)(.*?)\1/g, '$2');
    clean = clean.replace(/(\*|_)(.*?)\1/g, '$2');
    clean = clean.replace(/~~(.*?)~~/g, '$1');

    // 6. Remove Markdown Headers: # Header
    clean = clean.replace(/^#+\s+/gm, '');

    // 7. Remove Markdown Images: ![alt](url)
    clean = clean.replace(/!\[.*?\]\(.*?\)/g, '');

    // 8. Remove Code blocks and inline code
    clean = clean.replace(/```[\s\S]*?```/g, '');
    clean = clean.replace(/`.*?`/g, '');

    // 9. Remove leftover LaTeX artifacts: { }, _, ^, \
    clean = clean.replace(/[{}_\^]/g, '');
    clean = clean.replace(/\\/g, '');

    // 10. Clean up extra whitespace/newlines
    clean = clean.replace(/\n\s*\n/g, '\n').trim();
    clean = clean.replace(/[ \t]+/g, ' '); // Collapse horizontal spaces

    return clean;
}
