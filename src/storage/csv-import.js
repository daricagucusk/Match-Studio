

function parseLine(line,sep){const out=[];let field='',quoted=false;for(let i=0;i<line.length;i++){const c=line[i];if(c==='"'&&quoted&&line[i+1]==='"'){field+='"';i++;}else if(c==='"')quoted=!quoted;else if(c===sep&&!quoted){out.push(field.trim());field='';}else field+=c;}out.push(field.trim());return out;}
const norm=s=>String(s||'').toLocaleLowerCase('tr-TR').replace(/[^a-zçğıöşü0-9]/g,'');
function parsePlayersCsv(text,groupId){const lines=String(text||'').replace(/^\uFEFF/,'').split(/\r?\n/).filter(x=>x.trim());if(!lines.length)return{rows:[],errors:[{row:1,message:'CSV boş.'}]};const sep=lines[0].split(';').length>=lines[0].split(',').length?';':',';const headers=parseLine(lines[0],sep).map(norm);const at=(keys)=>headers.findIndex(x=>keys.includes(x));const n=at(['adsoyad','adısoyadı','oyuncu','isim','fullname','name']),b=at(['doğumyılı','dogumyili','birthyear']),s=at(['formano','formanumarası','shirt','shirtnumber']),p=at(['mevki','pozisyon','position']);if(n<0)return{rows:[],errors:[{row:1,message:'Ad Soyad sütunu gerekli.'}]};const rows=[],errors=[],seen=new Set();
for(let i=1;i<lines.length;i++){const v=parseLine(lines[i],sep);const name=(v[n]||'').trim();const y=b<0?'':(v[b]||'').trim();if(!name){errors.push({row:i+1,message:'İsim boş.'});continue;}if(y&&(!/^\d{4}$/.test(y)||Number(y)<1990||Number(y)>new Date().getFullYear())){errors.push({row:i+1,message:'Doğum yılı geçersiz.'});continue;}const rawPos=p<0?'':String(v[p]||'').toUpperCase();const position=['GK','DF','MF','FW','OTHER'].includes(rawPos)?rawPos:'OTHER';const key=playerImportKey({fullName:name,birthYear:y?Number(y):null});
if(seen.has(key)){errors.push({row:i+1,message:'CSV dosyasında aynı oyuncu tekrar ediyor.'});continue;}seen.add(key);
rows.push({fullName:name,birthYear:y?Number(y):null,shirtNumber:s<0?'':v[s]||'',position,groupIds:[groupId],licenseStatus:'unknown',isActive:true});}return{rows,errors};}

function playerImportKey(p){return norm(p.fullName)+'|'+String(p.birthYear||p.birthDate?.slice(0,4)||'');}
// Same person, same record. Never overwrite verified/edited existing fields.
function mergeCsvPlayers(incoming,existing){
 const mapped=new Map(existing.map(p=>[playerImportKey(p),p]));
 const merged=[...existing],updates=[];let created=0,updated=0;
 const seen=new Set();
 for(const p of incoming){
  const key=playerImportKey(p);if(seen.has(key))continue;seen.add(key);
  const old=mapped.get(key);
  if(old){const groups=[...new Set([...(old.groupIds||[]),...(p.groupIds||[])])];
   const next={...old,groupIds:groups};updates.push(next);merged[merged.findIndex(x=>x.id===old.id)]=next;updated++;
  }else{const next={...p};updates.push(next);merged.push(next);mapped.set(key,next);created++;}
 }
 return {players:merged,updates,created,updated};
}

Object.assign(exports,{parsePlayersCsv,playerImportKey,mergeCsvPlayers});
