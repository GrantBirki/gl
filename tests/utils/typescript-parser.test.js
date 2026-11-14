import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { clearCaches, parseForESLint } from '@typescript-eslint/parser';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

describe('TypeScript parser with the patched glob matcher', () => {
  let root;

  beforeEach(() => {
    root = mkdtempSync(join(tmpdir(), 'parser-project-'));
    writeFileSync(join(root, 'included.ts'), 'export {};');
    writeFileSync(join(root, 'tsconfig.json'), JSON.stringify({ files: ['included.ts'] }));
  });

  afterEach(() => {
    clearCaches();
    rmSync(root, { recursive: true, force: true });
  });

  function parse(filename) {
    const code = 'const answer: number = 42;';
    writeFileSync(join(root, filename), code);
    return parseForESLint(code, {
      filePath: join(root, filename),
      tsconfigRootDir: root,
      projectService: { allowDefaultProject: ['*.ts'] },
    });
  }

  it('allows matching dotfiles outside the configured TypeScript project', () => {
    const result = parse('.outside.ts');
    expect(result.ast.body[0].type).toBe('VariableDeclaration');
    expect(result.services.program).toBeTruthy();
    expect(result.services.program.getSyntacticDiagnostics()).toEqual([]);
  });

  it('rejects files outside both the configured project and the allowlist', () => {
    expect(() => parse('outside.js')).toThrow(/was not found by the project service/);
  });
});
