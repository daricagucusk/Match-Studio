#!/usr/bin/env node
'use strict';
// Release gate: scan source and locally generated static output without logging credentials.
const fs = require('node:fs');
const path = require('node:path');
const cp = require('node:child_process');

const PATTERNS = [
  ['openrouter-token', /sk-or-v1-[A-Za-z0-9_-]{20,}/],
  ['openai-token', /sk-(?:proj-|svcacct-)[A-Za-z0-9_-]{20,}/],
  ['github-token', /(?:ghp_|gho_|ghu_|ghs_|ghr_)[A-Za-z0-9]{30,}/],
  ['github-fine-grained-token', /github_pat_[A-Za-z0-9_]{30,}/],
  ['nvidia-token', /nvapi-[A-Za-z0-9_-]{20,}/],
  ['huggingface-token', /hf_[A-Za-z0-9]{30,}/],
  ['private-key', /-----BEGIN (?:[A-Z ]+ )?PRIVATE KEY-----/]
];

function forbiddenTrackedPath(file) {
  const n = String(file).replaceAll('\\', '/').toLowerCase();
  if (/(^|\/)\.env(\.|$)/.test(n) && !n.endsWith('/.env.example') && n !== '.env.example') return true;
  if (/(^|\/)\.codex(?:\/|$)/.test(n)) return true;
  if (/(^|\/)\.claude\/(?:settings[^/]*\.json|\.credentials\.json|config\.toml)$/.test(n)) return true;
  if (/(^|\/)(?:key\.properties|credentials\.json|service-account\.json)$/.test(n)) return true;
  return /\.(?:jks|keystore|p12|pfx|pkcs12|key)$/.test(n);
}

function scanText(content, relative) {
  const result = [];
  const lines = String(content).split(/\r?\n/);
  for (let i = 0; i < lines.length; i++) {
    for (const [kind, pattern] of PATTERNS) {
      if (pattern.test(lines[i])) result.push({file:relative, line:i+1, kind});
    }
  }
  return result;
}

function scanRepository(root = path.resolve(__dirname, '..')) {
  const output = cp.execFileSync('git', ['ls-files', '--cached', '--others', '--exclude-standard', '-z'], {
    cwd:root, encoding:'buffer', timeout:30000, maxBuffer:64*1024*1024
  });
  const files = output.toString('utf8').split('\0').filter(Boolean);
  const findings = [];
  for (const file of files) {
    const relative = file.replaceAll('\\', '/');
    if (forbiddenTrackedPath(relative)) {
      findings.push({file:relative, line:0, kind:'forbidden-tracked-file'});
      continue;
    }
    const target = path.resolve(root, file);
    const stat = fs.lstatSync(target);
    if (stat.isSymbolicLink()) {
      findings.push({file:relative, line:0, kind:'symlink-source'});
      continue;
    }
    if (!stat.isFile()) continue;
    const bytes = fs.readFileSync(target);
    if (bytes.subarray(0, 4096).includes(0)) continue; // Non-text assets.
    findings.push(...scanText(bytes.toString('utf8'), relative));
  }
  const built = path.join(root, 'public');
  if (fs.existsSync(built)) {
    const pending = [built];
    while (pending.length) {
      for (const ent of fs.readdirSync(pending.pop(), {withFileTypes:true})) {
        const full = path.join(ent.parentPath, ent.name);
        const relative = path.relative(root, full).replaceAll('\\', '/');
        if (ent.isSymbolicLink()) {
          findings.push({file:relative, line:0, kind:'symlink-public'});
        } else if (ent.isDirectory()) {
          pending.push(full);
        } else if (ent.isFile()) {
          const bytes = fs.readFileSync(full);
          if (!bytes.subarray(0,4096).includes(0)) findings.push(...scanText(bytes.toString('utf8'), relative));
        }
      }
    }
  }
  return findings;
}

if (require.main === module) {
  try {
    const findings = scanRepository();
    for (const finding of findings) console.error('[BLOCKED] ' + finding.file + ':' + finding.line + ' ' + finding.kind);
    if (findings.length) {
      console.error('Release security check: ' + findings.length + ' finding(s); no credential values printed.');
      process.exitCode = 1;
    } else {
      console.log('Release security check: PASS (source and static output; no credential values printed).');
    }
  } catch (error) {
    console.error('Release security check: FAILED CLOSED (' + error.code + ')');
    process.exitCode = 1;
  }
}
module.exports = {scanText, forbiddenTrackedPath, scanRepository};
