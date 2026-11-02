#!/usr/bin/env python3
"""Validate a Match Studio PWA archive without extracting or running its contents."""
import hashlib
import json
import posixpath
import re
import stat
import sys
import zipfile


def require(condition, message):
    if not condition:
        raise ValueError(message)


def verify(filename):
    with zipfile.ZipFile(filename) as archive:
        entries = archive.infolist()
        names = [entry.filename for entry in entries]
        require(len(entries) <= 100, 'Too many archive entries')
        require(len(names) == len(set(names)), 'Duplicate archive paths')
        require(sum(entry.file_size for entry in entries) <= 64 * 1024 * 1024, 'Archive exceeds 64 MiB')
        for entry in entries:
            name = entry.filename
            require(not name.startswith('/') and '\\' not in name and ':' not in name
                    and posixpath.normpath(name.rstrip('/')) == name.rstrip('/')
                    and '..' not in name.split('/'), 'Unsafe archive path: ' + name)
            require(not stat.S_ISLNK(entry.external_attr >> 16), 'Symbolic link: ' + name)
            require(not name.startswith(('src/', 'tests/', 'baseline/', 'evidence/', 'web/', 'node_modules/', '.git/')),
                    'Development file in PWA: ' + name)
        files = {entry.filename: archive.read(entry) for entry in entries if not entry.is_dir()}

    required = {'index.html', 'app.bundle.js', 'sw.js', 'manifest.webmanifest', 'SHA256SUMS.txt'}
    require(required <= files.keys(), 'Required PWA files are missing')
    sums = {}
    for line in files['SHA256SUMS.txt'].decode('utf-8').splitlines():
        match = re.fullmatch(r'([a-f0-9]{64})  (.+)', line)
        require(match is not None, 'Invalid checksum line')
        digest, name = match.groups()
        require(name not in sums, 'Duplicate checksum: ' + name)
        sums[name] = digest
    require(set(sums) == set(files) - {'SHA256SUMS.txt'}, 'Checksum file list does not match archive')
    for name, digest in sums.items():
        require(hashlib.sha256(files[name]).hexdigest() == digest, 'Checksum mismatch: ' + name)

    worker = files['sw.js'].decode('utf-8')
    def declaration(name):
        match = re.search(r'^const ' + name + r'=(.*);\n', worker, re.MULTILINE)
        require(match is not None, 'Missing worker declaration: ' + name)
        return json.loads(match[1]), match.end()

    shell, _ = declaration('SHELL')
    integrity, worker_start = declaration('INTEGRITY')
    cache, _ = declaration('CACHE')
    require(isinstance(shell, list) and shell and len(shell) == len(set(shell)), 'Invalid shell list')
    require(set(shell) == set(integrity), 'Worker integrity list does not match shell')
    require({'./', './index.html', './app.bundle.js', './manifest.webmanifest'} <= set(shell), 'Incomplete shell')
    digest = hashlib.sha256()
    for item in shell:
        require(isinstance(item, str) and item.startswith('./'), 'Invalid shell path')
        name = 'index.html' if item == './' else item[2:]
        require(name in files, 'Missing shell file: ' + name)
        require(hashlib.sha256(files[name]).hexdigest() == integrity[item], 'Worker checksum mismatch: ' + name)
        digest.update(item.encode('utf-8'))
        digest.update(files[name])
    digest.update(worker[worker_start:].encode('utf-8'))
    require(isinstance(cache, str) and cache.startswith('matchstudio-universal-')
            and cache.rsplit('-', 1)[-1] == digest.hexdigest()[:16], 'Worker release identity mismatch')
    manifest = json.loads(files['manifest.webmanifest'])
    require(manifest.get('start_url') == './index.html', 'Unexpected PWA start URL')
    print(f'PASS: {filename} ({len(files)} files; {cache})')


if __name__ == '__main__':
    try:
        require(len(sys.argv) == 2, 'Usage: python3 tools/verify-release.py <PWA.zip>')
        verify(sys.argv[1])
    except (ValueError, OSError, KeyError, TypeError, zipfile.BadZipFile) as error:
        print('FAIL: ' + str(error), file=sys.stderr)
        sys.exit(1)
