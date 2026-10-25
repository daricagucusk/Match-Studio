// MATCH_STUDIO_MULTI_MODEL_HANDOFF_SMOKE_20261025: agent code review pipeline smoke test.
// Modal focus is restored after the UI operation releases its temporary root lock.
function createModalFocusController(root,onDismiss){
 const doc=root.ownerDocument;
 const selector='button,input:not([type="hidden"]),select,textarea,a[href],summary,[tabindex]:not([tabindex="-1"])';
 let opened=false,pendingReturn=false,opener=null,lastFocused=null;
 const dialog=()=>root.querySelector('.modal[role="dialog"]');
 const usable=el=>Boolean(el?.isConnected&&!el.disabled&&!el.closest('[hidden],[inert]')&&el.getClientRects().length&&getComputedStyle(el).visibility!=='hidden');
 const same=(el,mark)=>Object.entries(mark.attrs).every(([key,value])=>el.getAttribute(key)===value);
 function mark(el){
  if(!el)return null;const attrs={};
  for(const key of ['id','data-action','data-id','data-pitch-menu-trigger','data-pitch-slot','data-nav','name'])if(el.hasAttribute(key))attrs[key]=el.getAttribute(key);
  if(el.matches('input[type="checkbox"],input[type="radio"]'))attrs.value=el.value;
  if(!Object.keys(attrs).length&&el.hasAttribute('aria-label'))attrs['aria-label']=el.getAttribute('aria-label');
  const result={node:el,tag:el.localName,attrs};result.index=[...root.querySelectorAll(result.tag)].filter(item=>same(item,result)).indexOf(el);return result;
 }
 function find(saved,scope){
  if(!saved)return null;
  if(scope.contains(saved.node)&&usable(saved.node))return saved.node;
  if(!Object.keys(saved.attrs).length)return null;
  const matches=[...scope.querySelectorAll(saved.tag)].filter(el=>same(el,saved)&&usable(el));return matches[saved.index]||matches[0]||null;
 }
 function rememberTrigger(el,force=false){if(!opened&&el&&(force||!root.inert))opener=mark(el);}
 function controls(panel){return [...panel.querySelectorAll(selector)].filter(el=>usable(el)&&el.tabIndex>=0);}
 function focusFirst(panel){const items=controls(panel);const initial=items.find(el=>el.hasAttribute('autofocus'))||items.find(el=>el.matches('input,select,textarea'))||items[0]||panel;initial.focus({preventScroll:true});}
 function sync(){
  const panel=dialog(),shell=root.querySelector('.app-shell');if(shell)shell.inert=Boolean(panel);
  if(panel){
   if(!opened){opened=true;pendingReturn=false;lastFocused=null;}
   panel.tabIndex=-1;
   if(root.inert||panel.contains(doc.activeElement))return;
   const previous=find(lastFocused,panel);if(previous)previous.focus({preventScroll:true});else focusFirst(panel);
   return;
  }
  if(opened){opened=false;pendingReturn=true;lastFocused=null;}
  if(!pendingReturn||root.inert)return;
  pendingReturn=false;let target=find(opener,root);opener=null;
  for(const fallback of ['[data-action="add-player"]','[data-pitch-slot]','.app-shell button']){if(target)break;target=[...root.querySelectorAll(fallback)].find(usable);}
  target?.focus({preventScroll:true});
 }
 root.addEventListener('click',event=>{if(!dialog()&&!root.inert)rememberTrigger(event.target.closest('button,a[href],input,select,summary,[tabindex]'));},true);
 doc.addEventListener('focusin',event=>{
  const panel=dialog();if(!panel||root.inert)return;
  if(panel.contains(event.target))lastFocused=mark(event.target);else focusFirst(panel);
 });
 doc.addEventListener('keydown',event=>{
  const panel=dialog();if(!panel||root.inert||event.isComposing)return;
  if(event.key==='Escape'){event.preventDefault();event.stopImmediatePropagation();onDismiss();return;}
  if(event.key!=='Tab')return;
  const items=controls(panel),first=items[0],last=items[items.length-1],active=doc.activeElement;
  if(!items.length){event.preventDefault();panel.focus();}
  else if(!panel.contains(active)||active===panel){event.preventDefault();(event.shiftKey?last:first).focus();}
  else if(event.shiftKey&&active===first){event.preventDefault();last.focus();}
  else if(!event.shiftKey&&active===last){event.preventDefault();first.focus();}
 },true);
 return {sync,rememberTrigger};
}
Object.assign(exports,{createModalFocusController});
