(function(){
  const App = window.App = window.App || {}; const S = App.state;
  App.ui = App.ui || {};
  const $ = s=>document.querySelector(s);

  App.ui.init=function(){ $('#concept').addEventListener('change', e=>switchConcept(e.target.value)); App.anim.init(); bindCpu(); bindPC(); bindBankers(); bindTimeline(); switchConcept('cpu-scheduling'); };

  function switchConcept(c){ S.concept=c; S.runningAnim=false; $('#cpu-scheduling-ui').style.display=(c==='cpu-scheduling')?'block':'none'; $('#producer-consumer-ui').style.display=(c==='producer-consumer')?'block':'none'; $('#bankers-algorithm-ui').style.display=(c==='bankers-algorithm')?'block':'none'; $('#process-list-container').style.display=(c==='cpu-scheduling')?'block':'none'; if(c==='cpu-scheduling'){ App.anim.resetCpu(false); } else if(c==='producer-consumer'){ window.resetPC(); App.draw.drawAll(); } else if(c==='bankers-algorithm'){ generateMatrices(); const br=document.querySelector('#bankers-result'); if(br) br.textContent=''; App.draw.drawAll(); } }

  function bindCpu(){ const alg=$('#algorithm'), at=$('#arrival-time'), bt=$('#burst-time'), pr=$('#priority-input'), add=$('#add-process'), st=$('#start-animation'), ps=$('#pause-animation'), rs=$('#reset-animation'), tqWrap=$('#time-quantum-input'), tq=$('#time-quantum'); alg.addEventListener('change',()=>{ const rr=alg.value==='rr', prio=alg.value==='priority'; tqWrap.style.display=rr?'block':'none'; pr.style.display=prio?'inline-block':'none'; S.algorithm=alg.value; updateList(); }); add.addEventListener('click',()=>{ const avt=parseInt(at.value), bst=parseInt(bt.value), pv=parseInt(pr.value); if(isNaN(avt)||isNaN(bst)||bst<=0){ alert('Enter valid arrival and positive burst.'); return; } if(S.algorithm==='priority' && isNaN(pv)){ alert('Enter a valid priority.'); return; } S.processes.push({ id:S.processes.length+1, arrivalTime:avt, burstTime:bst, priority:isNaN(pv)?null:pv, remainingTime:bst, completionTime:0, waitingTime:0, turnaroundTime:0, state:'new' }); at.value=''; bt.value=''; pr.value=''; updateList(); }); st.addEventListener('click',()=>{ if(S.algorithm==='rr'){ const q=parseInt(tq.value); if(isNaN(q)||q<=0) return alert('Invalid time quantum'); S.timeQuantum=q; } App.anim.startCpu(); }); ps.addEventListener('click',App.anim.pause); rs.addEventListener('click',()=>{ // Full reset: stop, clear processes, reset timeline
    App.anim.pause(); App.anim.resetCpu(true); updateList(); }); }
  function updateList(){ const ul=$('#queue'); ul.innerHTML=''; S.processes.forEach(p=>{ const li=document.createElement('li'); let t=`P${p.id}: AT=${p.arrivalTime}, BT=${p.burstTime}`; if(p.priority!==null && S.algorithm==='priority') t+=`, Prio=${p.priority}`; li.textContent=t; li.style.borderLeft=`5px solid ${App.config.colors[(p.id-1)%App.config.colors.length]}`; ul.appendChild(li); }); }

  function bindPC(){ const buf=$('#buffer-size');
    function takePCSnapshot(){ return { buffer:[...S.buffer], bufferSize:S.bufferSize, empty:S.empty, full:S.full, mutex:S.mutex, producer:{state:S.producer.state, progress:S.producer.progress}, consumer:{state:S.consumer.state, progress:S.consumer.progress} }; }
    $('#pc-start')?.addEventListener('click',()=>{ window.resetPC(); S.runningAnim=true; const step=()=>{ if(!S.runningAnim) return; App.algo.producerConsumerStep(); App.draw.drawAll(); S.timeline.push(takePCSnapshot()); if(S.live){ S.timelineIndex=S.timeline.length-1; } App.anim.updateTimelineUI(); requestAnimationFrame(step); }; step(); }); $('#pc-pause')?.addEventListener('click',()=>{ S.runningAnim=false; }); $('#pc-reset')?.addEventListener('click',()=>{ S.runningAnim=false; window.resetPC(); App.draw.drawAll(); }); window.resetPC=function(){ S.bufferSize=parseInt(buf.value)||5; S.buffer=[]; S.empty=S.bufferSize; S.full=0; S.mutex=1; S.producer.state='idle'; S.producer.progress=0; S.consumer.state='idle'; S.consumer.progress=0; S.timeline=[]; S.timelineIndex=0; App.anim.updateTimelineUI(); } }

  function bindBankers(){
    const matricesEl = document.querySelector('#bankers-matrices');
    const resultEl = document.querySelector('#bankers-result');
    const checkBtn = document.querySelector('#check-safe-state');
    const playBtn = document.querySelector('#bankers-play');
    const pauseBtn = document.querySelector('#bankers-pause');
    const stepBtn = document.querySelector('#bankers-step');
    const resetBtn = document.querySelector('#bankers-reset');
    const speedSel = document.querySelector('#bankers-speed');
    function updateFromInputs(){ const B=S.bankers; B.allocation=readM('alloc',B.nProc,B.nRes); B.max=readM('max',B.nProc,B.nRes); B.available=readV('avail',B.nRes); App.algo.computeNeed(); validateBankers(); }
    function clearResult(){ if(resultEl) resultEl.textContent=''; }
    function showResult(){ const B=S.bankers; if(!resultEl||!B.result) return; resultEl.textContent = B.result.safe ? ('Safe State: < '+B.result.sequence.join(', ')+' >') : 'Unsafe State: No safe sequence.'; setControlsEnabled(!!B.result?.safe); App.anim.updateBankersMeta(); }
    function setInvalid(el, invalid){ if(!el) return; if(invalid) el.classList.add('invalid'); else el.classList.remove('invalid'); }
    function validateBankers(){ const B=S.bankers; let ok=true; for(let i=0;i<B.nProc;i++){ for(let j=0;j<B.nRes;j++){ const aEl=document.getElementById(`alloc-${i}-${j}`); const mEl=document.getElementById(`max-${i}-${j}`); const a=parseInt(aEl?.value)||0; const m=parseInt(mEl?.value)||0; const bad=a>m; setInvalid(aEl,bad); setInvalid(mEl,bad); if(bad) ok=false; } } if(checkBtn) checkBtn.disabled=!ok; if(!ok && resultEl){ resultEl.textContent='Fix highlighted cells: Allocation must be ≤ Max.'; } return ok; }
    function fillExample(){ const np=5,nr=3; document.getElementById('num-processes').value=String(np); document.getElementById('num-resources').value=String(nr); generateMatrices(); const A=[[0,1,0],[2,0,0],[3,0,2],[2,1,1],[0,0,2]]; const M=[[7,5,3],[3,2,2],[9,0,2],[2,2,2],[4,3,3]]; const V=[3,3,2]; for(let i=0;i<np;i++){ for(let j=0;j<nr;j++){ document.getElementById(`alloc-${i}-${j}`).value=String(A[i][j]); document.getElementById(`max-${i}-${j}`).value=String(M[i][j]); } } for(let j=0;j<nr;j++){ document.getElementById(`avail-${j}`).value=String(V[j]); } updateFromInputs(); App.draw.drawAll(); clearResult(); setControlsEnabled(false); App.anim.updateBankersMeta(); }
    function clearInputs(){ const B=S.bankers; for(let i=0;i<B.nProc;i++){ for(let j=0;j<B.nRes;j++){ document.getElementById(`alloc-${i}-${j}`).value='0'; document.getElementById(`max-${i}-${j}`).value='0'; } } for(let j=0;j<B.nRes;j++){ document.getElementById(`avail-${j}`).value='0'; } updateFromInputs(); App.draw.drawAll(); clearResult(); }

    document.querySelector('#generate-matrices')?.addEventListener('click', ()=>{ generateMatrices(); App.draw.drawAll(); clearResult(); setControlsEnabled(false); App.anim.updateBankersMeta(); });
    matricesEl?.addEventListener('input', ()=>{ updateFromInputs(); App.draw.drawAll(); clearResult(); setControlsEnabled(false); App.anim.updateBankersMeta(); });
    document.querySelector('#check-safe-state')?.addEventListener('click', ()=>{ if(!validateBankers()) return; updateFromInputs(); App.algo.checkSafeState(); App.draw.drawAll(); showResult(); if(S.bankers.result && S.bankers.result.safe){ App.anim.resetBankers(); App.anim.startBankers(); } });
    document.querySelector('#load-example')?.addEventListener('click', fillExample);
    document.querySelector('#clear-inputs')?.addEventListener('click', clearInputs);
    function setControlsEnabled(enabled){ [playBtn, pauseBtn, stepBtn, resetBtn, speedSel].forEach(el=>{ if(el) el.disabled=!enabled; }); }
    setControlsEnabled(false);
    playBtn?.addEventListener('click', ()=>App.anim.startBankers());
    pauseBtn?.addEventListener('click', ()=>App.anim.pauseBankers());
    stepBtn?.addEventListener('click', ()=>App.anim.stepBankers());
    resetBtn?.addEventListener('click', ()=>App.anim.resetBankers());
    speedSel?.addEventListener('change', (e)=>{ const v=parseInt(e.target.value)||400; S.bankers.anim.speedMs=v; });
  }
  function generateMatrices(){ const B=S.bankers, np=parseInt($('#num-processes').value)||5, nr=parseInt($('#num-resources').value)||3; B.nProc=np; B.nRes=nr; $('#allocation-matrix').innerHTML=matrix('alloc',np,nr); $('#max-matrix').innerHTML=matrix('max',np,nr); $('#available-vector').innerHTML=vector('avail',nr); B.allocation=readM('alloc',np,nr); B.max=readM('max',np,nr); B.available=readV('avail',nr); App.algo.computeNeed(); validateBankers(); }
  function matrix(id,r,c){ let h='<table class="matrix"><thead><tr><th></th>'; for(let j=0;j<c;j++){ h+=`<th>R${j}</th>`; } h+='</tr></thead><tbody>'; for(let i=0;i<r;i++){ h+=`<tr><th>P${i}</th>`; for(let j=0;j<c;j++){ const ph=(id==='alloc'?'Allocation':'Max')+`[P${i},R${j}]`; h+=`<td><input type=\"number\" id=\"${id}-${i}-${j}\" value=\"0\" min=\"0\" placeholder=\"0\" title=\"${ph}\"></td>`; } h+='</tr>'; } return h+'</tbody></table>'; }
  function vector(id,c){ let h='<table class="matrix"><thead><tr>'; for(let i=0;i<c;i++){ h+=`<th>R${i}</th>`; } h+='</tr></thead><tbody><tr>'; for(let i=0;i<c;i++){ h+=`<td><input type=\"number\" id=\"${id}-${i}\" value=\"0\" min=\"0\" placeholder=\"0\" title=\"Available R${i}\"></td>`; } return h+'</tr></tbody></table>'; }
  function readM(id,r,c){ const m=[]; for(let i=0;i<r;i++){ const row=[]; for(let j=0;j<c;j++){ row.push(parseInt(document.getElementById(`${id}-${i}-${j}`).value)||0);} m.push(row);} return m; }
  function readV(id,c){ const v=[]; for(let i=0;i<c;i++){ v.push(parseInt(document.getElementById(`${id}-${i}`).value)||0);} return v; }

  function bindTimeline(){ const s=$('#timeline-slider'), f=$('#follow-live'); s.addEventListener('input',()=>{ S.live=false; S.timelineIndex=parseInt(s.value)||0; App.anim.jumpTo(S.timelineIndex); App.anim.updateTimelineUI(); }); f.addEventListener('change',()=>{ S.live=f.checked; if(S.live){ App.anim.updateTimelineUI(); } }); }
})();
