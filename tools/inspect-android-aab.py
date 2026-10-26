#!/usr/bin/env python3
"""Inspect the built bundle, not only Gradle inputs. Never reads signing keys."""
import argparse
import hashlib
import json
import pathlib
import re
import subprocess
import xml.etree.ElementTree as ET
import zipfile

ANDROID = '{http://schemas.android.com/apk/res/android}'

def manifest_metadata(xml, config):
    root = ET.fromstring(xml)
    sdk = root.find('uses-sdk')
    if sdk is None:
        raise ValueError('Missing uses-sdk')
    data = dict(packageId=root.get('package'), versionCode=int(root.get(ANDROID+'versionCode', '0')),
                versionName=root.get(ANDROID+'versionName'), targetSdk=int(sdk.get(ANDROID+'targetSdkVersion', '0')),
                minSdk=int(sdk.get(ANDROID+'minSdkVersion', '0')),
                compileSdk=int(root.get(ANDROID+'compileSdkVersion', '0')),
                permissions=[e.get(ANDROID+'name') for e in root.findall('uses-permission')])
    if data['packageId'] != config['packageId'] or data['versionCode'] != config['appVersionCode'] or data['versionName'] != config['appVersion']:
        raise ValueError('Built bundle package/version differs from approved metadata')
    if data['targetSdk'] < 36 or data['compileSdk'] < 36 or data['minSdk'] < 24:
        raise ValueError('Built bundle must compile/target API 36+ and minSdk 24+')
    if 'com.android.vending.BILLING' in data['permissions']:
        raise ValueError('Free first release must not contain unfinished Billing')
    return data

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--aab', required=True)
    parser.add_argument('--bundletool', required=True)
    parser.add_argument('--config', default='android/twa-manifest.json')
    parser.add_argument('--mode', choices=['unsigned', 'signed'], required=True)
    parser.add_argument('--report', required=True)
    parser.add_argument('--commit', default='')
    args = parser.parse_args()
    aab = pathlib.Path(args.aab).resolve()
    repo = pathlib.Path(__file__).resolve().parents[1]
    if args.mode == 'signed' and aab.is_relative_to(repo):
        raise ValueError('Keep signed release artifacts outside the repository')
    config = json.loads(pathlib.Path(args.config).read_text())
    base = ['java', '-jar', str(pathlib.Path(args.bundletool).resolve())]
    subprocess.run(base+['validate', '--bundle='+str(aab)], check=True, capture_output=True, text=True)
    xml = subprocess.run(base+['dump', 'manifest', '--bundle='+str(aab), '--module=base'], check=True, capture_output=True, text=True).stdout
    report = manifest_metadata(xml, config)
    with zipfile.ZipFile(aab) as archive:
        names = archive.namelist()
        signatures = [n for n in names if re.fullmatch(r'META-INF/[^/]+\.(RSA|DSA|EC)', n, re.I)]
        native = [n for n in names if n.endswith('.so')]
    if args.mode == 'unsigned' and signatures:
        raise ValueError('Unsigned QA must not contain signing blocks')
    if args.mode == 'signed':
        if not signatures:
            raise ValueError('Release AAB is unsigned')
        verified = subprocess.run(['jarsigner', '-J-Duser.language=en', '-verify', '-verbose', str(aab)], capture_output=True, text=True)
        output = verified.stdout+'\n'+verified.stderr
        if verified.returncode or 'jar verified.' not in output or 'unsigned entries' in output or 'treated as unsigned' in output:
            raise ValueError('AAB signature verification failed or unsigned entries found')
    report.update(reportVersion=1, artifactPath=str(aab), artifactSha256=hashlib.sha256(aab.read_bytes()).hexdigest(),
                  artifactKind='signed-upload' if args.mode == 'signed' else 'unsigned-qa',
                  signatureVerified=args.mode == 'signed', nativeLibraries=native,
                  nativeAlignmentVerified=False, buildCommit=args.commit,
                  playUploadApproved=False)
    pathlib.Path(args.report).write_text(json.dumps(report, indent=2, ensure_ascii=False)+'\n')
    print(json.dumps({k: v for k, v in report.items() if k != 'artifactPath'}, ensure_ascii=False))

if __name__ == '__main__':
    try:
        main()
    except (ValueError, OSError, subprocess.CalledProcessError, ET.ParseError, zipfile.BadZipFile) as error:
        raise SystemExit('AAB inspection failed: '+str(error))
