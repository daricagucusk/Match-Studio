'use strict';
const {test}=require('node:test');const assert=require('node:assert/strict');
const {createLoader}=require('./loader.cjs');
const ux=()=>createLoader().load('src/app/premium-ux.js');
function fakeNav(){const calls={request:0,release:0};const nav={wakeLock:{async request(){calls.request++;const l={released:false,listeners:[],addEventListener(t,f){this.listeners.push(f)},async release(){calls.release++;this.released=true;this.listeners.forEach(f=>f())}};nav.last=l;return l;}},vibrate:p=>{nav.pattern=p;return true;}};return {nav,calls};}
const fakeDoc=()=>({visibilityState:'visible',handlers:[],addEventListener(t,f){this.handlers.push(f)}});
test('wake lock is taken once while running and released when the match stops',async()=>{
 const {createWakeLock}=ux(),{nav,calls}=fakeNav(),doc=fakeDoc(),w=createWakeLock({navigator:nav,document:doc});
 await w.set(true);await w.set(true);await w.set(true);assert.equal(calls.request,1);assert.equal(w.active,true);
 await w.set(false);assert.equal(calls.release,1);assert.equal(w.active,false);
});
test('wake lock is re-requested after the tab returns and survives missing API',async()=>{
 const {createWakeLock}=ux(),{nav,calls}=fakeNav(),doc=fakeDoc(),w=createWakeLock({navigator:nav,document:doc});
 await w.set(true);nav.last.listeners.forEach(f=>f());assert.equal(w.active,false);
 doc.handlers.forEach(f=>f());await new Promise(r=>setTimeout(r,5));assert.equal(calls.request,2);
 const none=createWakeLock({navigator:{},document:doc});assert.equal(await none.set(true),false);
});
test('wake lock released while a request was pending is not leaked',async()=>{
 const {createWakeLock}=ux(),{nav,calls}=fakeNav(),w=createWakeLock({navigator:nav,document:fakeDoc()});
 const p=w.set(true);await w.set(false);await p;assert.equal(w.active,false);assert.equal(w.wanted,false);
});
test('haptics are silent without the API or with reduced motion',()=>{
 const {haptic}=ux(),{nav}=fakeNav();
 assert.equal(haptic('success',{navigator:nav,reducedMotion:false}),true);assert.equal(JSON.stringify(nav.pattern),"[14,40,14]");
 assert.equal(haptic('tap',{navigator:nav,reducedMotion:true}),false);assert.equal(haptic('tap',{navigator:{},reducedMotion:false}),false);
});

test('a delayed wake lock request is released if the tab became hidden',async()=>{
 const {createWakeLock}=ux(),doc=fakeDoc();let resolve,releaseCount=0;
 const nav={wakeLock:{request:()=>new Promise(done=>{resolve=done;})}};
 const wake=createWakeLock({navigator:nav,document:doc});
 const pending=wake.set(true);doc.visibilityState='hidden';
 resolve({release:async()=>{releaseCount++;},addEventListener(){}});
 await pending;
 assert.equal(wake.active,false);assert.equal(releaseCount,1);
});
