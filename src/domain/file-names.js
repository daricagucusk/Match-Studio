// Slugs for filesystem-safe exports. Keep display names and records untouched.
function safeFilenamePart(value,maxLength=48){
 const limit=Math.max(8,Math.min(Number(maxLength)||48,100));
 return String(value??'').toLocaleUpperCase('tr-TR')
  .normalize('NFKD').replace(/[\u0300-\u036f]/g,'')
  .replace(/[^A-Z0-9]+/g,'_').replace(/^_+|_+$/g,'')
  .slice(0,limit).replace(/_+$/g,'') || 'KULUP';
}
Object.assign(exports,{safeFilenamePart});
