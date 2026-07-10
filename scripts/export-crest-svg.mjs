import fs from 'node:fs';

const source = fs.readFileSync('src/components/VoxEcclesiaeLogo.tsx', 'utf8');
const match = source.match(/<svg[\s\S]*<\/svg>/);
if (!match) throw new Error('SVG not found in VoxEcclesiaeLogo.tsx');

let svg = match[0]
  .replace(/\{\/\*[\s\S]*?\*\/\}/g, '')
  .replace(/\{size\}/g, '100%')
  .replace(/className=\{`select-none \$\{className\}`\}/, 'class="select-none"');

const attrs = [
  ['strokeWidth', 'stroke-width'],
  ['strokeLinejoin', 'stroke-linejoin'],
  ['strokeLinecap', 'stroke-linecap'],
  ['textAnchor', 'text-anchor'],
  ['fontSize', 'font-size'],
  ['fontFamily', 'font-family'],
  ['fontWeight', 'font-weight'],
  ['letterSpacing', 'letter-spacing'],
  ['startOffset', 'start-offset'],
  ['clipPath', 'clip-path'],
];

for (const [from, to] of attrs) {
  svg = svg.replaceAll(from, to);
}

fs.mkdirSync('public', { recursive: true });
fs.writeFileSync('public/crest.svg', svg);
console.log(`Wrote public/crest.svg (${svg.length} bytes)`);
