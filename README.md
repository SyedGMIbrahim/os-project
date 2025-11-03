# OS Concepts Visualization Tool

An interactive, web-based animation and simulation tool that visualizes core operating system concepts. This standalone application runs entirely in the browser with no server dependencies, allowing users to input parameters and observe real-time algorithmic behavior through animated demonstrations.

## Features

The tool provides visualizations for three major OS concepts:

### 1. CPU Scheduling Algorithms

Visualize and compare the performance of various CPU scheduling algorithms. 

- **Algorithms Implemented:**
  - First-Come, First-Served (FCFS)
  - Shortest Job First (SJF) (Non-Preemptive)
  - Round Robin (RR)
  - Priority (Non-Preemptive)

- **Interactive Elements:**
  - Add custom processes with specific arrival times, burst times, and priority levels.
  - A dynamic Gantt chart illustrates the execution sequence of processes over time.
  - Real-time visualization of process states as they move between the Ready, Running (CPU), and Completed queues.
  - Automatic calculation and display of performance metrics, including Average Waiting Time and Average Turnaround Time.

### 2. Process Synchronization (Producer-Consumer Problem)

Observe a classic concurrency problem with a visualization of the Producer-Consumer scenario.

- **Simulation Components:**
  - A **Producer** agent that creates items.
  - A **Consumer** agent that consumes items.
  - A shared, fixed-size **Buffer** that holds the items.

- **Visualization:**
  - Watch the Producer and Consumer work concurrently.
  - The Producer will enter a "Sleeping" state when the buffer is full.
  - The Consumer will enter a "Sleeping" state when the buffer is empty.
  - The state of the buffer (number of items) is displayed in real-time.

### 3. Deadlock Avoidance (Banker's Algorithm)

Explore how deadlocks can be avoided by using the Banker's Algorithm to determine if a system is in a "safe state."

- **Interactive Matrices:**
  - Set the number of processes and resource types.
  - Input the **Allocation** matrix (resources currently held by each process).
  - Input the **Max** matrix (maximum resources required by each process).
  - Input the **Available** vector (currently available resources in the system).

- **Safety Check:**
  - The tool calculates the **Need** matrix based on your inputs.
  - It runs the safety algorithm to determine if a safe execution sequence exists.
  - The result is displayed on the canvas, showing either the **Safe Sequence** or an "Unsafe State" message.

## Technology Stack

- **Frontend:** HTML5, CSS3, JavaScript (ES6+)
- **Graphics:** HTML5 Canvas API for all animations and visualizations.
- **Dependencies:** None. The application is completely client-side and requires no build step or external libraries.

## How to Use

1.  Clone or download the project files.
2.  Open the `index.html` file in any modern web browser (e.g., Chrome, Firefox, Edge).
3.  Use the **"Choose Concept"** dropdown at the top left to select the visualization you want to see.
4.  Follow the on-screen controls for each concept to input data and run the simulation.

## File Structure

- `index.html`: The main HTML file containing the structure of the web application.
- `style.css`: The stylesheet responsible for all visual aspects and styling.
- `script.js`: The core JavaScript file containing all application logic, including the simulation algorithms and canvas drawing functions.