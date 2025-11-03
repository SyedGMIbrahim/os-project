# One-Page Execution Guide

## Setup
- Open index.html in Chrome 90+, Edge 90+, Firefox 88+, or Safari 14+.
- Optionally serve via: python3 -m http.server

## UI Guide
- Concept selector for CPU Scheduling, Producer–Consumer, Banker’s Algorithm
- CPU: choose algorithm, add processes, start/pause/reset, view stats and scrub timeline
- PC: set buffer size, start/pause/reset to see producing/consuming
- Banker’s: set sizes, generate matrices, input values, check safe state

## Animation Features
- Smooth ~300ms steps (config in js/state.js: tickMs)
- Color-coded processes/resources and idle markers
- Interactive timeline slider + “Follow live”
- Real-time stats: avg waiting, avg turnaround, completed/total, time

## Browser Requirements
- JS and Canvas enabled; latest browsers recommended.
