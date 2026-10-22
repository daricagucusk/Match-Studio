// Per-tab form drafts. They never write the club database or change saved matches.
function createMatchDraftStore(storage){
 const prefix='matchstudio-form-draft-v1:',memory=new Map();let persistent=!!storage;
 const clone=value=>JSON.parse(JSON.stringify(value));
 const key=scope=>prefix+JSON.stringify([scope.clubId,scope.matchId||'new']);
 function read(scope){
  const id=key(scope);if(memory.has(id))return clone(memory.get(id));
  let data=null;
  try{const raw=storage?.getItem(id);if(raw){const parsed=JSON.parse(raw);if(parsed&&parsed.fields&&typeof parsed.fields==='object'&&!Array.isArray(parsed.fields)&&Object.values(parsed.fields).every(v=>typeof v==='string'))data={fields:parsed.fields,seed:parsed.seed||null};}}
  catch(error){persistent=false;}
  memory.set(id,data);return clone(data);
 }
 function write(scope,value){const id=key(scope),copy=clone(value);memory.set(id,copy);try{if(storage)storage.setItem(id,JSON.stringify(copy));}catch(error){persistent=false;}}
 function remove(scope){const id=key(scope);memory.set(id,null);try{storage?.removeItem(id);}catch(error){persistent=false;}}
 function clearClub(clubId){
  const ids=new Set(memory.keys());try{for(let i=0;i<(storage?.length||0);i++)ids.add(storage.key(i));}catch(error){persistent=false;}
  for(const id of ids){if(!id?.startsWith(prefix))continue;try{if(JSON.parse(id.slice(prefix.length))[0]===clubId){memory.set(id,null);storage?.removeItem(id);}}catch(error){persistent=false;}}
 }
 return {read,write,remove,clearClub,isPersistent:()=>persistent,hasDrafts:()=>[...memory.values()].some(Boolean)};
}
Object.assign(exports,{createMatchDraftStore});
