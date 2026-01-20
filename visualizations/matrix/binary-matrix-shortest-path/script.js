/**
 * Binary Matrix Shortest Path Visualization
 * Find shortest path using 8-directional BFS
 */

class ShortestPathVisualizer extends VisualizerBase {
    constructor() {
        super({
            codeLineCount: 11,
        });

        this.grid = [];
        this.visited = [];
        this.distances = [];
        this.parent = [];
        this.rows = 0;
        this.cols = 0;
        this.queue = [];
        this.shortestPath = -1;
        this.pathCells = new Set();
        this.foundGoal = false;
        this.noPath = false;

        // Track the specific cell currently being processed for animation
        this.currentCell = null;
        this.isProcessing = false;

        // 8 directions: up, up-right, right, down-right, down, down-left, left, up-left
        this.directions = [
            [-1, 0],
            [-1, 1],
            [0, 1],
            [1, 1],
            [1, 0],
            [1, -1],
            [0, -1],
            [-1, -1],
        ];
    }

    init() {
        this.parseGrid();

        this.visited = this.grid.map((row) => row.map(() => false));
        this.distances = this.grid.map((row) => row.map(() => -1));
        this.parent = this.grid.map((row) => row.map(() => null));
        this.queue = [];
        this.shortestPath = -1;
        this.pathCells = new Set();
        this.foundGoal = false;
        this.noPath = false;
        this.isFinished = false;
        this.currentCell = null;
        this.isProcessing = false;

        if (
            this.grid[0][0] !== 0 ||
            this.grid[this.rows - 1][this.cols - 1] !== 0
        ) {
            this.noPath = true;
            this.isFinished = true;
        } else {
            this.queue.push([0, 0, 1]);
        }

        if (this.isPlaying) this.pause();

        this.renderGrid();
        this.renderQueue();
        this.updateInfoPanel();
        this.clearCodeHighlight();

        if (this.noPath) {
            this.highlightCode(0);
            this.highlightCode(1);
            this.updateStatus("Start or goal cell is blocked!", "error");
        } else {
            this.highlightCode(2);
            this.updateStatus('Click "Step" or "Play" to start.');
        }
    }

    parseGrid() {
        const input = document.getElementById("gridInput").value.trim();
        const rows = input
            .split(";")
            .filter((r) => r.trim())
            .map((row) =>
                row
                    .split(",")
                    .filter((c) => c.trim())
                    .map((cell) => parseInt(cell.trim()) || 0),
            );

        this.grid =
            rows.length === 0 || rows[0].length === 0
                ? [
                      [0, 0, 0],
                      [1, 1, 0],
                      [1, 1, 0],
                  ]
                : rows;
        this.rows = this.grid.length;
        this.cols = this.grid[0].length;
    }

    generateRandom() {
        const size = Math.floor(Math.random() * 2) + 4; // 4-5 size

        const grid = [];
        for (let i = 0; i < size; i++) {
            const row = [];
            for (let j = 0; j < size; j++) {
                // Keep start and end clear
                if ((i === 0 && j === 0) || (i === size - 1 && j === size - 1)) {
                    row.push(0);
                } else {
                    row.push(Math.random() < 0.3 ? 1 : 0);
                }
            }
            grid.push(row.join(","));
        }

        document.getElementById("gridInput").value = grid.join(";");
        this.init();
    }

    renderQueue() {
        const container = document.getElementById("queueDisplay");

        if (this.queue.length === 0) {
            container.innerHTML = '<span class="empty-text">Empty</span>';
            return;
        }

        container.innerHTML = "";
        this.queue.forEach(([i, j, dist], idx) => {
            const item = document.createElement("span");
            item.className = "queue-item";
            if (idx === 0) {
                item.classList.add("first");
            }
            item.textContent = `(${i},${j}):${dist}`;
            container.appendChild(item);
        });
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
                const value = this.grid[i][j];
                const isStart = i === 0 && j === 0;
                const isGoal = i === this.rows - 1 && j === this.cols - 1;

                // Use currentCell for highlight, not the queue front
                const isCurrent =
                    this.currentCell &&
                    this.currentCell[0] === i &&
                    this.currentCell[1] === j;
                const isInQueue = this.queue.some(
                    ([qi, qj]) => qi === i && qj === j,
                );

                if (this.pathCells.has(`${i}-${j}`)) cell.classList.add("path");
                else if (isCurrent) cell.classList.add("current");
                else if (this.visited[i][j]) cell.classList.add("visited");
                else if (isInQueue) cell.classList.add("in-queue");
                else if (value === 1) cell.classList.add("blocked");
                else cell.classList.add("clear");

                if (isStart) cell.innerHTML = "S";
                else if (isGoal) cell.innerHTML = "G";
                else if (
                    this.visited[i][j] ||
                    this.pathCells.has(`${i}-${j}`)
                ) {
                    cell.innerHTML = `<span class="cell-distance">${this.distances[i][j]}</span>`;
                } else cell.textContent = value;

                gridEl.appendChild(cell);
            }
        }
        container.appendChild(gridEl);
    }

    updateInfoPanel() {
        // Show the cell currently being expanded
        if (this.currentCell) {
            this.updateInfoBox(
                "currentCell",
                `(${this.currentCell[0]}, ${this.currentCell[1]})`,
            );
            this.updateInfoBox("currentDistance", this.currentCell[2]);
        } else {
            this.updateInfoBox("currentCell", "-");
            this.updateInfoBox("currentDistance", "-");
        }
        this.updateInfoBox("queueSize", this.queue.length);
        this.updateInfoBox(
            "shortestPath",
            this.noPath
                ? "No path"
                : this.shortestPath !== -1
                  ? this.shortestPath
                  : "-",
        );
    }

    step() {
        // Prevent concurrent steps or acting on a finished simulation
        if (this.isFinished || this.isProcessing) return;

        if (this.queue.length === 0) {
            this.noPath = true;
            this.finish();
            this.highlightCode(10);
            this.updateInfoPanel();
            this.updateStatus("No path found! Goal is unreachable.", "error");
            return;
        }

        this.isProcessing = true;
        this.currentCell = this.queue.shift();
        const [i, j, dist] = this.currentCell;

        this.highlightCode(3);
        this.highlightCode(4);
        this.updateStatus(`Dequeued cell (${i}, ${j})`);
        this.renderGrid();
        this.renderQueue();

        setTimeout(() => {
            this.highlightCode(5);
            // In a BFS visualizer, we usually validate at push-time, but we follow your logic here
            if (this.visited[i][j]) {
                this.isProcessing = false;
                this.step(); // Move to next immediately if already visited
                return;
            }

            setTimeout(() => {
                this.highlightCode(6);
                this.visited[i][j] = true;
                this.distances[i][j] = dist;
                this.renderGrid();

                setTimeout(() => {
                    this.highlightCode(7);
                    if (i === this.rows - 1 && j === this.cols - 1) {
                        this.foundGoal = true;
                        this.shortestPath = dist;
                        this.reconstructPath();
                        this.finish();
                        this.renderGrid();
                        this.updateInfoPanel();
                        this.updateStatus(
                            `Goal reached! Distance: ${dist}`,
                            "success",
                        );
                        this.isProcessing = false;
                        return;
                    }

                    setTimeout(() => {
                        this.highlightCode(8);
                        this.highlightCode(9);
                        let added = 0;
                        for (const [di, dj] of this.directions) {
                            const ni = i + di,
                                nj = j + dj;
                            if (
                                ni >= 0 &&
                                ni < this.rows &&
                                nj >= 0 &&
                                nj < this.cols &&
                                this.grid[ni][nj] === 0 &&
                                !this.visited[ni][nj] &&
                                !this.queue.some(
                                    ([qi, qj]) => qi === ni && qj === nj,
                                )
                            ) {
                                this.queue.push([ni, nj, dist + 1]);
                                this.parent[ni][nj] = [i, j];
                                added++;
                            }
                        }
                        this.updateStatus(`Added ${added} neighbor(s).`);
                        this.isProcessing = false; // Step is finally complete
                        this.renderGrid();
                        this.renderQueue();
                        this.updateInfoPanel();
                    }, this.getSpeed() / 4);
                }, this.getSpeed() / 4);
            }, this.getSpeed() / 4);
        }, this.getSpeed() / 4);
    }

    reconstructPath() {
        let i = this.rows - 1,
            j = this.cols - 1;
        while (i !== null && j !== null) {
            this.pathCells.add(`${i}-${j}`);
            const p = this.parent[i][j];
            if (!p) break;
            [i, j] = p;
        }
    }
}

// Initialize
const visualizer = new ShortestPathVisualizer();

window.onload = () => {
    visualizer.bindControls();
    visualizer.init();

    // Bind random button
    document.getElementById("randomBtn").addEventListener("click", () => {
        visualizer.generateRandom();
    });
};
