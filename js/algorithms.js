(function(){
  const App = window.App = window.App || {}; const S = App.state;
  App.algo = App.algo || {};

  function startIfIdleFrom(q){ if(!S.running && q.length>0){ S.running=q.shift(); S.running.state='running'; } }
  function completeIfFinished(){ if(S.running && S.running.remainingTime===0){ S.running.state='completed'; S.running.completionTime=S.currentTime+1; S.completed.push(S.running); S.running=null; S.currentSlice=0; } }
  function executeTick(){ if(S.running){ S.gantt.push({processId:S.running.id}); S.running.remainingTime--; completeIfFinished(); } else { S.gantt.push({processId:null}); } }

  App.algo.fcfsStep=function(){ if(!S.running && S.readyQueue.length>0){ S.readyQueue.sort((a,b)=>a.arrivalTime-b.arrivalTime); startIfIdleFrom(S.readyQueue);} executeTick(); };
  App.algo.sjfStep=function(){ if(!S.running && S.readyQueue.length>0){ S.readyQueue.sort((a,b)=>a.burstTime-b.burstTime); startIfIdleFrom(S.readyQueue);} executeTick(); };
  App.algo.priorityStep=function(){ if(!S.running && S.readyQueue.length>0){ S.readyQueue.sort((a,b)=>a.priority-b.priority); startIfIdleFrom(S.readyQueue);} executeTick(); };
  App.algo.rrStep=function(){ if(!S.running && S.readyQueue.length>0){ startIfIdleFrom(S.readyQueue);} if(S.running){ S.gantt.push({processId:S.running.id}); S.running.remainingTime--; S.currentSlice++; if(S.running.remainingTime===0){ completeIfFinished(); } else if(S.currentSlice===S.timeQuantum){ S.running.state='ready'; S.readyQueue.push(S.running); S.running=null; S.currentSlice=0; } } else { S.gantt.push({processId:null}); } };

  App.algo.producerConsumerStep=function(){
    if(Math.random()>0.5){ if(S.producer.state==='idle'){ S.producer.state=(S.empty>0)?'producing':'sleeping'; S.producer.progress=0; }}
    else { if(S.consumer.state==='idle'){ S.consumer.state=(S.full>0)?'consuming':'sleeping'; S.consumer.progress=0; }}
    if(S.producer.state==='producing'){ S.producer.progress+=5; if(S.producer.progress>=100 && S.mutex===1){ S.mutex=0; S.empty--; S.buffer.push({id:Date.now()}); S.full++; S.mutex=1; S.producer.state='idle'; }}
    if(S.consumer.state==='consuming'){ S.consumer.progress+=5; if(S.consumer.progress>=100 && S.mutex===1){ S.mutex=0; S.full--; S.buffer.shift(); S.empty++; S.mutex=1; S.consumer.state='idle'; }}
  };

  App.algo.computeNeed=function(){ const B=S.bankers; B.need=Array(B.nProc).fill(0).map((_,i)=>Array(B.nRes).fill(0).map((_,j)=>B.max[i][j]-B.allocation[i][j])); };
  App.algo.checkSafeState=function(){ const B=S.bankers; App.algo.computeNeed(); let work=B.available.slice(); let finish=Array(B.nProc).fill(false); const seq=[]; let count=0; while(count<B.nProc){ let found=false; for(let i=0;i<B.nProc;i++){ if(!finish[i]){ let can=true; for(let j=0;j<B.nRes;j++){ if(B.need[i][j]>work[j]){ can=false; break; } } if(can){ for(let j=0;j<B.nRes;j++){ work[j]+=B.allocation[i][j]; } finish[i]=true; seq.push(i); found=true; count++; } } } if(!found){ B.result={safe:false,sequence:null}; return B.result; } } B.result={safe:true,sequence:seq}; return B.result; };
})();
