'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const cp = require('node:child_process');
const { scanText, forbiddenTrackedPath, scanRepository } = require('../tools/release-security-check.cjs');

test('identifies a synthetic OpenRouter credential without returning its value', () => {
  const token = ['sk-or-v1-', 'a'.repeat(48)].join('');
  const findings = scanText('const api = "' + token + '";', 'src/example.js');
  assert.equal(findings.length, 1);
  assert.equal(findings[0].kind, 'openrouter-token');
  assert.equal(findings[0].line, 1);
  assert.equal(JSON.stringify(findings).includes(token), false);
});

test('detects a private key block and a synthetic GitHub credential', () => {
  const gitToken = ['ghp_', 'z'.repeat(36)].join('');
  const findings = scanText(['const token="' + gitToken + '";', '-----BEGIN' + ' PRIVATE KEY-----'].join('\n'), 'docs/test.txt');
  assert.deepEqual(findings.map(x => x.kind), ['github-token', 'private-key']);
});

test('does not reject harmless references to environment variable names', () => {
  assert.deepEqual(scanText('Use OPENROUTER_API_KEY from GitHub Secrets, never hardcode it.', 'README.md'), []);
});

test('refuses tracked credentials, signing keys and private agent settings', () => {
  for (const value of ['android/upload-key.jks', 'credentials/private.p12', '.env.local', '.claude/settings.local.json', '.codex/config.toml']) {
    assert.equal(forbiddenTrackedPath(value), true, value);
  }
  assert.equal(forbiddenTrackedPath('web/manifest.webmanifest'), false);
});

test('scans tracked files in a disposable repository, not ignored secrets', () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'matchstudio-release-audit-'));
  try {
    cp.execFileSync('git', ['init', '-q'], {cwd:root});
    fs.writeFileSync(path.join(root, 'clean.js'), 'const ok = true;');
    fs.writeFileSync(path.join(root, '.env'), 'DO_NOT_PRINT=this-is-not-a-real-secret');
    cp.execFileSync('git', ['add', '-f', 'clean.js', '.env'], {cwd:root});
    let findings = scanRepository(root);
    assert.deepEqual(findings.map(x => x.kind), ['forbidden-tracked-file']);
    fs.writeFileSync(path.join(root, 'clean.js'), ['const key="sk-or-v1-', 'b'.repeat(48), '";'].join(''));
    findings = scanRepository(root);
    assert.ok(findings.some(x => x.kind === 'openrouter-token'));
    assert.ok(findings.some(x => x.kind === 'forbidden-tracked-file'));
    assert.ok(findings.every(x => !JSON.stringify(x).includes('b'.repeat(48))));
  } finally {
    fs.rmSync(root, {recursive:true,force:true});
  }
});

test('release workflow runs a secret gate and high-severity audit before uploading artifacts', () => {
  const workflow = fs.readFileSync(path.resolve(__dirname, '../.github/workflows/verify.yml'), 'utf8');
  assert.match(workflow, /node tools\/release-security-check\.cjs/);
  assert.match(workflow, /npm audit --audit-level=high/);
  const upload = workflow.indexOf('actions/upload-artifact@');
  assert.ok(upload > workflow.indexOf('node tools/release-security-check.cjs'));
  assert.match(workflow, /persist-credentials: false/);
  assert.doesNotMatch(workflow, /permissions:\s*(?:\r?\n\s+[^\n]+)*\s+contents:\s*write/);
  for (const match of workflow.matchAll(/uses:\s*([^\s]+)/g)) {
    assert.match(match[1], /^actions\/[\w-]+@[0-9a-f]{40}$/, 'Every third-party Action must be pinned to a commit SHA');
  }
});

test('local release packaging runs credential scan before creating archives', () => {
  const pkg = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../package.json'), 'utf8'));
  assert.match(pkg.scripts.package, /^node tools\/release-security-check\.cjs && node tools\/package\.cjs$/);
});
