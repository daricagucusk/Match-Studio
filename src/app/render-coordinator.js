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
  // Same-route views are reconstructed after player clicks. Preserve inner scroll
  // containers and the exact focused athlete; never move the pitch on selection.
  const retainScrollSelectors=['.pitch-side','.pitch-bench-list','.pitch-layout','.pitch-main','.v22-team-members','.dg-tp-slot-list','.dg-tp-slot-list-grid','.live-tactical-benchlist','.live-console-pitch-column','.live-console-events-column'];
  const oldScroll=canPatch?retainScrollSelectors.map(selector=>{
   const element=content.querySelector(selector);
   return element?{selector,top:element.scrollTop,left:element.scrollLeft}:null;
  }).filter(Boolean):[];
  const oldPageY=canPatch?window.scrollY:null;
  const oldFocus=canPatch&&content.contains(document.activeElement)?(()=>{
   const element=document.activeElement;
   for(const dataName of ['pitchPlayer','pitchSlot','pitchRolePlayer','teamSlotPlayer','teamRolePlayer','teamSlot']){
    if(element.dataset?.[dataName]!==undefined)return {dataName,value:element.dataset[dataName]};
   }
   return element.id?{id:element.id}:null;
  })():null;
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
  for(const position of oldScroll){
   const element=root.querySelector(position.selector);
   if(element){element.scrollTop=position.top;element.scrollLeft=position.left;}
  }
  if(oldFocus){
   let element=oldFocus.id?document.getElementById(oldFocus.id):null;
   if(oldFocus.dataName){
    element=[...root.querySelectorAll('[data-'+oldFocus.dataName.replace(/[A-Z]/g,m=>'-'+m.toLowerCase())+']')]
      .find(candidate=>candidate.dataset[oldFocus.dataName]===oldFocus.value);
   }
   if(element?.isConnected&&!element.disabled)element.focus({preventScroll:true});
  }
  if(oldPageY!==null&&Math.abs(window.scrollY-oldPageY)>1)window.scrollTo({top:oldPageY,behavior:'instant'});
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
