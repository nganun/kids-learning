import { cp, mkdir, rm, readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const root = process.cwd();
const webDir = resolve(root, 'dist');
const defaultContent = JSON.parse(await readFile(resolve(root, 'data/default-learning-content.json'), 'utf8'));
await writeFile(resolve(root, 'features/default-content.js'), `// Generated from data/default-learning-content.json. Do not edit directly.\nexport const DEFAULT_LEARNING_CONTENT = ${JSON.stringify(defaultContent, null, 2)};\n`);
const entries = [
  'index.html',
  'app.js',
  'style.css',
  'service-worker.js',
  'manifest.webmanifest',
  '.nojekyll',
  'assets',
  'features',
  'styles',
];

await rm(webDir, { recursive: true, force: true });
await mkdir(webDir, { recursive: true });
await Promise.all(entries.map((entry) => cp(resolve(root, entry), resolve(webDir, entry), { recursive: true })));
console.log(`Built web bundle in ${webDir}`);
