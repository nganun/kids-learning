import { cp, mkdir, rm } from 'node:fs/promises';
import { resolve } from 'node:path';

const root = process.cwd();
const webDir = resolve(root, 'www');
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
