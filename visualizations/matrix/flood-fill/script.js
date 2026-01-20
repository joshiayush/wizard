/**
 * Flood Fill Visualization
 * Fill connected pixels using BFS traversal
 */

class FloodFillVisualizer extends VisualizerBase {
    constructor() {
        super({
            codeLineCount: 10,
        });

        this.grid = [];
        this.visited = [];
        this.rows = 0;
        this.cols = 0;
        this.sr = 0;
        this.sc = 0;
        this.originalColor = 0;
        this.newColor = 0;
        this.queue = [];
        this.filledCells = new Set();
    }

    init() {
        // Parse inputs
        this.parseGrid();
        this.parseStart();
        this.newColor = parseInt(document.getElementById("colorInput").value) || 2;

        // Get original color at starting position
        if (this.sr < this.rows && this.sc < this.cols) {
            this.originalColor = this.grid[this.sr][this.sc];
        }

        // Reset state
        this.visited = this.grid.map((row) => row.map(() => false));
        this.queue = [];
        this.filledCells = new Set();
        this.isFinished = false;

        // Initialize queue with starting position
        if (this.sr < this.rows && this.sc < this.cols) {
            this.queue.push([this.sr, this.sc]);
        }

        if (this.isPlaying) {
            this.pause();
        }

        // Render
        this.renderGrid();
        this.renderQueue();
        this.updateInfoPanel();
        this.clearCodeHighlight();
        this.highlightCode(0);
        this.highlightCode(1);
        this.updateStatus('Click "Step" or "Play" to start flood fill from (' + this.sr + ', ' + this.sc + ')');
    }

    parseGrid() {
        const input = document.getElementById("gridInput").value;
        const rows = input.split(";").map((row) =>
            row.split(",").map((cell) => parseInt(cell.trim()) || 0)
        );

        if (rows.length === 0 || rows[0].length === 0) {
            // Default grid
            this.grid = [
                [1, 1, 1],
                [1, 1, 0],
                [1, 0, 1],
            ];
        } else {
            this.grid = rows;
        }

        this.rows = this.grid.length;
        this.cols = this.grid[0].length;
    }

    parseStart() {
        const input = document.getElementById("startInput").value;
        const parts = input.split(",").map((p) => parseInt(p.trim()) || 0);
        this.sr = parts[0] || 0;
        this.sc = parts[1] || 0;

        // Clamp to grid bounds
        this.sr = Math.max(0, Math.min(this.sr, this.rows - 1));
        this.sc = Math.max(0, Math.min(this.sc, this.cols - 1));
    }

    generateRandom() {
        const rows = Math.floor(Math.random() * 2) + 4; // 4-5 rows
        const cols = Math.floor(Math.random() * 2) + 5; // 5-6 cols

        // Create grid with clustered colors
        const grid = [];
        const baseColor = Math.floor(Math.random() * 3) + 1; // 1-3
        const otherColor = baseColor + 3;

        for (let i = 0; i < rows; i++) {
            const row = [];
            for (let j = 0; j < cols; j++) {
                // Create clustered regions
                if (Math.random() < 0.7) {
                    row.push(baseColor);
                } else {
                    row.push(otherColor);
                }
            }
            grid.push(row.join(","));
        }

        document.getElementById("gridInput").value = grid.join(";");

        // Random starting position
        const sr = Math.floor(Math.random() * rows);
        const sc = Math.floor(Math.random() * cols);
        document.getElementById("startInput").value = `${sr},${sc}`;

        // Random new color different from base
        let newColor = Math.floor(Math.random() * 9) + 1;
        while (newColor === baseColor || newColor === otherColor) {
            newColor = Math.floor(Math.random() * 9) + 1;
        }
        document.getElementById("colorInput").value = newColor;

        this.init();
    }

    renderGrid() {
        const container = document.getElementById("gridContainer");
        container.innerHTML = "";

        const gridEl = document.createElement("div");
        gridEl.className = "grid";
        gridEl.style.gridTemplateColumns = `repeat(${this.cols}, 1fr)`;

        for (let i = 0; i < this.rows; i++) {
            for (let j = 0; j < this.cols; j++) {
                const cell = document.createElement("div");
                cell.className = "grid-cell";
                cell.id = `cell-${i}-${j}`;

                const value = this.grid[i][j];
                cell.textContent = value;
                cell.classList.add(`color-${value % 10}`);

                // Mark start cell
                if (i === this.sr && j === this.sc && !this.filledCells.has(`${i}-${j}`)) {
                    cell.classList.add("start-cell");
                }

                // Mark filled cells
                if (this.filledCells.has(`${i}-${j}`)) {
                    cell.classList.add("filled");
                }

                // Mark cells in queue
                if (this.queue.some(([qi, qj]) => qi === i && qj === j)) {
                    cell.classList.add("in-queue");
                }

                // Mark current cell (first in queue)
                if (this.queue.length > 0 && this.queue[0][0] === i && this.queue[0][1] === j) {
                    cell.classList.add("current");
                }

                gridEl.appendChild(cell);
            }
        }

        container.appendChild(gridEl);
    }

    renderQueue() {
        const container = document.getElementById("queueDisplay");

        if (this.queue.length === 0) {
            container.innerHTML = '<span class="empty-text">Empty</span>';
            return;
        }

        container.innerHTML = "";
        this.queue.forEach(([i, j], idx) => {
            const item = document.createElement("span");
            item.className = "queue-item";
            if (idx === 0) {
                item.style.background = "#4a2a4a";
                item.style.borderColor = "#ff79c6";
            }
            item.textContent = `(${i},${j})`;
            container.appendChild(item);
        });
    }

    updateInfoPanel() {
        if (this.queue.length > 0) {
            const [i, j] = this.queue[0];
            this.updateInfoBox("currentCell", `(${i}, ${j})`);
        } else {
            this.updateInfoBox("currentCell", "-");
        }
        this.updateInfoBox("originalColor", this.originalColor);
        this.updateInfoBox("newColor", this.newColor);
        this.updateInfoBox("queueSize", this.queue.length);
    }

    isInBounds(i, j) {
        return i >= 0 && i < this.rows && j >= 0 && j < this.cols;
    }

    step() {
        if (this.isFinished) {
            return;
        }

        // Check if queue is empty
        if (this.queue.length === 0) {
            this.finish();
            this.clearCodeHighlight();
            this.renderGrid();
            this.updateStatus(
                `Done! Flood fill complete. Filled ${this.filledCells.size} cells with color ${this.newColor}.`,
                "success"
            );
            return;
        }

        this.highlightCode(2);
        this.highlightCode(3);

        // Dequeue
        const [i, j] = this.queue.shift();
        this.updateStatus(`Dequeued cell (${i}, ${j})`);
        this.renderGrid();
        this.renderQueue();
        this.updateInfoPanel();

        setTimeout(() => {
            // Check bounds and color match
            this.highlightCode(4);
            this.highlightCode(5);

            if (!this.isInBounds(i, j)) {
                this.updateStatus(`Cell (${i}, ${j}) is out of bounds, skipping`);
                this.renderGrid();
                return;
            }

            if (this.grid[i][j] !== this.originalColor) {
                this.updateStatus(`Cell (${i}, ${j}) has color ${this.grid[i][j]}, not original color ${this.originalColor}, skipping`);
                this.renderGrid();
                return;
            }

            if (this.visited[i][j]) {
                this.updateStatus(`Cell (${i}, ${j}) already visited, skipping`);
                this.renderGrid();
                return;
            }

            setTimeout(() => {
                // Mark as visited and fill
                this.highlightCode(6);
                this.highlightCode(7);
                this.visited[i][j] = true;
                this.grid[i][j] = this.newColor;
                this.filledCells.add(`${i}-${j}`);

                this.updateStatus(`Filled cell (${i}, ${j}) with color ${this.newColor}`);
                this.renderGrid();

                // Add pop animation
                const cellEl = document.getElementById(`cell-${i}-${j}`);
                if (cellEl) {
                    cellEl.classList.add("filled");
                }

                setTimeout(() => {
                    // Add neighbors to queue
                    this.highlightCode(8);
                    this.highlightCode(9);

                    const directions = [
                        [-1, 0], // up
                        [0, 1],  // right
                        [1, 0],  // down
                        [0, -1], // left
                    ];

                    let addedCount = 0;
                    for (const [di, dj] of directions) {
                        const ni = i + di;
                        const nj = j + dj;

                        // Only add if in bounds, matches original color, and not visited
                        if (
                            this.isInBounds(ni, nj) &&
                            this.grid[ni][nj] === this.originalColor &&
                            !this.visited[ni][nj] &&
                            !this.queue.some(([qi, qj]) => qi === ni && qj === nj)
                        ) {
                            this.queue.push([ni, nj]);
                            addedCount++;
                        }
                    }

                    if (addedCount > 0) {
                        this.updateStatus(`Added ${addedCount} neighbor(s) to queue`);
                    } else {
                        this.updateStatus(`No new neighbors to add from (${i}, ${j})`);
                    }

                    this.renderGrid();
                    this.renderQueue();
                    this.updateInfoPanel();
                }, this.getSpeed() / 4);
            }, this.getSpeed() / 4);
        }, this.getSpeed() / 4);
    }
}

// Initialize
const visualizer = new FloodFillVisualizer();

window.onload = () => {
    visualizer.bindControls();
    visualizer.init();

    // Bind random button
    document.getElementById("randomBtn").addEventListener("click", () => {
        visualizer.generateRandom();
    });
};
