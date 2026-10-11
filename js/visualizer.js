/**
 * Interactive Visualizer & Playback Engine
 * Course: Artificial Intelligence
 * Assignment: Digital Assignment (Case Study)
 * Student: Shubh Vijayvargiya (24BCT0046)
 * Assigned Algorithm: Depth First Search (DFS)
 */

if (typeof require !== 'undefined') {
  var { PuzzleUtils } = require('./puzzle.js');
}

class PuzzleVisualizer {
  constructor() {
    this.currentBoard = [...PuzzleUtils.DEFAULT_GOAL];
    this.initialBoard = [...PuzzleUtils.DEFAULT_GOAL];
    this.goalBoard = [...PuzzleUtils.DEFAULT_GOAL];
    
    // Playback state
    this.steps = [];          // Search process steps OR Solution path steps
    this.currentIndex = 0;
    this.isPlaying = false;
    this.timer = null;
    this.speed = 400;         // Delay in ms
    this.mode = 'solution';   // 'solution' or 'search'
    this.currentResult = null;

    // Callbacks for UI updates
    this.onStepChange = null;
    this.onPlayStateChange = null;
  }

  setBoards(initialBoard, goalBoard) {
    this.initialBoard = [...initialBoard];
    this.goalBoard = [...goalBoard];
    this.reset();
  }

  loadSearchResult(result, mode = 'solution') {
    this.stop();
    this.currentResult = result;
    this.mode = mode;

    const hasPath = result && result.path && result.path.length > 1;
    const hasSearchSteps = result && result.steps && result.steps.length > 1;

    // If requested solution but no solution path found, automatically fallback to search exploration steps
    if (mode === 'solution' && !hasPath && hasSearchSteps) {
      this.mode = 'search';
    }

    if (this.mode === 'solution' && hasPath) {
      // Solution path frames
      this.steps = result.path.map((state, idx) => ({
        type: 'solution',
        stepIndex: idx,
        totalSteps: result.path.length - 1,
        board: state.board,
        action: state.action || 'Initial State',
        depth: state.depth,
        cost: state.cost,
        h: state.h,
        f: state.f,
        node: state
      }));
    } else if (hasSearchSteps) {
      // Step-by-step search process frames
      this.steps = result.steps.map((st, idx) => ({
        type: 'search',
        stepIndex: idx,
        totalSteps: result.steps.length - 1,
        board: st.currentNode.board,
        action: st.action || 'Expand Node',
        depth: st.currentDepth,
        cost: st.gVal,
        h: st.hVal,
        f: st.fVal,
        frontierSnapshot: st.frontierSnapshot,
        exploredCount: st.exploredCount,
        nodesGenerated: st.nodesGenerated,
        nodesExpanded: st.nodesExpanded,
        successors: st.successors,
        node: st.currentNode
      }));
    } else {
      this.steps = [{
        type: 'static',
        stepIndex: 0,
        totalSteps: 0,
        board: this.initialBoard,
        action: 'Initial State',
        depth: 0,
        cost: 0
      }];
    }

    this.currentIndex = 0;
    if (this.steps.length > 0) {
      this.currentBoard = [...this.steps[0].board];
    }
    this.notifyStep();
  }

  play() {
    if (this.steps.length <= 1) {
      if (this.onPlayStateChange) this.onPlayStateChange(false, 'empty');
      return;
    }

    if (this.currentIndex >= this.steps.length - 1) {
      this.currentIndex = 0; // Loop or restart from beginning
      this.applyCurrentStep();
    }

    this.isPlaying = true;
    if (this.onPlayStateChange) this.onPlayStateChange(true, 'playing');
    this.tick();
  }

  pause() {
    this.isPlaying = false;
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }
    if (this.onPlayStateChange) this.onPlayStateChange(false, 'paused');
  }

  resume() {
    this.play();
  }

  stop() {
    this.pause();
  }

  reset() {
    this.stop();
    this.currentIndex = 0;
    this.currentBoard = [...this.initialBoard];
    this.notifyStep();
  }

  nextStep() {
    this.pause();
    if (this.currentIndex < this.steps.length - 1) {
      this.currentIndex++;
      this.applyCurrentStep();
      return true;
    }
    return false;
  }

  prevStep() {
    this.pause();
    if (this.currentIndex > 0) {
      this.currentIndex--;
      this.applyCurrentStep();
      return true;
    }
    return false;
  }

  goToStep(index) {
    if (index >= 0 && index < this.steps.length) {
      this.currentIndex = index;
      this.applyCurrentStep();
    }
  }

  setSpeed(ms) {
    this.speed = Math.max(20, Math.min(2000, ms));
  }

  tick() {
    if (!this.isPlaying) return;

    if (this.currentIndex < this.steps.length - 1) {
      this.currentIndex++;
      this.applyCurrentStep();
      this.timer = setTimeout(() => this.tick(), this.speed);
    } else {
      this.isPlaying = false;
      if (this.timer) {
        clearTimeout(this.timer);
        this.timer = null;
      }
      if (this.onPlayStateChange) this.onPlayStateChange(false, 'ended');
    }
  }

  applyCurrentStep() {
    if (this.steps.length > 0 && this.steps[this.currentIndex]) {
      const step = this.steps[this.currentIndex];
      this.currentBoard = [...step.board];
    }
    this.notifyStep();
  }

  notifyStep() {
    if (this.onStepChange) {
      const currentStep = this.steps[this.currentIndex] || {
        board: this.currentBoard,
        action: 'None',
        depth: 0,
        cost: 0
      };
      this.onStepChange({
        index: this.currentIndex,
        total: Math.max(0, this.steps.length - 1),
        step: currentStep,
        board: this.currentBoard,
        isPlaying: this.isPlaying,
        mode: this.mode
      });
    }
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { PuzzleVisualizer };
}
