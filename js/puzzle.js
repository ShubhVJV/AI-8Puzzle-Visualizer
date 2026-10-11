/**
 * 8-Puzzle Problem Core Logic & State Management
 * Course: Artificial Intelligence
 * Assignment: Digital Assignment (Case Study)
 * Student: Shubh Vijayvargiya (24BCT0046)
 * Assigned Algorithm: Depth First Search (DFS)
 */

class PuzzleState {
  constructor(board, parent = null, action = null, depth = 0, cost = 0) {
    // board is an array of 9 integers, where 0 represents the blank tile
    this.board = Array.isArray(board) ? [...board] : [];
    this.parent = parent;
    this.action = action; // 'UP', 'DOWN', 'LEFT', 'RIGHT'
    this.depth = depth;
    this.cost = cost; // g(n): path cost from start to this node
    this.h = 0;       // h(n): heuristic value
    this.f = 0;       // f(n) = g(n) + h(n)
    this.id = this.board.join(',');
  }

  getBlankIndex() {
    return this.board.indexOf(0);
  }

  isGoal(goalState) {
    if (!goalState) return false;
    const goalBoard = Array.isArray(goalState) ? goalState : goalState.board;
    for (let i = 0; i < 9; i++) {
      if (this.board[i] !== goalBoard[i]) return false;
    }
    return true;
  }

  /**
   * Generates valid successor states from moving the blank tile.
   * Actions define blank tile movements:
   * UP (blank moves up), DOWN (blank moves down),
   * LEFT (blank moves left), RIGHT (blank moves right)
   */
  getSuccessors() {
    const successors = [];
    const blankIdx = this.getBlankIndex();
    const row = Math.floor(blankIdx / 3);
    const col = blankIdx % 3;

    // Movement offsets [rowOffset, colOffset, actionName]
    const moves = [
      [-1, 0, 'UP'],
      [1, 0, 'DOWN'],
      [0, -1, 'LEFT'],
      [0, 1, 'RIGHT']
    ];

    for (const [dRow, dCol, action] of moves) {
      const newRow = row + dRow;
      const newCol = col + dCol;

      if (newRow >= 0 && newRow < 3 && newCol >= 0 && newCol < 3) {
        const swapIdx = newRow * 3 + newCol;
        const newBoard = [...this.board];
        // Swap blank with adjacent tile
        newBoard[blankIdx] = newBoard[swapIdx];
        newBoard[swapIdx] = 0;

        const child = new PuzzleState(
          newBoard,
          this,
          action,
          this.depth + 1,
          this.cost + 1
        );
        successors.push(child);
      }
    }

    return successors;
  }

  // Returns path from root to this state
  getPath() {
    const path = [];
    let curr = this;
    while (curr) {
      path.unshift(curr);
      curr = curr.parent;
    }
    return path;
  }
}

class PuzzleUtils {
  // Standard Default Goal: [1, 2, 3, 8, 0, 4, 7, 6, 5] as in assignment prompt example
  // or classic [1, 2, 3, 4, 5, 6, 7, 8, 0]
  static DEFAULT_GOAL = [1, 2, 3, 8, 0, 4, 7, 6, 5];
  static CLASSIC_GOAL = [1, 2, 3, 4, 5, 6, 7, 8, 0];

  /**
   * Calculates the number of inversions in the board (ignoring tile 0).
   */
  static countInversions(board) {
    let inversions = 0;
    const tiles = board.filter(t => t !== 0);
    for (let i = 0; i < tiles.length - 1; i++) {
      for (let j = i + 1; j < tiles.length; j++) {
        if (tiles[i] > tiles[j]) {
          inversions++;
        }
      }
    }
    return inversions;
  }

  /**
   * Checks if initial state can reach goal state.
   * For 3x3 board, solvability holds if both have matching inversion parity.
   */
  static isSolvable(initialBoard, goalBoard = PuzzleUtils.DEFAULT_GOAL) {
    const invInitial = this.countInversions(initialBoard);
    const invGoal = this.countInversions(goalBoard);
    return (invInitial % 2) === (invGoal % 2);
  }

  /**
   * Validates if a board has valid tiles 0-8 without duplicates.
   */
  static isValidBoard(board) {
    if (!Array.isArray(board) || board.length !== 9) return false;
    const sorted = [...board].sort((a, b) => a - b);
    for (let i = 0; i < 9; i++) {
      if (sorted[i] !== i) return false;
    }
    return true;
  }

  /**
   * Generates a random solvable board by performing random valid moves from goal.
   * This guarantees solvability and provides configurable difficulty.
   */
  static generateRandomSolvable(goalBoard = PuzzleUtils.DEFAULT_GOAL, shuffleSteps = 20) {
    let current = new PuzzleState(goalBoard);
    let prevAction = null;

    const opposite = {
      'UP': 'DOWN',
      'DOWN': 'UP',
      'LEFT': 'RIGHT',
      'RIGHT': 'LEFT'
    };

    for (let i = 0; i < shuffleSteps; i++) {
      const successors = current.getSuccessors();
      // Filter out immediately reversing the previous action to avoid trivial loops
      const viable = successors.filter(s => !prevAction || s.action !== opposite[prevAction]);
      const chosen = viable.length > 0
        ? viable[Math.floor(Math.random() * viable.length)]
        : successors[Math.floor(Math.random() * successors.length)];
      
      prevAction = chosen.action;
      current = new PuzzleState(chosen.board);
    }

    return current.board;
  }

  /**
   * Heuristic 1: Misplaced Tiles
   * Count of non-blank tiles that are not in their target position.
   */
  static heuristicMisplacedTiles(stateBoard, goalBoard) {
    let count = 0;
    for (let i = 0; i < 9; i++) {
      if (stateBoard[i] !== 0 && stateBoard[i] !== goalBoard[i]) {
        count++;
      }
    }
    return count;
  }

  /**
   * Heuristic 2: Manhattan Distance
   * Sum of horizontal and vertical distances of tiles from their goal positions.
   */
  static heuristicManhattanDistance(stateBoard, goalBoard) {
    let dist = 0;
    // Map goal tile to target (row, col)
    const goalPos = {};
    for (let i = 0; i < 9; i++) {
      const tile = goalBoard[i];
      goalPos[tile] = {
        row: Math.floor(i / 3),
        col: i % 3
      };
    }

    for (let i = 0; i < 9; i++) {
      const tile = stateBoard[i];
      if (tile !== 0) {
        const currRow = Math.floor(i / 3);
        const currCol = i % 3;
        const target = goalPos[tile];
        dist += Math.abs(currRow - target.row) + Math.abs(currCol - target.col);
      }
    }
    return dist;
  }

  /**
   * Helper to format board as 3x3 text.
   */
  static formatBoardText(board) {
    return [
      board.slice(0, 3).map(n => n === 0 ? '_' : n).join(' '),
      board.slice(3, 6).map(n => n === 0 ? '_' : n).join(' '),
      board.slice(6, 9).map(n => n === 0 ? '_' : n).join(' ')
    ].join('\n');
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { PuzzleState, PuzzleUtils };
}
