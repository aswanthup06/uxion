import fs from 'fs';
import path from 'path';

function scanDir(dir) {
  const files = fs.readdirSync(dir, { withFileTypes: true });
  for (const f of files) {
    const fullPath = path.join(dir, f.name);
    if (f.isDirectory() && !['node_modules', '.next', '.git'].includes(f.name)) {
      scanDir(fullPath);
    } else if (f.isFile() && /\.(tsx|jsx)$/.test(f.name)) {
      const content = fs.readFileSync(fullPath, 'utf8');
      const buttonMatches = content.match(/<button[^>]*>[\s\S]*?<\/button>/g) || [];
      for (const btn of buttonMatches) {
        if (!/aria-label|aria-labelledby/i.test(btn) && !/<span[^>]*class(?:Name)?=["'][^"']*sr-only/i.test(btn)) {
          const stripped = btn.replace(/<[^>]+>/g, '').replace(/\{[^}]+\}/g, '').trim();
          if (!stripped) {
            console.log(fullPath, '-> Empty button:', btn.slice(0, 120).replace(/\n/g, ' '));
          }
        }
      }
    }
  }
}

scanDir('src');
