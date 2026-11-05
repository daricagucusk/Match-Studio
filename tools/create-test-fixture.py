import hashlib
import json
import sys
import zipfile

files = {'index.html': b'<!doctype html>', 'app.bundle.js': b'/* fixture */',
         'manifest.webmanifest': b'{"start_url":"./index.html"}'}
shell = ['./', './index.html', './app.bundle.js', './manifest.webmanifest']
def contents(item):
    return files['index.html' if item == './' else item[2:]]
integrity = {item: hashlib.sha256(contents(item)).hexdigest() for item in shell}
tail = '// fixture worker\n'
digest = hashlib.sha256()
for item in shell:
    digest.update(item.encode())
    digest.update(contents(item))
digest.update(tail.encode())
compact = lambda value: json.dumps(value, separators=(',', ':'))
files['sw.js'] = ('const CACHE=' + compact('matchstudio-universal-' + digest.hexdigest()[:16]) + ';\n'
                  + 'const SHELL=' + compact(shell) + ';\n'
                  + 'const INTEGRITY=' + compact(integrity) + ';\n' + tail).encode()
files['SHA256SUMS.txt'] = ''.join(hashlib.sha256(value).hexdigest() + '  ' + name + '\n'
                                  for name, value in sorted(files.items())).encode()
with zipfile.ZipFile(sys.argv[1], 'w') as archive:
    for name, value in files.items():
        archive.writestr(name, value)
