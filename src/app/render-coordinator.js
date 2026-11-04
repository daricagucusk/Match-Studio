/* Route-level DOM reconciliation. Keep the sidebar/mobile navigation stable while
 * refreshing only the active page. Unlike an unconditional root.innerHTML rewrite,
 * this preserves the navigation, club switcher, and connection indicator nodes. */
function createRenderCoordinator(root){
 let previousKey=null,expandedLive=[];
 function reset(){previousKey=null;expandedLive=[];}
 function update({key,page,shell,modal}){
  const content=root.querySelector('.app-shell .page');
  const canPatch=previousKey===key && content && root.querySelector('.app-shell');
  // Keep the coach's place when selecting players on a long roster.
  const oldRoster=canPatch?content.querySelector('.roster-list'):null;
  const rosterPosition=oldRoster?{top:oldRoster.scrollTop,left:oldRoster.scrollLeft,pageY:window.scrollY,playerId:document.activeElement?.dataset?.playerId}:null;
  // A clock action first renders a loading state; retain opened reports across that intermediate render.
  if(previousKey!==key)expandedLive=[];
  const existingLive=canPatch?content.querySelector('.live-match-console'):null;
  if(existingLive)expandedLive=[...existingLive.querySelectorAll('details.live-e-history,details.live-squad-details,details.live-console-secondary')].filter(el=>el.open).map(el=>el.className);
  if(canPatch){
   content.innerHTML=page;
   for(const child of [...root.children])if(child.classList?.contains('modal-backdrop'))child.remove();
   if(modal)root.insertAdjacentHTML('beforeend',modal);
  }else root.innerHTML=shell();
  if(page.includes('live-match-console'))for(const cls of expandedLive){const reopened=[...root.querySelectorAll('details')].find(el=>el.className===cls);if(reopened)reopened.open=true;}
  if(rosterPosition){
   const next=root.querySelector('.roster-list');
   if(next){
    next.scrollTop=rosterPosition.top;
    next.scrollLeft=rosterPosition.left;
    if(rosterPosition.playerId){
     const checkbox=[...next.querySelectorAll('input[data-player-id]')].find(el=>el.dataset.playerId===rosterPosition.playerId);
     checkbox?.focus({preventScroll:true});
    }
   }
   if(Math.abs(window.scrollY-rosterPosition.pageY)>1)window.scrollTo({top:rosterPosition.pageY,behavior:'instant'});
  }
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
