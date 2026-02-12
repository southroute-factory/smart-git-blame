import { createHighlighter, type Highlighter, type BundledLanguage } from "shiki";

/**
 * Represents a single highlighted line of code
 */
export interface HighlightedLine {
  lineNumber: number;
  html: string;
}

/**
 * Result of syntax highlighting
 */
export interface HighlightResult {
  lines: HighlightedLine[];
  language: string;
  theme: string;
}

// Singleton highlighter instance for reuse across requests
let highlighterInstance: Highlighter | null = null;

// Supported languages for syntax highlighting
// These are bundled with shiki and commonly used in code repositories
const SUPPORTED_LANGUAGES: BundledLanguage[] = [
  "typescript",
  "javascript",
  "python",
  "java",
  "go",
  "rust",
  "c",
  "cpp",
  "csharp",
  "ruby",
  "php",
  "swift",
  "kotlin",
  "scala",
  "html",
  "css",
  "scss",
  "json",
  "yaml",
  "toml",
  "markdown",
  "sql",
  "bash",
  "shell",
  "dockerfile",
  "graphql",
  "jsx",
  "tsx",
  "vue",
  "svelte",
];

// Default theme for syntax highlighting
// Using github-dark for good contrast and familiarity
const DEFAULT_THEME = "github-dark";

/**
 * Gets or creates the singleton highlighter instance.
 * Lazy initialization for better startup performance.
 */
async function getHighlighter(): Promise<Highlighter> {
  if (!highlighterInstance) {
    highlighterInstance = await createHighlighter({
      themes: [DEFAULT_THEME],
      langs: SUPPORTED_LANGUAGES,
    });
  }
  return highlighterInstance;
}

/**
 * Maps common file extensions to shiki language identifiers.
 * Handles cases where the extension doesn't match the language name.
 */
const EXTENSION_TO_LANGUAGE: Record<string, BundledLanguage> = {
  ts: "typescript",
  tsx: "tsx",
  js: "javascript",
  jsx: "jsx",
  mjs: "javascript",
  cjs: "javascript",
  mts: "typescript",
  cts: "typescript",
  py: "python",
  rb: "ruby",
  rs: "rust",
  go: "go",
  java: "java",
  kt: "kotlin",
  kts: "kotlin",
  scala: "scala",
  sc: "scala",
  cs: "csharp",
  c: "c",
  h: "c",
  cpp: "cpp",
  hpp: "cpp",
  cc: "cpp",
  cxx: "cpp",
  swift: "swift",
  php: "php",
  html: "html",
  htm: "html",
  css: "css",
  scss: "scss",
  sass: "scss",
  json: "json",
  yml: "yaml",
  yaml: "yaml",
  toml: "toml",
  md: "markdown",
  mdx: "markdown",
  sql: "sql",
  sh: "bash",
  bash: "bash",
  zsh: "bash",
  dockerfile: "dockerfile",
  graphql: "graphql",
  gql: "graphql",
  vue: "vue",
  svelte: "svelte",
};

/**
 * Detects the language from a filename or extension.
 * Returns undefined if the language cannot be determined.
 *
 * @param filename - The filename or file extension
 * @returns The detected language identifier or undefined
 */
export function detectLanguage(filename: string): BundledLanguage | undefined {
  const lower = filename.toLowerCase();

  // Handle special filenames
  if (lower === "dockerfile" || lower.endsWith("/dockerfile")) {
    return "dockerfile";
  }

  // Extract extension
  const parts = lower.split(".");
  if (parts.length < 2) {
    return undefined;
  }

  const ext = parts[parts.length - 1];
  return EXTENSION_TO_LANGUAGE[ext];
}

/**
 * Checks if a language is supported by the highlighter.
 *
 * @param language - The language identifier to check
 * @returns True if the language is supported
 */
export function isLanguageSupported(language: string): boolean {
  return SUPPORTED_LANGUAGES.includes(language as BundledLanguage);
}

/**
 * Highlights code with syntax coloring, returning line-by-line HTML.
 * Designed for integration with blame view components.
 *
 * @param code - The source code to highlight
 * @param options - Options for highlighting
 * @param options.language - Language identifier (e.g., "typescript")
 * @param options.filename - Filename to detect language from (used if language not specified)
 * @returns Promise resolving to HighlightResult with line-by-line HTML
 *
 * @example
 * ```typescript
 * const result = await highlightCode(code, { filename: "example.ts" });
 * result.lines.forEach(line => {
 *   console.log(`${line.lineNumber}: ${line.html}`);
 * });
 * ```
 */
export async function highlightCode(
  code: string,
  options: {
    language?: string;
    filename?: string;
  } = {}
): Promise<HighlightResult> {
  const highlighter = await getHighlighter();

  // Determine language
  let language: string | undefined = options.language;

  if (!language && options.filename) {
    language = detectLanguage(options.filename);
  }

  // Fallback to plaintext if language is unknown or unsupported
  const effectiveLanguage =
    language && isLanguageSupported(language) ? language : "text";

  // Load language dynamically if it's supported but not yet loaded
  if (effectiveLanguage !== "text") {
    const loadedLangs = highlighter.getLoadedLanguages();
    if (!loadedLangs.includes(effectiveLanguage)) {
      await highlighter.loadLanguage(effectiveLanguage as BundledLanguage);
    }
  }

  // Get highlighted HTML
  const html = highlighter.codeToHtml(code, {
    lang: effectiveLanguage,
    theme: DEFAULT_THEME,
  });

  // Parse the HTML to extract individual lines
  const lines = parseHighlightedHtml(html, code);

  return {
    lines,
    language: effectiveLanguage,
    theme: DEFAULT_THEME,
  };
}

/**
 * Parses Shiki's HTML output into line-by-line structure.
 * Extracts the content within each .line span.
 *
 * @param html - The full HTML output from Shiki
 * @param originalCode - The original source code for line counting
 * @returns Array of HighlightedLine objects
 */
function parseHighlightedHtml(
  html: string,
  originalCode: string
): HighlightedLine[] {
  const lines: HighlightedLine[] = [];
  const codeLines = originalCode.split("\n");

  // Shiki wraps each line in a span with class "line"
  // Extract content between <span class="line"> and </span>
  const lineRegex = /<span class="line">(.*?)<\/span>/g;
  let match;
  let lineNumber = 1;

  while ((match = lineRegex.exec(html)) !== null) {
    lines.push({
      lineNumber,
      html: match[1] || "",
    });
    lineNumber++;
  }

  // Handle edge case: if no lines matched, create plain text lines
  if (lines.length === 0) {
    codeLines.forEach((line, index) => {
      lines.push({
        lineNumber: index + 1,
        html: escapeHtml(line),
      });
    });
  }

  // Handle trailing newline edge case
  // If original code ends with newline, ensure we have matching line count
  if (
    lines.length < codeLines.length &&
    originalCode.endsWith("\n") &&
    codeLines[codeLines.length - 1] === ""
  ) {
    // The last empty line might not be captured by Shiki
    // This is expected behavior
  }

  return lines;
}

/**
 * Escapes HTML special characters for safe rendering.
 *
 * @param text - The text to escape
 * @returns HTML-escaped string
 */
function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

/**
 * Gets the list of supported languages.
 *
 * @returns Array of supported language identifiers
 */
export function getSupportedLanguages(): readonly string[] {
  return SUPPORTED_LANGUAGES;
}
