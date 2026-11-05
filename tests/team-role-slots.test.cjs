const {test} = require('node:test');
const assert = require('node:assert/strict');
const {createLoader} = require('./loader.cjs');
const load = createLoader();
const {
  createTeamDepth, sanitizeTeamDepth, setTeamSlotPlayer, moveTeamSlotCandidate,
  setTeamTacticalRole, TEAM_ROLE_PROFILES
} = load.load('src/domain/team-depth.js');
const {getTeamPitchAnalysis} = load.load('src/domain/team-pitch-analysis.js');
const {renderTeamPitch} = load.load('src/team/team-pitch.js');

const athletes = Array.from({length: 8}, (_,i)=>({
  id:'p'+(i+1), fullName:'Sporcu '+(i+1), groupIds:['g1'], position:'DF', isActive:true
}));
const base=()=>{
  const d=createTeamDepth('g1');
  d.roles.CB=['p1','p2','p3','p4','p5','p6'];
  d.roles.CM=['p7','p8'];
  return d;
};
test('independent left and right stoper queues preserve every alternative',()=>{
  const first=setTeamSlotPlayer(base(),'CB:0','p6',true,athletes);
  const a=moveTeamSlotCandidate(first,'CB:0','p6',-1,athletes);
  const b=moveTeamSlotCandidate(a,'CB:0','p6',-1,athletes);
  const left=b.slotCandidates['CB:0'];
  assert.equal(left.length,6);
  assert.equal(left[3],'p6');
  assert.equal(b.slotCandidates['CB:1'],undefined);
  assert.equal(b.roles.CB.join(','),base().roles.CB.join(','));
  const right=setTeamSlotPlayer(b,'CB:1','p1',false,athletes);
  assert.equal(right.slotCandidates['CB:0'].length,6);
  assert(!right.slotCandidates['CB:1'].includes('p1'));
  assert.equal(base().roles.CB.join(','),'p1,p2,p3,p4,p5,p6');
});
test('tactical role per slot is valid, independent and backward compatible',()=>{
  assert(TEAM_ROLE_PROFILES.CB.some(x=>x.id==='ball-playing-defender'));
  assert(TEAM_ROLE_PROFILES.CM.some(x=>x.id==='box-to-box-midfielder'));
  const first=setTeamTacticalRole(base(),'CB:0','ball-playing-defender',athletes);
  const second=setTeamTacticalRole(first,'CB:1','central-defender',athletes);
  const normalized=sanitizeTeamDepth(second,athletes);
  assert.equal(normalized.tacticalRoles['CB:0'],'ball-playing-defender');
  assert.equal(normalized.tacticalRoles['CB:1'],'central-defender');
  assert.equal(Object.keys(sanitizeTeamDepth(base(),athletes).slotCandidates).length,0);
  assert.throws(()=>setTeamTacticalRole(base(),'CM:0','ball-playing-defender',athletes),/rol/i);
});
test('two stoper slots have unique players, individually named roles and unlimited backups',()=>{
  const d=base();
  d.slotCandidates={'CB:0':['p1','p2','p3','p4','p5'], 'CB:1':['p6','p5','p4','p3','p2','p1']};
  d.tacticalRoles={'CB:0':'ball-playing-defender','CB:1':'stopper'};
  const result=getTeamPitchAnalysis(d,athletes,{formation:'4-3-3',depthFactor:2});
  const cb=result.slots.filter(x=>x.role==='CB');
  assert.equal(cb.length,2);
  assert.equal(cb[0].label,'Sol Stoper');
  assert.equal(cb[1].label,'Sağ Stoper');
  assert.equal(cb[0].tacticalRole,'ball-playing-defender');
  assert.equal(cb[1].tacticalRole,'stopper');
  assert.equal(cb[0].candidateCount,5);
  assert(cb[0].alternatives.length>=3);
  assert.notEqual(cb[0].primary?.id,cb[1].primary?.id);
  const html=renderTeamPitch({depth:d,players:athletes,selectedRole:'CB',selectedSlot:'CB:0',prefs:{formation:'4-3-3',depthFactor:2}});
  assert.match(html,/Sol Stoper/);
  assert.match(html,/Sağ Stoper/);
  assert.match(html,/Sporcu 5/);
  assert.match(html,/ball-playing-defender|Pasör Stoper/);
});
