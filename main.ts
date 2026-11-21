// Hand in the Vice Trophy Atlas static app and its Chrome screenshots to make.fun.
import { cpSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-frontend.ts';

const GUIDE_ID = "vice-trophy-atlas";
const repository = fileURLToPath(new URL('.', import.meta.url));
const output = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

mkdirSync(output, { recursive: true });
for (const directory of ['app', 'screenshots']) {
  cpSync(join(repository, directory), join(output, directory), { recursive: true });
}

const dossier = buildDossier(output, {
  text_max_bytes: 163840,
  screenshots: { max: 4, max_bytes: 262144 },
  app_max_files: 993,
  app_max_bytes: 50331648,
});
writeFileSync(join(output, 'dossier.json'), dossier);
console.log(`${GUIDE_ID} packaged in ${output}`);
