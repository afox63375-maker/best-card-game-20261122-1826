// Ember Court — the entrypoint: hands the game in.
// Node 22 standard library only. Copies game/ and screenshots/ from this
// repository into MAKEFUN_OUTPUT_DIR (or /output) and writes the dossier
// with buildDossier from the kit's library. Deterministic: two runs write
// the same bytes, because nothing here reads the clock or the environment
// beyond the output directory itself.

import { copyFileSync, mkdirSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-game.ts';

const REPO_ROOT = dirname(fileURLToPath(import.meta.url));
const OUT_DIR = process.env.MAKEFUN_OUTPUT_DIR || '/output';

function copyTree(fromDir, toDir) {
  mkdirSync(toDir, { recursive: true });
  const names = readdirSync(fromDir).sort();
  for (const name of names) {
    const from = join(fromDir, name);
    const to = join(toDir, name);
    const st = statSync(from);
    if (st.isDirectory()) {
      copyTree(from, to);
    } else if (st.isFile()) {
      copyFileSync(from, to);
    }
  }
}

copyTree(join(REPO_ROOT, 'game'), join(OUT_DIR, 'game'));
copyTree(join(REPO_ROOT, 'screenshots'), join(OUT_DIR, 'screenshots'));

const dossier = buildDossier(OUT_DIR, {
  text_max_bytes: 163840,
  screenshots: { max: 4, max_bytes: 262144 },
  game_max_files: 993,
  game_max_bytes: 50331648,
});
writeFileSync(join(OUT_DIR, 'dossier.json'), dossier);
console.log(`Ember Court handed in: ${OUT_DIR} (dossier.json ${dossier.length} bytes)`);
