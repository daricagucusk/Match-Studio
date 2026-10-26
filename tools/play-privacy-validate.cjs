'use strict';
// Source-level release guard. Manual legal and Data Safety review is still required.
function validatePrivacyPage(page,indexHtml){
 const errors=[];
 if(typeof page!=='string'||!/<html(?:\s|>)/i.test(page)||!/<title>[^<]*Gizlilik Politikası[^<]*<\/title>/i.test(page))
  errors.push('HTML gizlilik politikası başlığı eksik.');
 if(!/Match Studio/i.test(page))errors.push('Uygulama adı politikada yer almıyor.');
 if(!/mailto:[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/i.test(page))
  errors.push('Kamuya açık destek e-posta bağlantısı (mailto) eksik.');
 if(/\[(?:ONAYLANACAK|KAMUYA|DOLDURULACAK|VERİ_SORUMLUSU|DESTEK_EPOSTA)|TODO|PLACEHOLDER/i.test(page))
  errors.push('Henüz onaylanmamış/şablon içeriği yayımlanamaz.');
 if(!/\b(?:saklama|süre|retention)\b/i.test(page)||!/\b(?:silme|silin|deletion)\b/i.test(page))
  errors.push('Saklama ve silme açıklamaları eksik.');
 if(!/href=["'](?:\.\/|\/)?privacy\.html(?:\?[^"']*)?["']/i.test(indexHtml||''))
  errors.push('Uygulama giriş ekranında gizlilik sayfasına doğrudan bağlantı eksik.');
 return errors;
}
Object.assign(exports,{validatePrivacyPage});
