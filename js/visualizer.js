/**
 * Interactive Visualizer & Playback Engine
 * Course: Artificial Intelligence
 * Assignment: Digital Assignment (Case Study)
 * Student: Shubh Vijayvargiya (24BCT0046)
 * Assigned Algorithm: Depth First Search (DFS)
 */

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

    if (mode === 'solution' && result && result.path && result.path.length > 0) {
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
    } else if (mode === 'search' && result && result.steps && result.steps.length > 0) {
      // Step-by-step search process frames
      this.steps = result.steps.map((st, idx) => ({
        type: 'search',
        stepIndex: idx,
        totalSteps: result.steps.length,
        board: st.currentNode.board,
        action: st.action || 'Start',
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
    if (this.isPlaying || this.steps.length <= 1) return;
    if (this.currentIndex >= this.steps.length - 1) {
      this.currentIndex = 0; // Loop or restart from beginning
    }

    this.isPlaying = true;
    if (this.onPlayStateChange) this.onPlayStateChange(true);
    this.tick();
  }

  pause() {
    this.isPlaying = false;
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }
    if (this.onPlayStateChange) this.onPlayStateChange(false);
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
    }
  }

  prevStep() {
    this.pause();
    if (this.currentIndex > 0) {
      this.currentIndex--;
      this.applyCurrentStep();
    }
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
      this.pause();
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
