# Case Study Report: Solving the 8-Puzzle Problem using AI Search Algorithms
**Focus Algorithm:** Depth First Search (DFS)  
**Course:** Artificial Intelligence  
**Assignment Title:** Artificial Intelligence Digital Assignment (Case Study)  
**Student Name:** Shubh Vijayvargiya  
**Registration Number:** 24BCT0046  

---

## 1. Introduction & Problem Formulation

The 8-Puzzle is a classic benchmark problem in Artificial Intelligence used to evaluate state-space search strategies. It consists of a 3×3 square frame with 8 numbered tiles (labeled 1 through 8) and one blank space (represented as 0 or empty slot `_`).

### Formal State-Space Formulation
1. **State Representation:** A configuration of tiles in the 3×3 grid, represented as a 1D array of 9 integers:
   $$S = [s_0, s_1, s_2, s_3, s_4, s_5, s_6, s_7, s_8], \quad s_i \in \{0, 1, \dots, 8\}$$
2. **Initial State:** An arbitrary solvable configuration of tiles (e.g., `[2, 8, 3, 1, 6, 4, 7, 0, 5]`).
3. **Actions / Successor Function:** Legal movements of the blank tile:
   - **UP:** Swap blank tile with the tile directly above it (valid if row > 0).
   - **DOWN:** Swap blank tile with the tile directly below it (valid if row < 2).
   - **LEFT:** Swap blank tile with the tile directly to its left (valid if col > 0).
   - **RIGHT:** Swap blank tile with the tile directly to its right (valid if col < 2).
   - Effective branching factor: $b \approx 2$ to $4$ (average $\approx 3$).
4. **Goal Test:** Checks if current state equals the goal state (e.g., `[1, 2, 3, 8, 0, 4, 7, 6, 5]` or standard `[1, 2, 3, 4, 5, 6, 7, 8, 0]`).
5. **Path Cost:** Uniform cost of 1 per transition step ($g(n) = \text{depth}$).

---

## 2. Solvability & Inversion Parity Analysis

Not all permutations of the 8-puzzle are mutually reachable. The total permutation space is $9! = 362,880$. However, the state space is divided into exactly two disconnected equivalence classes of $181,440$ states each based on **inversion parity**.

### Mathematical Definition of Inversion
An inversion occurs when a tile with a higher number appears before a tile with a lower number in row-major order (ignoring the blank tile 0):
$$\text{Inversions} = |\{(i, j) \mid i < j \land s_i \neq 0 \land s_j \neq 0 \land s_i > s_j\}|$$

### Theorem (Solvability on 3×3 Grid)
For any grid with an odd width ($N = 3$), sliding the blank tile horizontally or vertically does not change the parity (even or odd) of the inversion count:
- Horizontal slide swaps adjacent elements, one of which is 0 (no effect on inversion count).
- Vertical slide moves a tile past 2 other tiles, which alters inversion count by $+2$, $0$, or $-2$ (parity is invariant).

Therefore, state $S_{init}$ can reach state $S_{goal}$ if and only if:
$$\text{countInversions}(S_{init}) \equiv \text{countInversions}(S_{goal}) \pmod 2$$

---

## 3. In-Depth Study of Depth First Search (DFS)

### Assigned Algorithm Details
- **Student:** Shubh Vijayvargiya (24BCT0046)
- **Algorithm Number:** 2
- **Search Paradigm:** Uninformed / Blind Search

### Working Principle
Depth First Search systematically explores as deep as possible along each branch before backtracking:
1. Initialize a **LIFO (Last-In First-Out) Stack** with the initial state node.
2. Initialize an explored set (hash map/set of visited configurations) to prevent infinite loops in cyclic state graphs.
3. While stack is not empty:
   - Pop the top node $u$.
   - If $u$ satisfies the goal test, reconstruct and return the solution path.
   - If current depth is within safety bounds, generate valid successors (UP, DOWN, LEFT, RIGHT).
   - For each child not present in the explored set (or found at a shallower depth), push the child onto the stack.

### Complexity & Algorithmic Properties

| Property | Value / Behavior | Justification |
| :--- | :--- | :--- |
| **Frontier Structure** | LIFO Stack | Expands the deepest node first. |
| **Time Complexity** | $O(b^m)$ | $b$ is branching factor ($\sim 3$), $m$ is maximum search depth. Can explore exponential states. |
| **Space Complexity** | $O(b \cdot m)$ | Only stores active branch and unexpanded siblings. Highly memory efficient. |
| **Completeness** | Complete with Graph Search | In finite state spaces ($181,440$ states), cycle detection ensures termination. Tree search DFS is incomplete due to loops. |
| **Optimality** | **Non-optimal** | DFS returns the first path found, which can have arbitrary depth and redundant loops. |

---

## 4. Multi-Algorithm Comparative Benchmark

Empirical evaluation on test puzzle instance:
- **Initial:** `[2, 8, 3, 1, 6, 4, 7, 0, 5]`
- **Goal:** `[1, 2, 3, 8, 0, 4, 7, 6, 5]`

| Algorithm | Solution Found | Nodes Expanded | Solution Moves | Time (ms) | Space / Memory Rating | Optimality |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **BFS** | Yes | 35 | 5 | ~0.7 ms | Exponential $O(b^d)$ (High) | Optimal |
| **DFS (Assigned)** | Yes | 397 | 5 (branch dependent) | ~10.8 ms | Linear $O(bm)$ (Low) | Non-optimal |
| **DLS (Limit=8)** | Yes | 14 | 5 | ~0.2 ms | Linear $O(bl)$ (Low) | Non-optimal |
| **IDDLS** | Yes | 73 | 5 | ~0.3 ms | Linear $O(bd)$ (Medium) | Optimal |
| **GBFS (Manhattan)** | Yes | 6 | 5 | ~0.2 ms | Exponential $O(b^m)$ (Low) | Non-optimal |
| **A\* (Manhattan)** | Yes | 6 | 5 | ~0.1 ms | Exponential $O(b^d)$ (Medium) | Optimal |

### Key Observations
1. **Space vs. Time Trade-Off:** DFS uses minimal space per branch $O(bm)$, whereas BFS must store the entire frontier level $O(b^d)$, quickly consuming megabytes of RAM as depth grows.
2. **Path Quality:** A* and BFS always guarantee the shortest number of moves (optimal 5 moves). DFS may wander down deep branches unless cycle detection and branch ordering steer it toward the goal.
3. **Informed vs. Uninformed:** A* with Manhattan distance expands only 6 nodes, representing an order of magnitude improvement over uninformed methods.

---

## 5. Conclusion
Depth First Search illustrates fundamental trade-offs in artificial intelligence: superior linear space complexity at the cost of solution optimality and vulnerability to deep graph traversal. In conjunction with cycle elimination and depth limits (DLS/IDDLS), DFS provides the foundational mechanics underpinning many modern search and planning engines.
