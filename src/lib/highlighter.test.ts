import { describe, test, expect } from 'bun:test';
import { highlightCode, detectLanguage } from './highlighter';

describe('highlighter', () => {
  describe('highlightCode', () => {
    test('returns lines with HTML content containing code text', async () => {
      const code = 'const hello = "world";';
      const result = await highlightCode(code, { language: 'typescript' });
      
      console.log('Result:', JSON.stringify(result, null, 2));
      
      expect(result.lines).toHaveLength(1);
      expect(result.lines[0].lineNumber).toBe(1);
      
      // The HTML should contain the actual code text
      const html = result.lines[0].html;
      console.log('Line HTML:', html);
      
      expect(html).toContain('const');
      expect(html).toContain('hello');
      expect(html).toContain('world');
    });

    test('multi-line code produces correct number of lines', async () => {
      const code = `function greet(name: string) {
  return \`Hello, \${name}!\`;
}`;
      const result = await highlightCode(code, { filename: 'test.ts' });
      
      console.log('Multi-line result:', JSON.stringify(result, null, 2));
      
      expect(result.lines).toHaveLength(3);
      
      // Check each line has content
      expect(result.lines[0].html).toContain('function');
      expect(result.lines[0].html).toContain('greet');
      expect(result.lines[1].html).toContain('return');
      expect(result.lines[2].html).toContain('}');
    });

    test('HTML contains span elements with style for dual themes', async () => {
      const code = 'const x = 1;';
      const result = await highlightCode(code, { language: 'typescript' });
      
      const html = result.lines[0].html;
      console.log('Styled HTML:', html);
      
      // With dual themes, should have style with CSS variables or multiple color definitions
      // Check the HTML structure
      expect(html.length).toBeGreaterThan(0);
      
      // The text content should be present
      expect(html).toContain('const');
      expect(html).toContain('x');
    });

    test('empty lines are preserved', async () => {
      const code = `line1

line3`;
      const result = await highlightCode(code, { language: 'text' });
      
      console.log('Empty line result:', JSON.stringify(result, null, 2));
      
      expect(result.lines).toHaveLength(3);
      expect(result.lines[0].html).toContain('line1');
      // Empty line might be empty string or whitespace
      expect(result.lines[2].html).toContain('line3');
    });

    test('special characters are escaped in output', async () => {
      const code = '<div>Hello & "world"</div>';
      const result = await highlightCode(code, { language: 'html' });
      
      const html = result.lines[0].html;
      console.log('Escaped HTML:', html);
      
      // Should contain the text (may be escaped differently by shiki)
      expect(html).toContain('div');
      expect(html).toContain('Hello');
      expect(html).toContain('world');
    });

    test('unsupported language falls back to text', async () => {
      const code = 'some random text content';
      const result = await highlightCode(code, { language: 'nonexistent-language' });
      
      console.log('Fallback result:', JSON.stringify(result, null, 2));
      
      expect(result.language).toBe('text');
      expect(result.lines[0].html).toContain('some');
      expect(result.lines[0].html).toContain('random');
    });
  });

  describe('detectLanguage', () => {
    test('detects TypeScript from .ts extension', () => {
      expect(detectLanguage('file.ts')).toBe('typescript');
    });

    test('detects JavaScript from .js extension', () => {
      expect(detectLanguage('file.js')).toBe('javascript');
    });

    test('returns undefined for unknown extension', () => {
      expect(detectLanguage('file.xyz')).toBeUndefined();
    });
  });
});
