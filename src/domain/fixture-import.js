// Import is intentionally opt-in: no PDF/OCR guesses and no direct database writes.
const clean = value => String(value ?? '').replace(/\u0000/g,'').trim();
const headerKey = value => clean(value).toLocaleLowerCase('tr-TR')
  .normalize('NFD').replace(/[\u0300-\u036f]/g,'')
  .replace(/[ıİ]/g,'i').replace(/[^a-z0-9]/g,'');
const ALIASES = {
  group:['grup','takim','takimgrup','yaskategorisi','kategori','group','team'],
  opponent:['rakip','rakiptakim','opponent','karsitakim'],
  date:['tarih','mactarihi','date','matchdate'],
  time:['saat','macsaati','baslamasaati','kickoff','kickofftime'],
  venue:['saha','stadyum','yer','tesis','venue','stadium'],
  competition:['organizasyon','turnuva','lig','competition']
};
function splitDelimited(text){
 const value=String(text||'').replace(/^\uFEFF/,'').replace(/\r\n?/g,'\n');
 const line=value.split('\n').find(x=>x.trim())||'';
 const options=[';','\t',','];
 const separator=options.sort((a,b)=>line.split(b).length-line.split(a).length)[0];
 let inQuote=false, field='',record=[],rows=[];
 for(let i=0;i<value.length;i++){
  const char=value[i];
  if(char==='"'){if(inQuote&&value[i+1]==='"'){field+='"';i++;}else inQuote=!inQuote;}
  else if(char===separator&&!inQuote){record.push(field.trim());field='';}
  else if(char==='\n'&&!inQuote){record.push(field.trim());if(record.some(Boolean))rows.push(record);record=[];field='';}
  else field+=char;
 }
 if(inQuote)throw Error('CSV içinde kapanmamış tırnak alanı.');
 record.push(field.trim());if(record.some(Boolean))rows.push(record);
 return rows;
}
function excelDate(value){
 if(!/^\d{5}(?:\.\d+)?$/.test(value))return value;
 const days=Number(value);
 if(days<20000||days>80000)return value;
 return new Date(Date.UTC(1899,11,30)+Math.floor(days)*86400000).toISOString().slice(0,10);
}
function parseFixtureRows(grid){
 if(!Array.isArray(grid)||!grid.length)return{rows:[],errors:['Tablo boş.']};
 const headers=grid[0].map(headerKey),indices={};
 for(const [field,synonyms] of Object.entries(ALIASES)){
  indices[field]=headers.findIndex(h=>synonyms.map(headerKey).includes(h));
 }
 const mandatory=['group','opponent','date','time','venue'];
 const absent=mandatory.filter(k=>indices[k]<0);
 if(absent.length)return{rows:[],errors:['Zorunlu sütunlar eksik: '+absent.join(', ')+'. Beklenen: Grup, Rakip, Tarih, Saat, Saha.']};
 const rows=[],errors=[],seen=new Set();
 const {normalizeDate,normalizeTime}=require('src/domain/validation.js');
 for(let i=1;i<grid.length&&i<=1000;i++){
  const row=grid[i],get=k=>clean(indices[k]<0?'':row[indices[k]]);
  if(!row.some(v=>clean(v)))continue;
  const group=get('group'),opponent=get('opponent'),date=normalizeDate(excelDate(get('date'))),time=normalizeTime(get('time')),venue=get('venue');
  const details=[group,opponent,date,time,venue];
  if(details.some(v=>!v)){errors.push('Satır '+(i+1)+': Grup/Rakip/Tarih/Saat/Saha geçerli olmalı.');continue;}
  if(group.length>80||opponent.length>110||venue.length>150){errors.push('Satır '+(i+1)+': Çok uzun alan.');continue;}
  const signature=[group.toLocaleLowerCase('tr-TR'),opponent.toLocaleLowerCase('tr-TR'),date,time].join('|');
  if(seen.has(signature)){errors.push('Satır '+(i+1)+': Aynı maç dosyada tekrar edilmiş.');continue;}
  seen.add(signature);
  rows.push({group,opponent,matchDate:date,kickoffTime:time,venue,competition:get('competition').slice(0,150)});
 }
 if(grid.length>1001)errors.push('En fazla 1000 maç satırı kabul edilir.');
 if(!rows.length&&!errors.length)errors.push('İçe aktarılacak maç bulunamadı.');
 return{rows,errors};
}
function xmlElements(node,name){return [...node.getElementsByTagNameNS('*',name)];}
function xmlText(text){
 const doc=new DOMParser().parseFromString(text,'application/xml');
 if(doc.getElementsByTagName('parsererror').length)throw Error('Excel XML bozuk.');
 return doc;
}
async function readXlsx(file){
 const bytes=new Uint8Array(await file.arrayBuffer()),view=new DataView(bytes.buffer);
 const u16=at=>view.getUint16(at,true),u32=at=>view.getUint32(at,true);
 let eocd=-1;
 for(let i=bytes.length-22;i>=Math.max(0,bytes.length-65557);i--){if(u32(i)===0x06054b50){eocd=i;break;}}
 if(eocd<0)throw Error('Excel ZIP yapısı okunamadı.');
 const count=u16(eocd+10),limit=u32(eocd+12);let offset=u32(eocd+16);
 if(count>250||limit>8_000_000)throw Error('Excel ZIP içeriği beklenen sınırın dışında.');
 const entries=new Map(),decoder=new TextDecoder('utf-8');
 for(let i=0;i<count;i++){
  if(offset+46>bytes.length||u32(offset)!==0x02014b50)throw Error('Excel ZIP tablo hatası.');
  const method=u16(offset+10),comp=u32(offset+20),uncomp=u32(offset+24),nameLen=u16(offset+28);
  const extra=u16(offset+30),comment=u16(offset+32),local=u32(offset+42);
  const name=decoder.decode(bytes.subarray(offset+46,offset+46+nameLen));
  if((name==='xl/sharedStrings.xml'||/^xl\/worksheets\/sheet\d+\.xml$/.test(name))&&uncomp<=12_000_000){
   if(local+30>bytes.length||u32(local)!==0x04034b50)throw Error('Excel ZIP local header hatası.');
   const start=local+30+u16(local+26)+u16(local+28);
   if(start+comp>bytes.length)throw Error('Excel ZIP verisi eksik.');
   entries.set(name,{method,compressed:bytes.slice(start,start+comp),uncompressed:uncomp});
  }
  offset+=46+nameLen+extra+comment;
 }
 async function decompress(entry){
  if(!entry)return null;
  let output=entry.compressed;
  if(entry.method===8){
   if(typeof DecompressionStream!=='function')throw Error('Bu tarayıcı Excel açmayı desteklemiyor. CSV seçin.');
   const ds=new DecompressionStream('deflate-raw');
   output=new Uint8Array(await new Response(new Blob([output]).stream().pipeThrough(ds)).arrayBuffer());
  }else if(entry.method!==0)throw Error('Desteklenmeyen Excel sıkıştırma yöntemi.');
  if(output.byteLength>12_000_000||output.byteLength!==entry.uncompressed)throw Error('Excel sayfa boyutu uyuşmuyor.');
  return decoder.decode(output);
 }
 const sheet= [...entries.keys()].filter(k=>k.startsWith('xl/worksheets/')).sort()[0];
 if(!sheet)throw Error('Excel çalışma sayfası bulunamadı.');
 const sharedXML=await decompress(entries.get('xl/sharedStrings.xml'));
 const shared=sharedXML?xmlElements(xmlText(sharedXML),'si').map(node=>xmlElements(node,'t').map(t=>t.textContent).join('')):[];
 const doc=xmlText(await decompress(entries.get(sheet))),grid=[];
 for(const row of xmlElements(doc,'row').slice(0,1002)){
  const cells=[];
  for(const cell of xmlElements(row,'c')){
   const letters=(cell.getAttribute('r')||'').match(/^[A-Z]+/i)?.[0]||'';
   let col=0;for(const char of letters.toUpperCase())col=col*26+char.charCodeAt(0)-64;col--;
   if(col<0||col>40)continue;
   const t=cell.getAttribute('t');
   const value=xmlElements(cell,'v')[0]?.textContent??'';
   cells[col]=t==='s'?(shared[Number(value)]||''):t==='inlineStr'?xmlElements(cell,'t').map(x=>x.textContent).join(''):value;
  }
  grid.push(Array.from({length:Math.max(cells.length,5)},(_,i)=>cells[i]||''));
 }
 return grid;
}
async function readFixtureFile(file){
 if(!file||file.size>8_000_000)throw Error('Dosya en fazla 8 MB olabilir.');
 const ext=file.name.toLowerCase().split('.').pop();
 if(ext==='pdf')throw Error('PDF içe aktarma bu sürümde henüz doğrulanmadı. Resmî programı CSV veya XLSX olarak alın; PDF içeriğini otomatik tahmin etmiyoruz.');
 if(!['csv','tsv','xlsx'].includes(ext))throw Error('CSV, TSV veya XLSX dosyası seçin.');
 const grid=ext==='xlsx'?await readXlsx(file):splitDelimited(await file.text());
 return parseFixtureRows(grid);
}
Object.assign(exports,{splitDelimited,parseFixtureRows,readFixtureFile});
