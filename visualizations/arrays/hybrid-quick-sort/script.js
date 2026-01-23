/**
 * Hybrid Quick Sort - DNF Partitioning Visualization
 * QuickSort with Dutch National Flag 3-way partitioning and random pivot
 */

class HybridQuickSortVisualizer extends VisualizerBase {
    constructor() {
        super({
            codeLineCount: 19
        });

        this.arr = [];
        this.callStack = [];          // Stack of {l, h} ranges to process
        this.currentRange = null;     // Current range being processed
        this.pivot = null;            // Current pivot value
        this.low = 0;                 // DNF low pointer
        this.mid = 0;                 // DNF mid pointer
        this.high = 0;                // DNF high pointer
        this.phase = 'idle';          // 'idle' | 'selecting_pivot' | 'partitioning' | 'pushing_children'
        this.sortedIndices = new Set(); // Indices in final sorted position
    }

    init() {
        // Parse input
        this.arr = this.parseArrayInput('arrayInput');

        if (this.arr.length === 0) {
            this.arr = [5, 3, 8, 4, 2, 7, 1, 6];
        }

        // Reset state
        this.callStack = [];
        this.currentRange = null;
        this.pivot = null;
        this.low = 0;
        this.mid = 0;
        this.high = 0;
        this.phase = 'idle';
        this.sortedIndices = new Set();
        this.isFinished = false;

        if (this.isPlaying) {
            this.pause();
        }

        // Push initial range if array has more than 1 element
        if (this.arr.length > 1) {
            this.callStack.push({ l: 0, h: this.arr.length - 1 });
        } else if (this.arr.length === 1) {
            this.sortedIndices.add(0);
        }

        // Render
        this.renderArray();
        this.renderCallStack();
        this.updateInfoPanel();
        this.clearCodeHighlight();
        this.highlightCode(14); // def _quickSort
        this.updateStatus('Click "Step" or "Play" to start sorting');
        document.getElementById('rangeValue').textContent = '-';
    }

    generateRandom() {
        const length = Math.floor(Math.random() * 8) + 8; // 8-15 elements
        const arr = [];
        for (let i = 0; i < length; i++) {
            arr.push(Math.floor(Math.random() * 50) + 1);
        }
        document.getElementById('arrayInput').value = arr.join(', ');
        this.init();
    }

    renderArray() {
        const container = document.getElementById('arrayDisplay');
        container.innerHTML = '';

        this.arr.forEach((num, idx) => {
            const element = document.createElement('div');
            element.className = 'array-element';
            element.style.position = 'relative';

            const box = document.createElement('div');
            box.className = 'array-box';
            box.id = `box-${idx}`;
            box.textContent = num;

            // Determine box class based on state
            if (this.sortedIndices.has(idx)) {
                box.classList.add('sorted');
            } else if (this.currentRange && idx >= this.currentRange.l && idx <= this.currentRange.h) {
                // Within active range
                if (this.phase === 'partitioning' && this.pivot !== null) {
                    if (num < this.pivot) {
                        box.classList.add('less-than');
                    } else if (num === this.pivot) {
                        box.classList.add('equal-to');
                    } else {
                        box.classList.add('greater-than');
                    }
                    // Highlight current mid position
                    if (idx === this.mid) {
                        box.classList.add('current');
                    }
                } else if (this.phase === 'selecting_pivot') {
                    // Pivot just selected
                    if (num === this.pivot) {
                        box.classList.add('pivot');
                    }
                }
            } else if (this.currentRange) {
                // Outside active range
                box.classList.add('inactive');
            }

            const index = document.createElement('div');
            index.className = 'array-index';
            index.textContent = `[${idx}]`;

            element.appendChild(box);
            element.appendChild(index);

            // Add pointers during partitioning
            if (this.phase === 'partitioning' && this.currentRange &&
                idx >= this.currentRange.l && idx <= this.currentRange.h) {

                if (idx === this.low) {
                    const pointer = document.createElement('div');
                    pointer.className = 'pointer bottom low';
                    pointer.innerHTML = '<span class="pointer-arrow">&#9650;</span><span>low</span>';
                    pointer.style.position = 'absolute';
                    pointer.style.bottom = '-35px';
                    pointer.style.left = '50%';
                    pointer.style.transform = 'translateX(-50%)';
                    element.appendChild(pointer);
                }

                if (idx === this.mid && idx !== this.low) {
                    const pointer = document.createElement('div');
                    pointer.className = 'pointer top mid';
                    pointer.innerHTML = '<span>mid</span><span class="pointer-arrow">&#9660;</span>';
                    pointer.style.position = 'absolute';
                    pointer.style.top = '-35px';
                    pointer.style.left = '50%';
                    pointer.style.transform = 'translateX(-50%)';
                    element.appendChild(pointer);
                }

                if (idx === this.high && idx !== this.low && idx !== this.mid) {
                    const pointer = document.createElement('div');
                    pointer.className = 'pointer bottom high';
                    pointer.innerHTML = '<span class="pointer-arrow">&#9650;</span><span>high</span>';
                    pointer.style.position = 'absolute';
                    pointer.style.bottom = '-35px';
                    pointer.style.left = '50%';
                    pointer.style.transform = 'translateX(-50%)';
                    element.appendChild(pointer);
                }
            }

            container.appendChild(element);
        });
    }

    renderCallStack() {
        const container = document.getElementById('callStack');
        container.innerHTML = '';

        if (this.callStack.length === 0) {
            container.innerHTML = '<div class="stack-empty">Stack empty</div>';
            return;
        }

        // Show stack with most recent at front
        this.callStack.slice().reverse().forEach((range, idx) => {
            const item = document.createElement('div');
            item.className = 'stack-item';
            if (idx === 0) {
                item.classList.add('next');
            }
            item.textContent = `[${range.l}, ${range.h}]`;
            container.appendChild(item);
        });
    }

    updateInfoPanel() {
        this.updateInfoBox('pivotValue', this.pivot !== null ? this.pivot : '-');
        this.updateInfoBox('lowValue', this.phase === 'partitioning' ? this.low : '-');
        this.updateInfoBox('midValue', this.phase === 'partitioning' ? this.mid : '-');
        this.updateInfoBox('highValue', this.phase === 'partitioning' ? this.high : '-');

        if (this.currentRange) {
            document.getElementById('rangeValue').textContent =
                `[${this.currentRange.l}, ${this.currentRange.h}]`;
        } else {
            document.getElementById('rangeValue').textContent = '-';
        }
    }

    step() {
        if (this.isFinished) {
            return;
        }

        // State machine
        if (this.phase === 'idle') {
            // Need to pop next range from stack
            if (this.callStack.length === 0) {
                // All done!
                this.finish();
                this.clearCodeHighlight();
                this.renderArray();
                this.updateStatus('Array is sorted!', 'success');
                return;
            }

            // Pop next range
            this.currentRange = this.callStack.pop();
            this.highlightCode(15); // if not l < h: return

            // Check if single element or invalid range
            if (this.currentRange.l >= this.currentRange.h) {
                // Single element - mark as sorted
                if (this.currentRange.l === this.currentRange.h) {
                    this.sortedIndices.add(this.currentRange.l);
                }
                this.currentRange = null;
                this.renderArray();
                this.renderCallStack();
                this.updateInfoPanel();
                this.updateStatus(`Range has single element, already sorted`);
                return;
            }

            // Valid range - move to pivot selection
            this.phase = 'selecting_pivot';
            this.renderCallStack();
            this.updateInfoPanel();
            this.updateStatus(`Processing range [${this.currentRange.l}, ${this.currentRange.h}]`);
            return;
        }

        if (this.phase === 'selecting_pivot') {
            // Select random pivot
            const pivotIdx = Math.floor(Math.random() * (this.currentRange.h - this.currentRange.l + 1)) + this.currentRange.l;
            this.pivot = this.arr[pivotIdx];

            this.highlightCode(1); // pivot = nums[random.randint(l, h)]

            setTimeout(() => {
                this.highlightCode(2); // low, mid, high = l, l, h
                this.low = this.currentRange.l;
                this.mid = this.currentRange.l;
                this.high = this.currentRange.h;
                this.phase = 'partitioning';

                this.renderArray();
                this.updateInfoPanel();
                this.updateStatus(`Selected pivot = ${this.pivot}. Starting DNF partitioning.`);
            }, this.getSpeed() / 3);

            this.renderArray();
            this.updateStatus(`Randomly selected pivot = ${this.pivot} from range [${this.currentRange.l}, ${this.currentRange.h}]`);
            return;
        }

        if (this.phase === 'partitioning') {
            // DNF partitioning step
            this.highlightCode(3); // while mid <= high

            if (this.mid > this.high) {
                // Partition complete
                this.phase = 'pushing_children';
                this.highlightCode(12); // return low, high

                setTimeout(() => {
                    // Mark pivot region as sorted
                    for (let i = this.low; i <= this.high; i++) {
                        this.sortedIndices.add(i);
                    }

                    // Push children (right first so left is processed first)
                    const rightRange = { l: this.high + 1, h: this.currentRange.h };
                    const leftRange = { l: this.currentRange.l, h: this.low - 1 };

                    this.highlightCode(17); // _quickSort(nums, l, low - 1)

                    if (rightRange.l <= rightRange.h) {
                        this.callStack.push(rightRange);
                    }
                    if (leftRange.l <= leftRange.h) {
                        this.callStack.push(leftRange);
                    }

                    this.updateStatus(`Partition done! Pivot region [${this.low}, ${this.high}] is sorted. Pushed child ranges.`);

                    // Reset for next range
                    this.currentRange = null;
                    this.pivot = null;
                    this.phase = 'idle';

                    this.renderArray();
                    this.renderCallStack();
                    this.updateInfoPanel();
                }, this.getSpeed() / 3);

                this.updateStatus(`Partitioning complete. mid (${this.mid}) > high (${this.high})`);
                return;
            }

            const currentValue = this.arr[this.mid];

            setTimeout(() => {
                if (currentValue < this.pivot) {
                    this.highlightCode(4); // if nums[mid] < pivot
                    this.updateStatus(`nums[${this.mid}] = ${currentValue} < pivot (${this.pivot}). Swap with nums[${this.low}] = ${this.arr[this.low]}`);

                    setTimeout(() => {
                        this.highlightCode(5); // swap

                        // Swap
                        const temp = this.arr[this.low];
                        this.arr[this.low] = this.arr[this.mid];
                        this.arr[this.mid] = temp;

                        this.animateSwap(this.low, this.mid, () => {
                            this.highlightCode(6); // low++; mid++
                            this.low++;
                            this.mid++;
                            this.renderArray();
                            this.updateInfoPanel();
                        });
                    }, this.getSpeed() / 3);

                } else if (currentValue === this.pivot) {
                    this.highlightCode(7); // elif nums[mid] == pivot
                    this.updateStatus(`nums[${this.mid}] = ${currentValue} == pivot (${this.pivot}). Move mid forward.`);

                    setTimeout(() => {
                        this.highlightCode(8); // mid++
                        this.mid++;
                        this.renderArray();
                        this.updateInfoPanel();
                    }, this.getSpeed() / 3);

                } else { // currentValue > this.pivot
                    this.highlightCode(9); // else (nums[mid] > pivot)
                    this.updateStatus(`nums[${this.mid}] = ${currentValue} > pivot (${this.pivot}). Swap with nums[${this.high}] = ${this.arr[this.high]}`);

                    setTimeout(() => {
                        this.highlightCode(10); // swap

                        // Swap
                        const temp = this.arr[this.mid];
                        this.arr[this.mid] = this.arr[this.high];
                        this.arr[this.high] = temp;

                        this.animateSwap(this.mid, this.high, () => {
                            this.highlightCode(11); // high--
                            this.high--;
                            this.renderArray();
                            this.updateInfoPanel();
                        });
                    }, this.getSpeed() / 3);
                }
            }, this.getSpeed() / 4);

            this.renderArray();
            return;
        }
    }
}

// Initialize
const visualizer = new HybridQuickSortVisualizer();

window.onload = () => {
    visualizer.bindControls();
    visualizer.init();

    // Bind random button
    document.getElementById('randomBtn').addEventListener('click', () => {
        visualizer.generateRandom();
    });
};
