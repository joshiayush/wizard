/**
 * Product of Array Except Self Visualization
 * Two-pass approach: prefix products (left→right), suffix products (right→left)
 */

class ProductExceptSelfVisualizer extends VisualizerBase {
    constructor() {
        super({
            codeLineCount: 9
        });

        this.nums = [];
        this.out = [];
        this.phase = 'init';     // init | prefix | suffix_init | suffix | done
        this.currentIndex = -1;
        this.suffix = 1;
    }

    init() {
        this.nums = this.parseArrayInput('arrayInput');

        if (this.nums.length === 0) {
            this.nums = [1, 2, 3, 4];
        }

        this.out = new Array(this.nums.length).fill(1);
        this.phase = 'init';
        this.currentIndex = -1;
        this.suffix = 1;
        this.isFinished = false;

        if (this.isPlaying) {
            this.pause();
        }

        this.renderNums();
        this.renderOut();
        this.updateInfoPanel();
        this.updateFormula('-');
        this.updatePassIndicator();
        this.clearCodeHighlight();
        this.highlightCode(0);
        this.updateStatus('Click "Step" or "Play" to start the visualization');
    }

    renderNums() {
        const container = document.getElementById('numsDisplay');
        container.innerHTML = '';

        this.nums.forEach((num, idx) => {
            const element = document.createElement('div');
            element.className = 'array-element';

            const box = document.createElement('div');
            box.className = 'array-box';
            box.id = `nums-box-${idx}`;

            // Highlight contributing element
            if (this.phase === 'prefix' && idx === this.currentIndex - 1 && this.currentIndex > 0) {
                box.classList.add('prefix-source');
            } else if (this.phase === 'suffix' && idx === this.currentIndex + 1 && this.currentIndex < this.nums.length - 1) {
                box.classList.add('prefix-source');
            }

            if (idx === this.currentIndex && (this.phase === 'prefix' || this.phase === 'suffix')) {
                box.classList.add('current');
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

    renderOut() {
        const container = document.getElementById('outDisplay');
        container.innerHTML = '';

        this.out.forEach((val, idx) => {
            const element = document.createElement('div');
            element.className = 'array-element';

            const box = document.createElement('div');
            box.className = 'array-box';
            box.id = `out-box-${idx}`;

            if (this.isFinished) {
                box.classList.add('success');
            } else if (idx === this.currentIndex && (this.phase === 'prefix' || this.phase === 'suffix')) {
                box.classList.add('current');
            } else if (this.phase === 'prefix' && idx > 0 && idx < this.currentIndex) {
                box.classList.add('computed');
            } else if (this.phase === 'suffix' && idx > this.currentIndex && idx < this.nums.length) {
                box.classList.add('computed');
            } else if (this.phase === 'suffix_init') {
                // All prefix values computed
                if (idx > 0) {
                    box.classList.add('computed');
                }
            }

            box.textContent = val;

            const index = document.createElement('div');
            index.className = 'array-index';
            index.textContent = `[${idx}]`;

            element.appendChild(box);
            element.appendChild(index);
            container.appendChild(element);
        });
    }

    updateFormula(html) {
        document.getElementById('formulaContent').innerHTML = html;
    }

    updatePassIndicator() {
        const indicator = document.getElementById('passIndicator');
        const label = document.getElementById('passLabel');
        const direction = document.getElementById('passDirection');

        indicator.className = 'pass-indicator';

        switch (this.phase) {
            case 'init':
                label.textContent = 'Initialization';
                direction.innerHTML = '';
                break;
            case 'prefix':
                indicator.classList.add('prefix');
                label.textContent = 'Pass 1: Prefix Products';
                direction.innerHTML = '&rarr;';
                break;
            case 'suffix_init':
            case 'suffix':
                indicator.classList.add('suffix');
                label.textContent = 'Pass 2: Suffix Products';
                direction.innerHTML = '&larr;';
                break;
            case 'done':
                label.textContent = 'Complete';
                direction.innerHTML = '';
                break;
        }
    }

    updateInfoPanel() {
        const phaseNames = {
            'init': '-',
            'prefix': 'Prefix',
            'suffix_init': 'Suffix Init',
            'suffix': 'Suffix',
            'done': 'Done'
        };
        this.updateInfoBox('currentPhase', phaseNames[this.phase] || '-');
        this.updateInfoBox('currentIndex', this.currentIndex >= 0 ? this.currentIndex : '-');
        this.updateInfoBox('runningProduct', '-');
        this.updateInfoBox('outputValue', '-');
    }

    generateRandom() {
        const len = Math.floor(Math.random() * 3) + 4; // 4-6 elements
        const arr = [];
        for (let i = 0; i < len; i++) {
            arr.push(Math.floor(Math.random() * 9) + 1); // 1-9
        }
        document.getElementById('arrayInput').value = arr.join(', ');
        this.init();
    }

    step() {
        if (this.isFinished) return;

        switch (this.phase) {
            case 'init':
                this.handleInit();
                break;
            case 'prefix':
                this.handlePrefix();
                break;
            case 'suffix_init':
                this.handleSuffixInit();
                break;
            case 'suffix':
                this.handleSuffix();
                break;
        }
    }

    handleInit() {
        this.highlightCode(1);
        this.out = new Array(this.nums.length).fill(1);
        this.phase = 'prefix';
        this.currentIndex = 1;

        this.renderNums();
        this.renderOut();
        this.updatePassIndicator();
        this.updateInfoBox('currentPhase', 'Init');
        this.updateFormula(`out = [${this.out.join(', ')}]`);
        this.updateStatus(`Initialized output array with ${this.nums.length} ones`);
    }

    handlePrefix() {
        if (this.currentIndex >= this.nums.length) {
            this.phase = 'suffix_init';
            this.handleSuffixInit();
            return;
        }

        const i = this.currentIndex;
        this.highlightCode(2);
        this.updatePassIndicator();
        this.updateInfoBox('currentPhase', 'Prefix');
        this.updateInfoBox('currentIndex', i);
        this.renderNums();
        this.renderOut();

        setTimeout(() => {
            this.highlightCode(3);

            const prevOut = this.out[i - 1];
            const prevNums = this.nums[i - 1];
            const result = prevOut * prevNums;
            this.out[i] = result;

            this.updateFormula(
                `out[${i}] = out[${i - 1}] <span class="formula-operator">&times;</span> nums[${i - 1}] = ` +
                `<span class="formula-value">${prevOut}</span> <span class="formula-operator">&times;</span> ` +
                `<span class="formula-value">${prevNums}</span> = <span class="formula-result">${result}</span>`
            );
            this.updateInfoBox('runningProduct', result);
            this.updateInfoBox('outputValue', result);
            this.renderOut();
            this.updateStatus(`Prefix: out[${i}] = ${prevOut} \u00d7 ${prevNums} = ${result}`);

            this.currentIndex++;
        }, this.getSpeed() / 3);
    }

    handleSuffixInit() {
        this.highlightCode(4);
        this.suffix = 1;
        this.currentIndex = this.nums.length - 2;

        this.updatePassIndicator();
        this.updateInfoBox('currentPhase', 'Suffix Init');
        this.updateInfoBox('currentIndex', '-');
        this.updateInfoBox('runningProduct', 1);
        this.updateFormula('suffix = <span class="formula-result">1</span>');
        this.renderNums();
        this.renderOut();
        this.updateStatus('Suffix pass initialized: suffix = 1');

        this.phase = 'suffix';
    }

    handleSuffix() {
        if (this.currentIndex < 0) {
            // Done
            this.phase = 'done';
            this.highlightCode(8);
            this.updatePassIndicator();
            this.finish();
            this.renderNums();
            this.renderOut();
            this.updateInfoBox('currentPhase', 'Done');
            this.updateInfoBox('currentIndex', '-');
            this.updateFormula(`Result: [${this.out.join(', ')}]`);
            this.updateStatus(`Done! Product array: [${this.out.join(', ')}]`, 'success');
            return;
        }

        const i = this.currentIndex;
        this.highlightCode(5);
        this.updatePassIndicator();
        this.updateInfoBox('currentPhase', 'Suffix');
        this.updateInfoBox('currentIndex', i);
        this.renderNums();
        this.renderOut();

        setTimeout(() => {
            // suffix *= nums[i+1]
            this.highlightCode(6);

            const oldSuffix = this.suffix;
            const numsVal = this.nums[i + 1];
            this.suffix *= numsVal;

            this.updateInfoBox('runningProduct', this.suffix);
            this.updateFormula(
                `suffix = <span class="formula-value">${oldSuffix}</span> <span class="formula-operator">&times;</span> ` +
                `nums[${i + 1}] = <span class="formula-value">${oldSuffix}</span> <span class="formula-operator">&times;</span> ` +
                `<span class="formula-value">${numsVal}</span> = <span class="formula-result">${this.suffix}</span>`
            );

            setTimeout(() => {
                // out[i] *= suffix
                this.highlightCode(7);

                const oldOut = this.out[i];
                this.out[i] *= this.suffix;

                this.updateFormula(
                    `out[${i}] = <span class="formula-value">${oldOut}</span> <span class="formula-operator">&times;</span> ` +
                    `suffix(<span class="formula-value">${this.suffix}</span>) = <span class="formula-result">${this.out[i]}</span>`
                );
                this.updateInfoBox('outputValue', this.out[i]);
                this.renderOut();
                this.updateStatus(`Suffix: out[${i}] = ${oldOut} \u00d7 ${this.suffix} = ${this.out[i]}`);

                this.currentIndex--;
            }, this.getSpeed() / 3);
        }, this.getSpeed() / 3);
    }
}

// Initialize
const visualizer = new ProductExceptSelfVisualizer();

window.onload = () => {
    visualizer.bindControls();
    visualizer.init();

    document.getElementById('randomBtn').addEventListener('click', () => {
        visualizer.generateRandom();
    });
};
