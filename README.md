# Interactive 8-Puzzle Problem Solver using AI Search Algorithms
**Case Study Focus: Depth First Search (DFS)**

> **Artificial Intelligence Digital Assignment (Case Study)**  
> **Course:** Artificial Intelligence  
> **Student Name:** Shubh Vijayvargiya  
> **Registration Number:** 24BCT0046  
> **Assigned Algorithm:** Algorithm #2 — Depth First Search (DFS)  
> **GitHub Pages Live Demo:** [https://shubhvijayvargiya.github.io/AI-8Puzzle-Visualizer/](https://shubhvijayvargiya.github.io/AI-8Puzzle-Visualizer/)  
> **GitHub Repository:** [https://github.com/shubhvijayvargiya/AI-8Puzzle-Visualizer](https://github.com/shubhvijayvargiya/AI-8Puzzle-Visualizer)

---

## 📋 Project Description

This project is an interactive, web-based state-space search visualizer for the classic **8-Puzzle Problem**. Developed from scratch using vanilla JavaScript (ES6), HTML5, and Tailwind CSS, it models the 3×3 sliding tile puzzle as an AI state-space search graph and provides real-time visual demonstration of how uninformed and informed search algorithms explore the state space.

As assigned by registration number **24BCT0046**, this project features a specialized implementation and in-depth case study on **Depth First Search (DFS)**, while additionally implementing **BFS, DLS, IDDLS, GBFS, and A\*** to facilitate comprehensive performance benchmarking.

---

## 👤 Student Details

| Attribute | Details |
| :--- | :--- |
| **Student Name** | Shubh Vijayvargiya |
| **Registration Number** | 24BCT0046 |
| **Course Name** | Artificial Intelligence |
| **Assignment Title** | Artificial Intelligence Digital Assignment (Case Study) |
| **Assigned Algorithm** | **#2 Depth First Search (DFS)** (as listed in document assignment roster) |


---

## 🚀 Key Features

1. **Assigned Algorithm Showcase: Depth First Search (DFS)**
   - LIFO (Last-In First-Out) Stack frontier visualization.
   - Graph-search cycle elimination to prevent infinite loops in cyclic 8-puzzle state graphs.
   - Configurable search depth cutoff and expansion safety guards.
   - Real-time display of current expanded node, depth, generated states, and execution time.

2. **Dual Puzzle Input Methods**
   - **Method 1 (User Custom Input & Presets):** Allows manual entry of initial and goal 3×3 matrices or selection of standardized assignment presets.
   - **Method 2 (Generate Random Solvable Puzzle):** Generates reachable, mathematically solvable configurations using controlled random walks from the goal.
   - **Solvability Validation:** Automatic inversion parity check ($countInversions(S_{init}) \equiv countInversions(S_{goal}) \pmod 2$).

3. **Real-Time Search & Solution Visualization**
   - Animated blank-tile movements with smooth sliding transitions.
   - Successor generation preview displaying all valid branch moves (UP, DOWN, LEFT, RIGHT).
   - Dynamic Frontier (Open List) preview showing stack/queue cards.
   - Step scrubber with full interactive controls: **Run, Pause, Resume, Next Step, Previous Step, Reset, and Speed Slider**.

4. **Multi-Algorithm Benchmark & Comparison**
   - One-click benchmark comparing all six algorithms on the identical puzzle instance:
     - Breadth First Search (BFS)
     - Depth First Search (DFS)
     - Depth Limited Search (DLS)
     - Iterative Deepening Search (IDDLS)
     - Greedy Best First Search (GBFS)
     - A\* Search
   - Real-time comparative metrics: Solution Found, Nodes Expanded, Moves, Execution Time (ms), and Memory Rating.

5. **Heuristic Evaluation**
   - Misplaced Tiles ($h_1$)
   - Manhattan Distance ($h_2$)

---

## 🛠️ Technologies Used

- **Markup & Layout:** HTML5
- **Styling:** CSS3, Tailwind CSS (via CDN)
- **Programming Language:** JavaScript (ES6+ Vanilla, modular architecture)
- **Deployment:** GitHub Pages (Static hosting)
- **Design System:** Dark glassmorphism, responsive mobile/desktop UI

---

## 📊 Implemented Search Algorithms

### 1. Depth First Search (DFS) — *Assigned to Shubh Vijayvargiya (24BCT0046)*
- **Frontier:** LIFO Stack
- **Time Complexity:** $O(b^m)$
- **Space Complexity:** $O(b \cdot m)$ (Linear memory advantage)
- **Completeness:** Complete in finite state spaces with visited hash set.
- **Optimality:** Non-optimal (returns first path reached).

### 2. Breadth First Search (BFS)
- **Frontier:** FIFO Queue
- **Time Complexity:** $O(b^d)$
- **Space Complexity:** $O(b^d)$ (Exponential memory footprint)
- **Completeness:** Complete
- **Optimality:** Optimal for unit edge costs.

### 3. Depth Limited Search (DLS)
- **Frontier:** LIFO Stack with depth limit cutoff $l$.
- **Time Complexity:** $O(b^l)$
- **Space Complexity:** $O(b \cdot l)$

### 4. Iterative Deepening Search (IDDLS)
- Repeatedly calls DLS with limits $0, 1, 2, \dots$
- Combines the space efficiency of DFS ($O(bd)$) with the optimality of BFS.

### 5. Greedy Best First Search (GBFS)
- Priority Queue evaluating $f(n) = h(n)$ using Manhattan or Misplaced Tiles.

### 6. A\* Search
- Priority Queue evaluating $f(n) = g(n) + h(n)$. Guaranteed optimal when $h(n)$ is admissible.

---

## 📐 Heuristics Used

1. **Misplaced Tiles ($h_1$):**
   $$h_1(n) = \sum_{i=1}^{8} [s_i \neq g_i \land s_i \neq 0]$$
2. **Manhattan Distance ($h_2$):**
   $$h_2(n) = \sum_{i=1}^{8} \left( |row(s_i) - row(g_i)| + |col(s_i) - col(g_i)| \right)$$
   *Note: Manhattan distance is admissible and dominates misplaced tiles ($h_2(n) \ge h_1(n)$).*

---

## 📁 Repository Structure

```text
AI-8Puzzle-Visualizer/
│── index.html          # Main Single-Page Application (Visualizer, Comparison, Theory)
│── css/
│   └── style.css       # Custom styles, animations, glowing tiles, responsive rules
│── js/
│   ├── puzzle.js       # Puzzle state representation, solvability parity, moves, heuristics
│   ├── algorithms.js   # From-scratch implementations of DFS, BFS, DLS, IDDLS, GBFS, A*
│   ├── visualizer.js   # Step playback engine, scrubber, speed controls, animation timer
│   └── ui.js           # UI event listeners, modal handlers, benchmark runner
│── assets/             # Icons and media resources
│── images/             # Application screenshots for report
│── docs/
│   └── case-study.md   # Comprehensive theoretical case study report
└── README.md           # Master project documentation
```

---

## 💻 How to Run the Project

### Option 1: Live Demo (No installation required)
Open the deployed GitHub Pages URL directly in any modern browser:
[https://shubhvijayvargiya.github.io/AI-8Puzzle-Visualizer/](https://shubhvijayvargiya.github.io/AI-8Puzzle-Visualizer/)

### Option 2: Run Locally
1. Clone the repository:
   ```bash
   git clone https://github.com/shubhvijayvargiya/AI-8Puzzle-Visualizer.git
   cd AI-8Puzzle-Visualizer
   ```
2. Open `index.html` in your web browser (double-click the file or use VS Code Live Server).
3. Alternatively, serve via simple Python or Node HTTP server:
   ```bash
   # Using Python 3
   python -m http.server 8000
   # Open http://localhost:8000 in your browser
   ```

---



## 📚 References

1. Russell, S. J., & Norvig, P. (2020). *Artificial Intelligence: A Modern Approach* (4th ed.). Pearson. Chapter 3: Solving Problems by Searching.
2. Korf, R. E. (1985). *Depth-first iterative-deepening: An optimal admissible tree search*. Artificial Intelligence, 27(1), 97-109.
3. Johnson, W. W., & Story, W. E. (1879). *Notes on the "15" Puzzle*. American Journal of Mathematics, 2(4), 397-404. (Mathematical proof of inversion parity and solvability).

---
*Developed by Shubh Vijayvargiya (24BCT0046) for Artificial Intelligence Digital Assignment (Case Study).*
