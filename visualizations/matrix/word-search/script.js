/**
 * Word Search Visualization
 * Find a word in a 2D grid using DFS with backtracking
 */

class WordSearchVisualizer extends VisualizerBase {
    constructor() {
        super({
            codeLineCount: 13,
        });

        this.board = [];
        this.word = '';
        this.rows = 0;
        this.cols = 0;

        // Scanning state
        this.scanI = 0;
        this.scanJ = 0;

        // DFS state
        this.phase = 'scanning'; // 'scanning' | 'dfs' | 'found' | 'not-found'
        this.dfsStack = [];      // {row, col, wordIndex, dirIndex}
        this.currentPath = [];   // {row, col}
        this.pathSet = new Set();
        this.cellsExplored = 0;
        this.foundPath = null;

        // Directions: right, down, left, up
        this.directions = [[0, 1], [1, 0], [0, -1], [-1, 0]];
        this.dirNames = ['right', 'down', 'left', 'up'];
    }

    init() {
        this.parseGrid();
        this.word = document.getElementById('wordInput').value.trim().toUpperCase();

        if (this.word.length === 0) {
            this.word = 'ABCCED';
            document.getElementById('wordInput').value = this.word;
        }

        // Reset state
        this.scanI = 0;
        this.scanJ = 0;
        this.phase = 'scanning';
        this.dfsStack = [];
        this.currentPath = [];
        this.pathSet = new Set();
        this.cellsExplored = 0;
        this.foundPath = null;
        this.isFinished = false;

        if (this.isPlaying) {
            this.pause();
        }

        this.renderBoard();
        this.renderWordProgress();
        this.renderPath();
        this.updateInfoPanel();
        this.clearCodeHighlight();
        this.highlightCode(1);
        this.updateStatus('Click "Step" or "Play" to start the visualization');
    }

    parseGrid() {
        const input = document.getElementById('gridInput').value;
        const rows = input.split(';').map(row =>
            row.split(',').map(cell => cell.trim().toUpperCase())
        );

        if (rows.length === 0 || rows[0].length === 0 || !rows[0][0]) {
            // Default grid
            this.board = [
                ['A', 'B', 'C', 'E'],
                ['S', 'F', 'C', 'S'],
                ['A', 'D', 'E', 'E']
            ];
        } else {
            this.board = rows;
        }

        this.rows = this.board.length;
        this.cols = this.board[0].length;
    }

    generateRandom() {
        const rows = 4;
        const cols = 4;
        const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

        // Fill grid with random letters
        const grid = [];
        for (let i = 0; i < rows; i++) {
            grid[i] = [];
            for (let j = 0; j < cols; j++) {
                grid[i][j] = letters[Math.floor(Math.random() * letters.length)];
            }
        }

        // Generate a word by walking a random DFS path
        const wordLen = 3 + Math.floor(Math.random() * 3); // 3-5 chars
        const startR = Math.floor(Math.random() * rows);
        const startC = Math.floor(Math.random() * cols);
        const path = [{r: startR, c: startC}];
        const visited = new Set([`${startR}-${startC}`]);
        let word = grid[startR][startC];

        while (path.length < wordLen) {
            const last = path[path.length - 1];
            const options = [];
            for (const [dr, dc] of this.directions) {
                const nr = last.r + dr;
                const nc = last.c + dc;
                if (nr >= 0 && nr < rows && nc >= 0 && nc < cols && !visited.has(`${nr}-${nc}`)) {
                    options.push({r: nr, c: nc});
                }
            }
            if (options.length === 0) break;
            const next = options[Math.floor(Math.random() * options.length)];
            path.push(next);
            visited.add(`${next.r}-${next.c}`);
            word += grid[next.r][next.c];
        }

        // Set inputs
        const gridStr = grid.map(row => row.join(',')).join(';');
        document.getElementById('gridInput').value = gridStr;
        document.getElementById('wordInput').value = word;

        this.init();
    }

    step() {
        if (this.isFinished) return;

        switch (this.phase) {
            case 'scanning':
                this.stepScanning();
                break;
            case 'dfs':
                this.stepDFS();
                break;
        }
    }

    stepScanning() {
        // Check if we've exhausted all cells
        if (this.scanI >= this.rows) {
            this.phase = 'not-found';
            this.highlightCode(4);
            this.updateStatus('Word "' + this.word + '" not found in the grid', 'error');
            this.finish();
            this.renderBoard();
            this.updateInfoPanel();
            return;
        }

        this.cellsExplored++;
        const char = this.board[this.scanI][this.scanJ];

        this.highlightCode(2);

        if (char === this.word[0]) {
            // First character matches — start DFS
            this.updateStatus(`Found '${char}' at (${this.scanI},${this.scanJ}), starting DFS`);
            this.highlightCode(3);

            this.dfsStack = [{
                row: this.scanI,
                col: this.scanJ,
                wordIndex: 0,
                dirIndex: -1
            }];
            this.currentPath = [{row: this.scanI, col: this.scanJ}];
            this.pathSet = new Set([`${this.scanI}-${this.scanJ}`]);
            this.phase = 'dfs';
        } else {
            this.updateStatus(`Cell (${this.scanI},${this.scanJ}) is '${char}', need '${this.word[0]}' — skipping`);
            this.advanceScan();
        }

        this.renderBoard();
        this.renderWordProgress();
        this.renderPath();
        this.updateInfoPanel();
    }

    stepDFS() {
        if (this.dfsStack.length === 0) return;

        const frame = this.dfsStack[this.dfsStack.length - 1];

        // Just arrived at this cell
        if (frame.dirIndex === -1) {
            // Check if word is complete
            if (frame.wordIndex === this.word.length - 1) {
                this.foundPath = this.currentPath.map(p => `${p.row}-${p.col}`);
                this.phase = 'found';
                this.highlightCode(6);
                this.updateStatus('Word "' + this.word + '" found!', 'success');
                this.finish();
                this.renderBoard();
                this.renderWordProgress();
                this.updateInfoPanel();
                return;
            }

            frame.dirIndex = 0;
            this.highlightCode(9);
            const matched = this.word.substring(0, frame.wordIndex + 1);
            this.updateStatus(`At (${frame.row},${frame.col}), matched "${matched}" — exploring neighbors`);
            this.renderBoard();
            this.renderWordProgress();
            this.renderPath();
            this.updateInfoPanel();
            return;
        }

        // Try directions — skip invalid ones in a loop, stop on first valid or exhaustion
        while (frame.dirIndex < 4) {
            const [dr, dc] = this.directions[frame.dirIndex];
            const nr = frame.row + dr;
            const nc = frame.col + dc;
            const dirName = this.dirNames[frame.dirIndex];
            frame.dirIndex++;

            // Bounds check
            if (nr < 0 || nr >= this.rows || nc < 0 || nc >= this.cols) continue;
            // Already in path
            if (this.pathSet.has(`${nr}-${nc}`)) continue;
            // Character mismatch
            const nextChar = this.word[frame.wordIndex + 1];
            if (this.board[nr][nc] !== nextChar) continue;

            // Valid match — push new frame
            this.dfsStack.push({
                row: nr,
                col: nc,
                wordIndex: frame.wordIndex + 1,
                dirIndex: -1
            });
            this.currentPath.push({row: nr, col: nc});
            this.pathSet.add(`${nr}-${nc}`);
            this.cellsExplored++;

            this.highlightCode(10);
            this.updateStatus(`${dirName}: '${this.board[nr][nc]}' at (${nr},${nc}) matches word[${frame.wordIndex + 1}]`);
            this.renderBoard();
            this.renderWordProgress();
            this.renderPath();
            this.updateInfoPanel();
            return;
        }

        // All 4 directions exhausted — backtrack
        this.dfsStack.pop();
        const removed = this.currentPath.pop();
        this.pathSet.delete(`${removed.row}-${removed.col}`);

        this.highlightCode(11);
        this.updateStatus(`Backtracking from (${frame.row},${frame.col}) — no valid neighbor`);

        // Flash the cell red
        const cellEl = document.getElementById(`cell-${frame.row}-${frame.col}`);
        if (cellEl) {
            cellEl.className = 'grid-cell backtrack';
        }

        if (this.dfsStack.length === 0) {
            // DFS from this starting cell failed — resume scanning
            this.phase = 'scanning';
            this.advanceScan();
            this.highlightCode(1);
            this.updateStatus(`No path from (${frame.row},${frame.col}), continuing scan...`);
        }

        this.renderBoard();
        this.renderWordProgress();
        this.renderPath();
        this.updateInfoPanel();
    }

    advanceScan() {
        this.scanJ++;
        if (this.scanJ >= this.cols) {
            this.scanJ = 0;
            this.scanI++;
        }
    }

    // --- Rendering ---

    renderBoard() {
        const container = document.getElementById('gridContainer');
        if (!container) return;

        container.innerHTML = '';

        const grid = document.createElement('div');
        grid.className = 'grid';
        grid.style.gridTemplateColumns = `repeat(${this.cols}, 45px)`;

        for (let i = 0; i < this.rows; i++) {
            for (let j = 0; j < this.cols; j++) {
                const cell = document.createElement('div');
                cell.className = 'grid-cell';
                cell.id = `cell-${i}-${j}`;
                cell.textContent = this.board[i][j];

                const key = `${i}-${j}`;

                if (this.foundPath && this.foundPath.includes(key)) {
                    cell.classList.add('found');
                } else if (this.dfsStack.length > 0 && this.dfsStack[this.dfsStack.length - 1].row === i && this.dfsStack[this.dfsStack.length - 1].col === j) {
                    cell.classList.add('current');
                } else if (this.pathSet.has(key)) {
                    cell.classList.add('path');
                } else if (this.phase === 'scanning' && i === this.scanI && j === this.scanJ) {
                    cell.classList.add('scanning');
                } else {
                    cell.classList.add('default');
                }

                grid.appendChild(cell);
            }
        }

        container.appendChild(grid);
    }

    renderWordProgress() {
        const container = document.getElementById('wordProgress');
        if (!container) return;

        container.innerHTML = '';

        const matchedCount = this.currentPath.length;

        for (let i = 0; i < this.word.length; i++) {
            const charBox = document.createElement('div');
            charBox.className = 'word-char';
            charBox.textContent = this.word[i];

            if (this.foundPath) {
                charBox.classList.add('matched');
            } else if (i < matchedCount) {
                charBox.classList.add('matched');
            } else if (i === matchedCount) {
                charBox.classList.add('active');
            }

            container.appendChild(charBox);
        }
    }

    renderPath() {
        const container = document.getElementById('pathDisplay');
        if (!container) return;

        if (this.currentPath.length === 0) {
            container.innerHTML = '<span class="empty-text">Empty</span>';
            return;
        }

        container.innerHTML = '';

        for (const p of this.currentPath) {
            const item = document.createElement('span');
            item.className = 'queue-item';
            item.textContent = `(${p.row},${p.col}):${this.board[p.row][p.col]}`;
            container.appendChild(item);
        }
    }

    updateInfoPanel() {
        const phaseLabels = {
            'scanning': 'Scanning',
            'dfs': 'DFS',
            'found': 'Found!',
            'not-found': 'Not Found'
        };

        this.updateInfoBox('phaseInfo', phaseLabels[this.phase] || '-');

        if (this.phase === 'scanning') {
            this.updateInfoBox('currentCell', this.scanI < this.rows ? `(${this.scanI},${this.scanJ})` : '-');
        } else if (this.dfsStack.length > 0) {
            const top = this.dfsStack[this.dfsStack.length - 1];
            this.updateInfoBox('currentCell', `(${top.row},${top.col})`);
        } else {
            this.updateInfoBox('currentCell', '-');
        }

        const matched = this.currentPath.map(p => this.board[p.row][p.col]).join('');
        this.updateInfoBox('wordMatchInfo', matched || '-');
        this.updateInfoBox('cellsExplored', this.cellsExplored);
    }
}

// Initialize
const visualizer = new WordSearchVisualizer();

window.onload = () => {
    visualizer.bindControls();
    visualizer.init();

    document.getElementById('randomBtn').addEventListener('click', () => {
        visualizer.generateRandom();
    });
};
