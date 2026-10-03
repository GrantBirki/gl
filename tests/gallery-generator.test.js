import { afterEach, describe, expect, it } from 'vitest';
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

const script = fileURLToPath(new URL('../script/js/generate-gallery-images.js', import.meta.url));
const workspaces = [];
function workspace() {
  const root = mkdtempSync(join(tmpdir(), 'gl-gallery-'));
  workspaces.push(root);
  mkdirSync(join(root, 'public/assets/gallery'), { recursive: true });
  mkdirSync(join(root, 'src/config/pages/gallery'), { recursive: true });
  return root;
}
const output = 'src/config/pages/gallery/photos.json';
afterEach(() => workspaces.splice(0).forEach((root) => rmSync(root, { recursive: true, force: true })));

describe('gallery image generator', () => {
  it('reads dimensions through the file API and skips unrelated files', () => {
    const root = workspace();
    writeFileSync(
      join(root, 'public/assets/gallery/photo.png'),
      Buffer.from(
        'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jfwAAAABJRU5ErkJggg==',
        'base64'
      )
    );
    writeFileSync(join(root, 'public/assets/gallery/readme.txt'), 'not an image');
    const result = spawnSync(process.execPath, [script], { cwd: root, encoding: 'utf8' });
    expect(result.status, result.stderr).toBe(0);
    expect(JSON.parse(readFileSync(join(root, output), 'utf8'))).toEqual([
      { key: 0, alt: 'photo.png', src: '/assets/gallery/photo.png', width: 1, height: 1 },
    ]);
    expect(readFileSync(join(root, output), 'utf8').endsWith('\n')).toBe(true);
  });

  it('fails on malformed images without overwriting the existing gallery', () => {
    const root = workspace();
    writeFileSync(join(root, 'public/assets/gallery/broken.jpg'), 'invalid JPEG');
    writeFileSync(join(root, output), 'existing gallery\n');
    const result = spawnSync(process.execPath, [script], { cwd: root, encoding: 'utf8' });
    expect(result.status).not.toBe(0);
    expect(result.stderr).toContain('unsupported file type');
    expect(readFileSync(join(root, output), 'utf8')).toBe('existing gallery\n');
  });
});
