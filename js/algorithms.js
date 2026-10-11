/**
 * AI Search Algorithms for 8-Puzzle Problem
 * Course: Artificial Intelligence
 * Assignment: Digital Assignment (Case Study)
 * Student: Shubh Vijayvargiya (24BCT0046)
 * Assigned Algorithm: Depth First Search (DFS)
 * 
 * Implements:
 * 1. Breadth First Search (BFS)
 * 2. Depth First Search (DFS) - Primary Focus / Assigned
 * 3. Depth Limited Search (DLS)
 * 4. Iterative Deepening Search (IDDLS)
 * 5. Greedy Best First Search (GBFS)
 * 6. A* Search
 */

if (typeof require !== 'undefined') {
  var { PuzzleState, PuzzleUtils } = require('./puzzle.js');
}

class SearchResult {
  constructor() {
    this.algorithm = '';
    this.found = false;
    this.path = [];              // Array of PuzzleState from start to goal
    this.moves = 0;              // Length of solution path - 1
    this.nodesGenerated = 0;
    this.nodesExpanded = 0;
    this.maxSearchDepth = 0;
    this.executionTimeMs = 0;
    this.pathCost = 0;
    this.memoryUsageKB = 0;
    this.memoryRating = 'Low';   // 'Low', 'Medium', 'High'
    this.steps = [];             // Trace for step-by-step animation
    this.statusMessage = '';
  }
}

class SearchStep {
  constructor({
    stepNumber,
    currentNode,
    frontierSnapshot,
    exploredCount,
    action,
    nodesGenerated,
    nodesExpanded,
    currentDepth,
    successors = [],
    hVal = null,
    gVal = null,
    fVal = null
  }) {
    this.stepNumber = stepNumber;
    this.currentNode = currentNode; // PuzzleState
    this.frontierSnapshot = frontierSnapshot; // array of boards or ids
    this.exploredCount = exploredCount;
    this.action = action;
    this.nodesGenerated = nodesGenerated;
    this.nodesExpanded = nodesExpanded;
    this.currentDepth = currentDepth;
    this.successors = successors; // array of child states
    this.hVal = hVal;
    this.gVal = gVal;
    this.fVal = fVal;
  }
}

class SearchAlgorithms {

  /**
   * 1. DEPTH FIRST SEARCH (DFS)
   * Assigned to: Shubh Vijayvargiya (24BCT0046)
   * 
   * Strategy: Explores deepest node in current branch using a LIFO Stack.
   * Uses graph-search cycle detection to prevent infinite cycles in the 8-puzzle graph.
   * Includes a safety maxDepth limit (default: 50) and step limit to protect browser memory.
   */
  static solveDFS(initialBoard, goalBoard, options = {}) {
    const maxDepth = options.maxDepth !== undefined ? options.maxDepth : 16;
    const maxExpandedLimit = options.maxExpandedLimit || 75000;
    const recordSteps = options.recordSteps !== false;
    const maxStepsToRecord = options.maxStepsToRecord || 1500;

    const result = new SearchResult();
    result.algorithm = 'Depth First Search (DFS)';
    const startTime = performance.now();

    const root = new PuzzleState(initialBoard, null, null, 0, 0);
    if (root.isGoal(goalBoard)) {
      result.found = true;
      result.path = [root];
      result.executionTimeMs = Math.round((performance.now() - startTime) * 100) / 100;
      result.memoryUsageKB = 1;
      result.memoryRating = 'Low';
      return result;
    }

    // LIFO Stack for frontier
    const frontier = [root];
    // Visited set for cycle detection (maps board string -> smallest depth seen)
    const visited = new Map();
    visited.set(root.id, 0);

    let nodesGen = 1;
    let nodesExp = 0;
    let maxDepthReached = 0;

    while (frontier.length > 0) {
      if (nodesExp >= maxExpandedLimit) {
        result.statusMessage = `Search halted: expansion limit reached (${maxExpandedLimit} nodes). DFS explores non-optimal deep branches in 8-puzzle.`;
        break;
      }

      // LIFO: pop from top of stack
      const current = frontier.pop();
      nodesExp++;

      if (current.depth > maxDepthReached) {
        maxDepthReached = current.depth;
      }

      // Check if goal reached
      if (current.isGoal(goalBoard)) {
        result.found = true;
        result.path = current.getPath();
        result.moves = result.path.length - 1;
        result.pathCost = current.cost;
        break;
      }

      // Generate successors if within depth limit
      const successors = current.getSuccessors();
      const validSuccessors = [];

      if (current.depth < maxDepth) {
        // In DFS, we push onto stack. Successors can be pushed in reverse order
        // so that the first child is expanded next.
        for (let i = successors.length - 1; i >= 0; i--) {
          const child = successors[i];
          nodesGen++;

          // Graph search check: don't revisit if already seen at equal or shallower depth
          if (!visited.has(child.id) || visited.get(child.id) > child.depth) {
            visited.set(child.id, child.depth);
            frontier.push(child);
            validSuccessors.push(child);
          }
        }
      }

      // Record visual step trace
      if (recordSteps && result.steps.length < maxStepsToRecord) {
        result.steps.push(new SearchStep({
          stepNumber: nodesExp,
          currentNode: current,
          frontierSnapshot: frontier.slice(-10).map(n => n.board), // Top 10 stack items
          exploredCount: visited.size,
          action: current.action,
          nodesGenerated: nodesGen,
          nodesExpanded: nodesExp,
          currentDepth: current.depth,
          successors: successors,
          hVal: null,
          gVal: current.cost,
          fVal: null
        }));
      }
    }

    result.nodesGenerated = nodesGen;
    result.nodesExpanded = nodesExp;
    result.maxSearchDepth = maxDepthReached;
    result.executionTimeMs = Math.round((performance.now() - startTime) * 100) / 100;
    
    // Memory calculation: DFS space complexity is O(b * m)
    result.memoryUsageKB = Math.round((frontier.length + visited.size) * 0.18);
    result.memoryRating = result.memoryUsageKB < 500 ? 'Low' : (result.memoryUsageKB < 5000 ? 'Medium' : 'High');

    if (!result.found && !result.statusMessage) {
      result.statusMessage = `Goal not found within maximum depth of ${maxDepth}. DFS is incomplete in infinite/large graphs without adequate depth.`;
    }

    return result;
  }

  /**
   * 2. BREADTH FIRST SEARCH (BFS)
   * Strategy: FIFO Queue, explores level by level. Optimal for unweighted graphs.
   */
  static solveBFS(initialBoard, goalBoard, options = {}) {
    const maxExpandedLimit = options.maxExpandedLimit || 12000;
    const recordSteps = options.recordSteps !== false;
    const maxStepsToRecord = options.maxStepsToRecord || 1200;

    const result = new SearchResult();
    result.algorithm = 'Breadth First Search (BFS)';
    const startTime = performance.now();

    const root = new PuzzleState(initialBoard, null, null, 0, 0);
    if (root.isGoal(goalBoard)) {
      result.found = true;
      result.path = [root];
      result.executionTimeMs = Math.round((performance.now() - startTime) * 100) / 100;
      return result;
    }

    // FIFO Queue
    const frontier = [root];
    const visited = new Set();
    visited.add(root.id);

    let nodesGen = 1;
    let nodesExp = 0;
    let maxDepthReached = 0;

    while (frontier.length > 0) {
      if (nodesExp >= maxExpandedLimit) {
        result.statusMessage = `Expansion limit reached (${maxExpandedLimit} nodes) to prevent browser memory exhaustion.`;
        break;
      }

      // Dequeue from front
      const current = frontier.shift();
      nodesExp++;

      if (current.depth > maxDepthReached) {
        maxDepthReached = current.depth;
      }

      if (current.isGoal(goalBoard)) {
        result.found = true;
        result.path = current.getPath();
        result.moves = result.path.length - 1;
        result.pathCost = current.cost;
        break;
      }

      const successors = current.getSuccessors();
      for (const child of successors) {
        nodesGen++;
        if (!visited.has(child.id)) {
          visited.add(child.id);
          frontier.push(child);
        }
      }

      if (recordSteps && result.steps.length < maxStepsToRecord) {
        result.steps.push(new SearchStep({
          stepNumber: nodesExp,
          currentNode: current,
          frontierSnapshot: frontier.slice(0, 10).map(n => n.board), // Front 10 queue items
          exploredCount: visited.size,
          action: current.action,
          nodesGenerated: nodesGen,
          nodesExpanded: nodesExp,
          currentDepth: current.depth,
          successors: successors,
          hVal: null,
          gVal: current.cost,
          fVal: null
        }));
      }
    }

    result.nodesGenerated = nodesGen;
    result.nodesExpanded = nodesExp;
    result.maxSearchDepth = maxDepthReached;
    result.executionTimeMs = Math.round((performance.now() - startTime) * 100) / 100;
    result.memoryUsageKB = Math.round((frontier.length + visited.size) * 0.18);
    result.memoryRating = result.memoryUsageKB < 500 ? 'Low' : (result.memoryUsageKB < 4000 ? 'Medium' : 'High');

    return result;
  }

  /**
   * 3. DEPTH LIMITED SEARCH (DLS)
   * Strategy: DFS with strict depth cutoff limit.
   */
  static solveDLS(initialBoard, goalBoard, depthLimit = 10, options = {}) {
    const recordSteps = options.recordSteps !== false;
    const maxStepsToRecord = options.maxStepsToRecord || 1200;

    const result = new SearchResult();
    result.algorithm = `Depth Limited Search (DLS, Limit=${depthLimit})`;
    const startTime = performance.now();

    const root = new PuzzleState(initialBoard, null, null, 0, 0);
    const frontier = [root];
    const visited = new Map();
    visited.set(root.id, 0);

    let nodesGen = 1;
    let nodesExp = 0;
    let maxDepthReached = 0;
    let cutoffOccurred = false;

    while (frontier.length > 0) {
      const current = frontier.pop();
      nodesExp++;

      if (current.depth > maxDepthReached) {
        maxDepthReached = current.depth;
      }

      if (current.isGoal(goalBoard)) {
        result.found = true;
        result.path = current.getPath();
        result.moves = result.path.length - 1;
        result.pathCost = current.cost;
        break;
      }

      const successors = current.getSuccessors();
      if (current.depth < depthLimit) {
        for (let i = successors.length - 1; i >= 0; i--) {
          const child = successors[i];
          nodesGen++;
          if (!visited.has(child.id) || visited.get(child.id) > child.depth) {
            visited.set(child.id, child.depth);
            frontier.push(child);
          }
        }
      } else {
        cutoffOccurred = true;
      }

      if (recordSteps && result.steps.length < maxStepsToRecord) {
        result.steps.push(new SearchStep({
          stepNumber: nodesExp,
          currentNode: current,
          frontierSnapshot: frontier.slice(-10).map(n => n.board),
          exploredCount: visited.size,
          action: current.action,
          nodesGenerated: nodesGen,
          nodesExpanded: nodesExp,
          currentDepth: current.depth,
          successors: successors,
          hVal: null,
          gVal: current.cost,
          fVal: null
        }));
      }
    }

    result.nodesGenerated = nodesGen;
    result.nodesExpanded = nodesExp;
    result.maxSearchDepth = maxDepthReached;
    result.executionTimeMs = Math.round((performance.now() - startTime) * 100) / 100;
    result.memoryUsageKB = Math.round((frontier.length + visited.size) * 0.18);
    result.memoryRating = 'Low';

    if (!result.found) {
      result.statusMessage = cutoffOccurred 
        ? `Cutoff: Solution not within depth limit ${depthLimit}.`
        : `Failure: State space exhausted within limit ${depthLimit}.`;
    }

    return result;
  }

  /**
   * 4. ITERATIVE DEEPENING DEPTH LIMITED SEARCH (IDDLS)
   * Strategy: Repeatedly calls DLS with depth limits 0, 1, 2, ...
   * Combines BFS optimality with DFS space efficiency.
   */
  static solveIDDLS(initialBoard, goalBoard, maxLimit = 25, options = {}) {
    const result = new SearchResult();
    result.algorithm = 'Iterative Deepening Search (IDDLS)';
    const startTime = performance.now();

    let totalNodesGen = 0;
    let totalNodesExp = 0;
    let maxOverallDepth = 0;
    const accumulatedSteps = [];

    for (let depth = 0; depth <= maxLimit; depth++) {
      const dlsRes = SearchAlgorithms.solveDLS(initialBoard, goalBoard, depth, {
        recordSteps: true,
        maxStepsToRecord: 200
      });

      totalNodesGen += dlsRes.nodesGenerated;
      totalNodesExp += dlsRes.nodesExpanded;
      if (dlsRes.maxSearchDepth > maxOverallDepth) {
        maxOverallDepth = dlsRes.maxSearchDepth;
      }

      // Accumulate steps for visualization
      for (const st of dlsRes.steps) {
        if (accumulatedSteps.length < 1500) {
          accumulatedSteps.push(st);
        }
      }

      if (dlsRes.found) {
        result.found = true;
        result.path = dlsRes.path;
        result.moves = dlsRes.moves;
        result.pathCost = dlsRes.pathCost;
        break;
      }
    }

    result.nodesGenerated = totalNodesGen;
    result.nodesExpanded = totalNodesExp;
    result.maxSearchDepth = maxOverallDepth;
    result.steps = accumulatedSteps;
    result.executionTimeMs = Math.round((performance.now() - startTime) * 100) / 100;
    result.memoryUsageKB = Math.round(maxOverallDepth * 0.18 + 5);
    result.memoryRating = 'Medium';

    if (!result.found) {
      result.statusMessage = `Goal not found within iterative depth limit of ${maxLimit}.`;
    }

    return result;
  }

  /**
   * 5. GREEDY BEST FIRST SEARCH (GBFS)
   * Strategy: Priority Queue ordered purely by heuristic h(n).
   */
  static solveGBFS(initialBoard, goalBoard, heuristicType = 'manhattan', options = {}) {
    const maxExpandedLimit = options.maxExpandedLimit || 10000;
    const recordSteps = options.recordSteps !== false;
    const maxStepsToRecord = options.maxStepsToRecord || 1200;

    const result = new SearchResult();
    result.algorithm = `Greedy Best First Search (${heuristicType === 'manhattan' ? 'Manhattan' : 'Misplaced'})`;
    const startTime = performance.now();

    const heuristicFn = heuristicType === 'manhattan'
      ? PuzzleUtils.heuristicManhattanDistance
      : PuzzleUtils.heuristicMisplacedTiles;

    const root = new PuzzleState(initialBoard, null, null, 0, 0);
    root.h = heuristicFn(root.board, goalBoard);
    root.f = root.h;

    // Min-Priority queue sorted by h
    const frontier = [root];
    const visited = new Set();
    visited.add(root.id);

    let nodesGen = 1;
    let nodesExp = 0;
    let maxDepthReached = 0;

    while (frontier.length > 0) {
      if (nodesExp >= maxExpandedLimit) {
        result.statusMessage = `Expansion limit reached (${maxExpandedLimit} nodes).`;
        break;
      }

      // Sort or find min h
      let bestIdx = 0;
      for (let i = 1; i < frontier.length; i++) {
        if (frontier[i].h < frontier[bestIdx].h) {
          bestIdx = i;
        }
      }

      const current = frontier.splice(bestIdx, 1)[0];
      nodesExp++;

      if (current.depth > maxDepthReached) {
        maxDepthReached = current.depth;
      }

      if (current.isGoal(goalBoard)) {
        result.found = true;
        result.path = current.getPath();
        result.moves = result.path.length - 1;
        result.pathCost = current.cost;
        break;
      }

      const successors = current.getSuccessors();
      for (const child of successors) {
        nodesGen++;
        if (!visited.has(child.id)) {
          visited.add(child.id);
          child.h = heuristicFn(child.board, goalBoard);
          child.f = child.h;
          frontier.push(child);
        }
      }

      if (recordSteps && result.steps.length < maxStepsToRecord) {
        result.steps.push(new SearchStep({
          stepNumber: nodesExp,
          currentNode: current,
          frontierSnapshot: frontier.slice(0, 8).map(n => n.board),
          exploredCount: visited.size,
          action: current.action,
          nodesGenerated: nodesGen,
          nodesExpanded: nodesExp,
          currentDepth: current.depth,
          successors: successors,
          hVal: current.h,
          gVal: current.cost,
          fVal: current.f
        }));
      }
    }

    result.nodesGenerated = nodesGen;
    result.nodesExpanded = nodesExp;
    result.maxSearchDepth = maxDepthReached;
    result.executionTimeMs = Math.round((performance.now() - startTime) * 100) / 100;
    result.memoryUsageKB = Math.round((frontier.length + visited.size) * 0.18);
    result.memoryRating = 'Low';

    return result;
  }

  /**
   * 6. A* SEARCH
   * Strategy: Priority Queue ordered by f(n) = g(n) + h(n).
   * Guaranteed optimal if heuristic is admissible and consistent.
   */
  static solveAStar(initialBoard, goalBoard, heuristicType = 'manhattan', options = {}) {
    const maxExpandedLimit = options.maxExpandedLimit || 12000;
    const recordSteps = options.recordSteps !== false;
    const maxStepsToRecord = options.maxStepsToRecord || 1200;

    const result = new SearchResult();
    result.algorithm = `A* Search (${heuristicType === 'manhattan' ? 'Manhattan' : 'Misplaced'})`;
    const startTime = performance.now();

    const heuristicFn = heuristicType === 'manhattan'
      ? PuzzleUtils.heuristicManhattanDistance
      : PuzzleUtils.heuristicMisplacedTiles;

    const root = new PuzzleState(initialBoard, null, null, 0, 0);
    root.h = heuristicFn(root.board, goalBoard);
    root.f = root.cost + root.h;

    // Min-Priority queue sorted by f
    const frontier = [root];
    // Cost tracking for reached states
    const costSoFar = new Map();
    costSoFar.set(root.id, 0);

    let nodesGen = 1;
    let nodesExp = 0;
    let maxDepthReached = 0;

    while (frontier.length > 0) {
      if (nodesExp >= maxExpandedLimit) {
        result.statusMessage = `Expansion limit reached (${maxExpandedLimit} nodes).`;
        break;
      }

      // Select lowest f(n), tie-breaker: lower h(n)
      let bestIdx = 0;
      for (let i = 1; i < frontier.length; i++) {
        if (frontier[i].f < frontier[bestIdx].f ||
           (frontier[i].f === frontier[bestIdx].f && frontier[i].h < frontier[bestIdx].h)) {
          bestIdx = i;
        }
      }

      const current = frontier.splice(bestIdx, 1)[0];
      nodesExp++;

      if (current.depth > maxDepthReached) {
        maxDepthReached = current.depth;
      }

      if (current.isGoal(goalBoard)) {
        result.found = true;
        result.path = current.getPath();
        result.moves = result.path.length - 1;
        result.pathCost = current.cost;
        break;
      }

      const successors = current.getSuccessors();
      for (const child of successors) {
        nodesGen++;
        const newCost = current.cost + 1;

        if (!costSoFar.has(child.id) || newCost < costSoFar.get(child.id)) {
          costSoFar.set(child.id, newCost);
          child.cost = newCost;
          child.h = heuristicFn(child.board, goalBoard);
          child.f = child.cost + child.h;
          frontier.push(child);
        }
      }

      if (recordSteps && result.steps.length < maxStepsToRecord) {
        result.steps.push(new SearchStep({
          stepNumber: nodesExp,
          currentNode: current,
          frontierSnapshot: frontier.slice(0, 8).map(n => n.board),
          exploredCount: costSoFar.size,
          action: current.action,
          nodesGenerated: nodesGen,
          nodesExpanded: nodesExp,
          currentDepth: current.depth,
          successors: successors,
          hVal: current.h,
          gVal: current.cost,
          fVal: current.f
        }));
      }
    }

    result.nodesGenerated = nodesGen;
    result.nodesExpanded = nodesExp;
    result.maxSearchDepth = maxDepthReached;
    result.executionTimeMs = Math.round((performance.now() - startTime) * 100) / 100;
    result.memoryUsageKB = Math.round((frontier.length + costSoFar.size) * 0.18);
    result.memoryRating = 'Medium';

    return result;
  }

  /**
   * Master execution router
   */
  static runAlgorithm(algorithmType, initialBoard, goalBoard, params = {}) {
    switch (algorithmType.toUpperCase()) {
      case 'DFS':
        return SearchAlgorithms.solveDFS(initialBoard, goalBoard, params);
      case 'BFS':
        return SearchAlgorithms.solveBFS(initialBoard, goalBoard, params);
      case 'DLS':
        return SearchAlgorithms.solveDLS(initialBoard, goalBoard, params.depthLimit || 12, params);
      case 'IDDLS':
        return SearchAlgorithms.solveIDDLS(initialBoard, goalBoard, params.maxLimit || 20, params);
      case 'GBFS':
        return SearchAlgorithms.solveGBFS(initialBoard, goalBoard, params.heuristic || 'manhattan', params);
      case 'ASTAR':
      case 'A*':
        return SearchAlgorithms.solveAStar(initialBoard, goalBoard, params.heuristic || 'manhattan', params);
      default:
        return SearchAlgorithms.solveDFS(initialBoard, goalBoard, params);
    }
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { SearchAlgorithms, SearchResult, SearchStep };
}
