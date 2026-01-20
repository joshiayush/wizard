/**
 * Sort Colors - Dutch National Flag Algorithm Visualization
 * Sort array of 0s, 1s, and 2s in-place using three pointers
 */

class SortColorsVisualizer extends VisualizerBase {
    constructor() {
        super({
            codeLineCount: 10
        });

        this.nums = [];
        this.low = 0;
        this.mid = 0;
        this.high = 0;
    }

    init() {
        // Parse input - only allow 0, 1, 2
        this.nums = this.parseArrayInput('arrayInput', n => n >= 0 && n <= 2);

        if (this.nums.length === 0) {
            this.nums = [2, 0, 2, 1, 1, 0];
        }

        // Reset state
        this.low = 0;
        this.mid = 0;
        this.high = this.nums.length - 1;
        this.isFinished = false;

        if (this.isPlaying) {
            this.pause();
        }

        // Render
        this.renderArray();
        this.updateInfoPanel();
        this.updateRegions();
        this.clearCodeHighlight();
        this.highlightCode(0);
        this.updateStatus('Click "Step" or "Play" to start the visualization');
    }

    generateRandom() {
        const length = Math.floor(Math.random() * 8) + 5; // 5-12 elements
        const arr = [];
        for (let i = 0; i < length; i++) {
            arr.push(Math.floor(Math.random() * 3));
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
            element.style.position = 'relative';

            const box = document.createElement('div');
            box.className = `array-box color-${num}`;
            box.id = `box-${idx}`;
            box.textContent = num;

            const index = document.createElement('div');
            index.className = 'array-index';
            index.textContent = `[${idx}]`;

            element.appendChild(box);
            element.appendChild(index);

            // Add pointers
            if (!this.isFinished) {
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

                if (idx === this.mid) {
                    const pointer = document.createElement('div');
                    pointer.className = 'pointer top mid';
                    pointer.innerHTML = '<span>mid</span><span class="pointer-arrow">&#9660;</span>';
                    pointer.style.position = 'absolute';
                    pointer.style.top = '-35px';
                    pointer.style.left = '50%';
                    pointer.style.transform = 'translateX(-50%)';
                    element.appendChild(pointer);
                }

                if (idx === this.high) {
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

    updateInfoPanel() {
        this.updateInfoBox('lowValue', this.low);
        this.updateInfoBox('midValue', this.mid);
        this.updateInfoBox('highValue', this.high);
    }

    updateRegions() {
        document.getElementById('redRange').textContent = `[0, ${this.low}) = ${this.low} elements`;
        document.getElementById('whiteRange').textContent = `[${this.low}, ${this.mid}) = ${this.mid - this.low} elements`;
        document.getElementById('blueRange').textContent = `(${this.high}, ${this.nums.length - 1}] = ${this.nums.length - 1 - this.high} elements`;
    }

    step() {
        if (this.isFinished) {
            return;
        }

        // Check if done
        if (this.mid > this.high) {
            this.finish();
            this.clearCodeHighlight();
            this.renderArray();
            this.updateStatus('Array sorted! All 0s are at the beginning, 2s at the end, 1s in the middle.', 'success');
            return;
        }

        this.highlightCode(1); // while condition

        const currentValue = this.nums[this.mid];

        setTimeout(() => {
            if (currentValue === 0) {
                this.highlightCode(2);
                this.updateStatus(`nums[mid] = nums[${this.mid}] = 0 (Red). Swap with nums[low] = nums[${this.low}] = ${this.nums[this.low]}`);

                setTimeout(() => {
                    this.highlightCode(3);

                    // Swap
                    const temp = this.nums[this.low];
                    this.nums[this.low] = this.nums[this.mid];
                    this.nums[this.mid] = temp;

                    this.animateSwap(this.low, this.mid, () => {
                        this.highlightCode(4);
                        this.low++;
                        this.mid++;
                        this.renderArray();
                        this.updateInfoPanel();
                        this.updateRegions();
                    });
                }, this.getSpeed() / 3);

            } else if (currentValue === 1) {
                this.highlightCode(5);
                this.updateStatus(`nums[mid] = nums[${this.mid}] = 1 (White). Already in correct region, move mid forward.`);

                setTimeout(() => {
                    this.highlightCode(6);
                    this.mid++;
                    this.renderArray();
                    this.updateInfoPanel();
                    this.updateRegions();
                }, this.getSpeed() / 3);

            } else { // currentValue === 2
                this.highlightCode(7);
                this.updateStatus(`nums[mid] = nums[${this.mid}] = 2 (Blue). Swap with nums[high] = nums[${this.high}] = ${this.nums[this.high]}`);

                setTimeout(() => {
                    this.highlightCode(8);

                    // Swap
                    const temp = this.nums[this.mid];
                    this.nums[this.mid] = this.nums[this.high];
                    this.nums[this.high] = temp;

                    this.animateSwap(this.mid, this.high, () => {
                        this.highlightCode(9);
                        this.high--;
                        this.renderArray();
                        this.updateInfoPanel();
                        this.updateRegions();
                    });
                }, this.getSpeed() / 3);
            }
        }, this.getSpeed() / 4);
    }
}

// Initialize
const visualizer = new SortColorsVisualizer();

window.onload = () => {
    visualizer.bindControls();
    visualizer.init();

    // Bind random button
    document.getElementById('randomBtn').addEventListener('click', () => {
        visualizer.generateRandom();
    });
};
