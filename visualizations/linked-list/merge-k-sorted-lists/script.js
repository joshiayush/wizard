/**
 * Merge K Sorted Lists - Divide & Conquer Visualization
 * Merges k sorted linked lists using divide and conquer with O(n log k) time complexity
 */

class MergeKListsVisualizer extends VisualizerBase {
    constructor() {
        super({
            codeLineCount: 21
        });

        this.lists = [];              // Array of arrays [{value, id}, ...]
        this.originalK = 0;           // Original number of lists
        this.operations = [];         // Queue of operations to execute
        this.opIndex = 0;             // Current operation index
        this.phase = 'idle';          // Current phase
        this.activePair = null;       // [leftIdx, rightIdx] currently merging
        this.leftPtr = -1;            // Node index in left list being compared
        this.rightPtr = -1;           // Node index in right list being compared
        this.depth = 0;               // Recursion depth
        this.activeIndices = new Set(); // Indices currently being processed
        this.mergedIndices = new Set(); // Indices that have been merged
        this.hiddenIndices = new Set(); // Indices that are hidden (merged into another)

        // Merge state for step-by-step merging
        this.mergeState = null;       // { leftIdx, rightIdx, leftList, rightList, merged, l, r }
    }

    init() {
        // Parse input - each line is a sorted list
        const input = document.getElementById('listsInput').value;
        const lines = input.split('\n').filter(line => line.trim());

        if (lines.length === 0) {
            // Default example
            this.lists = [
                [{ value: 1, id: 0 }, { value: 4, id: 1 }, { value: 5, id: 2 }],
                [{ value: 1, id: 3 }, { value: 3, id: 4 }, { value: 4, id: 5 }],
                [{ value: 2, id: 6 }, { value: 6, id: 7 }]
            ];
        } else {
            this.lists = lines.map((line, listIdx) => {
                const values = line.split(',')
                    .map(s => parseInt(s.trim()))
                    .filter(n => !isNaN(n));
                return values.map((v, nodeIdx) => ({
                    value: v,
                    id: listIdx * 100 + nodeIdx
                }));
            });
        }

        // Reset state
        this.originalK = this.lists.length;
        this.operations = [];
        this.opIndex = 0;
        this.phase = 'idle';
        this.activePair = null;
        this.leftPtr = -1;
        this.rightPtr = -1;
        this.depth = 0;
        this.activeIndices = new Set();
        this.mergedIndices = new Set();
        this.hiddenIndices = new Set();
        this.mergeState = null;
        this.isFinished = false;

        if (this.isPlaying) {
            this.pause();
        }

        // Build operation queue
        if (this.lists.length > 0) {
            this.buildOperations(0, this.lists.length - 1, 0);
        }

        // Render
        this.renderLists();
        this.updateInfoPanel();
        this.clearCodeHighlight();
        this.highlightCode(0);
        this.updateStatus('Click "Step" or "Play" to start merging k sorted lists');
        document.getElementById('mergeInfo').style.display = 'none';
    }

    buildOperations(start, end, depth) {
        if (start > end) {
            return;
        }

        if (start === end) {
            // Base case - single list
            this.operations.push({
                type: 'base_case',
                listIdx: start,
                depth: depth
            });
            return;
        }

        // Divide
        const mid = Math.floor((start + end) / 2);

        this.operations.push({
            type: 'divide',
            range: [start, end],
            mid: mid,
            depth: depth
        });

        // Recurse left
        this.buildOperations(start, mid, depth + 1);

        // Recurse right
        this.buildOperations(mid + 1, end, depth + 1);

        // Merge - now just marks start, actual steps happen dynamically
        this.operations.push({
            type: 'merge_start',
            leftIdx: start,
            rightIdx: mid + 1,
            depth: depth
        });
    }

    generateRandom() {
        const k = Math.floor(Math.random() * 3) + 3; // 3-5 lists
        const lines = [];

        for (let i = 0; i < k; i++) {
            const length = Math.floor(Math.random() * 4) + 2; // 2-5 nodes per list
            const arr = [];
            let prev = 0;
            for (let j = 0; j < length; j++) {
                prev += Math.floor(Math.random() * 5) + 1; // Sorted ascending
                arr.push(prev);
            }
            lines.push(arr.join(', '));
        }

        document.getElementById('listsInput').value = lines.join('\n');
        this.init();
    }

    renderLists() {
        const container = document.getElementById('listsDisplay');
        container.innerHTML = '';

        this.lists.forEach((list, listIdx) => {
            // Skip hidden lists (merged into another)
            if (this.hiddenIndices.has(listIdx)) {
                return;
            }

            const row = document.createElement('div');
            row.className = 'list-row';
            row.id = `list-row-${listIdx}`;

            // Apply state classes
            if (this.activeIndices.has(listIdx)) {
                row.classList.add('active');
            }
            if (this.activePair && (listIdx === this.activePair[0] || listIdx === this.activePair[1])) {
                row.classList.add('merging');
            }
            if (this.mergedIndices.has(listIdx)) {
                row.classList.add('merged');
            }
            if (!this.activeIndices.has(listIdx) && !this.mergedIndices.has(listIdx) &&
                !(this.activePair && (listIdx === this.activePair[0] || listIdx === this.activePair[1]))) {
                row.classList.add('inactive');
            }

            // List label
            const label = document.createElement('div');
            label.className = 'list-label';
            label.textContent = `List ${listIdx}`;
            row.appendChild(label);

            // Linked list container
            const listContainer = document.createElement('div');
            listContainer.className = 'linked-list-container';

            if (list.length === 0) {
                const empty = document.createElement('span');
                empty.className = 'empty-list';
                empty.textContent = '(empty)';
                listContainer.appendChild(empty);
            } else {
                list.forEach((node, nodeIdx) => {
                    const nodeEl = document.createElement('div');
                    nodeEl.className = 'linked-list-node';

                    const box = document.createElement('div');
                    box.className = 'node-box';
                    box.id = `node-${listIdx}-${nodeIdx}`;
                    box.textContent = node.value;

                    // Apply node states
                    if (this.activePair && this.phase === 'merging') {
                        if (listIdx === this.activePair[0] && nodeIdx === this.leftPtr) {
                            box.classList.add('left-ptr');
                            box.classList.add('comparing');
                            this.addPointerLabel(box, 'L', 'left');
                        }
                        if (listIdx === this.activePair[1] && nodeIdx === this.rightPtr) {
                            box.classList.add('right-ptr');
                            box.classList.add('comparing');
                            this.addPointerLabel(box, 'R', 'right');
                        }
                    }

                    if (this.mergedIndices.has(listIdx)) {
                        box.classList.add('merged');
                    }

                    nodeEl.appendChild(box);

                    // Add arrow pointer (except for last node)
                    if (nodeIdx < list.length - 1) {
                        const pointer = document.createElement('div');
                        pointer.className = 'node-pointer';
                        pointer.textContent = '→';
                        nodeEl.appendChild(pointer);
                    }

                    listContainer.appendChild(nodeEl);
                });
            }

            row.appendChild(listContainer);
            container.appendChild(row);
        });

        // Show merged result preview if merging
        if (this.mergeState && this.mergeState.merged.length > 0) {
            const divider = document.createElement('div');
            divider.className = 'lists-divider';
            container.appendChild(divider);

            const resultRow = document.createElement('div');
            resultRow.className = 'list-row result';

            const label = document.createElement('div');
            label.className = 'list-label';
            label.textContent = 'Result';
            resultRow.appendChild(label);

            const listContainer = document.createElement('div');
            listContainer.className = 'linked-list-container';

            this.mergeState.merged.forEach((node, nodeIdx) => {
                const nodeEl = document.createElement('div');
                nodeEl.className = 'linked-list-node';

                const box = document.createElement('div');
                box.className = 'node-box merged';
                box.textContent = node.value;

                nodeEl.appendChild(box);

                if (nodeIdx < this.mergeState.merged.length - 1) {
                    const pointer = document.createElement('div');
                    pointer.className = 'node-pointer';
                    pointer.textContent = '→';
                    nodeEl.appendChild(pointer);
                }

                listContainer.appendChild(nodeEl);
            });

            resultRow.appendChild(listContainer);
            container.appendChild(resultRow);
        }
    }

    addPointerLabel(box, text, type) {
        const labelContainer = document.createElement('div');
        labelContainer.className = 'ptr-label-container';

        const label = document.createElement('div');
        label.className = `ptr-label ${type}`;
        label.textContent = text;
        labelContainer.appendChild(label);

        const arrow = document.createElement('div');
        arrow.className = `ptr-arrow ${type}`;
        arrow.innerHTML = '&#9660;';
        labelContainer.appendChild(arrow);

        box.appendChild(labelContainer);
    }

    updateInfoPanel() {
        document.getElementById('phaseValue').textContent = this.phase || '-';
        document.getElementById('depthValue').textContent = this.depth;
        document.getElementById('kValue').textContent = this.originalK;

        if (this.activePair) {
            document.getElementById('pairValue').textContent = `[${this.activePair[0]}, ${this.activePair[1]}]`;
        } else {
            document.getElementById('pairValue').textContent = '-';
        }

        // Update merge info
        if (this.phase === 'merging' && this.activePair && this.mergeState) {
            document.getElementById('mergeInfo').style.display = 'block';
            const leftList = this.mergeState.leftList;
            const rightList = this.mergeState.rightList;
            const l = this.mergeState.l;
            const r = this.mergeState.r;
            document.getElementById('leftPtrValue').textContent =
                l < leftList.length ? leftList[l].value : '-';
            document.getElementById('rightPtrValue').textContent =
                r < rightList.length ? rightList[r].value : '-';
        } else {
            document.getElementById('mergeInfo').style.display = 'none';
        }
    }

    step() {
        if (this.isFinished) {
            return;
        }

        // If we're in the middle of a merge, continue step-by-step
        if (this.mergeState) {
            this.stepMerge();
            return;
        }

        if (this.opIndex >= this.operations.length) {
            this.finish();
            this.phase = 'complete';
            this.activePair = null;
            this.leftPtr = -1;
            this.rightPtr = -1;
            this.activeIndices.clear();
            // Mark the final result as merged
            this.mergedIndices.clear();
            this.mergedIndices.add(0);
            this.renderLists();
            this.updateInfoPanel();
            this.clearCodeHighlight();
            this.updateStatus('All lists merged into one sorted list!', 'success');
            return;
        }

        const op = this.operations[this.opIndex++];
        this.depth = op.depth;

        switch (op.type) {
            case 'base_case':
                this.phase = 'base';
                this.activeIndices.clear();
                this.activeIndices.add(op.listIdx);
                this.highlightCode(3);
                setTimeout(() => this.highlightCode(4), this.getSpeed() / 2);
                this.updateStatus(`Base case: List ${op.listIdx} has single list, return as-is`);
                break;

            case 'divide':
                this.phase = 'dividing';
                this.activeIndices.clear();
                for (let i = op.range[0]; i <= op.range[1]; i++) {
                    if (!this.hiddenIndices.has(i)) {
                        this.activeIndices.add(i);
                    }
                }
                this.highlightCode(5);
                this.updateStatus(`Divide: Split lists[${op.range[0]}:${op.range[1]+1}] at mid=${op.mid}`);
                break;

            case 'merge_start':
                this.phase = 'merging';
                this.activePair = [op.leftIdx, op.rightIdx];
                this.activeIndices.clear();
                this.activeIndices.add(op.leftIdx);
                this.activeIndices.add(op.rightIdx);

                // Initialize merge state
                this.mergeState = {
                    leftIdx: op.leftIdx,
                    rightIdx: op.rightIdx,
                    leftList: [...this.lists[op.leftIdx]],
                    rightList: [...this.lists[op.rightIdx]],
                    merged: [],
                    l: 0,
                    r: 0,
                    depth: op.depth
                };

                this.leftPtr = 0;
                this.rightPtr = 0;

                this.highlightCode(8);
                this.updateStatus(`Starting merge: List ${op.leftIdx} and List ${op.rightIdx}`);
                break;
        }

        this.renderLists();
        this.updateInfoPanel();
    }

    stepMerge() {
        const state = this.mergeState;
        const { leftList, rightList, merged, l, r } = state;

        // Check if both pointers are exhausted
        if (l >= leftList.length && r >= rightList.length) {
            // Merge complete
            this.finishMerge();
            return;
        }

        // Check if left is exhausted
        if (l >= leftList.length) {
            // Take from right
            merged.push(rightList[r]);
            state.r++;
            this.rightPtr = state.r;
            this.leftPtr = -1;
            this.highlightCode(19);
            this.updateStatus(`Left exhausted, taking ${rightList[r].value} from right`);
            this.renderLists();
            this.updateInfoPanel();
            return;
        }

        // Check if right is exhausted
        if (r >= rightList.length) {
            // Take from left
            merged.push(leftList[l]);
            state.l++;
            this.leftPtr = state.l;
            this.rightPtr = -1;
            this.highlightCode(19);
            this.updateStatus(`Right exhausted, taking ${leftList[l].value} from left`);
            this.renderLists();
            this.updateInfoPanel();
            return;
        }

        // Compare and select
        const leftVal = leftList[l].value;
        const rightVal = rightList[r].value;

        this.leftPtr = l;
        this.rightPtr = r;

        if (leftVal <= rightVal) {
            merged.push(leftList[l]);
            state.l++;
            this.leftPtr = state.l < leftList.length ? state.l : -1;
            this.highlightCode(15);
            this.updateStatus(`Comparing ${leftVal} <= ${rightVal}: select ${leftVal} from left`);
        } else {
            merged.push(rightList[r]);
            state.r++;
            this.rightPtr = state.r < rightList.length ? state.r : -1;
            this.highlightCode(17);
            this.updateStatus(`Comparing ${leftVal} > ${rightVal}: select ${rightVal} from right`);
        }

        this.renderLists();
        this.updateInfoPanel();
    }

    finishMerge() {
        const state = this.mergeState;

        // Store merged result at leftIdx
        this.lists[state.leftIdx] = state.merged;
        // Clear rightIdx (will be hidden)
        this.lists[state.rightIdx] = [];

        // Update state
        this.phase = 'merged';
        this.mergedIndices.add(state.leftIdx);
        this.hiddenIndices.add(state.rightIdx);
        this.activePair = null;
        this.leftPtr = -1;
        this.rightPtr = -1;
        this.activeIndices.clear();
        this.mergeState = null;

        this.highlightCode(20);
        this.updateStatus(`Merge complete! Result: [${state.merged.map(n => n.value).join(' → ')}]`);

        this.renderLists();
        this.updateInfoPanel();
    }
}

// Initialize
const visualizer = new MergeKListsVisualizer();

window.onload = () => {
    visualizer.bindControls();
    visualizer.init();

    // Bind random button
    document.getElementById('randomBtn').addEventListener('click', () => {
        visualizer.generateRandom();
    });
};
