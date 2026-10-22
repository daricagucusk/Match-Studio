const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const {IDBFactory,IDBKeyRange}=require('fake-indexeddb');
function createLoader(extra={}){
 const sandbox={console,Blob,File,TextEncoder,TextDecoder,crypto:globalThis.crypto,structuredClone,Uint8Array,ArrayBuffer,atob,btoa,setTimeout,clearTimeout,indexedDB:new IDBFactory(),IDBKeyRange,...extra};
 sandbox.FileReader=class{readAsDataURL(blob){blob.arrayBuffer().then(b=>{this.result=`data:${blob.type};base64,${Buffer.from(b).toString('base64')}`;this.onload?.();},error=>{this.error=error;this.onerror?.();});}};
 const context=vm.createContext(sandbox),cache={};
 function load(id){if(cache[id])return cache[id];const exports={};cache[id]=exports;const fn=vm.runInContext(`(function(exports,require){${fs.readFileSync(path.join(__dirname,'..',id),'utf8')}\n})`,context,{filename:id});fn(exports,load);return exports;}
 return {load,context};
}
module.exports={createLoader};
