import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { build } from 'esbuild';
await mkdir('dist', { recursive: true });
const html = await readFile('mercado (4).html', 'utf8');
await writeFile('dist/index.html', html.replace('<!-- NATIVE_BRIDGE -->', '<script src="native.js"></script>'));
await build({ entryPoints: ['scripts/native.js'], bundle: true, outfile: 'dist/native.js', format: 'iife', target: 'chrome100' });
console.log('Web pronta em dist/; HTML de origem preservado como fonte única.');
