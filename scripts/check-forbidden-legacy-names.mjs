import { readdirSync, readFileSync, statSync } from 'node:fs';
import { dirname, extname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const repoRoot = dirname(dirname(fileURLToPath(import.meta.url)));
const ignoredDirectories = new Set(['.git', '.next', 'dist', 'generated', 'node_modules']);
const ignoredExtensions = new Set([
  '.avif',
  '.bin',
  '.bmp',
  '.gif',
  '.ico',
  '.jpeg',
  '.jpg',
  '.pdf',
  '.png',
  '.webp',
]);
const forbiddenTerms = [['ZE', 'TA'].join(''), ['Ze', 'fix'].join('')];

function collectFiles(directory) {
  const files = [];

  for (const entry of readdirSync(directory)) {
    if (ignoredDirectories.has(entry)) {
      continue;
    }

    const path = join(directory, entry);
    const stat = statSync(path);

    if (stat.isDirectory()) {
      files.push(...collectFiles(path));
      continue;
    }

    if (!ignoredExtensions.has(extname(path).toLowerCase())) {
      files.push(path);
    }
  }

  return files;
}

const matches = collectFiles(repoRoot).flatMap((file) => {
  const content = readFileSync(file, 'utf8');

  return forbiddenTerms
    .filter((term) => content.includes(term))
    .map((term) => ({
      file,
      term,
    }));
});

if (matches.length > 0) {
  for (const match of matches) {
    console.error(`${match.file}: forbidden legacy term "${match.term}"`);
  }

  process.exitCode = 1;
} else {
  console.log('No forbidden legacy names found.');
}
