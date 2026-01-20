/**
 * Maximum Subarray - Kadane's Algorithm Visualization
 * Find the contiguous subarray with the largest sum
 */

class MaxSubarrayVisualizer extends VisualizerBase {
    constructor() {
        super({
            codeLineCount: 10
        });

        this.nums = [];
        this.currentIndex = -1;
        this.currentSum = 0;
        this.maxSum = -Infinity;
        this.start = 0;
        this.ansStart = -1;
        this.ansEnd = -1;
    }

    init() {
        // Parse input
        this.nums = this.parseArrayInput('arrayInput');

        if (this.nums.length === 0) {
            this.nums = [-2, 1, -3, 4, -1, 2, 1, -5, 4];
        }

        // Reset state
        this.currentIndex = -1;
        this.currentSum = 0;
        this.maxSum = -Infinity;
        this.start = 0;
        this.ansStart = -1;
        this.ansEnd = -1;
        this.isFinished = false;

        if (this.isPlaying) {
            this.pause();
        }

        // Render
        this.renderArray();
        this.renderSubarray();
        this.updateInfoPanel();
        this.clearCodeHighlight();
        this.highlightCode(0);
        this.updateStatus('Click "Step" or "Play" to start the visualization');
    }

    generateRandom() {
        const length = Math.floor(Math.random() * 6) + 5; // 5-10 elements
        const arr = [];
        for (let i = 0; i < length; i++) {
            arr.push(Math.floor(Math.random() * 21) - 10); // -10 to 10
        }
        document.getElementById('arrayInput').value = arr.join(', ');
        this.init();
    }

    renderArray() {
        const container = document.getElementById('arrayDisplay');
        container.innerHTML = '';

        this.nums.forEach((num, idx) => {
            const element = document.createElement('div');
            element.className = 'array-element';

            const box = document.createElement('div');
            box.className = 'array-box';
            box.id = `box-${idx}`;

            // Determine box state
            if (this.isFinished && idx >= this.ansStart && idx <= this.ansEnd) {
                box.classList.add('max-subarray');
            } else if (idx === this.currentIndex) {
                box.classList.add('current');
            } else if (idx >= this.start && idx < this.currentIndex && this.currentSum > 0) {
                box.classList.add('in-subarray');
            }

            box.textContent = num;

            const index = document.createElement('div');
            index.className = 'array-index';
            index.textContent = `[${idx}]`;

            element.appendChild(box);
            element.appendChild(index);
            container.appendChild(element);
        });
    }

    renderSubarray() {
        const container = document.getElementById('subarrayVisual');

        if (this.currentIndex < 0 || this.currentSum <= 0) {
            container.innerHTML = '<span style="color: #666;">No current subarray</span>';
            return;
        }

        container.innerHTML = '';

        // Show current subarray elements
        const elements = [];
        for (let i = this.start; i <= this.currentIndex; i++) {
            elements.push(this.nums[i]);
        }

        elements.forEach((num, idx) => {
            if (idx > 0) {
                const plus = document.createElement('span');
                plus.textContent = '+';
                plus.style.color = '#888';
                container.appendChild(plus);
            }
            const item = document.createElement('span');
            item.className = 'subarray-item';
            item.textContent = num;
            container.appendChild(item);
        });

        // Show equals and sum
        const equals = document.createElement('span');
        equals.className = 'subarray-equals';
        equals.textContent = '=';
        container.appendChild(equals);

        const sum = document.createElement('span');
        sum.className = 'subarray-sum';
        sum.textContent = this.currentSum;
        container.appendChild(sum);
    }

    updateInfoPanel() {
        this.updateInfoBox('currentIndex', this.currentIndex >= 0 ? this.currentIndex : '-');
        this.updateInfoBox('currentSum', this.currentSum);
        this.updateInfoBox('maxSum', this.maxSum === -Infinity ? '-∞' : this.maxSum);

        if (this.ansStart >= 0 && this.ansEnd >= 0) {
            const subarray = this.nums.slice(this.ansStart, this.ansEnd + 1);
            this.updateInfoBox('maxSubarray', `[${subarray.join(', ')}]`);
        } else {
            this.updateInfoBox('maxSubarray', '-');
        }
    }

    step() {
        if (this.isFinished) {
            return;
        }

        this.currentIndex++;

        if (this.currentIndex >= this.nums.length) {
            this.finish();
            this.highlightCode(9);
            this.renderArray();
            const subarray = this.nums.slice(this.ansStart, this.ansEnd + 1);
            this.updateStatus(
                `Done! Maximum sum is ${this.maxSum} from subarray [${subarray.join(', ')}] at indices [${this.ansStart}, ${this.ansEnd}]`,
                'success'
            );
            return;
        }

        const currentNum = this.nums[this.currentIndex];

        // Check if starting new subarray
        this.highlightCode(3);

        setTimeout(() => {
            if (this.currentSum === 0) {
                this.start = this.currentIndex;
                this.updateStatus(`Starting new subarray at index ${this.currentIndex}`);
            }

            // Add current element
            setTimeout(() => {
                this.highlightCode(4);
                this.currentSum += currentNum;
                this.renderArray();
                this.renderSubarray();
                this.updateInfoPanel();

                // Check if new maximum
                setTimeout(() => {
                    this.highlightCode(5);

                    if (this.currentSum > this.maxSum) {
                        setTimeout(() => {
                            this.highlightCode(6);
                            this.maxSum = this.currentSum;

                            setTimeout(() => {
                                this.highlightCode(7);
                                this.ansStart = this.start;
                                this.ansEnd = this.currentIndex;
                                this.updateInfoPanel();
                                this.updateStatus(`New maximum! Sum = ${this.maxSum} from indices [${this.ansStart}, ${this.ansEnd}]`);

                                // Check if sum went negative
                                this.checkNegative();
                            }, this.getSpeed() / 5);
                        }, this.getSpeed() / 5);
                    } else {
                        this.updateStatus(`Current sum ${this.currentSum} is not greater than max ${this.maxSum}`);
                        this.checkNegative();
                    }
                }, this.getSpeed() / 4);
            }, this.getSpeed() / 4);
        }, this.getSpeed() / 4);
    }

    checkNegative() {
        setTimeout(() => {
            this.highlightCode(8);

            if (this.currentSum < 0) {
                // Add visual feedback for reset
                const box = document.getElementById(`box-${this.currentIndex}`);
                if (box) {
                    box.classList.add('negative-sum');
                }

                setTimeout(() => {
                    this.currentSum = 0;
                    this.renderArray();
                    this.renderSubarray();
                    this.updateInfoPanel();
                    this.updateStatus(`Sum went negative! Resetting sum to 0 and starting fresh.`);
                }, this.getSpeed() / 4);
            }
        }, this.getSpeed() / 4);
    }
}

// Initialize
const visualizer = new MaxSubarrayVisualizer();

window.onload = () => {
    visualizer.bindControls();
    visualizer.init();

    // Bind random button
    document.getElementById('randomBtn').addEventListener('click', () => {
        visualizer.generateRandom();
    });
};
