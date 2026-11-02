'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const {createLoader}=require('./loader.cjs');
// Module results are created in the loader's VM realm; compare plain copies so prototypes do not interfere.
const plain=value=>JSON.parse(JSON.stringify(value));

// Real match flow: sessions, clock actions and sporting events go through the production storage modules.
async function club(){
 const {load}=createLoader();
 const db=load('src/storage/db.js');db.setClubDatabase('season_unit_club');
 const live=load('src/storage/live-match.js'),clock=load('src/storage/match-clock.js'),sports=load('src/storage/match-sporting-events.js');
 const domain=load('src/domain/season-analytics.js');
 for(const [id,fullName] of [['pA','Test Oyuncu A'],['pB','Test Oyuncu B'],['pC','Test Oyuncu C'],['pD','Test Oyuncu D']])
  await db.putRecord('players',{id,fullName,isActive:true,groupIds:['g1']});
 const ctx={db,live,clock,sports,domain};
 ctx.act=async(matchId,action,nowMs)=>clock.commitClockAction({matchId,action,nowMs,expectedRevision:(await live.getMatchSession(matchId)).revision,idempotencyKey:action+nowMs});
 ctx.create=async({id,groupId='g1',opponent='Test Rakip',matchDate,kickoffTime='14:00',starters=['pA','pB','pC'],bench=['pD']})=>{
  await db.putRecord('matches',{id,groupId,opponent,matchDate,kickoffTime,state:'saved'});
  await live.createMatchSession({matchId:id,rules:{periods:[1,1],substitutionMode:'returnAllowed',maximumNamedSubstitutes:2},initialPlayerIds:[...starters,...bench],currentOnFieldIds:starters});
  return id;
 };
 // Kick-off, one event per minute-slot in the first period, then a clean finish (2 playing minutes).
 ctx.play=async(matchId,events=[])=>{
  await ctx.act(matchId,'START',1000);
  for(const [i,[type,payload]] of events.entries())
   await sports.commitSportingEvent({matchId,type,payload,nowMs:10000+i*1000,expectedRevision:(await live.getMatchSession(matchId)).revision,idempotencyKey:'e'+i});
  for(const [action,ms] of [['END_PERIOD',61000],['NEXT_PERIOD',62000],['END_PERIOD',122000],['FINISH',123000]])await ctx.act(matchId,action,ms);
 };
 ctx.analytics=async(filter={})=>{
  const matches=await db.listRecords('matches'),players=await db.listRecords('players');
  const rosters=new Map(),sessions=new Map(),events=new Map();
  for(const m of matches){const s=await live.getMatchSession(m.id);if(!s)continue;sessions.set(m.id,s);if(s.status==='finished')events.set(m.id,await live.listMatchEvents(m.id));}
  return domain.buildSeasonAnalytics({matches,players,sessions,events,rosters,filter,nowMs:200000});
 };
 return ctx;
}

async function seasonFixture(){
 const c=await club();
 await c.create({id:'m1',matchDate:'2026-10-01',opponent:'Test Rakip A'});
 await c.play('m1',[['GOAL',{playerId:'pA'}],['GOAL',{playerId:'pB',assistPlayerId:'pC'}],['OPPONENT_GOAL',{}]]);
 await c.create({id:'m2',matchDate:'2026-10-08',opponent:'Test Rakip B'});
 await c.play('m2',[['YELLOW_CARD',{playerId:'pB'}]]);
 await c.create({id:'m3',matchDate:'2026-10-15',opponent:'Test Rakip C'});
 await c.play('m3',[['OPPONENT_GOAL',{}],['OPPONENT_GOAL',{}]]);
 await c.create({id:'m4',groupId:'g2',matchDate:'2026-10-16',opponent:'Test Rakip D'});
 await c.act('m4','START',1000);                                  // still running: must not count
 await c.create({id:'m5',matchDate:'2026-10-22',opponent:'Test Rakip E'});
 const session=await c.live.getMatchSession('m5');                // finished without any period events: needs review
 await c.db.putRecord('matchSessions',{...session,status:'finished'});
 return c;
}

test('season totals count only finished, review-clean matches and report the rest',async()=>{
 const c=await seasonFixture();const a=await c.analytics();
 assert.deepEqual(plain(a.counts),{candidates:5,unfinished:1,reviewRequired:1,included:3});
 assert.equal(a.team.played,3);assert.equal(a.team.wins,1);assert.equal(a.team.draws,1);assert.equal(a.team.losses,1);
 assert.equal(a.team.goalsFor,2);assert.equal(a.team.goalsAgainst,3);assert.equal(a.team.goalDifference,-1);
 assert.equal(a.team.points,4);assert.equal(a.team.averageGoals,0.7);
 assert.deepEqual(plain(a.team.form.map(f=>f.label)),['G','B','M']);
 assert.equal(a.review.length,1);assert.equal(a.review[0].matchId,'m5');assert.ok(a.review[0].reasons.length>0);
});

test('player season lines come from projected match reports, ordered by goals then name',async()=>{
 const c=await seasonFixture();const a=await c.analytics();
 const byName=Object.fromEntries(a.players.map(p=>[p.name,p]));
 assert.equal(byName['Test Oyuncu A'].matches,3);assert.equal(byName['Test Oyuncu A'].starts,3);assert.equal(byName['Test Oyuncu A'].goals,1);
 assert.equal(byName['Test Oyuncu A'].minutes,6);assert.equal(byName['Test Oyuncu A'].averageMinutes,2);assert.equal(byName['Test Oyuncu A'].participation,100);
 assert.equal(byName['Test Oyuncu B'].goals,1);assert.equal(byName['Test Oyuncu B'].yellow,1);
 assert.equal(byName['Test Oyuncu C'].assists,1);assert.equal(byName['Test Oyuncu C'].contributions,1);
 assert.equal(byName['Test Oyuncu D'].matches,0);assert.equal(byName['Test Oyuncu D'].minutes,0);assert.equal(byName['Test Oyuncu D'].participation,0);
 assert.deepEqual(plain(a.players.map(p=>p.name)),['Test Oyuncu A','Test Oyuncu B','Test Oyuncu C','Test Oyuncu D']);
});

test('sorting by assists and the group and date filters narrow the season',async()=>{
 const c=await seasonFixture();
 const byAssists=await c.analytics({sort:'assists'});assert.equal(byAssists.players[0].name,'Test Oyuncu C');assert.equal(byAssists.sortLabel,'Asist');
 const other=await c.analytics({groupId:'g2'});
 assert.deepEqual([other.counts.candidates,other.counts.unfinished,other.counts.included],[1,1,0]);assert.equal(other.team.played,0);assert.deepEqual(plain(other.players),[]);
 const range=await c.analytics({from:'2026-10-05',to:'2026-10-20'});
 assert.deepEqual([range.counts.candidates,range.counts.unfinished,range.counts.reviewRequired,range.counts.included],[3,1,0,2]);
 assert.equal(range.team.draws,1);assert.equal(range.team.losses,1);
 const unknownSort=await c.analytics({sort:'constructor'});assert.equal(unknownSort.filter.sort,'goals');
});

test('csv export is spreadsheet-safe, semicolon separated and reproduces the season line',async()=>{
 const {csvCell,seasonPlayersCsv,CSV_HEADERS}=(await club()).domain;
 assert.equal(csvCell('=HYPERLINK("x")'),`"'=HYPERLINK(""x"")"`);
 assert.equal(csvCell('+1'),"'+1");assert.equal(csvCell('-Ali'),"'-Ali");assert.equal(csvCell('@sum'),"'@sum");
 assert.equal(csvCell(' =HYPERLINK(1)'),"' =HYPERLINK(1)");assert.equal(csvCell('\n=SUM(1)'),"\"'\n=SUM(1)\"");
 assert.equal(csvCell('Ali;Veli'),'"Ali;Veli"');assert.equal(csvCell('say "hi"\nnow'),'"say ""hi""\nnow"');
 assert.equal(csvCell('Normal Ad'),'Normal Ad');assert.equal(csvCell(0),'0');
 const c=await seasonFixture();const csv=seasonPlayersCsv(await c.analytics());
 const lines=csv.trimEnd().split('\r\n');
 assert.equal(lines[0],CSV_HEADERS.join(';'));
 assert.equal(lines[1],'Test Oyuncu A;3;3;6;2;1;0;1;0;0;0;100');
 assert.equal(lines.length,5);
});
