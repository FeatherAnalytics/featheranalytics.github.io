import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { FIGURES } from '../../data/tokenomics';

const POST = 'src/content/blog/2026-06-26-token-economics.mdx';
const source = readFileSync(POST, 'utf8');

/**
 * Everything inside a JSX expression (`{...}`) is data-driven by construction:
 * a number in there is either a `FIGURES` reference, a computed layout value,
 * or a UI-control parameter, never a hand-typed measurement. Depth-counted
 * rather than a non-greedy regex, because a naive `\{[^}]*\}` breaks on the
 * nested braces every `table={{ ... }}` and `style={\`...${x}...\`}` prop uses
 * here — it would stop at the first inner `}` and leak the rest as "prose".
 */
function stripBraceExpressions(text: string): string {
  let out = '';
  let depth = 0;
  for (const ch of text) {
    if (ch === '{') {
      depth++;
      continue;
    }
    if (ch === '}') {
      if (depth > 0) depth--;
      continue;
    }
    if (depth === 0) out += ch;
  }
  return out;
}

/** The YAML frontmatter is metadata (dates, tags), not authored prose. */
function stripFrontmatter(text: string): string {
  const end = text.indexOf('---', text.indexOf('---') + 3);
  return end === -1 ? text : text.slice(end + 3);
}

/**
 * Drop the authoring-guide comment at the top of the post.
 *
 * It documents these very rules for whoever writes the prose, which means it
 * has to SHOW the things the rules are about — a `FIGURES.<key>` placeholder,
 * the outline marker, and the `published: true` line the workflow tells the
 * author to set. Scanned as content, every one of those reads as a violation:
 * the guide tripped both the key-existence check and the draft guard the first
 * time it was added. It is instructions about the post, not part of it.
 *
 * Matched by delimiter rather than by brace depth, because the guide's own
 * prose contains unbalanced braces.
 *
 * Anchored to the preamble — only a comment sitting BEFORE the first `import`
 * counts as the guide. The post body carries other `{/* ... *\/}` comments
 * explaining individual label positions, and an unanchored "first comment"
 * match would silently start eating one of those the day the guide is deleted,
 * quietly shrinking what this file checks.
 */
function stripGuideComment(text: string): string {
  const firstImport = text.indexOf('\nimport ');
  const start = text.indexOf('{/*');
  if (start === -1) return text;
  if (firstImport !== -1 && start > firstImport) return text;
  const end = text.indexOf('*/}', start);
  return end === -1 ? text : text.slice(0, start) + text.slice(end + 3);
}

/** Everything the author actually wrote, with metadata and guidance removed. */
const content = stripGuideComment(source);
const body = stripFrontmatter(content);
const prose = stripBraceExpressions(body);

describe('FIGURES references', () => {
  it('interpolates more than eight FIGURES values rather than typing them', () => {
    const matches = [...content.matchAll(/FIGURES\.(\w+)/g)];
    expect(matches.length).toBeGreaterThan(8);
  });

  it('references only keys that actually exist on FIGURES', () => {
    const matches = [...content.matchAll(/FIGURES\.(\w+)/g)].map((m) => m[1]);
    for (const key of matches) {
      expect(Object.prototype.hasOwnProperty.call(FIGURES, key), `FIGURES.${key} does not exist`).toBe(true);
    }
  });
});

describe('no literal figures typed into prose', () => {
  /**
   * Measurement-shaped numeric tokens only: dollar amounts, percentages,
   * multipliers, and K/M/B-suffixed magnitudes. Deliberately NOT every digit —
   * step indices (`data-steps="0 1 2 3"`), section ordinals ("## 3. ..."), and
   * doc citation numbers ("Doc 01") all fail this shape and pass through
   * untouched, because none of those are measurements a chart could disagree
   * with. Anything that does match this shape is exactly the kind of number
   * FIGURES exists to keep in sync with the charts beside it.
   */
  const MEASUREMENT = /\$\d[\d,]*(?:\.\d+)?|\d[\d,]*(?:\.\d+)?%|\d[\d,]*(?:\.\d+)?×|\b\d[\d,]*(?:\.\d+)?[KMB]\b/g;

  // Keep this SHORT. A growing list means figures are being typed into prose
  // again instead of interpolated — fix the offending sentence, don't add
  // another exemption.
  const EXEMPT: string[] = [
    '3B', // Ministral 3B — a model name, not a magnitude measurement.
  ];

  it('flags no unexempted measurement-shaped literal outside a JSX expression', () => {
    const found = [...prose.matchAll(MEASUREMENT)].map((m) => m[0]);
    const offenders = found.filter((tok) => !EXEMPT.includes(tok));
    expect(offenders, `literal figures found in prose: ${offenders.join(', ')}`).toEqual([]);
  });
});

describe('draft guards', () => {
  it('keeps published: false', () => {
    expect(content).toMatch(/published:\s*false/);
  });

  it('refuses to be publishable while an outline marker remains', () => {
    const hasOutlineMarker = content.includes('Outline — replace with prose.');
    const isPublished = /published:\s*true/.test(content);
    expect(hasOutlineMarker && isPublished).toBe(false);
  });
});
