import importlib.util
import pathlib
import unittest

spec = importlib.util.spec_from_file_location('inspect_aab', pathlib.Path(__file__).with_name('inspect-android-aab.py'))
module = importlib.util.module_from_spec(spec)
spec.loader.exec_module(module)

class BuiltManifestTests(unittest.TestCase):
    config = dict(packageId='com.example.synthetic', appVersionCode=1, appVersion='1.0')
    def xml(self, package='com.example.synthetic', target=36, compile=36, extra=''):
        return f'<manifest xmlns:android="http://schemas.android.com/apk/res/android" package="{package}" android:versionCode="1" android:versionName="1.0" android:compileSdkVersion="{compile}"><uses-sdk android:minSdkVersion="24" android:targetSdkVersion="{target}"/>{extra}</manifest>'
    def test_accepts_actual_expected_manifest(self):
        self.assertEqual(module.manifest_metadata(self.xml(), self.config)['targetSdk'], 36)
    def test_rejects_wrong_package_old_target_compile_and_billing(self):
        for xml in [self.xml(package='com.example.other'), self.xml(target=35), self.xml(compile=35), self.xml(extra='<uses-permission android:name="com.android.vending.BILLING"/>')]:
            with self.subTest(xml=xml), self.assertRaises(ValueError):
                module.manifest_metadata(xml, self.config)

if __name__ == '__main__':
    unittest.main()
