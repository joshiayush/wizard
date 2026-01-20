/**
 * Two Sum Algorithm Visualization
 * Uses hashmap to find two numbers that add up to target
 */

class TwoSumVisualizer extends VisualizerBase {
    constructor() {
        super({
            codeLineCount: 7
        });

        this.nums = [];
        this.target = 9;
        this.currentIndex = -1;
        this.hashmap = {};
        this.foundPair = null;
    }

    init() {
        // Parse inputs
        this.nums = this.parseArrayInput('arrayInput');
        this.target = this.parseNumberInput('targetInput', 9);

        if (this.nums.length === 0) {
            this.nums = [2, 7, 11, 15];
        }

        // Reset state
        this.currentIndex = -1;
        this.hashmap = {};
        this.foundPair = null;
        this.isFinished = false;

        if (this.isPlaying) {
            this.pause();
        }

        // Render
        this.renderArray();
        this.renderHashmap();
        this.updateInfoPanel();
        this.updateInfoBox('targetDisplay', this.target);
        this.clearCodeHighlight();
        this.highlightCode(0);
        this.updateStatus('Click "Step" or "Play" to start the visualization');
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

            if (this.foundPair && (idx === this.foundPair[0] || idx === this.foundPair[1])) {
                box.classList.add('found');
            } else if (idx === this.currentIndex) {
                box.classList.add('current');
            } else if (Object.values(this.hashmap).includes(idx)) {
                box.classList.add('highlight');
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

    renderHashmap() {
        const container = document.getElementById('hashmapDisplay');

        if (Object.keys(this.hashmap).length === 0) {
            container.innerHTML = '<span class="empty-text">Empty</span>';
            return;
        }

        container.innerHTML = '';
        Object.entries(this.hashmap).forEach(([key, value]) => {
            const entry = document.createElement('div');
            entry.className = 'hashmap-entry';
            entry.id = `hash-${key}`;
            entry.innerHTML = `<span class="hashmap-key">${key}</span> &rarr; <span class="hashmap-value">${value}</span>`;
            container.appendChild(entry);
        });
    }

    updateInfoPanel() {
        this.updateInfoBox('currentIndex', this.currentIndex >= 0 ? this.currentIndex : '-');
        this.updateInfoBox('currentValue', this.currentIndex >= 0 ? this.nums[this.currentIndex] : '-');

        if (this.currentIndex >= 0) {
            const complement = this.target - this.nums[this.currentIndex];
            this.updateInfoBox('complementValue', complement);
        } else {
            this.updateInfoBox('complementValue', '-');
        }
    }

    step() {
        if (this.isFinished) {
            return;
        }

        this.currentIndex++;

        if (this.currentIndex >= this.nums.length) {
            this.finish();
            this.updateStatus('No solution found!', 'error');
            return;
        }

        const currentNum = this.nums[this.currentIndex];
        const complement = this.target - currentNum;

        // Update display
        this.renderArray();
        this.updateInfoPanel();

        // Highlight complement calculation
        this.highlightCode(2);

        setTimeout(() => {
            this.highlightCode(3); // if check

            if (complement in this.hashmap) {
                // Found the pair!
                this.foundPair = [this.currentIndex, this.hashmap[complement]];

                setTimeout(() => {
                    this.highlightCode(4); // return statement

                    // Highlight the found entry in hashmap
                    const hashEntry = document.getElementById(`hash-${complement}`);
                    if (hashEntry) {
                        hashEntry.classList.add('highlight');
                    }

                    this.renderArray();
                    this.finish();
                    this.updateStatus(
                        `Found! indices [${this.foundPair[0]}, ${this.foundPair[1]}] → values [${this.nums[this.foundPair[0]]}, ${this.nums[this.foundPair[1]]}] = ${this.target}`,
                        'success'
                    );
                }, this.getSpeed() / 3);
            } else {
                // Add to hashmap
                setTimeout(() => {
                    this.highlightCode(6); // add to map

                    this.hashmap[currentNum] = this.currentIndex;
                    this.renderHashmap();

                    // Animate new entry
                    const newEntry = document.getElementById(`hash-${currentNum}`);
                    if (newEntry) {
                        newEntry.classList.add('new');
                    }

                    this.renderArray();
                    this.updateStatus(`Added nums[${this.currentIndex}] = ${currentNum} to hashmap. Looking for complement ${complement}...`);
                }, this.getSpeed() / 3);
            }
        }, this.getSpeed() / 3);
    }
}

// Initialize
const visualizer = new TwoSumVisualizer();

window.onload = () => {
    visualizer.bindControls();
    visualizer.init();
};
