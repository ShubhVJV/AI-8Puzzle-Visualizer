/**
 * UI Orchestrator & Application Logic
 * Course: Artificial Intelligence
 * Assignment: Digital Assignment (Case Study)
 * Student: Shubh Vijayvargiya (24BCT0046)
 * Assigned Algorithm: Depth First Search (DFS)
 */

document.addEventListener('DOMContentLoaded', () => {
  // Initialize Visualizer
  const visualizer = new PuzzleVisualizer();

  // State
  let initialBoard = [2, 8, 3, 1, 6, 4, 7, 0, 5]; // Default assignment example
  let goalBoard = [1, 2, 3, 8, 0, 4, 7, 6, 5];    // Default assignment goal
  let lastSearchResult = null;

  // DOM Elements
  const mainBoardEl = document.getElementById('mainPuzzleBoard');
  const initialMiniEl = document.getElementById('initialMiniBoard');
  const goalMiniEl = document.getElementById('goalMiniBoard');
  const successorsContainer = document.getElementById('successorsContainer');
  const frontierStackContainer = document.getElementById('frontierStackContainer');
  const algorithmSelect = document.getElementById('algorithmSelect');
  const dlsDepthGroup = document.getElementById('dlsDepthGroup');
  const heuristicGroup = document.getElementById('heuristicGroup');
  const dfsDepthGroup = document.getElementById('dfsDepthGroup');

  // Metrics elements
  const statStatus = document.getElementById('statStatus');
  const statNodesExpanded = document.getElementById('statNodesExpanded');
  const statNodesGenerated = document.getElementById('statNodesGenerated');
  const statCurrentDepth = document.getElementById('statCurrentDepth');
  const statMoves = document.getElementById('statMoves');
  const statTime = document.getElementById('statTime');
  const statMemory = document.getElementById('statMemory');
  const statCostG = document.getElementById('statCostG');
  const statHeuristicH = document.getElementById('statHeuristicH');
  const statEvaluationF = document.getElementById('statEvaluationF');
  const currentStepLabel = document.getElementById('currentStepLabel');
  const currentActionBadge = document.getElementById('currentActionBadge');
  const timelineSlider = document.getElementById('timelineSlider');

  // Controls
  const btnRun = document.getElementById('btnRun');
  const btnPause = document.getElementById('btnPause');
  const btnResume = document.getElementById('btnResume');
  const btnNext = document.getElementById('btnNext');
  const btnPrev = document.getElementById('btnPrev');
  const btnReset = document.getElementById('btnReset');
  const speedSlider = document.getElementById('speedSlider');
  const speedLabel = document.getElementById('speedLabel');
  const viewModeRadios = document.querySelectorAll('input[name="viewMode"]');

  // Input methods
  const btnRandomSolvable = document.getElementById('btnRandomSolvable');
  const presetSelect = document.getElementById('presetSelect');
  const btnOpenCustomModal = document.getElementById('btnOpenCustomModal');
  const customModal = document.getElementById('customInputModal');
  const btnSaveCustomBoard = document.getElementById('btnSaveCustomBoard');
  const btnCloseCustomModal = document.getElementById('btnCloseCustomModal');
  const solvabilityBadge = document.getElementById('solvabilityBadge');

  // Render board helper
  function renderBoard(element, board, isInteractive = false, isDfsTheme = false) {
    if (!element) return;
    element.innerHTML = '';
    board.forEach((val, index) => {
      const tile = document.createElement('div');
      tile.className = `puzzle-tile ${val === 0 ? 'tile-blank' : 'tile-active'} ${isDfsTheme && val !== 0 ? 'tile-dfs' : ''}`;
      tile.dataset.value = val;
      tile.dataset.index = index;
      tile.textContent = val === 0 ? '' : val;
      element.appendChild(tile);
    });
  }

  function renderMiniBoard(element, board) {
    if (!element) return;
    element.innerHTML = '';
    board.forEach(val => {
      const tile = document.createElement('div');
      tile.className = `mini-tile ${val === 0 ? 'blank' : 'active'}`;
      tile.textContent = val === 0 ? '' : val;
      element.appendChild(tile);
    });
  }

  function updateSolvabilityUI() {
    const isSolv = PuzzleUtils.isSolvable(initialBoard, goalBoard);
    const invInit = PuzzleUtils.countInversions(initialBoard);
    const invGoal = PuzzleUtils.countInversions(goalBoard);

    if (solvabilityBadge) {
      if (isSolv) {
        solvabilityBadge.className = 'inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20';
        solvabilityBadge.innerHTML = `<span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span> Solvable (Inversions: Initial=${invInit}, Goal=${invGoal})`;
      } else {
        solvabilityBadge.className = 'inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/20';
        solvabilityBadge.innerHTML = `<span class="w-2 h-2 rounded-full bg-rose-400"></span> Unsolvable (Parity mismatch: Initial=${invInit}, Goal=${invGoal})`;
      }
    }
  }

  function updateSuccessorsPreview(currentBoardState) {
    if (!successorsContainer) return;
    successorsContainer.innerHTML = '';

    const dummyState = new PuzzleState(currentBoardState);
    const successors = dummyState.getSuccessors();

    successors.forEach(succ => {
      const card = document.createElement('div');
      card.className = 'flex flex-col items-center bg-slate-900/60 p-2 rounded-lg border border-slate-700/60 text-xs';
      
      const title = document.createElement('span');
      title.className = 'font-semibold text-indigo-400 mb-1 text-[11px]';
      title.textContent = `Action: ${succ.action}`;

      const miniGrid = document.createElement('div');
      miniGrid.className = 'mini-puzzle-grid';
      renderMiniBoard(miniGrid, succ.board);

      card.appendChild(title);
      card.appendChild(miniGrid);
      successorsContainer.appendChild(card);
    });
  }

  function updateFrontierVisualizer(frontierBoards, isStack = true) {
    if (!frontierStackContainer) return;
    frontierStackContainer.innerHTML = '';

    if (!frontierBoards || frontierBoards.length === 0) {
      frontierStackContainer.innerHTML = '<span class="text-xs text-slate-500 italic p-2">Frontier is empty.</span>';
      return;
    }

    frontierBoards.forEach((board, idx) => {
      const card = document.createElement('div');
      const isTop = isStack ? (idx === frontierBoards.length - 1) : (idx === 0);
      card.className = `stack-card flex flex-col items-center gap-1 ${isTop ? 'top-item' : ''}`;

      const badge = document.createElement('span');
      badge.className = `text-[10px] font-mono px-1 rounded ${isTop ? 'bg-pink-500 text-white font-bold' : 'bg-slate-800 text-slate-400'}`;
      badge.textContent = isStack ? (isTop ? 'TOP (LIFO)' : `#${idx + 1}`) : (isTop ? 'FRONT' : `#${idx + 1}`);

      const miniGrid = document.createElement('div');
      miniGrid.className = 'mini-puzzle-grid';
      miniGrid.style.width = '60px';
      miniGrid.style.height = '60px';
      renderMiniBoard(miniGrid, board);

      card.appendChild(badge);
      card.appendChild(miniGrid);
      frontierStackContainer.appendChild(card);
    });
  }

  // Visualizer step callback
  visualizer.onStepChange = (payload) => {
    const isDFS = (algorithmSelect.value === 'DFS');
    renderBoard(mainBoardEl, payload.board, false, isDFS);
    updateSuccessorsPreview(payload.board);

    // Timeline update
    if (timelineSlider) {
      timelineSlider.max = payload.total;
      timelineSlider.value = payload.index;
    }
    if (currentStepLabel) {
      currentStepLabel.textContent = `Step ${payload.index} / ${payload.total}`;
    }
    if (currentActionBadge) {
      currentActionBadge.textContent = payload.step.action || 'Initial';
    }

    // Telemetry display
    if (statCurrentDepth) statCurrentDepth.textContent = payload.step.depth ?? 0;
    if (statCostG) statCostG.textContent = payload.step.cost ?? payload.step.depth ?? 0;
    if (statHeuristicH) statHeuristicH.textContent = payload.step.h !== null ? payload.step.h : 'N/A';
    if (statEvaluationF) statEvaluationF.textContent = payload.step.f !== null ? payload.step.f : 'N/A';

    if (payload.step.frontierSnapshot) {
      updateFrontierVisualizer(payload.step.frontierSnapshot, isDFS);
    }
    if (payload.step.nodesExpanded !== undefined) {
      statNodesExpanded.textContent = payload.step.nodesExpanded;
    }
    if (payload.step.nodesGenerated !== undefined) {
      statNodesGenerated.textContent = payload.step.nodesGenerated;
    }
  };

  visualizer.onPlayStateChange = (playing) => {
    if (playing) {
      btnRun.classList.add('hidden');
      btnResume.classList.add('hidden');
      btnPause.classList.remove('hidden');
    } else {
      btnPause.classList.add('hidden');
      btnResume.classList.remove('hidden');
    }
  };

  // Algorithm configuration changes
  algorithmSelect.addEventListener('change', () => {
    const val = algorithmSelect.value;
    dlsDepthGroup.classList.toggle('hidden', val !== 'DLS');
    heuristicGroup.classList.toggle('hidden', val !== 'GBFS' && val !== 'ASTAR');
    dfsDepthGroup.classList.toggle('hidden', val !== 'DFS');
  });

  // Execute Search
  function runSearch() {
    const alg = algorithmSelect.value;
    const heur = document.querySelector('input[name="heuristic"]:checked')?.value || 'manhattan';
    const dlsLimit = parseInt(document.getElementById('dlsDepthLimit')?.value || '12', 10);
    const dfsMaxDepth = parseInt(document.getElementById('dfsMaxDepth')?.value || '25', 10);

    const isSolv = PuzzleUtils.isSolvable(initialBoard, goalBoard);
    if (!isSolv) {
      alert('Warning: This initial state is mathematically unsolvable for the selected goal state! Inversion parities do not match.');
      return;
    }

    const params = {
      heuristic: heur,
      depthLimit: dlsLimit,
      maxLimit: 22,
      maxDepth: dfsMaxDepth,
      recordSteps: true
    };

    const result = SearchAlgorithms.runAlgorithm(alg, initialBoard, goalBoard, params);
    lastSearchResult = result;

    // Update Summary UI
    statStatus.textContent = result.found ? 'Solution Found' : (result.statusMessage || 'Cutoff / Not Found');
    statStatus.className = result.found ? 'text-emerald-400 font-semibold' : 'text-amber-400 font-semibold';
    statMoves.textContent = result.found ? result.moves : '-';
    statNodesExpanded.textContent = result.nodesExpanded.toLocaleString();
    statNodesGenerated.textContent = result.nodesGenerated.toLocaleString();
    statTime.textContent = `${result.executionTimeMs} ms`;
    statMemory.textContent = `~${result.memoryUsageKB} KB (${result.memoryRating})`;

    const selectedMode = document.querySelector('input[name="viewMode"]:checked')?.value || 'solution';
    visualizer.loadSearchResult(result, selectedMode);
    visualizer.play();
  }

  // Playback Buttons
  btnRun.addEventListener('click', runSearch);
  btnPause.addEventListener('click', () => visualizer.pause());
  btnResume.addEventListener('click', () => visualizer.resume());
  btnNext.addEventListener('click', () => visualizer.nextStep());
  btnPrev.addEventListener('click', () => visualizer.prevStep());
  btnReset.addEventListener('click', () => visualizer.reset());

  timelineSlider.addEventListener('input', (e) => {
    visualizer.goToStep(parseInt(e.target.value, 10));
  });

  speedSlider.addEventListener('input', (e) => {
    const val = parseInt(e.target.value, 10);
    // Invert so higher slider value = faster animation
    const ms = 1050 - val;
    visualizer.setSpeed(ms);
    speedLabel.textContent = `${val > 800 ? 'Fast' : val > 400 ? 'Normal' : 'Slow'} (${ms}ms)`;
  });

  viewModeRadios.forEach(radio => {
    radio.addEventListener('change', () => {
      if (lastSearchResult) {
        visualizer.loadSearchResult(lastSearchResult, radio.value);
      }
    });
  });

  // Random Solvable Puzzle Generator
  btnRandomSolvable.addEventListener('click', () => {
    // Generate board 8-14 moves away from goal to keep puzzles interesting and quick
    initialBoard = PuzzleUtils.generateRandomSolvable(goalBoard, 10);
    visualizer.setBoards(initialBoard, goalBoard);
    renderMiniBoard(initialMiniEl, initialBoard);
    updateSolvabilityUI();
    renderBoard(mainBoardEl, initialBoard);
    updateSuccessorsPreview(initialBoard);
    resetStats();
  });

  // Preset Selector
  presetSelect.addEventListener('change', () => {
    const val = presetSelect.value;
    if (val === 'assignment') {
      // Assignment doc example:
      // 2 8 3 / 1 6 4 / 7 _ 5  => Goal: 1 2 3 / 8 _ 4 / 7 6 5
      initialBoard = [2, 8, 3, 1, 6, 4, 7, 0, 5];
      goalBoard = [1, 2, 3, 8, 0, 4, 7, 6, 5];
    } else if (val === 'easy3') {
      goalBoard = [1, 2, 3, 8, 0, 4, 7, 6, 5];
      initialBoard = [1, 2, 3, 8, 4, 0, 7, 6, 5]; // 1 move
    } else if (val === 'medium5') {
      goalBoard = [1, 2, 3, 4, 5, 6, 7, 8, 0];
      initialBoard = [1, 2, 3, 0, 4, 6, 7, 5, 8];
    } else if (val === 'classic_standard') {
      goalBoard = [1, 2, 3, 4, 5, 6, 7, 8, 0];
      initialBoard = [1, 2, 3, 4, 0, 5, 7, 8, 6];
    }

    visualizer.setBoards(initialBoard, goalBoard);
    renderMiniBoard(initialMiniEl, initialBoard);
    renderMiniBoard(goalMiniEl, goalBoard);
    updateSolvabilityUI();
    renderBoard(mainBoardEl, initialBoard);
    updateSuccessorsPreview(initialBoard);
    resetStats();
  });

  function resetStats() {
    statStatus.textContent = 'Ready';
    statStatus.className = 'text-slate-300 font-medium';
    statMoves.textContent = '-';
    statNodesExpanded.textContent = '0';
    statNodesGenerated.textContent = '0';
    statCurrentDepth.textContent = '0';
    statTime.textContent = '0 ms';
    statMemory.textContent = '-';
    statCostG.textContent = '0';
    statHeuristicH.textContent = 'N/A';
    statEvaluationF.textContent = 'N/A';
    if (currentStepLabel) currentStepLabel.textContent = 'Step 0 / 0';
    if (currentActionBadge) currentActionBadge.textContent = 'None';
    if (frontierStackContainer) frontierStackContainer.innerHTML = '<span class="text-xs text-slate-500 italic p-2">Ready to run search</span>';
    btnRun.classList.remove('hidden');
    btnPause.classList.add('hidden');
    btnResume.classList.add('hidden');
  }

  // Custom Input Modal
  btnOpenCustomModal.addEventListener('click', () => {
    // Populate modal inputs with current board
    for (let i = 0; i < 9; i++) {
      const initInp = document.getElementById(`customInit_${i}`);
      const goalInp = document.getElementById(`customGoal_${i}`);
      if (initInp) initInp.value = initialBoard[i];
      if (goalInp) goalInp.value = goalBoard[i];
    }
    customModal.classList.remove('hidden');
  });

  btnCloseCustomModal.addEventListener('click', () => {
    customModal.classList.add('hidden');
  });

  btnSaveCustomBoard.addEventListener('click', () => {
    const newInit = [];
    const newGoal = [];
    for (let i = 0; i < 9; i++) {
      const valI = parseInt(document.getElementById(`customInit_${i}`).value, 10);
      const valG = parseInt(document.getElementById(`customGoal_${i}`).value, 10);
      newInit.push(isNaN(valI) ? 0 : valI);
      newGoal.push(isNaN(valG) ? 0 : valG);
    }

    if (!PuzzleUtils.isValidBoard(newInit) || !PuzzleUtils.isValidBoard(newGoal)) {
      alert('Invalid configuration! Each board must contain numbers 0 through 8 exactly once (0 represents the blank tile).');
      return;
    }

    initialBoard = newInit;
    goalBoard = newGoal;
    customModal.classList.add('hidden');

    visualizer.setBoards(initialBoard, goalBoard);
    renderMiniBoard(initialMiniEl, initialBoard);
    renderMiniBoard(goalMiniEl, goalBoard);
    updateSolvabilityUI();
    renderBoard(mainBoardEl, initialBoard);
    updateSuccessorsPreview(initialBoard);
    resetStats();
  });

  // Multi-Algorithm Comparison Engine
  const btnRunComparison = document.getElementById('btnRunComparison');
  const comparisonResultsTable = document.getElementById('comparisonResultsTable');

  if (btnRunComparison) {
    btnRunComparison.addEventListener('click', () => {
      btnRunComparison.disabled = true;
      btnRunComparison.innerHTML = '<span class="animate-spin inline-block mr-2">⚙</span> Benchmarking...';

      setTimeout(() => {
        const algorithms = [
          { name: 'Breadth First Search (BFS)', key: 'BFS', params: {} },
          { name: 'Depth First Search (DFS)', key: 'DFS', params: { maxDepth: 25 }, isAssigned: true },
          { name: 'Depth Limited Search (DLS)', key: 'DLS', params: { depthLimit: 12 } },
          { name: 'Iterative Deepening (IDDLS)', key: 'IDDLS', params: { maxLimit: 18 } },
          { name: 'Greedy Best First (GBFS - Manhattan)', key: 'GBFS', params: { heuristic: 'manhattan' } },
          { name: 'A* Search (Manhattan)', key: 'ASTAR', params: { heuristic: 'manhattan' } }
        ];

        comparisonResultsTable.innerHTML = '';
        let maxExp = 1;
        const results = [];

        algorithms.forEach(alg => {
          const res = SearchAlgorithms.runAlgorithm(alg.key, initialBoard, goalBoard, {
            ...alg.params,
            recordSteps: false
          });
          results.push({ ...alg, res });
          if (res.nodesExpanded > maxExp) maxExp = res.nodesExpanded;
        });

        results.forEach(item => {
          const row = document.createElement('tr');
          row.className = `border-b border-slate-700/60 hover:bg-slate-800/40 transition-colors ${item.isAssigned ? 'bg-pink-950/20' : ''}`;

          const pctExp = Math.max(5, Math.min(100, (item.res.nodesExpanded / maxExp) * 100));

          row.innerHTML = `
            <td class="px-4 py-3 font-medium flex items-center gap-2">
              ${item.name}
              ${item.isAssigned ? '<span class="badge-dfs text-[10px]">Assigned</span>' : ''}
            </td>
            <td class="px-4 py-3">
              <span class="inline-flex px-2 py-0.5 rounded text-xs font-semibold ${item.res.found ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'}">
                ${item.res.found ? 'Yes' : 'No'}
              </span>
            </td>
            <td class="px-4 py-3">
              <div class="flex items-center gap-2">
                <span class="font-mono text-sm">${item.res.nodesExpanded.toLocaleString()}</span>
                <div class="bar-track w-16 hidden sm:block">
                  <div class="bar-fill ${item.isAssigned ? 'bg-pink-500' : 'bg-indigo-500'}" style="width: ${pctExp}%"></div>
                </div>
              </div>
            </td>
            <td class="px-4 py-3 font-mono">${item.res.found ? item.res.moves : '-'}</td>
            <td class="px-4 py-3 font-mono">${item.res.executionTimeMs} ms</td>
            <td class="px-4 py-3 font-mono text-xs">
              <span class="px-2 py-0.5 rounded ${item.res.memoryRating === 'Low' ? 'bg-blue-500/20 text-blue-300' : item.res.memoryRating === 'Medium' ? 'bg-yellow-500/20 text-yellow-300' : 'bg-red-500/20 text-red-300'}">
                ${item.res.memoryRating} (~${item.res.memoryUsageKB} KB)
              </span>
            </td>
          `;
          comparisonResultsTable.appendChild(row);
        });

        btnRunComparison.disabled = false;
        btnRunComparison.innerHTML = '⚡ Run All Algorithms Benchmark';
      }, 50);
    });
  }

  // Navigation tab switching
  const navTabs = document.querySelectorAll('.nav-tab');
  const tabContents = document.querySelectorAll('.tab-content');

  navTabs.forEach(tab => {
    tab.addEventListener('click', (e) => {
      e.preventDefault();
      const targetId = tab.dataset.target;
      navTabs.forEach(t => t.classList.remove('active', 'border-indigo-500', 'text-white'));
      navTabs.forEach(t => t.classList.add('border-transparent', 'text-slate-400'));
      tab.classList.add('active', 'border-indigo-500', 'text-white');
      tab.classList.remove('border-transparent', 'text-slate-400');

      tabContents.forEach(content => {
        content.classList.toggle('hidden', content.id !== targetId);
      });
    });
  });

  // Initial render
  visualizer.setBoards(initialBoard, goalBoard);
  renderBoard(mainBoardEl, initialBoard, false, true);
  renderMiniBoard(initialMiniEl, initialBoard);
  renderMiniBoard(goalMiniEl, goalBoard);
  updateSolvabilityUI();
  updateSuccessorsPreview(initialBoard);
  updateFrontierVisualizer([initialBoard], true);
  resetStats();
});
