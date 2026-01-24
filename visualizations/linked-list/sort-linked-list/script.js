/**
 * Sort Linked List - Merge Sort Visualization
 * Sorts a linked list using merge sort with O(n log n) time complexity
 */

class LinkedListSortVisualizer extends VisualizerBase {
    constructor() {
        super({
            codeLineCount: 29
        });

        this.nodes = [];              // Array of {value, id}
        this.operations = [];         // Queue of operations to execute
        this.opIndex = 0;             // Current operation index
        this.slowPtr = -1;            // Slow pointer index
        this.fastPtr = -1;            // Fast pointer index
        this.leftPtr = -1;            // Left merge pointer
        this.rightPtr = -1;           // Right merge pointer
        this.currentRange = null;     // Current range being processed
        this.splitPoints = new Set(); // Indices where splits occur
        this.sortedRanges = [];       // Ranges that are fully sorted
        this.phase = 'idle';          // Current phase
        this.depth = 0;               // Recursion depth
    }

    init() {
        // Parse input
        const input = document.getElementById('listInput').value;
        const values = input.split(',')
            .map(s => parseInt(s.trim()))
            .filter(n => !isNaN(n));

        if (values.length === 0) {
            this.nodes = [4, 2, 1, 3, 5, 6].map((v, i) => ({ value: v, id: i }));
        } else {
            this.nodes = values.map((v, i) => ({ value: v, id: i }));
        }

        // Reset state
        this.operations = [];
        this.opIndex = 0;
        this.slowPtr = -1;
        this.fastPtr = -1;
        this.leftPtr = -1;
        this.rightPtr = -1;
        this.currentRange = null;
        this.splitPoints = new Set();
        this.sortedRanges = [];
        this.phase = 'idle';
        this.depth = 0;
        this.isFinished = false;

        if (this.isPlaying) {
            this.pause();
        }

        // Build operation queue
        this.buildOperations(0, this.nodes.length - 1, 0);

        // Render
        this.renderList();
        this.updateInfoPanel();
        this.clearCodeHighlight();
        this.highlightCode(0);
        this.updateStatus('Click "Step" or "Play" to start merge sort');
        document.getElementById('mergeInfo').style.display = 'none';
    }

    buildOperations(start, end, depth) {
        if (start >= end) {
            // Base case - single element or invalid range
            if (start === end) {
                this.operations.push({
                    type: 'base_case',
                    index: start,
                    depth: depth
                });
            }
            return;
        }

        // Find middle operation
        this.operations.push({
            type: 'start_sort',
            range: [start, end],
            depth: depth
        });

        // Simulate slow/fast pointer to find mid
        let slow = start;
        let fast = start + 1;

        this.operations.push({
            type: 'init_pointers',
            slow: slow,
            fast: fast,
            range: [start, end],
            depth: depth
        });

        while (fast <= end && fast + 1 <= end) {
            slow++;
            fast += 2;
            this.operations.push({
                type: 'advance_pointers',
                slow: slow,
                fast: Math.min(fast, end),
                range: [start, end],
                depth: depth
            });
        }

        const mid = slow;

        this.operations.push({
            type: 'found_mid',
            mid: mid,
            range: [start, end],
            depth: depth
        });

        this.operations.push({
            type: 'split',
            mid: mid,
            range: [start, end],
            leftRange: [start, mid],
            rightRange: [mid + 1, end],
            depth: depth
        });

        // Recurse left
        this.buildOperations(start, mid, depth + 1);

        // Recurse right
        this.buildOperations(mid + 1, end, depth + 1);

        // Merge operation
        this.buildMergeOperations(start, mid, mid + 1, end, depth);
    }

    buildMergeOperations(leftStart, leftEnd, rightStart, rightEnd, depth) {
        this.operations.push({
            type: 'merge_start',
            leftRange: [leftStart, leftEnd],
            rightRange: [rightStart, rightEnd],
            depth: depth
        });

        // Simulate merge to generate operations
        const leftVals = [];
        const rightVals = [];

        // We'll generate comparison operations during step execution
        // since actual values change during sorting
        this.operations.push({
            type: 'merge_execute',
            leftRange: [leftStart, leftEnd],
            rightRange: [rightStart, rightEnd],
            fullRange: [leftStart, rightEnd],
            depth: depth
        });

        this.operations.push({
            type: 'merge_complete',
            range: [leftStart, rightEnd],
            depth: depth
        });
    }

    generateRandom() {
        const length = Math.floor(Math.random() * 5) + 6; // 6-10 elements
        const arr = [];
        for (let i = 0; i < length; i++) {
            arr.push(Math.floor(Math.random() * 50) + 1);
        }
        document.getElementById('listInput').value = arr.join(', ');
        this.init();
    }

    renderList() {
        const container = document.getElementById('listDisplay');
        container.innerHTML = '';

        this.nodes.forEach((node, idx) => {
            const nodeEl = document.createElement('div');
            nodeEl.className = 'linked-list-node';

            const box = document.createElement('div');
            box.className = 'node-box';
            box.id = `node-${idx}`;
            box.textContent = node.value;

            // Apply state classes
            if (this.isIndexSorted(idx)) {
                box.classList.add('sorted');
            } else if (idx === this.slowPtr && idx === this.fastPtr) {
                box.classList.add('slow-ptr');
            } else if (idx === this.slowPtr) {
                box.classList.add('slow-ptr');
            } else if (idx === this.fastPtr) {
                box.classList.add('fast-ptr');
            } else if (this.splitPoints.has(idx)) {
                box.classList.add('split-point');
            } else if (idx === this.leftPtr) {
                box.classList.add('comparing');
                box.classList.add('left-half');
            } else if (idx === this.rightPtr) {
                box.classList.add('comparing');
                box.classList.add('right-half');
            } else if (this.currentRange && idx >= this.currentRange[0] && idx <= this.currentRange[1]) {
                box.classList.add('finding-mid');
            }

            // Add pointer labels
            if (idx === this.slowPtr || idx === this.fastPtr) {
                const labelContainer = document.createElement('div');
                labelContainer.className = 'ptr-label-container';

                if (idx === this.slowPtr) {
                    const slowLabel = document.createElement('div');
                    slowLabel.className = 'ptr-label slow';
                    slowLabel.textContent = 'slow';
                    labelContainer.appendChild(slowLabel);
                }

                if (idx === this.fastPtr && idx !== this.slowPtr) {
                    const fastLabel = document.createElement('div');
                    fastLabel.className = 'ptr-label fast';
                    fastLabel.textContent = 'fast';
                    labelContainer.appendChild(fastLabel);
                }

                const arrow = document.createElement('div');
                arrow.className = `ptr-arrow ${idx === this.slowPtr ? 'slow' : 'fast'}`;
                arrow.innerHTML = '&#9660;';
                labelContainer.appendChild(arrow);

                box.appendChild(labelContainer);
            }

            // Add merge pointer labels
            if (idx === this.leftPtr && this.phase === 'merging') {
                const labelContainer = document.createElement('div');
                labelContainer.className = 'ptr-label-container';
                const label = document.createElement('div');
                label.className = 'ptr-label left';
                label.textContent = 'L';
                labelContainer.appendChild(label);
                box.appendChild(labelContainer);
            }

            if (idx === this.rightPtr && this.phase === 'merging') {
                const labelContainer = document.createElement('div');
                labelContainer.className = 'ptr-label-container';
                const label = document.createElement('div');
                label.className = 'ptr-label right';
                label.textContent = 'R';
                labelContainer.appendChild(label);
                box.appendChild(labelContainer);
            }

            const index = document.createElement('div');
            index.className = 'node-index';
            index.textContent = `[${idx}]`;

            box.appendChild(index);
            nodeEl.appendChild(box);

            // Add arrow pointer (except for last node)
            if (idx < this.nodes.length - 1) {
                const pointer = document.createElement('div');
                pointer.className = 'node-pointer';

                // Check if there's a split between this node and next
                if (this.splitPoints.has(idx)) {
                    pointer.classList.add('hidden');

                    // Add split divider
                    const divider = document.createElement('div');
                    divider.className = 'split-divider';
                    nodeEl.appendChild(divider);
                } else {
                    pointer.textContent = '→';
                }

                nodeEl.appendChild(pointer);
            }

            container.appendChild(nodeEl);
        });
    }

    isIndexSorted(idx) {
        for (const range of this.sortedRanges) {
            if (idx >= range[0] && idx <= range[1]) {
                return true;
            }
        }
        return false;
    }

    updateInfoPanel() {
        document.getElementById('phaseValue').textContent = this.phase || '-';
        document.getElementById('slowValue').textContent = this.slowPtr >= 0 ? this.nodes[this.slowPtr]?.value : '-';
        document.getElementById('fastValue').textContent = this.fastPtr >= 0 ? this.nodes[this.fastPtr]?.value : '-';
        document.getElementById('depthValue').textContent = this.depth;

        // Update merge info
        if (this.phase === 'merging') {
            document.getElementById('mergeInfo').style.display = 'block';
            document.getElementById('leftPtrValue').textContent =
                this.leftPtr >= 0 ? this.nodes[this.leftPtr]?.value : '-';
            document.getElementById('rightPtrValue').textContent =
                this.rightPtr >= 0 ? this.nodes[this.rightPtr]?.value : '-';
        } else {
            document.getElementById('mergeInfo').style.display = 'none';
        }
    }

    step() {
        if (this.isFinished) {
            return;
        }

        if (this.opIndex >= this.operations.length) {
            this.finish();
            this.phase = 'complete';
            this.slowPtr = -1;
            this.fastPtr = -1;
            this.leftPtr = -1;
            this.rightPtr = -1;
            this.splitPoints.clear();
            this.sortedRanges = [[0, this.nodes.length - 1]];
            this.renderList();
            this.updateInfoPanel();
            this.clearCodeHighlight();
            this.updateStatus('Linked list sorted!', 'success');
            return;
        }

        const op = this.operations[this.opIndex++];
        this.depth = op.depth;

        switch (op.type) {
            case 'start_sort':
                this.phase = 'sorting';
                this.currentRange = op.range;
                this.slowPtr = -1;
                this.fastPtr = -1;
                this.highlightCode(0);
                this.updateStatus(`Starting sort on range [${op.range[0]}, ${op.range[1]}]`);
                break;

            case 'base_case':
                this.phase = 'base';
                this.highlightCode(1);
                this.sortedRanges.push([op.index, op.index]);
                this.updateStatus(`Base case: single element at index ${op.index}`);
                break;

            case 'init_pointers':
                this.phase = 'finding_mid';
                this.currentRange = op.range;
                this.slowPtr = op.slow;
                this.fastPtr = op.fast;
                this.highlightCode(12);
                this.updateStatus(`Initialize pointers: slow=${this.nodes[op.slow].value}, fast=${this.nodes[op.fast]?.value || 'null'}`);
                break;

            case 'advance_pointers':
                this.slowPtr = op.slow;
                this.fastPtr = op.fast;
                this.highlightCode(14);
                setTimeout(() => {
                    this.highlightCode(15);
                    this.renderList();
                }, this.getSpeed() / 3);
                this.updateStatus(`Advance: slow→${this.nodes[op.slow].value}, fast→${this.nodes[op.fast]?.value || 'end'}`);
                break;

            case 'found_mid':
                this.highlightCode(16);
                this.updateStatus(`Found middle at index ${op.mid} (value: ${this.nodes[op.mid].value})`);
                break;

            case 'split':
                this.phase = 'splitting';
                this.splitPoints.add(op.mid);
                this.slowPtr = -1;
                this.fastPtr = -1;
                this.highlightCode(6);
                this.updateStatus(`Split list: left=[${op.leftRange[0]},${op.leftRange[1]}], right=[${op.rightRange[0]},${op.rightRange[1]}]`);
                break;

            case 'merge_start':
                this.phase = 'merging';
                this.currentRange = [op.leftRange[0], op.rightRange[1]];
                this.leftPtr = op.leftRange[0];
                this.rightPtr = op.rightRange[0];
                // Remove split point between the ranges
                this.splitPoints.delete(op.leftRange[1]);
                this.highlightCode(18);
                this.updateStatus(`Merging [${op.leftRange[0]},${op.leftRange[1]}] and [${op.rightRange[0]},${op.rightRange[1]}]`);
                break;

            case 'merge_execute':
                this.executeMerge(op.leftRange, op.rightRange);
                this.highlightCode(21);
                break;

            case 'merge_complete':
                this.phase = 'sorted';
                this.leftPtr = -1;
                this.rightPtr = -1;
                this.sortedRanges.push(op.range);
                this.highlightCode(28);
                this.updateStatus(`Merge complete! Range [${op.range[0]}, ${op.range[1]}] is now sorted`);
                break;
        }

        this.renderList();
        this.updateInfoPanel();
    }

    executeMerge(leftRange, rightRange) {
        // Extract the values from both ranges
        const leftNodes = [];
        const rightNodes = [];

        for (let i = leftRange[0]; i <= leftRange[1]; i++) {
            leftNodes.push({ ...this.nodes[i] });
        }
        for (let i = rightRange[0]; i <= rightRange[1]; i++) {
            rightNodes.push({ ...this.nodes[i] });
        }

        // Merge the two sorted arrays
        const merged = [];
        let l = 0, r = 0;

        while (l < leftNodes.length && r < rightNodes.length) {
            if (leftNodes[l].value <= rightNodes[r].value) {
                merged.push(leftNodes[l++]);
            } else {
                merged.push(rightNodes[r++]);
            }
        }

        while (l < leftNodes.length) {
            merged.push(leftNodes[l++]);
        }

        while (r < rightNodes.length) {
            merged.push(rightNodes[r++]);
        }

        // Put merged values back into nodes array
        for (let i = 0; i < merged.length; i++) {
            this.nodes[leftRange[0] + i] = merged[i];
        }

        this.updateStatus(`Merged: [${merged.map(n => n.value).join(', ')}]`);
    }
}

// Initialize
const visualizer = new LinkedListSortVisualizer();

window.onload = () => {
    visualizer.bindControls();
    visualizer.init();

    // Bind random button
    document.getElementById('randomBtn').addEventListener('click', () => {
        visualizer.generateRandom();
    });
};
