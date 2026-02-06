/**
 * Group Anagrams Algorithm Visualization
 * Groups words by character frequency using a hashmap
 */

class GroupAnagramsVisualizer extends VisualizerBase {
    constructor() {
        super({
            codeLineCount: 7
        });

        this.words = [];
        this.wordIndex = -1;
        this.charIndex = -1;
        this.freq = [];
        this.hashmap = {};       // key: freq string, value: { words: [], id: number }
        this.currentKey = '';
        this.phase = 'idle';     // idle | pickWord | initFreq | scanChar | formKey | insertMap | done
        this.groupColors = [
            '#4ecdc4', '#ff6b6b', '#ffd700', '#9b59b6',
            '#2ecc71', '#e67e22', '#3498db', '#e74c3c'
        ];
    }

    init() {
        this.words = this.parseWordsInput();

        if (this.words.length === 0) {
            this.words = ['eat', 'tea', 'tan', 'ate', 'nat', 'bat'];
        }

        // Reset state
        this.wordIndex = -1;
        this.charIndex = -1;
        this.freq = [];
        this.hashmap = {};
        this.currentKey = '';
        this.phase = 'idle';
        this.isFinished = false;

        if (this.isPlaying) {
            this.pause();
        }

        // Render initial state
        this.renderWordList();
        this.renderCurrentWord(null);
        this.renderFreqGrid();
        this.renderHashKey('-');
        this.renderHashmap();
        this.updateInfoPanel();
        this.clearCodeHighlight();
        this.highlightCode(0);
        this.updateStatus('Click "Step" or "Play" to start the visualization');
    }

    parseWordsInput() {
        const input = document.getElementById('wordsInput');
        if (!input) return [];
        return input.value.split(',')
            .map(s => s.trim().toLowerCase())
            .filter(s => s.length > 0);
    }

    renderWordList() {
        const container = document.getElementById('wordListDisplay');
        container.innerHTML = '';

        this.words.forEach((word, idx) => {
            const box = document.createElement('div');
            box.className = 'word-box';
            box.id = `word-${idx}`;
            box.textContent = word;

            if (this.phase === 'done') {
                // Color by group
                const groupIdx = this.getGroupIndex(word);
                if (groupIdx >= 0) {
                    box.classList.add(`group-${groupIdx % this.groupColors.length}`);
                }
            } else if (idx === this.wordIndex) {
                box.classList.add('current');
            } else if (idx < this.wordIndex) {
                box.classList.add('visited');
            }

            container.appendChild(box);
        });
    }

    getGroupIndex(word) {
        let groupIdx = 0;
        for (const key in this.hashmap) {
            if (this.hashmap[key].words.includes(word)) {
                return groupIdx;
            }
            groupIdx++;
        }
        return -1;
    }

    renderCurrentWord(word) {
        const container = document.getElementById('currentWordDisplay');
        if (!word) {
            container.innerHTML = '-';
            return;
        }

        container.innerHTML = '';
        for (let i = 0; i < word.length; i++) {
            const charBox = document.createElement('div');
            charBox.className = 'current-word-char';
            charBox.id = `cwchar-${i}`;
            charBox.textContent = word[i];

            if (i === this.charIndex) {
                charBox.classList.add('current');
            } else if (i < this.charIndex) {
                charBox.classList.add('scanned');
            }

            container.appendChild(charBox);
        }
    }

    renderFreqGrid(highlightIdx) {
        const gridContainer = document.getElementById('freqDisplay');
        const labelsContainer = document.getElementById('freqLabels');
        gridContainer.innerHTML = '';
        labelsContainer.innerHTML = '';

        for (let i = 0; i < 26; i++) {
            const cell = document.createElement('div');
            cell.className = 'freq-cell';
            cell.id = `freq-${i}`;

            const val = this.freq.length > 0 ? this.freq[i] : 0;
            cell.textContent = val;

            if (val > 0) {
                cell.classList.add('nonzero');
            }
            if (i === highlightIdx) {
                cell.classList.add('current');
            }

            gridContainer.appendChild(cell);

            const label = document.createElement('div');
            label.className = 'freq-label';
            label.textContent = String.fromCharCode(97 + i);
            labelsContainer.appendChild(label);
        }
    }

    renderHashKey(keyStr) {
        const display = document.getElementById('hashKeyDisplay');
        display.textContent = keyStr;
        if (keyStr !== '-') {
            display.classList.add('active');
        } else {
            display.classList.remove('active');
        }
    }

    getCompactKey(freqArr) {
        const parts = [];
        for (let i = 0; i < 26; i++) {
            if (freqArr[i] > 0) {
                parts.push(`${String.fromCharCode(97 + i)}:${freqArr[i]}`);
            }
        }
        return `{${parts.join(', ')}}`;
    }

    getFullTupleKey(freqArr) {
        return `(${freqArr.join(',')})`;
    }

    renderHashmap(highlightKey, isNewKey) {
        const container = document.getElementById('hashmapDisplay');

        if (Object.keys(this.hashmap).length === 0) {
            container.innerHTML = '<span class="empty-text">Empty</span>';
            return;
        }

        container.innerHTML = '';
        let groupIdx = 0;

        for (const key in this.hashmap) {
            const entry = document.createElement('div');
            entry.className = 'hashmap-entry';
            entry.id = `hash-${groupIdx}`;

            if (this.phase === 'done') {
                entry.classList.add(`group-${groupIdx % this.groupColors.length}`);
            }

            if (key === highlightKey) {
                if (isNewKey) {
                    entry.classList.add('new');
                } else {
                    entry.classList.add('highlight');
                }
            }

            const keyLabel = document.createElement('span');
            keyLabel.className = 'hashmap-key-label';
            keyLabel.textContent = this.hashmap[key].displayKey;
            keyLabel.title = key;

            const arrow = document.createElement('span');
            arrow.className = 'hashmap-arrow';
            arrow.innerHTML = '&rarr;';

            const wordsDiv = document.createElement('span');
            wordsDiv.className = 'hashmap-words';

            this.hashmap[key].words.forEach((w, wIdx) => {
                const wordSpan = document.createElement('span');
                wordSpan.className = 'hashmap-word';
                wordSpan.textContent = `"${w}"`;

                // Highlight the last word if this is the entry just updated
                if (key === highlightKey && wIdx === this.hashmap[key].words.length - 1) {
                    wordSpan.classList.add('new-word');
                }

                wordsDiv.appendChild(wordSpan);
            });

            entry.appendChild(keyLabel);
            entry.appendChild(arrow);
            entry.appendChild(wordsDiv);
            container.appendChild(entry);
            groupIdx++;
        }
    }

    updateInfoPanel() {
        this.updateInfoBox('wordIndexValue', this.wordIndex >= 0 ? this.wordIndex : '-');
        this.updateInfoBox('currentWordValue', this.wordIndex >= 0 ? this.words[this.wordIndex] : '-');
        this.updateInfoBox('charScanValue', this.charIndex >= 0 && this.wordIndex >= 0
            ? `'${this.words[this.wordIndex][this.charIndex]}'`
            : '-');
        this.updateInfoBox('groupCountValue', Object.keys(this.hashmap).length);
    }

    step() {
        if (this.isFinished) return;

        switch (this.phase) {
            case 'idle':
            case 'pickWord':
                this.wordIndex++;
                if (this.wordIndex >= this.words.length) {
                    this.phase = 'done';
                    this.highlightCode(6);
                    this.renderWordList();
                    this.renderHashmap();
                    this.renderCurrentWord(null);
                    this.renderHashKey('-');
                    this.freq = [];
                    this.renderFreqGrid();
                    this.finish();
                    this.updateStatus(
                        `Done! Found ${Object.keys(this.hashmap).length} anagram group(s)`,
                        'success'
                    );
                    return;
                }
                this.charIndex = -1;
                this.phase = 'initFreq';
                this.highlightCode(1);
                this.renderWordList();
                this.updateInfoPanel();
                this.updateStatus(`Processing word ${this.wordIndex}: "${this.words[this.wordIndex]}"`);
                break;

            case 'initFreq':
                this.freq = new Array(26).fill(0);
                this.charIndex = -1;
                this.phase = 'scanChar';
                this.highlightCode(2);
                this.renderFreqGrid();
                this.renderCurrentWord(this.words[this.wordIndex]);
                this.renderHashKey('-');
                this.updateStatus(`Initialize frequency array [0]*26 for "${this.words[this.wordIndex]}"`);
                break;

            case 'scanChar': {
                this.charIndex++;
                const word = this.words[this.wordIndex];

                if (this.charIndex >= word.length) {
                    // Done scanning, form the key
                    this.phase = 'formKey';
                    this.charIndex = word.length; // keep at end
                    this.highlightCode(3);
                    this.renderCurrentWord(word);
                    this.updateInfoPanel();
                    this.updateStatus(`Finished scanning all characters of "${word}"`);
                    return;
                }

                const ch = word[this.charIndex];
                const idx = ch.charCodeAt(0) - 97;
                this.freq[idx]++;

                // Highlight code line 4 (the increment)
                this.highlightCode(4);

                // Render with highlighted cell
                this.renderFreqGrid(idx);
                this.renderCurrentWord(word);
                this.updateInfoPanel();
                this.updateStatus(
                    `Char '${ch}': freq[${idx}] (${String.fromCharCode(97 + idx)}) → ${this.freq[idx]}`
                );
                break;
            }

            case 'formKey': {
                const freqKey = this.getFullTupleKey(this.freq);
                const displayKey = this.getCompactKey(this.freq);
                this.currentKey = freqKey;
                this.currentDisplayKey = displayKey;
                this.highlightCode(5);
                this.renderHashKey(displayKey);

                // Highlight all non-zero freq cells
                this.renderFreqGrid();

                this.updateStatus(`Hash key: ${displayKey} for "${this.words[this.wordIndex]}"`);
                this.phase = 'insertMap';
                break;
            }

            case 'insertMap': {
                const w = this.words[this.wordIndex];
                const k = this.currentKey;
                const isNewKey = !(k in this.hashmap);

                if (isNewKey) {
                    this.hashmap[k] = {
                        words: [w],
                        id: Object.keys(this.hashmap).length,
                        displayKey: this.currentDisplayKey
                    };
                } else {
                    this.hashmap[k].words.push(w);
                }

                this.highlightCode(5);
                this.renderHashmap(k, isNewKey);
                this.updateInfoPanel();

                if (isNewKey) {
                    this.updateStatus(`New group created: ${this.currentDisplayKey} → ["${w}"]`);
                } else {
                    const groupWords = this.hashmap[k].words.map(x => `"${x}"`).join(', ');
                    this.updateStatus(`Added "${w}" to existing group: ${this.currentDisplayKey} → [${groupWords}]`);
                }

                this.phase = 'pickWord';
                break;
            }
        }
    }
}

// Initialize
const visualizer = new GroupAnagramsVisualizer();

window.onload = () => {
    visualizer.bindControls();
    visualizer.init();
};
