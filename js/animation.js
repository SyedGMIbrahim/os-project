(function(){
  const App = window.App = window.App || {}; const S = App.state;
  App.anim = App.anim || {};
  let cpuTimer=null;

  function resizeCanvas(){ S.canvas.width=S.canvas.parentElement.clientWidth; const t=document.getElementById('timeline-controls'); const th=t? t.offsetHeight:0; S.canvas.height=S.canvas.parentElement.clientHeight - th; S.width=S.canvas.width; S.height=S.canvas.height; App.draw.drawAll(); }
  App.anim.init=function(){ S.canvas=document.getElementById('canvas'); S.ctx=S.canvas.getContext('2d'); window.addEventListener('resize', resizeCanvas); resizeCanvas(); };

  App.anim.resetCpu=function(clear=false){ S.currentTime=0; S.readyQueue=[]; S.running=null; S.completed=[]; S.gantt=[]; S.currentSlice=0; if(clear) S.processes=[]; S.processes.forEach(p=>{ p.remainingTime=p.burstTime; p.state='new'; p.completionTime=0; }); S.timeline=[]; S.timelineIndex=0; updateTimelineUI(); App.draw.drawAll(); };
  App.anim.startCpu=function(){ if(S.processes.length===0) return; S.processes.sort((a,b)=>a.arrivalTime-b.arrivalTime); App.anim.resetCpu(false); S.runningAnim=true; tickCpu(); };
  App.anim.pause=function(){ S.runningAnim=false; if(cpuTimer){ clearTimeout(cpuTimer); cpuTimer=null; } };
  App.anim.jumpTo=function(idx){ App.anim.resetCpu(false); const maxSteps=Math.min(idx,10000); for(let t=0;t<maxSteps;t++){ arrivalCheck(); step(); S.currentTime++; S.timeline.push(App.snapshot()); } S.timelineIndex=idx; updateStats(); App.draw.drawAll(); };

  function tickCpu(){ if(!S.runningAnim) return; arrivalCheck(); step(); App.draw.drawAll(); if(S.completed.length===S.processes.length){ S.runningAnim=false; updateStats(); return;} S.currentTime++; S.timeline.push(App.snapshot()); S.timelineIndex=S.timeline.length-1; updateTimelineUI(); updateStats(); cpuTimer=setTimeout(()=>requestAnimationFrame(tickCpu), App.config.tickMs); }
  function arrivalCheck(){ S.processes.forEach(p=>{ if(p.arrivalTime===S.currentTime && p.state==='new'){ p.state='ready'; S.readyQueue.push(p); } }); }
  function step(){ if(S.algorithm==='fcfs') App.algo.fcfsStep(); else if(S.algorithm==='sjf') App.algo.sjfStep(); else if(S.algorithm==='rr') App.algo.rrStep(); else if(S.algorithm==='priority') App.algo.priorityStep(); }

  function updateStats(){ let tw=0, tt=0; S.processes.forEach(p=>{ const ct=p.completionTime||S.currentTime; const tat=ct-p.arrivalTime; const wt=tat-p.burstTime; if(!isNaN(wt)) tw+=wt; if(!isNaN(tat)) tt+=tat; }); const avgW=S.processes.length?tw/S.processes.length:0; const avgT=S.processes.length?tt/S.processes.length:0; const g=id=>document.getElementById(id); g('stat-avg-wait')&&(g('stat-avg-wait').textContent=avgW.toFixed(2)); g('stat-avg-ta')&&(g('stat-avg-ta').textContent=avgT.toFixed(2)); g('stat-completed')&&(g('stat-completed').textContent=S.completed.length+'/'+S.processes.length); g('stat-time')&&(g('stat-time').textContent=S.currentTime); }
  function updateTimelineUI(){ const s=document.getElementById('timeline-slider'); const l=document.getElementById('timeline-label'); if(!s||!l) return; s.max=String(Math.max(0,S.timeline.length-1)); s.value=String(S.live? (S.timeline.length-1): (S.timelineIndex||0)); l.textContent='t='+(S.live? S.timeline.length-1: S.timelineIndex); }
  App.anim.updateTimelineUI=updateTimelineUI;
})();
