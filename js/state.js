(function () {
  window.App = window.App || {};
  const App = window.App;

  App.config = {
    colors: ['#7b61ff', '#ff4d6d', '#2ee6a6', '#ffd166', '#e056fd', '#58a6ff', '#00d4ff', '#ff9f1c'],
    tickMs: 300,
  };

  App.state = {
    concept: 'cpu-scheduling',
    canvas: null, ctx: null, width: 0, height: 0,
    // CPU Scheduling
    processes: [], currentTime: 0, readyQueue: [], running: null, completed: [], gantt: [], timeQuantum: 2, currentSlice: 0, algorithm: 'fcfs',
    // Producer-Consumer
    buffer: [], bufferSize: 5, producer: { state: 'idle', progress: 0 }, consumer: { state: 'idle', progress: 0 }, empty: 5, full: 0, mutex: 1,
    // Banker's
    bankers: { nProc: 5, nRes: 3, allocation: null, max: null, available: null, need: null, result: null },
    // Timeline
    timeline: [], live: true, timelineIndex: 0,
    // Animation
    runningAnim: false, rafId: 0,
  };

  App.snapshot = function () {
    const s = App.state;
    return { currentTime: s.currentTime, ready: s.readyQueue.map(p=>p.id), running: s.running? s.running.id: null, completed: s.completed.map(p=>p.id), ganttLen: s.gantt.length };
  };
})();
