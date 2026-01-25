/**
 * Kth Largest Element - Max Heap Visualization
 * Visualizes heap operations: sift-up during push, sift-down during pop
 */

class KthLargestVisualizer extends VisualizerBase {
    constructor() {
        super({
            codeLineCount: 12
        });

        this.nums = [];                // Original input array
        this.heap = [];                // Current heap state
        this.extracted = [];           // Extracted elements
        this.k = 2;                    // Target k
        this.operations = [];          // Operation queue
        this.opIndex = 0;              // Current operation index
        this.phase = 'idle';           // 'building' | 'extracting' | 'complete'
        this.currentIdx = -1;          // Current index being processed
        this.parentIdx = -1;           // Parent index
        this.childIdx = -1;            // Child index (for sift-down)
        this.largerChildIdx = -1;      // Larger child during sift-down
        this.activeEdge = null;        // [parentIdx, childIdx] for highlighting edge

        // Tree layout constants (will be recalculated based on heap size)
        this.treeWidth = 580;
        this.treeHeight = 220;
        this.nodeRadius = 22;
        this.levelHeight = 60;
    }

    /**
     * Calculate dynamic tree layout based on heap size
     * Shrinks nodes and spacing for larger heaps to fit within fixed container
     */
    calculateTreeLayout() {
        if (this.heap.length === 0) return;

        const numLevels = Math.floor(Math.log2(this.heap.length)) + 1;

        // Base values for small trees (1-3 levels)
        const baseRadius = 22;
        const baseLevelHeight = 60;

        // Scale factors based on number of levels
        // More levels = smaller nodes and tighter spacing
        if (numLevels <= 3) {
            this.nodeRadius = baseRadius;
            this.levelHeight = baseLevelHeight;
        } else if (numLevels === 4) {
            this.nodeRadius = 18;
            this.levelHeight = 50;
        } else if (numLevels === 5) {
            this.nodeRadius = 14;
            this.levelHeight = 42;
        } else {
            // 6+ levels - minimum sizing
            this.nodeRadius = 11;
            this.levelHeight = 35;
        }

        // Ensure tree fits vertically
        const requiredHeight = 30 + (numLevels - 1) * this.levelHeight + this.nodeRadius + 20;
        if (requiredHeight > this.treeHeight) {
            // Compress level height to fit
            this.levelHeight = Math.max(30, (this.treeHeight - 50 - this.nodeRadius) / Math.max(1, numLevels - 1));
        }
    }

    init() {
        // Parse input
        const arrayInput = document.getElementById('arrayInput').value;
        this.nums = arrayInput.split(',')
            .map(s => parseInt(s.trim()))
            .filter(n => !isNaN(n));

        if (this.nums.length === 0) {
            this.nums = [3, 2, 1, 5, 6, 4];
        }

        this.k = parseInt(document.getElementById('kInput').value) || 2;
        if (this.k < 1) this.k = 1;
        if (this.k > this.nums.length) this.k = this.nums.length;

        // Reset state
        this.heap = [];
        this.extracted = [];
        this.operations = [];
        this.opIndex = 0;
        this.phase = 'idle';
        this.currentIdx = -1;
        this.parentIdx = -1;
        this.childIdx = -1;
        this.largerChildIdx = -1;
        this.activeEdge = null;
        this.isFinished = false;

        if (this.isPlaying) {
            this.pause();
        }

        // Build all operations
        this.buildOperations();

        // Render
        this.renderTree();
        this.renderArray();
        this.renderExtracted();
        this.updateInfoPanel();
        this.clearCodeHighlight();
        this.highlightCode(0);
        this.updateStatus('Click "Step" or "Play" to build the max heap and find kth largest');
    }

    buildOperations() {
        // Simulate the algorithm and record all operations
        const heap = [];
        const extracted = [];

        // Build phase - push all elements
        for (let i = 0; i < this.nums.length; i++) {
            const value = this.nums[i];
            this.operations.push({ type: 'push_start', value, buildIdx: i });

            // Append to heap
            heap.push(value);
            let idx = heap.length - 1;
            this.operations.push({ type: 'push_append', value, idx });

            // Sift up
            while (idx > 0) {
                const parentIdx = (idx - 1) >> 1;
                this.operations.push({ type: 'sift_up_compare', idx, parentIdx });

                if (heap[idx] > heap[parentIdx]) {
                    this.operations.push({ type: 'sift_up_swap', idx, parentIdx });
                    // Swap
                    [heap[idx], heap[parentIdx]] = [heap[parentIdx], heap[idx]];
                    idx = parentIdx;
                } else {
                    this.operations.push({ type: 'sift_up_done', idx });
                    break;
                }
            }

            if (idx === 0) {
                this.operations.push({ type: 'sift_up_done', idx: 0 });
            }

            this.operations.push({ type: 'push_complete' });
        }

        // Extract phase - pop k elements
        for (let i = 0; i < this.k; i++) {
            this.operations.push({ type: 'pop_start', extractIdx: i });

            const max = heap[0];
            this.operations.push({ type: 'pop_save_root', value: max });

            // Move last to root
            const last = heap.pop();
            if (heap.length > 0) {
                heap[0] = last;
                this.operations.push({ type: 'pop_move_last', value: last });

                // Sift down
                let idx = 0;
                const size = heap.length;

                while (true) {
                    const leftIdx = (idx << 1) + 1;
                    const rightIdx = (idx << 1) + 2;
                    let largest = idx;

                    this.operations.push({
                        type: 'sift_down_compare',
                        idx,
                        leftIdx: leftIdx < size ? leftIdx : -1,
                        rightIdx: rightIdx < size ? rightIdx : -1
                    });

                    if (leftIdx < size && heap[leftIdx] > heap[largest]) {
                        largest = leftIdx;
                    }
                    if (rightIdx < size && heap[rightIdx] > heap[largest]) {
                        largest = rightIdx;
                    }

                    if (largest !== idx) {
                        this.operations.push({
                            type: 'sift_down_select_larger',
                            idx,
                            largerIdx: largest
                        });
                        this.operations.push({ type: 'sift_down_swap', idx, largerIdx: largest });
                        [heap[idx], heap[largest]] = [heap[largest], heap[idx]];
                        idx = largest;
                    } else {
                        this.operations.push({ type: 'sift_down_done', idx });
                        break;
                    }
                }
            }

            extracted.push(max);
            this.operations.push({ type: 'pop_complete', value: max, extractIdx: i });
        }

        this.operations.push({ type: 'complete' });
    }

    generateRandom() {
        // Generate arrays of varying sizes: 5-15 elements
        const length = Math.floor(Math.random() * 11) + 5;
        const arr = [];
        for (let i = 0; i < length; i++) {
            arr.push(Math.floor(Math.random() * 30) + 1);
        }
        document.getElementById('arrayInput').value = arr.join(', ');
        document.getElementById('kInput').value = Math.floor(Math.random() * Math.min(5, length)) + 1;
        this.init();
    }

    getNodePosition(idx) {
        if (idx < 0) return null;
        const level = Math.floor(Math.log2(idx + 1));
        const levelStart = Math.pow(2, level) - 1;
        const posInLevel = idx - levelStart;
        const nodesInLevel = Math.pow(2, level);

        const padding = 40;
        const usableWidth = this.treeWidth - padding * 2;
        const x = padding + (posInLevel + 0.5) * (usableWidth / nodesInLevel);
        const y = 30 + level * this.levelHeight;

        return { x, y };
    }

    renderTree() {
        const svg = document.getElementById('heapTree');
        svg.innerHTML = '';
        svg.setAttribute('viewBox', `0 0 ${this.treeWidth} ${this.treeHeight}`);

        if (this.heap.length === 0) {
            const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            text.setAttribute('x', this.treeWidth / 2);
            text.setAttribute('y', this.treeHeight / 2);
            text.setAttribute('text-anchor', 'middle');
            text.setAttribute('fill', '#666');
            text.textContent = 'Heap is empty';
            svg.appendChild(text);
            return;
        }

        // Recalculate layout for current heap size
        this.calculateTreeLayout();

        // Draw edges first (so they appear behind nodes)
        for (let i = 0; i < this.heap.length; i++) {
            const leftIdx = (i << 1) + 1;
            const rightIdx = (i << 1) + 2;
            const parentPos = this.getNodePosition(i);

            if (leftIdx < this.heap.length) {
                const childPos = this.getNodePosition(leftIdx);
                const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
                line.setAttribute('x1', parentPos.x);
                line.setAttribute('y1', parentPos.y);
                line.setAttribute('x2', childPos.x);
                line.setAttribute('y2', childPos.y);
                line.setAttribute('class', 'tree-edge');
                if (this.activeEdge && this.activeEdge[0] === i && this.activeEdge[1] === leftIdx) {
                    line.classList.add('active');
                }
                svg.appendChild(line);
            }

            if (rightIdx < this.heap.length) {
                const childPos = this.getNodePosition(rightIdx);
                const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
                line.setAttribute('x1', parentPos.x);
                line.setAttribute('y1', parentPos.y);
                line.setAttribute('x2', childPos.x);
                line.setAttribute('y2', childPos.y);
                line.setAttribute('class', 'tree-edge');
                if (this.activeEdge && this.activeEdge[0] === i && this.activeEdge[1] === rightIdx) {
                    line.classList.add('active');
                }
                svg.appendChild(line);
            }
        }

        // Draw nodes
        for (let i = 0; i < this.heap.length; i++) {
            const pos = this.getNodePosition(i);
            const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
            g.setAttribute('class', 'tree-node');
            g.setAttribute('transform', `translate(${pos.x}, ${pos.y})`);

            // Apply state classes
            if (i === 0) g.classList.add('root');
            if (i === this.currentIdx) g.classList.add('current');
            if (i === this.parentIdx) g.classList.add('parent');
            if (i === this.childIdx || i === this.largerChildIdx) g.classList.add('child');
            if (i === this.largerChildIdx) g.classList.add('larger-child');

            // Circle
            const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
            circle.setAttribute('r', this.nodeRadius);
            g.appendChild(circle);

            // Calculate font sizes based on node radius
            const valueFontSize = Math.max(8, Math.floor(this.nodeRadius * 0.65));
            const indexFontSize = Math.max(6, Math.floor(this.nodeRadius * 0.45));

            // Value text
            const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            text.setAttribute('y', 1);
            text.setAttribute('style', `font-size: ${valueFontSize}px`);
            text.textContent = this.heap[i];
            g.appendChild(text);

            // Index text (hide for very small nodes)
            if (this.nodeRadius >= 12) {
                const indexText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
                indexText.setAttribute('class', 'node-index');
                indexText.setAttribute('y', this.nodeRadius + Math.max(10, indexFontSize + 4));
                indexText.setAttribute('style', `font-size: ${indexFontSize}px`);
                indexText.textContent = `[${i}]`;
                g.appendChild(indexText);
            }

            svg.appendChild(g);
        }
    }

    renderArray() {
        const container = document.getElementById('heapArray');
        container.innerHTML = '';

        if (this.heap.length === 0) {
            container.innerHTML = '<span class="empty-message">Empty</span>';
            return;
        }

        this.heap.forEach((value, idx) => {
            const box = document.createElement('div');
            box.className = 'array-box';
            box.id = `arr-${idx}`;
            box.textContent = value;

            // Apply state classes
            if (idx === 0) box.classList.add('root');
            if (idx === this.currentIdx) box.classList.add('current');
            if (idx === this.parentIdx) box.classList.add('parent');
            if (idx === this.childIdx || idx === this.largerChildIdx) box.classList.add('child');
            if (idx === this.largerChildIdx) box.classList.add('larger-child');

            // Index label
            const indexSpan = document.createElement('span');
            indexSpan.className = 'arr-index';
            indexSpan.textContent = idx;
            box.appendChild(indexSpan);

            container.appendChild(box);
        });
    }

    renderExtracted() {
        const container = document.getElementById('extractedList');
        container.innerHTML = '';

        if (this.extracted.length === 0) {
            container.innerHTML = '<span class="empty-message">No elements extracted yet</span>';
            return;
        }

        this.extracted.forEach((value, idx) => {
            const box = document.createElement('div');
            box.className = 'extracted-box';
            box.textContent = value;

            // Order label
            const orderSpan = document.createElement('span');
            orderSpan.className = 'extract-order';
            orderSpan.textContent = `#${idx + 1}`;
            box.appendChild(orderSpan);

            // Highlight kth element
            if (idx === this.k - 1) {
                box.classList.add('result');
            }

            // Highlight latest
            if (idx === this.extracted.length - 1 && this.phase === 'extracting') {
                box.classList.add('latest');
            }

            container.appendChild(box);
        });
    }

    updateInfoPanel() {
        document.getElementById('phaseValue').textContent = this.phase || '-';
        document.getElementById('sizeValue').textContent = this.heap.length;
        document.getElementById('kValue').textContent = this.k;

        if (this.extracted.length >= this.k) {
            document.getElementById('resultValue').textContent = this.extracted[this.k - 1];
        } else {
            document.getElementById('resultValue').textContent = '-';
        }
    }

    step() {
        if (this.isFinished) {
            return;
        }

        if (this.opIndex >= this.operations.length) {
            this.finish();
            return;
        }

        const op = this.operations[this.opIndex++];
        this.clearHighlights();

        switch (op.type) {
            case 'push_start':
                this.phase = 'building';
                this.highlightCode(2);
                this.updateStatus(`Pushing ${op.value} into heap (element ${op.buildIdx + 1}/${this.nums.length})`);
                break;

            case 'push_append':
                this.heap.push(op.value);
                this.currentIdx = op.idx;
                this.highlightCode(3);
                this.updateStatus(`Appended ${op.value} at index ${op.idx}`);
                break;

            case 'sift_up_compare':
                this.currentIdx = op.idx;
                this.parentIdx = op.parentIdx;
                this.activeEdge = [op.parentIdx, op.idx];
                this.highlightCode(9);
                this.updateStatus(`Comparing heap[${op.idx}]=${this.heap[op.idx]} with parent heap[${op.parentIdx}]=${this.heap[op.parentIdx]}`);
                break;

            case 'sift_up_swap':
                // Perform swap
                [this.heap[op.idx], this.heap[op.parentIdx]] = [this.heap[op.parentIdx], this.heap[op.idx]];
                this.currentIdx = op.parentIdx;
                this.parentIdx = -1;
                this.activeEdge = [op.parentIdx, op.idx];
                this.highlightCode(9);
                this.updateStatus(`Swapped! ${this.heap[op.parentIdx]} > ${this.heap[op.idx]}, moving up`);
                break;

            case 'sift_up_done':
                this.currentIdx = op.idx;
                this.parentIdx = -1;
                this.activeEdge = null;
                this.updateStatus(`Sift-up complete. Element at correct position [${op.idx}]`);
                break;

            case 'push_complete':
                this.clearHighlights();
                this.highlightCode(3);
                this.updateStatus(`Push complete. Heap size: ${this.heap.length}`);
                break;

            case 'pop_start':
                this.phase = 'extracting';
                this.highlightCode(5);
                this.updateStatus(`Extracting element ${op.extractIdx + 1}/${this.k}`);
                break;

            case 'pop_save_root':
                this.currentIdx = 0;
                this.highlightCode(6);
                this.updateStatus(`Root value ${op.value} will be extracted (max element)`);
                break;

            case 'pop_move_last':
                // Move last element to root
                const lastVal = this.heap.pop();
                if (this.heap.length > 0) {
                    this.heap[0] = op.value;
                }
                this.currentIdx = 0;
                this.highlightCode(10);
                this.updateStatus(`Moved last element ${op.value} to root position`);
                break;

            case 'sift_down_compare':
                this.currentIdx = op.idx;
                this.childIdx = op.leftIdx >= 0 ? op.leftIdx : (op.rightIdx >= 0 ? op.rightIdx : -1);
                this.largerChildIdx = -1;

                let compareMsg = `Comparing heap[${op.idx}]=${this.heap[op.idx]} with children: `;
                if (op.leftIdx >= 0) compareMsg += `left[${op.leftIdx}]=${this.heap[op.leftIdx]} `;
                if (op.rightIdx >= 0) compareMsg += `right[${op.rightIdx}]=${this.heap[op.rightIdx]}`;
                if (op.leftIdx < 0 && op.rightIdx < 0) compareMsg = `No children, sift-down complete`;

                this.highlightCode(10);
                this.updateStatus(compareMsg);
                break;

            case 'sift_down_select_larger':
                this.currentIdx = op.idx;
                this.largerChildIdx = op.largerIdx;
                this.childIdx = -1;
                this.activeEdge = [op.idx, op.largerIdx];
                this.highlightCode(10);
                this.updateStatus(`Larger child is heap[${op.largerIdx}]=${this.heap[op.largerIdx]}`);
                break;

            case 'sift_down_swap':
                // Perform swap
                [this.heap[op.idx], this.heap[op.largerIdx]] = [this.heap[op.largerIdx], this.heap[op.idx]];
                this.currentIdx = op.largerIdx;
                this.largerChildIdx = -1;
                this.activeEdge = [op.idx, op.largerIdx];
                this.highlightCode(10);
                this.updateStatus(`Swapped! Element sinks down to index ${op.largerIdx}`);
                break;

            case 'sift_down_done':
                this.clearHighlights();
                this.updateStatus(`Sift-down complete. Heap property restored`);
                break;

            case 'pop_complete':
                this.extracted.push(op.value);
                this.clearHighlights();
                this.highlightCode(6);

                if (op.extractIdx + 1 === this.k) {
                    this.updateStatus(`Extracted ${op.value}. This is the ${this.k}${this.getOrdinalSuffix(this.k)} largest!`, 'success');
                } else {
                    this.updateStatus(`Extracted ${op.value}. ${this.k - op.extractIdx - 1} more to go`);
                }
                break;

            case 'complete':
                this.phase = 'complete';
                this.clearHighlights();
                this.highlightCode(7);
                this.updateStatus(`Complete! The ${this.k}${this.getOrdinalSuffix(this.k)} largest element is ${this.extracted[this.k - 1]}`, 'success');
                this.finish();
                break;
        }

        this.renderTree();
        this.renderArray();
        this.renderExtracted();
        this.updateInfoPanel();
    }

    clearHighlights() {
        this.currentIdx = -1;
        this.parentIdx = -1;
        this.childIdx = -1;
        this.largerChildIdx = -1;
        this.activeEdge = null;
    }

    getOrdinalSuffix(n) {
        const s = ['th', 'st', 'nd', 'rd'];
        const v = n % 100;
        return s[(v - 20) % 10] || s[v] || s[0];
    }
}

// Initialize
const visualizer = new KthLargestVisualizer();

window.onload = () => {
    visualizer.bindControls();
    visualizer.init();

    document.getElementById('randomBtn').addEventListener('click', () => {
        visualizer.generateRandom();
    });
};
