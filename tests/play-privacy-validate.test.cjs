const {test}=require('node:test');
const assert=require('node:assert/strict');
const {validatePrivacyPage}=require('../tools/play-privacy-validate.cjs');
const good='<!doctype html><html lang="tr"><head><title>Match Studio Gizlilik Politikası</title></head><body><h1>Match Studio Gizlilik Politikası</h1><p>Veri saklama süresi ve veri silme hakkı.</p><a href="mailto:destek@example.org">İletişim</a></body></html>';
const index='<a href="./privacy.html">Gizlilik Politikası</a>';
test('privacy route gate accepts a complete structural fixture',()=>assert.deepEqual(validatePrivacyPage(good,index),[]));
test('unfinished privacy policy placeholders cannot be silently published',()=>{
 const errors=validatePrivacyPage(good.replace('destek@example.org','[KAMUYA AÇIK DESTEK E-POSTASI]'),index);
 assert.ok(errors.some(e=>/şablon/.test(e)));
 assert.ok(errors.some(e=>/e-posta/.test(e)));
});
test('store public privacy document requires in-app link and deletion description',()=>{
 assert.ok(validatePrivacyPage(good,'').some(e=>/doğrudan bağlantı/.test(e)));
 assert.ok(validatePrivacyPage(good.replace('veri silme','veri yönetimi'),index).some(e=>/silme/.test(e)));
});
