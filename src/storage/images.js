
const {putRecord,getRecord}=require("src/storage/db.js");
const {uid}=require("src/domain/validation.js");

async function preparePhoto(file,max=512){if(!file?.type?.startsWith('image/'))throw Error('Lütfen bir görsel dosyası seç.');if(file.size>12*1024*1024)throw Error('Görsel dosyası çok büyük (12 MB sınırı).');const img=await createImageBitmap(file);const scale=Math.min(1,max/Math.max(img.width,img.height));const c=document.createElement('canvas');c.width=Math.round(img.width*scale);c.height=Math.round(img.height*scale);c.getContext('2d').drawImage(img,0,0,c.width,c.height);img.close?.();return new Promise((resolve,reject)=>c.toBlob(b=>b?resolve(b):reject(Error('Görsel işlenemedi.')),'image/jpeg',.8));}
async function saveAsset(blob){const id=uid();await putRecord('assets',{id,blob,mime:blob.type});return id;}
async function loadAsset(id){return id?(await getRecord('assets',id))?.blob||null:null;}
async function assetDataURL(id){const blob=await loadAsset(id);if(!blob)return null;return new Promise((res,rej)=>{const r=new FileReader();r.onload=()=>res(r.result);r.onerror=()=>rej(r.error);r.readAsDataURL(blob)});}

async function prepareLogo(file){if(!['image/png','image/webp'].includes(file?.type))throw Error('Kulüp logosu şeffaf PNG veya WEBP olmalı.');if(file.size>12*1024*1024)throw Error('Logo 12 MB sınırını aşıyor.');const img=await createImageBitmap(file);const scale=Math.min(1,1000/Math.max(img.width,img.height));const c=document.createElement('canvas');c.width=Math.round(img.width*scale);c.height=Math.round(img.height*scale);c.getContext('2d').drawImage(img,0,0,c.width,c.height);img.close?.();return new Promise((resolve,reject)=>c.toBlob(b=>b?resolve(b):reject(Error('Logo işlenemedi.')),'image/png'));}

Object.assign(exports,{preparePhoto,saveAsset,loadAsset,assetDataURL,prepareLogo});
