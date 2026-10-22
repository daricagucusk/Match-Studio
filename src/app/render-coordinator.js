/* Route-level DOM reconciliation. Keep the sidebar/mobile navigation stable while
 * refreshing only the active page. Unlike an unconditional root.innerHTML rewrite,
 * this preserves the navigation, club switcher, and connection indicator nodes. */
function createRenderCoordinator(root){
 let previousKey=null;
 function reset(){previousKey=null;}
 function update({key,page,shell,modal}){
  const content=root.querySelector('.app-shell .page');
  const canPatch=previousKey===key && content && root.querySelector('.app-shell');
  if(canPatch){
   content.innerHTML=page;
   for(const child of [...root.children])if(child.classList?.contains('modal-backdrop'))child.remove();
   if(modal)root.insertAdjacentHTML('beforeend',modal);
  }else root.innerHTML=shell();
  previousKey=key;
  return canPatch?'page':'shell';
 }
 return {update,reset};
}
/* Change only the search-results region. In particular, preserve the search input,
 * its IME composition state and the on-screen keyboard on Android. */
function patchSearchRegion(root,html,selector){
 const target=root.querySelector(selector);
 if(!target)return false;
 const template=document.createElement('template');template.innerHTML=html;
 const next=template.content.querySelector(selector);
 if(!next)return false;
 target.replaceWith(next);return true;
}
Object.assign(exports,{createRenderCoordinator,patchSearchRegion});
