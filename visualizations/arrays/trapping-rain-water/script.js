/**
 * Trapping Rain Water Visualization
 * Three-pass approach: left max (→), right max (←), calculate water
 */

class TrappingRainWaterVisualizer extends VisualizerBase {
    constructor() {
        super({
            codeLineCount: 13
        });

        this.height = [];
        this.lmax = [];
        this.rmax = [];
        this.water = [];
        this.totalWater = 0;
        this.maxHeight = 0;
        this.phase = 'idle';
        this.currentIndex = -1;
        this.newlyFilledIndex = -1;
    }

    init() {
        this.height = this.parseArrayInput('arrayInput').map(v => Math.max(0, v));

        if (this.height.length === 0) {
            this.height = [0, 1, 0, 2, 1, 0, 1, 3, 2, 1, 2, 1];
        }

        const n = this.height.length;
        this.lmax = new Array(n).fill(0);
        this.rmax = new Array(n).fill(0);
        this.water = new Array(n).fill(0);
        this.totalWater = 0;
        this.maxHeight = Math.max(...this.height, 1);
        this.phase = 'idle';
        this.currentIndex = -1;
        this.newlyFilledIndex = -1;
        this.isFinished = false;

        if (this.isPlaying) {
            this.pause();
        }

        this.renderBarChart();
        this.renderLmaxArray();
        this.renderRmaxArray();
        this.updateInfoPanel();
        this.updateFormula('-');
        this.updatePassIndicator();
        this.clearCodeHighlight();
        this.highlightCode(0);
        this.updateStatus('Click "Step" or "Play" to start the visualization');
    }

    renderBarChart() {
        const chart = document.getElementById('barChart');
        chart.innerHTML = '';

        const n = this.height.length;
        if (n === 0) return;

        // Build columns
        for (let i = 0; i < n; i++) {
            const col = document.createElement('div');
            col.className = 'bar-column';

            const cells = document.createElement('div');
            cells.className = 'bar-cells';

            const h = this.height[i];
            const w = this.water[i] || 0;
            const waterLevel = h + w;
            const fillingCells = [];

            // Rows from top (maxHeight) to bottom (1)
            for (let r = this.maxHeight; r >= 1; r--) {
                const cell = document.createElement('div');
                cell.className = 'bar-cell';

                if (r <= h) {
                    // Wall cell
                    cell.classList.add('wall');
                    if (i === this.currentIndex && !this.isFinished) {
                        cell.classList.add('current-column');
                    }
                } else if (w > 0 && r <= waterLevel) {
                    // Water cell
                    cell.classList.add('water');
                    if (i === this.newlyFilledIndex) {
                        cell.classList.add('filling');
                        fillingCells.push(cell);
                    }
                    if (this.isFinished) {
                        cell.classList.add('settled');
                    }
                } else {
                    // Empty cell
                    cell.classList.add('empty');
                }

                cells.appendChild(cell);
            }

            // Staggered delay for filling: bottom water cell first (rising effect)
            const total = fillingCells.length;
            fillingCells.forEach((cell, j) => {
                // j=0 is top water cell, j=total-1 is bottom
                cell.style.animationDelay = `${(total - 1 - j) * 0.06}s`;
            });

            col.appendChild(cells);

            // Index label below column
            const indexLabel = document.createElement('div');
            indexLabel.className = 'bar-index';
            if (i === this.currentIndex && !this.isFinished) {
                indexLabel.classList.add('current');
            }
            indexLabel.textContent = i;
            col.appendChild(indexLabel);

            chart.appendChild(col);
        }
    }

    renderLmaxArray() {
        const container = document.getElementById('lmaxDisplay');
        container.innerHTML = '';

        this.lmax.forEach((val, idx) => {
            const box = document.createElement('div');
            box.className = 'aux-box lmax-box';

            const isComputed = (this.phase === 'idle')
                ? false
                : (this.phase === 'lmax')
                    ? idx <= this.currentIndex && (idx === 0 || idx < this.currentIndex)
                    : true;

            // Base case: lmax[0] is always computed after init
            if (this.phase !== 'idle' && idx === 0) {
                box.classList.add('computed');
            } else if (isComputed) {
                box.classList.add('computed');
            }

            if (this.phase === 'lmax' && idx === this.currentIndex) {
                box.classList.add('current');
            }

            box.textContent = (this.phase === 'idle') ? '-' : val;
            container.appendChild(box);
        });
    }

    renderRmaxArray() {
        const container = document.getElementById('rmaxDisplay');
        container.innerHTML = '';

        const n = this.height.length;

        this.rmax.forEach((val, idx) => {
            const box = document.createElement('div');
            box.className = 'aux-box rmax-box';

            const rmaxStarted = ['rmax_init', 'rmax', 'water_init', 'water', 'done'].includes(this.phase);
            const isComputed = rmaxStarted && (
                (this.phase === 'rmax')
                    ? idx >= this.currentIndex && (idx === n - 1 || idx > this.currentIndex)
                    : (this.phase === 'rmax_init')
                        ? idx === n - 1
                        : true
            );

            if (rmaxStarted && idx === n - 1) {
                box.classList.add('computed');
            } else if (isComputed) {
                box.classList.add('computed');
            }

            if (this.phase === 'rmax' && idx === this.currentIndex) {
                box.classList.add('current');
            }

            box.textContent = rmaxStarted ? val : '-';
            container.appendChild(box);
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
            case 'idle':
                label.textContent = 'Ready';
                direction.innerHTML = '';
                break;
            case 'init':
            case 'lmax':
                indicator.classList.add('lmax');
                label.textContent = 'Pass 1: Left Max';
                direction.innerHTML = '&rarr;';
                break;
            case 'rmax_init':
            case 'rmax':
                indicator.classList.add('rmax');
                label.textContent = 'Pass 2: Right Max';
                direction.innerHTML = '&larr;';
                break;
            case 'water_init':
            case 'water':
                indicator.classList.add('water-pass');
                label.textContent = 'Pass 3: Calculate Water';
                direction.innerHTML = '&#x1F4A7;';
                break;
            case 'done':
                label.textContent = 'Complete';
                direction.innerHTML = '';
                break;
        }
    }

    updateInfoPanel() {
        const phaseNames = {
            'idle': '-',
            'init': 'Init',
            'lmax': 'Left Max',
            'rmax_init': 'Right Max Init',
            'rmax': 'Right Max',
            'water_init': 'Water Init',
            'water': 'Water Calc',
            'done': 'Done'
        };
        this.updateInfoBox('currentPhase', phaseNames[this.phase] || '-');
        this.updateInfoBox('currentIndex', this.currentIndex >= 0 ? this.currentIndex : '-');
        this.updateInfoBox('leftMaxValue', this.currentIndex >= 0 && this.lmax[this.currentIndex] !== undefined
            ? this.lmax[this.currentIndex] : '-');
        this.updateInfoBox('rightMaxValue', this.currentIndex >= 0 && ['rmax', 'water_init', 'water', 'done'].includes(this.phase)
            ? this.rmax[this.currentIndex] : '-');
        this.updateInfoBox('totalWater', this.totalWater);
    }

    generateRandom() {
        const len = Math.floor(Math.random() * 5) + 8; // 8-12 elements
        const arr = [];
        for (let i = 0; i < len; i++) {
            arr.push(Math.floor(Math.random() * 5)); // 0-4
        }
        document.getElementById('arrayInput').value = arr.join(', ');
        this.init();
    }

    step() {
        if (this.isFinished) return;

        switch (this.phase) {
            case 'idle':
                this.handleInit();
                break;
            case 'lmax':
                this.handleLmax();
                break;
            case 'rmax_init':
                this.handleRmaxInit();
                break;
            case 'rmax':
                this.handleRmax();
                break;
            case 'water_init':
                this.handleWaterInit();
                break;
            case 'water':
                this.handleWater();
                break;
        }
    }

    handleInit() {
        const n = this.height.length;
        this.lmax[0] = this.height[0];
        this.rmax[n - 1] = this.height[n - 1];

        this.highlightCode(0);
        this.phase = 'lmax';
        this.currentIndex = 1;

        this.renderBarChart();
        this.renderLmaxArray();
        this.renderRmaxArray();
        this.updatePassIndicator();
        this.updateInfoPanel();
        this.updateFormula(
            `n = <span class="formula-result">${n}</span>, ` +
            `lmax[0] = <span class="formula-value">${this.lmax[0]}</span>, ` +
            `rmax[${n - 1}] = <span class="formula-value">${this.rmax[n - 1]}</span>`
        );
        this.updateStatus(`Initialized: n=${n}, lmax[0]=${this.lmax[0]}, rmax[${n - 1}]=${this.rmax[n - 1]}`);
    }

    handleLmax() {
        const n = this.height.length;

        if (this.currentIndex >= n) {
            this.phase = 'rmax_init';
            this.handleRmaxInit();
            return;
        }

        const i = this.currentIndex;
        this.highlightCode(5);
        this.updatePassIndicator();
        this.updateInfoBox('currentPhase', 'Left Max');
        this.updateInfoBox('currentIndex', i);
        this.renderBarChart();
        this.renderLmaxArray();

        setTimeout(() => {
            this.highlightCode(6);

            const prev = this.lmax[i - 1];
            const h = this.height[i];
            this.lmax[i] = Math.max(prev, h);

            this.updateFormula(
                `lmax[${i}] = <span class="formula-operator">max</span>(lmax[${i - 1}], height[${i}]) = ` +
                `<span class="formula-operator">max</span>(<span class="formula-value">${prev}</span>, ` +
                `<span class="formula-value">${h}</span>) = <span class="formula-result">${this.lmax[i]}</span>`
            );
            this.updateInfoBox('leftMaxValue', this.lmax[i]);
            this.renderLmaxArray();
            this.updateStatus(`Left Max: lmax[${i}] = max(${prev}, ${h}) = ${this.lmax[i]}`);

            this.currentIndex++;
        }, this.getSpeed() / 3);
    }

    handleRmaxInit() {
        const n = this.height.length;
        this.highlightCode(7);
        this.currentIndex = n - 2;

        this.phase = 'rmax';
        this.updatePassIndicator();
        this.updateInfoBox('currentPhase', 'Right Max Init');
        this.updateInfoBox('currentIndex', '-');
        this.updateFormula(`rmax[${n - 1}] = <span class="formula-result">${this.rmax[n - 1]}</span> (base case)`);
        this.renderBarChart();
        this.renderLmaxArray();
        this.renderRmaxArray();
        this.updateStatus(`Right max pass initialized, rmax[${n - 1}] = ${this.rmax[n - 1]}`);
    }

    handleRmax() {
        if (this.currentIndex < 0) {
            this.phase = 'water_init';
            this.handleWaterInit();
            return;
        }

        const i = this.currentIndex;
        this.highlightCode(7);
        this.updatePassIndicator();
        this.updateInfoBox('currentPhase', 'Right Max');
        this.updateInfoBox('currentIndex', i);
        this.renderBarChart();
        this.renderRmaxArray();

        setTimeout(() => {
            this.highlightCode(8);

            const next = this.rmax[i + 1];
            const h = this.height[i];
            this.rmax[i] = Math.max(next, h);

            this.updateFormula(
                `rmax[${i}] = <span class="formula-operator">max</span>(rmax[${i + 1}], height[${i}]) = ` +
                `<span class="formula-operator">max</span>(<span class="formula-value">${next}</span>, ` +
                `<span class="formula-value">${h}</span>) = <span class="formula-result">${this.rmax[i]}</span>`
            );
            this.updateInfoBox('rightMaxValue', this.rmax[i]);
            this.renderRmaxArray();
            this.updateStatus(`Right Max: rmax[${i}] = max(${next}, ${h}) = ${this.rmax[i]}`);

            this.currentIndex--;
        }, this.getSpeed() / 3);
    }

    handleWaterInit() {
        this.highlightCode(9);
        this.totalWater = 0;
        this.currentIndex = 0;

        this.phase = 'water';
        this.updatePassIndicator();
        this.updateInfoBox('currentPhase', 'Water Init');
        this.updateInfoBox('currentIndex', '-');
        this.updateInfoBox('totalWater', 0);
        this.updateFormula('out = <span class="formula-result">0</span>');
        this.renderBarChart();
        this.renderLmaxArray();
        this.renderRmaxArray();
        this.updateStatus('Water calculation initialized: out = 0');
    }

    handleWater() {
        const n = this.height.length;

        if (this.currentIndex >= n) {
            // Done
            this.phase = 'done';
            this.currentIndex = -1;
            this.newlyFilledIndex = -1;
            this.highlightCode(12);
            this.updatePassIndicator();
            this.finish();
            this.renderBarChart();
            this.renderLmaxArray();
            this.renderRmaxArray();
            this.updateInfoBox('currentPhase', 'Done');
            this.updateInfoBox('currentIndex', '-');
            this.updateInfoBox('leftMaxValue', '-');
            this.updateInfoBox('rightMaxValue', '-');
            this.updateFormula(`Total water trapped: <span class="formula-water">${this.totalWater}</span>`);
            this.updateStatus(`Done! Total water trapped: ${this.totalWater}`, 'success');
            return;
        }

        const i = this.currentIndex;
        this.highlightCode(10);
        this.updatePassIndicator();
        this.updateInfoBox('currentPhase', 'Water Calc');
        this.updateInfoBox('currentIndex', i);
        this.updateInfoBox('leftMaxValue', this.lmax[i]);
        this.updateInfoBox('rightMaxValue', this.rmax[i]);
        this.renderBarChart();

        setTimeout(() => {
            this.highlightCode(11);

            const lm = this.lmax[i];
            const rm = this.rmax[i];
            const h = this.height[i];
            const minMax = Math.min(lm, rm);
            const w = minMax - h;
            this.water[i] = w;
            this.totalWater += w;

            this.newlyFilledIndex = w > 0 ? i : -1;

            this.updateFormula(
                `out += <span class="formula-operator">min</span>(lmax[${i}], rmax[${i}]) - height[${i}] = ` +
                `<span class="formula-operator">min</span>(<span class="formula-value">${lm}</span>, ` +
                `<span class="formula-value">${rm}</span>) - <span class="formula-value">${h}</span> = ` +
                `<span class="formula-water">${w}</span>` +
                (w > 0 ? ` &nbsp;(total: <span class="formula-result">${this.totalWater}</span>)` : '')
            );
            this.updateInfoBox('totalWater', this.totalWater);
            this.renderBarChart();
            this.updateStatus(
                w > 0
                    ? `Water at [${i}]: min(${lm}, ${rm}) - ${h} = ${w} (total: ${this.totalWater})`
                    : `Water at [${i}]: min(${lm}, ${rm}) - ${h} = ${w} (no water)`
            );

            this.newlyFilledIndex = -1;
            this.currentIndex++;
        }, this.getSpeed() / 3);
    }
}

// Initialize
const visualizer = new TrappingRainWaterVisualizer();

window.onload = () => {
    visualizer.bindControls();
    visualizer.init();

    document.getElementById('randomBtn').addEventListener('click', () => {
        visualizer.generateRandom();
    });
};
