(function(){
  const App = window.App = window.App || {}; const S = App.state;
  App.anim = App.anim || {};
  let cpuTimer=null;
  let bankersTimer=null;

  function resizeCanvas(){ S.canvas.width=S.canvas.parentElement.clientWidth; const t=document.getElementById('timeline-controls'); const th=t? t.offsetHeight:0; S.canvas.height=S.canvas.parentElement.clientHeight - th; S.width=S.canvas.width; S.height=S.canvas.height; App.draw.drawAll(); }
  App.anim.init=function(){ S.canvas=document.getElementById('canvas'); S.ctx=S.canvas.getContext('2d'); window.addEventListener('resize', resizeCanvas); resizeCanvas(); };

  // --- Banker's animation helpers ---
  function takeBankersSnapshot(){ const B=S.bankers; return { bankers: { nProc:B.nProc, nRes:B.nRes, allocation:B.allocation?B.allocation.map(r=>r.slice()):null, max:B.max?B.max.map(r=>r.slice()):null, available:B.available?B.available.slice():null, need:B.need?B.need.map(r=>r.slice()):null, result:B.result?{safe:B.result.safe, sequence:B.result.sequence?B.result.sequence.slice():null}:null, anim:{ playing:B.anim.playing, idx:B.anim.idx } } }; }
  function restoreBankersSnapshot(snap){ if(!snap||!snap.bankers) return; const b=snap.bankers; const B=S.bankers; B.nProc=b.nProc; B.nRes=b.nRes; B.allocation=b.allocation?b.allocation.map(r=>r.slice()):null; B.max=b.max?b.max.map(r=>r.slice()):null; B.available=b.available?b.available.slice():null; B.need=b.need?b.need.map(r=>r.slice()):null; B.result=b.result?{safe:b.result.safe, sequence:b.result.sequence?b.result.sequence.slice():null}:null; B.anim={ playing:b.anim.playing, idx:b.anim.idx }; }

  App.anim.startBankers=function(){ const B=S.bankers; if(!B.result||!B.result.safe||!Array.isArray(B.result.sequence)) return; App.anim.pauseBankers(); B.anim.playing=true; B.anim.idx=0; // seed timeline with initial state
    S.timeline=[]; S.timelineIndex=0; S.timeline.push(takeBankersSnapshot()); updateTimelineUI(); updateBankersMeta(); App.draw.drawAll(); bankTick(); };
  App.anim.pauseBankers=function(){ if(bankersTimer){ clearTimeout(bankersTimer); bankersTimer=null; } S.bankers.anim.playing=false; updateBankersMeta(); };
  App.anim.resetBankers=function(){ if(bankersTimer){ clearTimeout(bankersTimer); bankersTimer=null; } const B=S.bankers; B.anim.playing=false; B.anim.idx=0; S.timeline=[]; S.timelineIndex=0; if(B.result && B.result.safe){ S.timeline.push(takeBankersSnapshot()); } updateTimelineUI(); updateBankersMeta(); App.draw.drawAll(); };
  App.anim.stepBankers=function(){ const B=S.bankers; if(!B.result||!B.result.safe) return; if(bankersTimer){ clearTimeout(bankersTimer); bankersTimer=null; } B.anim.playing=false; if(B.anim.idx < B.result.sequence.length){ B.anim.idx++; App.draw.drawAll(); S.timeline.push(takeBankersSnapshot()); if(S.live){ S.timelineIndex=S.timeline.length-1; } updateTimelineUI(); updateBankersMeta(); } };
  function bankTick(){ const B=S.bankers; if(!B.anim.playing) return; const seq=B.result.sequence||[]; if(B.anim.idx<seq.length){ B.anim.idx++; App.draw.drawAll(); S.timeline.push(takeBankersSnapshot()); if(S.live){ S.timelineIndex=S.timeline.length-1; } updateTimelineUI(); updateBankersMeta(); bankersTimer=setTimeout(()=>requestAnimationFrame(bankTick), B.anim.speedMs||App.config.tickMs); } else { B.anim.playing=false; updateBankersMeta(); updateTimelineUI(); } }
  function updateBankersMeta(){ const lbl=document.getElementById('bankers-step-label'); if(!lbl) return; const B=S.bankers; const n=(B.result&&B.result.safe&&Array.isArray(B.result.sequence))? B.result.sequence.length: 0; const k=Math.min(B.anim.idx, n); lbl.textContent = n? (`Step ${k} / ${n}`): ''; }
  App.anim.updateBankersMeta=updateBankersMeta;

  App.anim.resetCpu=function(clear=false){ S.currentTime=0; S.readyQueue=[]; S.running=null; S.completed=[]; S.gantt=[]; S.currentSlice=0; if(clear) S.processes=[]; S.processes.forEach(p=>{ p.remainingTime=p.burstTime; p.state='new'; p.completionTime=0; }); S.timeline=[]; S.timelineIndex=0; updateTimelineUI(); App.draw.drawAll(); };
  App.anim.startCpu=function(){ if(S.processes.length===0) return; S.processes.sort((a,b)=>a.arrivalTime-b.arrivalTime); App.anim.resetCpu(false); S.runningAnim=true; tickCpu(); };
  App.anim.pause=function(){ S.runningAnim=false; if(cpuTimer){ clearTimeout(cpuTimer); cpuTimer=null; } };
  App.anim.jumpTo=function(idx){
    if(S.concept==='cpu-scheduling'){
      App.anim.resetCpu(false);
      const maxSteps=Math.min(idx,10000);
      for(let t=0;t<maxSteps;t++){ arrivalCheck(); step(); S.currentTime++; S.timeline.push(App.snapshot()); }
      S.timelineIndex=idx; updateStats(); App.draw.drawAll();
      return;
    }
    if(S.concept==='producer-consumer'){
      if(!S.timeline.length) return;
      const i=Math.min(idx, S.timeline.length-1);
      const snap=S.timeline[i];
      if(!snap) return;
      // Restore PC snapshot
      S.bufferSize = snap.bufferSize;
      S.buffer = Array.isArray(snap.buffer) ? [...snap.buffer] : [];
      S.empty = snap.empty; S.full = snap.full; S.mutex = snap.mutex;
      S.producer.state = snap.producer.state; S.producer.progress = snap.producer.progress;
      S.consumer.state = snap.consumer.state; S.consumer.progress = snap.consumer.progress;
      S.timelineIndex=i; App.draw.drawAll();
      return;
    }
    if(S.concept==='bankers-algorithm'){
      if(!S.timeline.length) return;
      const i=Math.min(idx, S.timeline.length-1);
      const snap=S.timeline[i];
      restoreBankersSnapshot(snap);
      S.timelineIndex=i; App.draw.drawAll();
      return;
    }
  };

  function tickCpu(){ if(!S.runningAnim) return; arrivalCheck(); step(); App.draw.drawAll(); if(S.completed.length===S.processes.length){ S.runningAnim=false; updateStats(); return;} S.currentTime++; S.timeline.push(App.snapshot()); S.timelineIndex=S.timeline.length-1; updateTimelineUI(); updateStats(); cpuTimer=setTimeout(()=>requestAnimationFrame(tickCpu), App.config.tickMs); }
  function arrivalCheck(){ S.processes.forEach(p=>{ if(p.arrivalTime===S.currentTime && p.state==='new'){ p.state='ready'; S.readyQueue.push(p); } }); }
  function step(){ if(S.algorithm==='fcfs') App.algo.fcfsStep(); else if(S.algorithm==='sjf') App.algo.sjfStep(); else if(S.algorithm==='rr') App.algo.rrStep(); else if(S.algorithm==='priority') App.algo.priorityStep(); }

  function updateStats(){ let tw=0, tt=0; S.processes.forEach(p=>{ const ct=p.completionTime||S.currentTime; const tat=ct-p.arrivalTime; const wt=tat-p.burstTime; if(!isNaN(wt)) tw+=wt; if(!isNaN(tat)) tt+=tat; }); const avgW=S.processes.length?tw/S.processes.length:0; const avgT=S.processes.length?tt/S.processes.length:0; const g=id=>document.getElementById(id); g('stat-avg-wait')&&(g('stat-avg-wait').textContent=avgW.toFixed(2)); g('stat-avg-ta')&&(g('stat-avg-ta').textContent=avgT.toFixed(2)); g('stat-completed')&&(g('stat-completed').textContent=S.completed.length+'/'+S.processes.length); g('stat-time')&&(g('stat-time').textContent=S.currentTime); }
  function updateTimelineUI(){ const s=document.getElementById('timeline-slider'); const l=document.getElementById('timeline-label'); if(!s||!l) return; s.max=String(Math.max(0,S.timeline.length-1)); s.value=String(S.live? (S.timeline.length-1): (S.timelineIndex||0)); l.textContent='t='+(S.live? S.timeline.length-1: S.timelineIndex); }
  App.anim.updateTimelineUI=updateTimelineUI;
})();
