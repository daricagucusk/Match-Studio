// Password-protected portable backup. AES-GCM authentication + PBKDF2-SHA256.
// Passwords never enter IndexedDB, localStorage, logs, or the backup payload.
const FORMAT='MatchStudioEncryptedBackup';
const ITERATIONS=260000;
const enc=new TextEncoder(),dec=new TextDecoder();
const b64=a=>{const bytes=new Uint8Array(a);let s='';for(let i=0;i<bytes.length;i+=8192)s+=String.fromCharCode(...bytes.subarray(i,i+8192));return btoa(s);};
const fromB64=s=>Uint8Array.from(atob(s),c=>c.charCodeAt(0));
async function keyFor(password,salt,usage){
 if(typeof password!=='string'||password.length<12)throw Error('Yedek parolası en az 12 karakter olmalıdır.');
 if(!crypto?.subtle)throw Error('Güvenli yedekleme bu bağlantıda kullanılamıyor. HTTPS veya localhost kullanın.');
 const material=await crypto.subtle.importKey('raw',enc.encode(password),'PBKDF2',false,['deriveKey']);
 return crypto.subtle.deriveKey({name:'PBKDF2',salt,iterations:ITERATIONS,hash:'SHA-256'},material,{name:'AES-GCM',length:256},false,[usage]);
}
async function encryptBackupBlob(blob,password){
 if(!blob||blob.size>100*1024*1024)throw Error('Yedek boyutu güvenli sınırı aşıyor.');
 const salt=crypto.getRandomValues(new Uint8Array(16)),iv=crypto.getRandomValues(new Uint8Array(12));
 const key=await keyFor(password,salt,'encrypt');
 const encrypted=await crypto.subtle.encrypt({name:'AES-GCM',iv,additionalData:enc.encode(FORMAT)},key,await blob.arrayBuffer());
 const wrapper={application:FORMAT,version:1,kdf:'PBKDF2-SHA256',iterations:ITERATIONS,cipher:'AES-256-GCM',salt:b64(salt),iv:b64(iv),data:b64(encrypted)};
 return new Blob([JSON.stringify(wrapper)],{type:'application/json'});
}
async function decodeBackupBlob(file,password){
 if(file.size>105*1024*1024)throw Error('Yedek dosyası çok büyük.');
 let payload;try{payload=JSON.parse(await file.text())}catch{throw Error('Yedek JSON biçiminde değil.');}
 if(payload?.application!==FORMAT)return {payload,encrypted:false};
 if(!password)return {encrypted:true,needsPassword:true};
 if(payload.version!==1||payload.kdf!=='PBKDF2-SHA256'||payload.cipher!=='AES-256-GCM'||payload.iterations!==ITERATIONS||typeof payload.data!=='string'||typeof payload.salt!=='string'||typeof payload.iv!=='string')throw Error('Şifreli yedek biçimi desteklenmiyor.');
 let salt,iv,data;try{salt=fromB64(payload.salt);iv=fromB64(payload.iv);data=fromB64(payload.data)}catch{throw Error('Yedek verisi bozulmuş.');}
 if(salt.length!==16||iv.length!==12||data.length>100*1024*1024)throw Error('Şifreli yedek verisi geçersiz.');
 try{
  const key=await keyFor(password,salt,'decrypt');
  const plain=await crypto.subtle.decrypt({name:'AES-GCM',iv,additionalData:enc.encode(FORMAT)},key,data);
  return {payload:JSON.parse(dec.decode(plain)),encrypted:true};
 }catch{throw Error('Parola yanlış veya şifreli yedek değiştirilmiş. Hiçbir mevcut kayıt değiştirilmedi.');}
}
Object.assign(exports,{FORMAT,ITERATIONS,encryptBackupBlob,decodeBackupBlob});
