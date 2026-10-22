// Match Studio v2.6 - competition format is independent from age and field geometry.
// All limits are user-configured match parameters, NOT legal federation limits.
const FORMATS=Object.freeze(Array.from({length:9},(_,i)=>i+3));
const FORMAT_DEFAULTS={3:'1-2 (kalecisiz)',4:'2-2 (kalecisiz)',5:'1-2-1',6:'2-2-1',7:'2-3-1',8:'3-3-1',9:'3-3-2',10:'3-3-3',11:'4-3-3'};
const LAYOUTS=Object.freeze({standard:{label:'Standart / taktik saha'},small:{label:'Bağımsız küçük saha'},'half-pitch-crosswise':{label:'Yarı saha · Enine (taç çizgilerinde kaleler)'}});
const safeInt=(v,fallback)=>v!==''&&v!=null&&Number.isInteger(Number(v))?Number(v):fallback;
function normalizeGameFormat(raw,{strict=true}={}){
 if(!raw||typeof raw!=='object')throw Error('Maç formatı belirtilmeli.');
 const players=safeInt(raw.playersPerSide,NaN);
 if(!FORMATS.includes(players))throw Error('Oyun formatı 3v3–11v11 arasında olmalı.');
 const goalkeeperMode=raw.goalkeeperMode==='none'?'none':raw.goalkeeperMode==='required'?'required':(players<=4?'none':'required');
 if(raw.benchLimit!==''&&raw.benchLimit!=null&&!Number.isInteger(Number(raw.benchLimit)))throw Error('Yedek sayısı tam sayı olmalı.');
 const benchLimit=safeInt(raw.benchLimit,players===11?10:players===8?8:Math.min(8,players));
 if(!Number.isInteger(benchLimit)||benchLimit<0||benchLimit>32)throw Error('Yedek sayısı 0–32 arasında olmalı.');
 if(strict&&goalkeeperMode==='required'&&players<=4)throw Error('3v3 ve 4v4 mevcut saha şablonunda kalecisiz oynanır. Kalecisiz seçin.');
 return {playersPerSide:players,goalkeeperMode,benchLimit,ruleSource:'manual',version:1};
}
function normalizePitchLayout(raw,format){
 const id=raw?.id||'standard';
 if(!LAYOUTS[id])throw Error('Bilinmeyen saha yerleşimi.');
 if(id==='half-pitch-crosswise'&&format?.playersPerSide!==8)throw Error('Yarı saha enine profili şu anda yalnızca 8v8 için tasarlandı.');
 const half=raw?.half==='south'?'south':'north';
 return {id,half,attackAxis:id==='half-pitch-crosswise'?'crosswise':'lengthwise',version:1};
}
function resolveMatchFormat(match){
 if(!match?.gameFormat)return null;
 return normalizeGameFormat(match.gameFormat);
}
function defaultPresetFor(format){return format.goalkeeperMode==='none'&&format.playersPerSide>4?`Serbest ${format.playersPerSide} (kalecisiz)`:(FORMAT_DEFAULTS[format.playersPerSide]||'4-3-3');}
function recommendedFormatForAge(ageCategory){
 const m=String(ageCategory||'').match(/^U(\d{1,2})$/i),age=m?+m[1]:0;
 return age>0&&age<=9?5:age<=12&&age>0?8:11;
}
function getFormatDisplay(match){const f=resolveMatchFormat(match);return f?`${f.playersPerSide}v${f.playersPerSide}`:'Eski kadro kuralı';}
Object.assign(exports,{FORMATS,FORMAT_DEFAULTS,LAYOUTS,normalizeGameFormat,normalizePitchLayout,resolveMatchFormat,defaultPresetFor,recommendedFormatForAge,getFormatDisplay});
