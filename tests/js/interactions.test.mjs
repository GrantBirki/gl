import assert from 'node:assert/strict';
import test from 'node:test';
import { readdirSync, readFileSync } from 'node:fs';
import { distribute } from '../../public/assets/gallery.mjs';
import { pointFor, rotate, rotationMatrix, arcBetween } from '../../public/assets/globe-math.mjs';

test('browser modules only import first-party files, without CDN or package imports', () => {
  const root = new URL('../../public/assets/', import.meta.url);
  for (const name of readdirSync(root).filter((name) => /\.(m?js)$/.test(name))) {
    const source = readFileSync(new URL(name, root), 'utf8');
    for (const match of source.matchAll(/(?:from\s+|import\()\s*['"]([^'"]+)['"]/g)) {
      assert.match(match[1], /^\.\.?\//, `Non-local import in ${name}`);
    }
  }
});

test('gallery assigns each photo to the shortest column while preserving source order', () => {
  assert.deepEqual(distribute([1.5, 1.5, 1.5, 1.2, 0.67, 1.2], 3, 300), [0, 1, 2, 0, 1, 2]);
  assert.deepEqual(distribute([2, 1, 1, 0.5], 2, 200), [0, 1, 1, 0]);
  assert.deepEqual(distribute([2, 1, 1], 1, 350), [0, 0, 0]);
});

test('globe points and rotations preserve unit-sphere geometry', () => {
  for (const [lat, lon] of [[0, 0], [90, 0], [-45, 120], [40, -100]]) {
    const p = pointFor(lat, lon);
    assert.ok(Math.abs(Math.hypot(...p) - 1) < 1e-10);
    assert.ok(Math.abs(Math.hypot(...rotate(p, rotationMatrix(0.8, -0.6))) - 1) < 1e-10);
  }
});

test('choosing a destination centers its geographic coordinates', () => {
  for (const [lat, lon] of [[47.606209, -122.332069], [-33.924869, 18.424055], [35, 140]]) {
    const [x, y, z] = rotate(pointFor(lat, lon), rotationMatrix(-lon * Math.PI / 180, lat * Math.PI / 180));
    assert.ok(Math.abs(x) < 1e-10 && Math.abs(y) < 1e-10 && Math.abs(z - 1) < 1e-10);
  }
});

test('travel arcs connect endpoints and rise above the sphere', () => {
  const a = pointFor(0, 0), b = pointFor(30, 80), arc = arcBetween(a, b);
  assert.deepEqual(arc[0], a);
  arc.at(-1).forEach((v, i) => assert.ok(Math.abs(v - b[i]) < 1e-10));
  assert.ok(Math.hypot(...arc[32]) > 1.2);
});

test('coincident and opposite destinations do not produce invalid geometry', () => {
  for (const b of [[0, 0, 1], [0, 0, -1]]) {
    assert.ok(arcBetween([0, 0, 1], b).flat().every(Number.isFinite));
  }
});
