import { readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const root = process.cwd();
const source = resolve(root, 'data/default-learning-content.json');
const target = resolve(root, 'features/default-content.js');
const content = JSON.parse(await readFile(source, 'utf8'));

await writeFile(
  target,
  `// Generated from data/default-learning-content.json. Do not edit directly.\nexport const DEFAULT_LEARNING_CONTENT = ${JSON.stringify(content, null, 2)};\n`,
);
console.log(`Synced default learning content to ${target}`);
