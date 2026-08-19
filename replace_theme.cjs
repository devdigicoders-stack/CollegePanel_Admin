const fs = require('fs');
const path = require('path');

const directory = path.join(__dirname, 'src');

const replacements = [
  // 1. Replace tailwind arbitrary values [ #HEX ]
  { regex: /\[#0A6C54\]/ig, replacement: 'primary' },
  { regex: /\[#085a46\]/ig, replacement: 'primary-hover' },
  { regex: /\[#022a36\]/ig, replacement: 'sidebar' },
  { regex: /\[#2DD4BF\]/ig, replacement: 'accent' },
  { regex: /\[rgba\(10,108,84,.*?\)\]/ig, replacement: 'primary/20' }, // Approximation for shadows

  // 2. Replace inline styles or SVG props
  { regex: /"#0A6C54"/ig, replacement: '"var(--color-primary)"' },
  { regex: /"#085a46"/ig, replacement: '"var(--color-primary-hover)"' },
  { regex: /"#022a36"/ig, replacement: '"var(--color-sidebar)"' },
  { regex: /"#2DD4BF"/ig, replacement: '"var(--color-accent)"' },
  { regex: /'#0A6C54'/ig, replacement: "'var(--color-primary)'" },
  { regex: /'#085a46'/ig, replacement: "'var(--color-primary-hover)'" },
  { regex: /'#022a36'/ig, replacement: "'var(--color-sidebar)'" },
  { regex: /'#2DD4BF'/ig, replacement: "'var(--color-accent)'" },
];

function processDirectory(dir) {
  const files = fs.readdirSync(dir);

  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      processDirectory(fullPath);
    } else if (fullPath.endsWith('.jsx') || fullPath.endsWith('.js')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      let originalContent = content;

      for (const { regex, replacement } of replacements) {
        content = content.replace(regex, replacement);
      }

      if (content !== originalContent) {
        fs.writeFileSync(fullPath, content, 'utf8');
        console.log(`Updated: ${fullPath}`);
      }
    }
  }
}

processDirectory(directory);
console.log('Theme replacement complete!');
