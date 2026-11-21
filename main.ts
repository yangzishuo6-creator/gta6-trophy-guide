// Vice Trophy Atlas — package the offline guide and its Chrome captures for make.fun.
import { cpSync, mkdirSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { buildDossier } from './vendor/makefun-frontend.ts';

const GUIDE_ID = "vice-trophy-atlas";
const repository = import.meta.dirname;
const destination = resolve(process.env.MAKEFUN_OUTPUT_DIR ?? '/output');

for (const directory of ['app', 'screenshots']) {
  if (resolve(repository, directory) === resolve(destination, directory)) {
    throw new Error(`${GUIDE_ID}: the output must be separate from the source folders`);
  }
}

mkdirSync(destination, { recursive: true });
for (const directory of ['app', 'screenshots']) {
  cpSync(resolve(repository, directory), resolve(destination, directory), { recursive: true });
}

const dossier = buildDossier(destination, {
  text_max_bytes: 160 * 1024,
  screenshots: { max: 4, max_bytes: 256 * 1024 },
  app_max_files: 993,
  app_max_bytes: 48 * 1024 * 1024,
});
writeFileSync(resolve(destination, 'dossier.json'), dossier);
