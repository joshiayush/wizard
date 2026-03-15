/**
 * Integer to English Words Visualization
 * Convert a non-negative integer to its English words representation
 */

const BELOW_TWENTY = [
    '', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven',
    'Eight', 'Nine', 'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen',
    'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'
];

const TENS = [
    '', '', 'Twenty', 'Thirty', 'Forty', 'Fifty',
    'Sixty', 'Seventy', 'Eighty', 'Ninety'
];

const SCALES = ['', 'Thousand', 'Million', 'Billion'];
const GROUP_CLASSES = ['group-ones', 'group-thousands', 'group-millions', 'group-billions'];
const GROUP_COLOR_CLASSES = ['group-ones-color', 'group-thousands-color', 'group-millions-color', 'group-billions-color'];
const SCALE_LABELS = ['Ones', 'Thousands', 'Millions', 'Billions'];

class IntToWordsVisualizer extends VisualizerBase {
    constructor() {
        super({
            codeLineCount: 13,
        });

        this.num = 0;
        this.groups = [];       // [{value, scaleIndex, digits}] from least significant
        this.groupIndex = -1;   // which group we're processing (from least significant, like the algorithm)
        this.helperSteps = [];  // pre-computed decomposition steps for current group
        this.helperStepIdx = 0;
        this.resultParts = [];  // [{text, scaleIndex}] accumulated result
        this.currentGroupWords = []; // words for current group
        this.phase = 'idle';
        this.activeLookup = null;  // {table: 'below20'|'tens', index: n}
        this.decompositionSteps = []; // visual decomposition chain
        this.completedGroups = new Set();
    }

    init() {
        const input = document.getElementById('numInput').value.trim();
        this.num = parseInt(input, 10);

        if (isNaN(this.num) || this.num < 0) {
            this.num = 0;
            document.getElementById('numInput').value = '0';
        }
        if (this.num > 2147483647) {
            this.num = 2147483647;
            document.getElementById('numInput').value = '2147483647';
        }

        // Split into groups of 3
        this.groups = [];
        if (this.num === 0) {
            this.groups.push({ value: 0, scaleIndex: 0, digits: '0' });
        } else {
            let n = this.num;
            let i = 0;
            while (n > 0) {
                const groupVal = n % 1000;
                const digits = String(groupVal).padStart(i === 0 ? 1 : 3, '0');
                this.groups.push({ value: groupVal, scaleIndex: i, digits });
                n = Math.floor(n / 1000);
                i++;
            }
        }
        // groups[0] = ones, groups[1] = thousands, etc.
        // Process from least significant (ones first), matching the algorithm's while loop
        this.groupIndex = -1; // will increment before processing
        this.helperSteps = [];
        this.helperStepIdx = 0;
        this.resultParts = [];
        this.currentGroupWords = [];
        this.phase = 'idle';
        this.activeLookup = null;
        this.decompositionSteps = [];
        this.completedGroups = new Set();
        this.isFinished = false;

        if (this.isPlaying) {
            this.pause();
        }

        this.renderDigitGroups();
        this.renderLookupTables();
        this.renderDecomposition();
        this.renderResult();
        this.updateInfoPanel();
        this.clearCodeHighlight();
        this.highlightCode(0);
        this.updateStatus('Click "Step" or "Play" to start the visualization');
    }

    generateRandom() {
        const ranges = [
            [0, 19],
            [20, 99],
            [100, 999],
            [1000, 999999],
            [1000000, 999999999],
            [1000000000, 2147483647]
        ];
        const range = ranges[Math.floor(Math.random() * ranges.length)];
        const num = range[0] + Math.floor(Math.random() * (range[1] - range[0] + 1));
        document.getElementById('numInput').value = num;
        this.init();
    }

    computeHelperSteps(n) {
        const steps = [];
        if (n === 0) return steps;

        if (n >= 100) {
            const hundredsDigit = Math.floor(n / 100);
            steps.push({
                type: 'hundreds',
                table: 'below20',
                index: hundredsDigit,
                word: BELOW_TWENTY[hundredsDigit],
                label: `${n} >= 100: BELOW_20[${hundredsDigit}]`,
                codeLine: 11
            });
            steps.push({
                type: 'hundredWord',
                table: null,
                index: null,
                word: 'Hundred',
                label: `+ "Hundred"`,
                codeLine: 11
            });
            n = n % 100;
            if (n === 0) return steps;
        }

        if (n >= 20) {
            const tensDigit = Math.floor(n / 10);
            steps.push({
                type: 'tens',
                table: 'tens',
                index: tensDigit,
                word: TENS[tensDigit],
                label: `${n} >= 20: TENS[${tensDigit}]`,
                codeLine: 10
            });
            n = n % 10;
            if (n === 0) return steps;
        }

        if (n > 0) {
            steps.push({
                type: 'below20',
                table: 'below20',
                index: n,
                word: BELOW_TWENTY[n],
                label: `${n} < 20: BELOW_20[${n}]`,
                codeLine: 9
            });
        }

        return steps;
    }

    step() {
        if (this.isFinished) return;

        switch (this.phase) {
            case 'idle':
                this.stepIdle();
                break;
            case 'zeroCase':
                this.stepZeroCase();
                break;
            case 'splitGroups':
                this.stepSplitGroups();
                break;
            case 'pickGroup':
                this.stepPickGroup();
                break;
            case 'helperProcess':
                this.stepHelperProcess();
                break;
            case 'appendScale':
                this.stepAppendScale();
                break;
            case 'buildResult':
                this.stepBuildResult();
                break;
        }
    }

    stepIdle() {
        this.highlightCode(0);
        if (this.num === 0) {
            this.phase = 'zeroCase';
            this.updateStatus('Number is 0, special case');
            this.highlightCode(1);
        } else {
            this.phase = 'splitGroups';
            this.updateStatus(`Processing ${this.num.toLocaleString()}`);
            this.highlightCode(2);
        }
        this.updateInfoPanel();
    }

    stepZeroCase() {
        this.highlightCode(1);
        this.resultParts = [{ text: 'Zero', scaleIndex: 0 }];
        this.phase = 'buildResult';
        this.updateStatus('Return "Zero"', 'success');
        this.renderResult();
        this.finish();
        this.updateInfoPanel();
    }

    stepSplitGroups() {
        this.highlightCode(3);
        this.groupIndex = -1; // will increment to 0 on first pickGroup
        this.phase = 'pickGroup';
        this.updateStatus(`Split into ${this.groups.length} group(s): processing right to left (num % 1000, num //= 1000)`);
        this.renderDigitGroups();
        this.updateInfoPanel();
    }

    stepPickGroup() {
        this.groupIndex++;

        // Skip zero-value groups
        while (this.groupIndex < this.groups.length && this.groups[this.groupIndex].value === 0) {
            this.completedGroups.add(this.groupIndex);
            this.groupIndex++;
        }

        if (this.groupIndex >= this.groups.length) {
            // All groups processed (num is now 0)
            this.phase = 'buildResult';
            this.highlightCode(12);
            this.activeLookup = null;
            this.decompositionSteps = [];
            this.updateStatus('num == 0, loop done — building final result');
            this.renderDigitGroups();
            this.renderDecomposition();
            this.renderLookupTables();
            this.updateInfoPanel();
            return;
        }

        const group = this.groups[this.groupIndex];
        this.helperSteps = this.computeHelperSteps(group.value);
        this.helperStepIdx = 0;
        this.currentGroupWords = [];
        this.decompositionSteps = [];
        this.activeLookup = null;

        this.highlightCode(4);
        this.phase = 'helperProcess';
        this.updateStatus(`num % 1000 = ${group.value} → processing ${SCALE_LABELS[group.scaleIndex]} group`);
        this.renderDigitGroups();
        this.renderDecomposition();
        this.renderLookupTables();
        this.updateInfoPanel();
    }

    stepHelperProcess() {
        if (this.helperStepIdx >= this.helperSteps.length) {
            // Helper done, move to append scale
            this.phase = 'appendScale';
            this.activeLookup = null;
            this.renderLookupTables();
            return;
        }

        const step = this.helperSteps[this.helperStepIdx];
        this.helperStepIdx++;

        // Highlight the lookup
        if (step.table) {
            this.activeLookup = { table: step.table, index: step.index };
        } else {
            this.activeLookup = null;
        }

        // Add word
        this.currentGroupWords.push(step.word);

        // Add to decomposition display
        this.decompositionSteps.push({
            label: step.label,
            word: step.word
        });

        this.highlightCode(step.codeLine);
        this.updateStatus(`${step.label} → "${step.word}"`);

        this.renderDecomposition();
        this.renderLookupTables();
        this.updateInfoPanel();
    }

    stepAppendScale() {
        const group = this.groups[this.groupIndex];
        const scaleWord = SCALES[group.scaleIndex];
        const groupText = this.currentGroupWords.join(' ');
        const fullText = scaleWord ? groupText + ' ' + scaleWord : groupText;

        this.resultParts.unshift({ text: fullText, scaleIndex: group.scaleIndex });
        this.completedGroups.add(this.groupIndex);

        this.highlightCode(6);
        if (scaleWord) {
            this.updateStatus(`res = helper(${this.groups[this.groupIndex].value}) + "${scaleWord}" + res → prepended to result`);
        } else {
            this.updateStatus(`res = helper(${this.groups[this.groupIndex].value}) + res → prepended to result`);
        }

        this.highlightCode(7);
        this.phase = 'pickGroup';
        this.activeLookup = null;

        this.renderDigitGroups();
        this.renderResult();
        this.renderLookupTables();
        this.updateInfoPanel();
    }

    stepBuildResult() {
        const finalText = this.resultParts.map(p => p.text).join(' ');
        this.highlightCode(12);
        this.updateStatus(`Result: "${finalText}"`, 'success');
        this.renderResult();
        this.finish();
        this.updateInfoPanel();
    }

    // --- Rendering ---

    renderDigitGroups() {
        const container = document.getElementById('digitGroups');
        if (!container) return;
        container.innerHTML = '';

        if (this.num === 0) {
            const group = document.createElement('div');
            group.className = 'digit-group group-ones';
            const digits = document.createElement('div');
            digits.className = 'digit-group-digits';
            const box = document.createElement('div');
            box.className = 'digit-box';
            box.textContent = '0';
            digits.appendChild(box);
            const label = document.createElement('div');
            label.className = 'scale-label';
            label.textContent = 'Ones';
            group.appendChild(digits);
            group.appendChild(label);
            container.appendChild(group);
            return;
        }

        // Render from most significant to least
        for (let i = this.groups.length - 1; i >= 0; i--) {
            if (i < this.groups.length - 1) {
                const sep = document.createElement('div');
                sep.className = 'group-separator';
                sep.textContent = ',';
                container.appendChild(sep);
            }

            const g = this.groups[i];
            const groupEl = document.createElement('div');
            groupEl.className = `digit-group ${GROUP_CLASSES[g.scaleIndex]}`;

            if (this.completedGroups.has(i)) {
                groupEl.classList.add('completed');
            } else if (i === this.groupIndex) {
                groupEl.classList.add('active');
            }

            const digitsEl = document.createElement('div');
            digitsEl.className = 'digit-group-digits';

            const digitStr = i === this.groups.length - 1
                ? String(g.value)
                : String(g.value).padStart(3, '0');

            for (let d = 0; d < digitStr.length; d++) {
                const box = document.createElement('div');
                box.className = 'digit-box';
                box.textContent = digitStr[d];
                if (digitStr[d] === '0' && d < digitStr.length - 1 && i !== this.groups.length - 1) {
                    // Check if all remaining are non-zero — if leading zero
                    const prefix = digitStr.substring(0, d + 1);
                    if (parseInt(prefix) === 0) {
                        box.classList.add('leading-zero');
                    }
                }
                digitsEl.appendChild(box);
            }

            const label = document.createElement('div');
            label.className = 'scale-label';
            label.textContent = SCALE_LABELS[g.scaleIndex];

            groupEl.appendChild(digitsEl);
            groupEl.appendChild(label);
            container.appendChild(groupEl);
        }
    }

    renderLookupTables() {
        this.renderOneTable('belowTwentyTable', BELOW_TWENTY, 'below20');
        this.renderOneTable('tensTable', TENS, 'tens');
    }

    renderOneTable(containerId, arr, tableName) {
        const container = document.getElementById(containerId);
        if (!container) return;
        container.innerHTML = '';

        for (let i = 0; i < arr.length; i++) {
            const cell = document.createElement('div');
            cell.className = 'lookup-cell';

            if (this.activeLookup && this.activeLookup.table === tableName && this.activeLookup.index === i) {
                cell.classList.add('active');
            }

            cell.textContent = i;

            // Tooltip showing the word
            if (arr[i]) {
                const tooltip = document.createElement('div');
                tooltip.className = 'lookup-cell-tooltip';
                tooltip.textContent = arr[i];
                cell.appendChild(tooltip);
            }

            container.appendChild(cell);
        }
    }

    renderDecomposition() {
        const container = document.getElementById('decomposition');
        if (!container) return;

        if (this.decompositionSteps.length === 0) {
            if (this.groupIndex >= 0 && this.groupIndex < this.groups.length) {
                container.innerHTML = `<span class="decomp-value highlight">${this.groups[this.groupIndex].value}</span>`;
            } else {
                container.innerHTML = '<span class="empty-text">-</span>';
            }
            return;
        }

        container.innerHTML = '';

        for (let i = 0; i < this.decompositionSteps.length; i++) {
            if (i > 0) {
                const arrow = document.createElement('span');
                arrow.className = 'decomp-arrow';
                arrow.textContent = '+';
                container.appendChild(arrow);
            }

            const step = this.decompositionSteps[i];
            const wordEl = document.createElement('span');
            wordEl.className = 'decomp-word';
            wordEl.textContent = `"${step.word}"`;
            container.appendChild(wordEl);
        }
    }

    renderResult() {
        const container = document.getElementById('resultDisplay');
        if (!container) return;

        if (this.resultParts.length === 0) {
            container.innerHTML = '<span class="empty-text">-</span>';
            return;
        }

        container.innerHTML = '';

        for (let i = 0; i < this.resultParts.length; i++) {
            if (i > 0) {
                container.appendChild(document.createTextNode(' '));
            }
            const part = this.resultParts[i];
            const span = document.createElement('span');
            span.className = `result-word ${GROUP_COLOR_CLASSES[part.scaleIndex]}`;
            span.textContent = part.text;
            container.appendChild(span);
        }
    }

    updateInfoPanel() {
        this.updateInfoBox('inputNumValue', this.num.toLocaleString());

        if (this.groupIndex >= 0 && this.groupIndex < this.groups.length) {
            const g = this.groups[this.groupIndex];
            this.updateInfoBox('currentScaleValue', SCALE_LABELS[g.scaleIndex]);
            this.updateInfoBox('groupValueValue', g.value);
        } else {
            this.updateInfoBox('currentScaleValue', '-');
            this.updateInfoBox('groupValueValue', '-');
        }

        const remaining = this.groups.filter((_, i) => !this.completedGroups.has(i) && this.groups[i].value > 0).length;
        this.updateInfoBox('groupsLeftValue', remaining);
    }
}

// Initialize
const visualizer = new IntToWordsVisualizer();

window.onload = () => {
    visualizer.bindControls();
    visualizer.init();

    document.getElementById('randomBtn').addEventListener('click', () => {
        visualizer.generateRandom();
    });
};
