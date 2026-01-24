/**
 * Power of Two - Bit Manipulation Visualization
 * Visualizes n & (n-1) == 0 check for powers of two
 */

class PowerOfTwoVisualizer extends VisualizerBase {
    constructor() {
        super({
            codeLineCount: 8
        });

        this.n = 8;                    // Input number
        this.nBits = [];               // Binary representation of n
        this.nMinusOneBits = [];       // Binary representation of n-1
        this.resultBits = [];          // Result of AND operation (filled as we go)
        this.currentBitIndex = -1;     // Current bit being compared (left to right visually, but we process right to left logically)
        this.phase = 'idle';           // 'idle' | 'check_zero' | 'comparing' | 'complete'
        this.bitWidth = 8;             // Number of bits to display
        this.processIndex = 0;         // Index for processing (0 = rightmost bit)
    }

    init() {
        // Parse input
        const input = document.getElementById('numberInput').value;
        this.n = parseInt(input) || 0;

        // Clamp to valid range
        if (this.n < 0) this.n = 0;
        if (this.n > 255) this.n = 255;

        // Convert to binary
        this.nBits = this.toBinary(this.n);
        this.nMinusOneBits = this.n > 0 ? this.toBinary(this.n - 1) : this.toBinary(0);
        this.resultBits = new Array(this.bitWidth).fill(null); // null = not yet computed

        // Reset state
        this.currentBitIndex = -1;
        this.processIndex = 0;
        this.phase = 'idle';
        this.isFinished = false;

        if (this.isPlaying) {
            this.pause();
        }

        // Render
        this.renderBits();
        this.updateInfoPanel();
        this.clearCodeHighlight();
        this.highlightCode(0);
        this.updateStatus('Click "Step" or "Play" to check if n is a power of two');
    }

    toBinary(num) {
        const bits = [];
        for (let i = this.bitWidth - 1; i >= 0; i--) {
            bits.push((num >> i) & 1);
        }
        return bits;
    }

    bitsToDecimal(bits) {
        let result = 0;
        for (let i = 0; i < bits.length; i++) {
            if (bits[i] === 1) {
                result += Math.pow(2, bits.length - 1 - i);
            }
        }
        return result;
    }

    generateRandom() {
        // Mix of powers of two and non-powers
        const options = [1, 2, 4, 8, 16, 32, 64, 128, 3, 5, 6, 7, 9, 10, 12, 15, 20, 100];
        this.n = options[Math.floor(Math.random() * options.length)];
        document.getElementById('numberInput').value = this.n;
        this.init();
    }

    renderBits() {
        const container = document.getElementById('bitsDisplay');
        container.innerHTML = '';

        // Row 1: n
        const row1 = this.createBitRow('n', this.n, this.nBits, 'n-row');
        container.appendChild(row1);

        // Operator row (AND)
        const opRow = document.createElement('div');
        opRow.className = 'operator-row';
        const op = document.createElement('div');
        op.className = 'operator';
        op.textContent = '&';
        opRow.appendChild(op);
        container.appendChild(opRow);

        // Row 2: n - 1
        const nMinusLabel = this.n > 0 ? `n - 1` : 'n - 1';
        const nMinusValue = this.n > 0 ? this.n - 1 : -1;
        const row2 = this.createBitRow(nMinusLabel, nMinusValue, this.nMinusOneBits, 'nminus-row');
        container.appendChild(row2);

        // Separator line
        const sepRow = document.createElement('div');
        sepRow.className = 'operator-row';
        const sepLine = document.createElement('div');
        sepLine.className = 'operator-line';
        const sepOp = document.createElement('div');
        sepOp.className = 'operator';
        sepOp.textContent = '=';
        sepRow.appendChild(sepOp);
        sepRow.appendChild(sepLine);
        container.appendChild(sepRow);

        // Row 3: Result
        const resultRow = this.createResultRow();
        container.appendChild(resultRow);

        // Final verdict (only show when complete)
        if (this.phase === 'complete') {
            const verdictRow = this.createVerdictRow();
            container.appendChild(verdictRow);
        }
    }

    createBitRow(label, decimal, bits, rowClass) {
        const row = document.createElement('div');
        row.className = `bit-row ${rowClass}`;

        // Label
        const labelDiv = document.createElement('div');
        labelDiv.className = 'bit-label';
        labelDiv.innerHTML = `${label} = <span class="decimal">${decimal}</span>`;
        row.appendChild(labelDiv);

        // Bits group
        const bitsGroup = document.createElement('div');
        bitsGroup.className = 'bits-group';

        bits.forEach((bit, idx) => {
            const bitBox = document.createElement('div');
            bitBox.className = `bit-box ${bit === 1 ? 'one' : 'zero'}`;
            bitBox.textContent = bit;

            // Highlight current bit being compared
            const visualIdx = this.bitWidth - 1 - this.processIndex;
            if (this.phase === 'comparing' && idx === visualIdx) {
                bitBox.classList.add('active');
            }

            // Add bit position index
            const indexDiv = document.createElement('div');
            indexDiv.className = 'bit-index';
            indexDiv.textContent = this.bitWidth - 1 - idx;
            bitBox.appendChild(indexDiv);

            bitsGroup.appendChild(bitBox);
        });

        row.appendChild(bitsGroup);
        return row;
    }

    createResultRow() {
        const row = document.createElement('div');
        row.className = 'bit-row result-row';

        // Label
        const labelDiv = document.createElement('div');
        labelDiv.className = 'bit-label';
        const computedResult = this.getComputedResult();
        labelDiv.innerHTML = `result = <span class="decimal">${computedResult !== null ? computedResult : '?'}</span>`;
        row.appendChild(labelDiv);

        // Bits group
        const bitsGroup = document.createElement('div');
        bitsGroup.className = 'bits-group';

        for (let i = 0; i < this.bitWidth; i++) {
            const bitBox = document.createElement('div');
            const bit = this.resultBits[i];

            if (bit === null) {
                bitBox.className = 'bit-box empty';
                bitBox.textContent = '?';
            } else {
                bitBox.className = `bit-box result ${bit === 1 ? 'one' : 'zero'}`;
                bitBox.textContent = bit;
            }

            // Highlight just-computed bit
            const visualIdx = this.bitWidth - 1 - (this.processIndex - 1);
            if (this.phase === 'comparing' && i === visualIdx && this.processIndex > 0) {
                bitBox.classList.add('active');
            }

            bitsGroup.appendChild(bitBox);
        }

        row.appendChild(bitsGroup);
        return row;
    }

    createVerdictRow() {
        const row = document.createElement('div');
        row.className = 'equals-row';

        const result = this.n & (this.n - 1);
        const isPower = this.n > 0 && result === 0;

        const eqSymbol = document.createElement('div');
        eqSymbol.className = 'equals-symbol';
        eqSymbol.textContent = '';
        row.appendChild(eqSymbol);

        const eqValue = document.createElement('div');
        eqValue.className = `equals-value ${result === 0 ? 'is-zero' : 'not-zero'}`;
        eqValue.textContent = result;
        row.appendChild(eqValue);

        const verdict = document.createElement('div');
        verdict.className = `verdict ${isPower ? 'power' : 'not-power'}`;
        if (this.n === 0) {
            verdict.textContent = 'n = 0 is not a power of two';
        } else {
            verdict.textContent = isPower ? `${this.n} is a power of two!` : `${this.n} is NOT a power of two`;
        }
        row.appendChild(verdict);

        return row;
    }

    getComputedResult() {
        // Calculate result from computed bits
        let hasNull = false;
        let result = 0;
        for (let i = 0; i < this.bitWidth; i++) {
            if (this.resultBits[i] === null) {
                hasNull = true;
            } else if (this.resultBits[i] === 1) {
                result += Math.pow(2, this.bitWidth - 1 - i);
            }
        }
        return hasNull ? null : result;
    }

    updateInfoPanel() {
        document.getElementById('nValue').textContent = this.n;
        document.getElementById('nMinusValue').textContent = this.n > 0 ? this.n - 1 : 'N/A';

        if (this.phase === 'comparing' && this.processIndex > 0) {
            document.getElementById('currentBitValue').textContent = this.processIndex - 1;
        } else if (this.phase === 'comparing') {
            document.getElementById('currentBitValue').textContent = this.processIndex;
        } else {
            document.getElementById('currentBitValue').textContent = '-';
        }

        const result = this.getComputedResult();
        document.getElementById('resultValue').textContent = result !== null ? result : '-';
    }

    step() {
        if (this.isFinished) {
            return;
        }

        // Special case: n = 0
        if (this.n === 0 && this.phase === 'idle') {
            this.phase = 'check_zero';
            this.highlightCode(1);
            this.updateStatus('Checking if n == 0...');
            this.renderBits();
            this.updateInfoPanel();
            return;
        }

        if (this.phase === 'check_zero') {
            this.phase = 'complete';
            this.highlightCode(2);
            this.updateStatus('n = 0, return False (0 is not a power of two)', 'error');
            this.finish();
            this.renderBits();
            this.updateInfoPanel();
            return;
        }

        if (this.phase === 'idle') {
            // Start comparing
            this.phase = 'comparing';
            this.processIndex = 0;
            this.highlightCode(3);
            this.updateStatus(`Starting AND operation: comparing bit at position ${this.processIndex}`);
            this.renderBits();
            this.updateInfoPanel();
            return;
        }

        if (this.phase === 'comparing') {
            if (this.processIndex >= this.bitWidth) {
                // Done comparing all bits
                this.phase = 'complete';
                const result = this.n & (this.n - 1);
                const isPower = result === 0;

                if (isPower) {
                    this.highlightCode(7);
                    this.updateStatus(`Result is 0! ${this.n} is a power of two.`, 'success');
                } else {
                    this.highlightCode(3);
                    this.updateStatus(`Result is ${result} (not zero). ${this.n} is NOT a power of two.`, 'error');
                }

                this.finish();
                this.renderBits();
                this.updateInfoPanel();
                return;
            }

            // Compute AND for current bit (process from right to left, but display left to right)
            const visualIdx = this.bitWidth - 1 - this.processIndex;
            const bitN = this.nBits[visualIdx];
            const bitNMinus = this.nMinusOneBits[visualIdx];
            const resultBit = bitN & bitNMinus;

            this.resultBits[visualIdx] = resultBit;

            this.highlightCode(3);
            this.updateStatus(`Bit ${this.processIndex}: ${bitN} & ${bitNMinus} = ${resultBit}`);

            this.processIndex++;
            this.renderBits();
            this.updateInfoPanel();
        }
    }
}

// Initialize
const visualizer = new PowerOfTwoVisualizer();

window.onload = () => {
    visualizer.bindControls();
    visualizer.init();

    // Bind random button
    document.getElementById('randomBtn').addEventListener('click', () => {
        visualizer.generateRandom();
    });
};
