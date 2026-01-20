/**
 * Number of Islands Visualization
 * Count islands using DFS traversal
 */

class IslandsVisualizer extends VisualizerBase {
    constructor() {
        super({
            codeLineCount: 10,
        });

        this.grid = [];
        this.visited = [];
        this.rows = 0;
        this.cols = 0;
        this.scanI = 0;
        this.scanJ = 0;
        this.islandCount = 0;
        this.currentIsland = 0;
        this.dfsStack = [];
        this.islandColors = {};
        this.phase = "scanning"; // 'scanning' or 'dfs'
    }

    init() {
        // Parse input
        this.parseGrid();

        // Reset state
        this.visited = this.grid.map((row) => row.map(() => false));
        this.scanI = 0;
        this.scanJ = 0;
        this.islandCount = 0;
        this.currentIsland = 0;
        this.dfsStack = [];
        this.islandColors = {};
        this.phase = "scanning";
        this.isFinished = false;

        if (this.isPlaying) {
            this.pause();
        }

        // Render
        this.renderGrid();
        this.renderStack();
        this.updateInfoPanel();
        this.clearCodeHighlight();
        this.highlightCode(0);
        this.updateStatus('Click "Step" or "Play" to start the visualization');
    }

    parseGrid() {
        const input = document.getElementById("gridInput").value;
        const rows = input.split(";").map((row) =>
            row.split(",").map((cell) => cell.trim())
        );

        if (rows.length === 0 || rows[0].length === 0) {
            // Default grid
            this.grid = [
                ["1", "1", "0", "0", "0"],
                ["1", "1", "0", "0", "0"],
                ["0", "0", "1", "0", "0"],
                ["0", "0", "0", "1", "1"],
            ];
        } else {
            this.grid = rows;
        }

        this.rows = this.grid.length;
        this.cols = this.grid[0].length;
    }

    generateRandom() {
        const rows = Math.floor(Math.random() * 3) + 4; // 4-6 rows
        const cols = Math.floor(Math.random() * 3) + 5; // 5-7 cols

        const grid = [];
        for (let i = 0; i < rows; i++) {
            const row = [];
            for (let j = 0; j < cols; j++) {
                // 40% chance of land
                row.push(Math.random() < 0.4 ? "1" : "0");
            }
            grid.push(row.join(","));
        }

        document.getElementById("gridInput").value = grid.join(";");
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
                cell.textContent = this.grid[i][j];

                // Determine cell state
                if (this.grid[i][j] === "0") {
                    cell.classList.add("water");
                } else if (this.visited[i][j]) {
                    cell.classList.add("visited");
                    // Add island color
                    const islandNum = this.islandColors[`${i}-${j}`];
                    if (islandNum) {
                        cell.classList.add(`island-${((islandNum - 1) % 6) + 1}`);
                    }
                } else {
                    cell.classList.add("land");
                }

                // Highlight current cell
                if (this.phase === "scanning" && i === this.scanI && j === this.scanJ) {
                    cell.classList.add("current");
                }

                // Highlight cells in DFS stack
                if (
                    this.dfsStack.some(([si, sj]) => si === i && sj === j)
                ) {
                    cell.classList.add("current");
                }

                gridEl.appendChild(cell);
            }
        }

        container.appendChild(gridEl);
    }

    renderStack() {
        const container = document.getElementById("stackDisplay");

        if (this.dfsStack.length === 0) {
            container.innerHTML = '<span class="empty-text">Empty</span>';
            return;
        }

        container.innerHTML = "";
        this.dfsStack.forEach(([i, j]) => {
            const item = document.createElement("span");
            item.className = "queue-item";
            item.textContent = `(${i},${j})`;
            container.appendChild(item);
        });
    }

    updateInfoPanel() {
        if (this.phase === "scanning") {
            this.updateInfoBox("currentCell", `(${this.scanI}, ${this.scanJ})`);
            this.updateInfoBox("scanningCell", "Grid scan");
        } else {
            const current = this.dfsStack[this.dfsStack.length - 1];
            if (current) {
                this.updateInfoBox("currentCell", `(${current[0]}, ${current[1]})`);
            }
            this.updateInfoBox("scanningCell", "DFS traversal");
        }
        this.updateInfoBox("islandCount", this.islandCount);
        this.updateInfoBox("stackSize", this.dfsStack.length);
    }

    isInBounds(i, j) {
        return i >= 0 && i < this.rows && j >= 0 && j < this.cols;
    }

    step() {
        if (this.isFinished) {
            return;
        }

        if (this.phase === "scanning") {
            this.stepScan();
        } else {
            this.stepDFS();
        }
    }

    stepScan() {
        // Check if done scanning
        if (this.scanI >= this.rows) {
            this.finish();
            this.clearCodeHighlight();
            this.renderGrid();
            this.updateStatus(
                `Done! Found ${this.islandCount} island${this.islandCount !== 1 ? "s" : ""}.`,
                "success"
            );
            return;
        }

        this.highlightCode(2);
        this.renderGrid();
        this.updateInfoPanel();

        const cell = this.grid[this.scanI][this.scanJ];
        const isVisited = this.visited[this.scanI][this.scanJ];

        setTimeout(() => {
            if (cell === "1" && !isVisited) {
                // Found new island!
                this.highlightCode(3);
                this.islandCount++;
                this.currentIsland = this.islandCount;
                this.updateStatus(
                    `Found new island #${this.islandCount} at (${this.scanI}, ${this.scanJ})! Starting DFS...`
                );
                this.updateInfoPanel();

                setTimeout(() => {
                    this.highlightCode(4);
                    // Start DFS from this cell
                    this.dfsStack.push([this.scanI, this.scanJ]);
                    this.phase = "dfs";
                    this.renderStack();
                }, this.getSpeed() / 3);
            } else {
                // Move to next cell
                if (cell === "0") {
                    this.updateStatus(`Cell (${this.scanI}, ${this.scanJ}) is water, skipping.`);
                } else {
                    this.updateStatus(
                        `Cell (${this.scanI}, ${this.scanJ}) already visited, skipping.`
                    );
                }
                this.moveToNextScanCell();
            }
        }, this.getSpeed() / 3);
    }

    stepDFS() {
        if (this.dfsStack.length === 0) {
            // DFS complete, return to scanning
            this.phase = "scanning";
            this.moveToNextScanCell();
            this.highlightCode(0);
            this.updateStatus(
                `Island #${this.currentIsland} fully explored. Continuing scan...`
            );
            this.renderGrid();
            this.renderStack();
            this.updateInfoPanel();
            return;
        }

        const [i, j] = this.dfsStack[this.dfsStack.length - 1];

        if (!this.visited[i][j]) {
            // Mark as visited
            this.highlightCode(6);
            this.visited[i][j] = true;
            this.islandColors[`${i}-${j}`] = this.currentIsland;
            this.updateStatus(`Visiting cell (${i}, ${j}), marking as part of island #${this.currentIsland}`);

            this.renderGrid();
            this.updateInfoPanel();

            // Add ripple effect
            const cellEl = document.getElementById(`cell-${i}-${j}`);
            if (cellEl) {
                cellEl.classList.add("ripple");
                setTimeout(() => cellEl.classList.remove("ripple"), 300);
            }

            setTimeout(() => {
                // Find unvisited neighbors
                this.highlightCode(7);
                const directions = [
                    [-1, 0],
                    [0, 1],
                    [1, 0],
                    [0, -1],
                ];
                let foundNeighbor = false;

                for (const [di, dj] of directions) {
                    const ni = i + di;
                    const nj = j + dj;

                    if (
                        this.isInBounds(ni, nj) &&
                        this.grid[ni][nj] === "1" &&
                        !this.visited[ni][nj] &&
                        !this.dfsStack.some(([si, sj]) => si === ni && sj === nj)
                    ) {
                        this.highlightCode(9);
                        this.dfsStack.push([ni, nj]);
                        foundNeighbor = true;
                        this.updateStatus(`Found unvisited land at (${ni}, ${nj}), adding to stack`);
                        break;
                    }
                }

                if (!foundNeighbor) {
                    // No more neighbors, backtrack
                    this.dfsStack.pop();
                    this.updateStatus(`No unvisited neighbors at (${i}, ${j}), backtracking`);
                }

                this.renderStack();
                this.updateInfoPanel();
            }, this.getSpeed() / 3);
        } else {
            // Already visited, pop and continue
            this.dfsStack.pop();
            this.renderStack();
            this.updateInfoPanel();
        }
    }

    moveToNextScanCell() {
        this.scanJ++;
        if (this.scanJ >= this.cols) {
            this.scanJ = 0;
            this.scanI++;
        }
    }
}

// Initialize
const visualizer = new IslandsVisualizer();

window.onload = () => {
    visualizer.bindControls();
    visualizer.init();

    // Bind random button
    document.getElementById("randomBtn").addEventListener("click", () => {
        visualizer.generateRandom();
    });
};
