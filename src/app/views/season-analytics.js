/* Season analytics page (V2.6.8-F.16). Templates only: every figure is precomputed by src/domain/season-analytics.js. */
function createSeasonAnalyticsViews(deps){
 const {state, pageHeader, esc, btn, I, formatTurkishDate, SORT_KEYS, RESULT_LABEL, RESULT_NAME} = deps;
 const n=(value,digits=0)=>Number(value||0).toLocaleString('tr-TR',{minimumFractionDigits:digits,maximumFractionDigits:digits});
 const signed=value=>(value>0?'+':'')+n(value);

 function toolbar(s,hasPlayers){
  const groups=`<option value="">Tüm takımlar</option>`+state.data.groups.map(g=>`<option value="${esc(g.id)}"${s.groupId===g.id?' selected':''}>${esc(g.name)}</option>`).join('');
  const sorts=Object.entries(SORT_KEYS).map(([key,label])=>`<option value="${key}"${s.sort===key?' selected':''}>${esc(label)}</option>`).join('');
  return `<div class="season-toolbar" role="group" aria-label="Analitik filtreleri">`+
   `<div class="field"><label for="season-group">Takım</label><select id="season-group">${groups}</select></div>`+
   `<div class="field"><label for="season-from">Başlangıç</label><input id="season-from" type="date" value="${esc(s.from)}"></div>`+
   `<div class="field"><label for="season-to">Bitiş</label><input id="season-to" type="date" value="${esc(s.to)}"></div>`+
   `<div class="field"><label for="season-sort">Oyuncu sıralaması</label><select id="season-sort">${sorts}</select></div>`+
   `</div><div class="season-actions">${btn(I('download')+' CSV indir','season-csv','btn-ghost btn-small',hasPlayers?'':'disabled')}</div>`;
 }

 function reviewNotice(a){
  if(!a.review.length)return '';
  return `<div class="callout warning season-review"><strong>${a.review.length} maç toplamlara alınmadı.</strong>`+
   `<p>Oynama süresi veya maç saati denetim gerektiriyor. Bu maçlar denetim tamamlanana kadar sezon toplamlarına girmez.</p>`+
   `<ul>${a.review.map(m=>`<li>${esc(formatTurkishDate(m.matchDate))} · ${esc(m.opponent)} — ${esc(m.reasons.join(', '))}</li>`).join('')}</ul></div>`;
 }

 function seasonPage(){
  const s=state.season,a=s.data;
  const head=pageHeader('SEZON ANALİTİĞİ','Sezon Analitiği','Yalnızca tamamlanmış ve süre denetiminden geçmiş maçlar toplamlara girer. Veriler bu cihazda hesaplanır.',
   btn('Yenile','season-refresh','btn-ghost btn-small',s.loading?'disabled':''));
  if(s.error)return head+toolbar(s,false)+`<div class="callout warning" role="alert">${esc(s.error)}</div>`;
  if(!a)return head+toolbar(s,false)+`<div class="empty" role="status"><h3>Maç kayıtları okunuyor</h3><p>Tamamlanan maçlar hesaplanıyor.</p></div>`;

  const status=s.loading?`<p class="season-note" role="status">Güncelleniyor…</p>`:'';
  const pending=a.counts.unfinished?`<p class="season-note">${n(a.counts.unfinished)} maç henüz tamamlanmadı ve toplamlara dahil değil.</p>`:'';
  const t=a.team;
  if(!t.played)return head+toolbar(s,false)+reviewNotice(a)+`<div class="empty" role="status"><h3>Henüz analiz edilecek maç yok</h3><p>Canlı maç saatinden bir maçı bitirdiğinizde sonuçlar ve oyuncu istatistikleri burada görünür.</p></div>${pending}${status}`;

  const kpis=[
   ['Oynanan maç',n(t.played)],
   ['G – B – M',`${n(t.wins)} – ${n(t.draws)} – ${n(t.losses)}`],
   ['Puan',n(t.points)],
   ['Atılan / yenilen',`${n(t.goalsFor)} / ${n(t.goalsAgainst)}`],
   ['Gol farkı',signed(t.goalDifference)],
   ['Maç başı gol',n(t.averageGoals,1)],
  ].map(([label,value])=>`<div class="season-kpi"><span class="season-kpi-label">${esc(label)}</span><strong class="season-kpi-value">${esc(value)}</strong></div>`).join('');

  const form=`<div class="season-form-row" role="group" aria-label="Son maçlar"><span class="eyebrow">Son ${n(t.form.length)} maç</span>`+
   t.form.map(f=>`<span class="season-form season-form-${f.result}" title="${esc(f.name)}"><span class="sr-only">${esc(f.name)}: </span>${esc(f.label)}</span>`).join('')+`</div>`;

  const playerRows=a.players.map(p=>`<tr><th scope="row">${esc(p.name)}</th><td class="num">${n(p.matches)}</td><td class="num hide-sm">${n(p.starts)}</td><td class="num">${n(p.minutes)}</td><td class="num hide-sm">${n(p.averageMinutes)}</td><td class="num">${n(p.goals)}</td><td class="num">${n(p.assists)}</td><td class="num hide-sm">${n(p.contributions)}</td><td class="num hide-sm">${n(p.yellow)}</td><td class="num hide-sm">${n(p.red)}</td><td class="num">${n(p.participation)}%</td></tr>`).join('');
  const playerTable=`<section class="panel season-panel" aria-labelledby="season-players-title"><h2 id="season-players-title" class="season-h">Oyuncu sezon tablosu</h2>`+
   `<div class="season-table-wrap"><table class="season-table season-players"><caption class="sr-only">Oyuncular, ${esc(a.sortLabel)} sıralamasıyla</caption>`+
   `<thead><tr><th scope="col">Oyuncu</th><th scope="col" class="num">Maç</th><th scope="col" class="num hide-sm">İlk 11</th><th scope="col" class="num">Dakika</th><th scope="col" class="num hide-sm">Ort. dk</th><th scope="col" class="num">Gol</th><th scope="col" class="num">Asist</th><th scope="col" class="num hide-sm">Katkı</th><th scope="col" class="num hide-sm">Sarı</th><th scope="col" class="num hide-sm">Kırmızı</th><th scope="col" class="num">Katılım</th></tr></thead>`+
   `<tbody>${playerRows||'<tr><td colspan="11">Bu takımda kadro kaydı yok.</td></tr>'}</tbody></table></div>`+
   `<p class="season-note">Katılım, oynanan maçların yüzdesidir. Dakika, canlı maç kayıtlarındaki oynama süresinden hesaplanır.</p></section>`;

  const matchRows=[...a.matches].reverse().map(m=>`<tr><th scope="row">${esc(formatTurkishDate(m.matchDate))}</th><td>${esc(m.opponent)}</td><td class="num">${n(m.ourGoals)} – ${n(m.opponentGoals)}</td><td><span class="season-form season-form-${m.result}" title="${esc(RESULT_NAME[m.result])}">${esc(RESULT_LABEL[m.result])}</span><span class="sr-only">${esc(RESULT_NAME[m.result])}</span></td></tr>`).join('');
  const matchTable=`<section class="panel season-panel" aria-labelledby="season-matches-title"><h2 id="season-matches-title" class="season-h">Maç sonuçları</h2>`+
   `<div class="season-table-wrap"><table class="season-table"><caption class="sr-only">Tamamlanan maçlar, en yeni önce</caption>`+
   `<thead><tr><th scope="col">Tarih</th><th scope="col">Rakip</th><th scope="col" class="num">Skor</th><th scope="col">Sonuç</th></tr></thead><tbody>${matchRows}</tbody></table></div></section>`;

  return head+toolbar(s,a.players.length>0)+reviewNotice(a)+pending+
   `<section class="season-kpis" aria-label="Sezon özeti">${kpis}</section>`+form+playerTable+matchTable+status;
 }

 return {seasonPage};
}

Object.assign(exports,{createSeasonAnalyticsViews});
