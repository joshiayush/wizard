/**
 * BPE Tokenizer Algorithm Visualization
 * Byte Pair Encoding: iteratively merge the most frequent byte pairs into new tokens
 */

class BPETokenizerVisualizer extends VisualizerBase {
    constructor() {
        super({
            codeLineCount: 14
        });

        this.text = '';
        this.vocabSize = 260;
        this.originalIds = [];
        this.ids = [];
        this.merges = {};        // "id1,id2" -> newId
        this.mergeList = [];     // ordered list of { pair: [id1,id2], newId, decoded }
        this.vocab = {};         // id -> uint8 array representation
        this.pairStats = {};     // "id1,id2" -> count
        this.bestPair = null;    // [id1, id2]
        this.mergeIndex = 0;
        this.nMerges = 0;
        this.phase = 'idle';
        // idle | initBytes | countPairs | findBest | merge |
        // trainDone | encodeInit | encodeCountPairs | encodeFindBest | encodeMerge | done
        this.lastMergedIdx = -1; // the new token id that was just merged (for highlighting)
    }

    init() {
        const textInput = document.getElementById('textInput');
        this.text = textInput ? textInput.value : 'the cat sat on the mat the cat';

        if (this.text.trim().length === 0) {
            this.text = 'the cat sat on the mat the cat';
        }

        const vocabInput = document.getElementById('vocabSizeInput');
        this.vocabSize = vocabInput ? Math.max(257, parseInt(vocabInput.value) || 260) : 260;

        this.nMerges = this.vocabSize - 256;
        this.originalIds = [];
        this.ids = [];
        this.merges = {};
        this.mergeList = [];
        this.vocab = {};
        this.pairStats = {};
        this.bestPair = null;
        this.mergeIndex = 0;
        this.phase = 'idle';
        this.lastMergedIdx = -1;
        this.isFinished = false;

        if (this.isPlaying) {
            this.pause();
        }

        // Build initial vocab (0-255)
        for (let i = 0; i < 256; i++) {
            this.vocab[i] = [i];
        }

        this.renderIds();
        this.renderPairStats();
        this.renderMergeTable();
        this.renderTokenOutput();
        this.updateInfoPanel();
        this.clearCodeHighlight();
        this.updateStatus('Click "Step" or "Play" to start the visualization');
    }

    // --- BPE Algorithm Helpers (JS ports) ---

    _getConsecutivePairStats(ids) {
        const counts = {};
        for (let i = 0; i < ids.length - 1; i++) {
            const key = ids[i] + ',' + ids[i + 1];
            counts[key] = (counts[key] || 0) + 1;
        }
        return counts;
    }

    _mergeConsecutivePair(ids, pair, idx) {
        const out = [];
        let i = 0;
        while (i < ids.length) {
            if (i < ids.length - 1 && ids[i] === pair[0] && ids[i + 1] === pair[1]) {
                out.push(idx);
                i += 2;
            } else {
                out.push(ids[i]);
                i += 1;
            }
        }
        return out;
    }

    _textToBytes(text) {
        const encoder = new TextEncoder();
        return Array.from(encoder.encode(text));
    }

    _getTokenColor(id) {
        const hue = (id * 137.508) % 360;
        return `hsl(${hue}, 70%, 60%)`;
    }

    _decodeToken(id) {
        const bytes = this.vocab[id];
        if (!bytes) return '?';
        try {
            const decoder = new TextDecoder('utf-8', { fatal: false });
            return decoder.decode(new Uint8Array(bytes));
        } catch {
            return bytes.map(b => String.fromCharCode(b)).join('');
        }
    }

    _displayByte(id) {
        if (id >= 256) {
            return this._decodeToken(id);
        }
        if (id >= 32 && id < 127) {
            return String.fromCharCode(id);
        }
        return '0x' + id.toString(16).padStart(2, '0');
    }

    // --- Rendering ---

    renderIds() {
        const container = document.getElementById('idsDisplay');
        if (!container) return;

        if (this.ids.length === 0) {
            container.innerHTML = '<span class="empty-text">Click Step or Play to start</span>';
            return;
        }

        container.innerHTML = '';
        const pairKey = this.bestPair ? this.bestPair[0] + ',' + this.bestPair[1] : null;

        for (let i = 0; i < this.ids.length; i++) {
            const box = document.createElement('div');
            box.className = 'token-box';
            box.textContent = this.ids[i];
            box.title = this._displayByte(this.ids[i]);

            // Color the box based on token id
            if (this.ids[i] >= 256) {
                const color = this._getTokenColor(this.ids[i]);
                box.style.borderColor = color;
                box.style.color = color;
                box.style.background = this._colorWithAlpha(color, 0.15);
            }

            // Highlight best pair occurrences
            if (pairKey && this.phase === 'findBest' &&
                i < this.ids.length - 1 &&
                this.ids[i] === this.bestPair[0] &&
                this.ids[i + 1] === this.bestPair[1]) {
                box.classList.add('pair-highlight');
                // Also highlight the next element
                // (handled in next iteration by same check offset by 1 is not clean,
                //  so we'll mark pairs with a data attribute)
                box.dataset.pairStart = 'true';
            }

            // Check if previous was a pair start and this is the second element
            if (pairKey && this.phase === 'findBest' &&
                i > 0 &&
                this.ids[i - 1] === this.bestPair[0] &&
                this.ids[i] === this.bestPair[1]) {
                box.classList.add('pair-highlight');
            }

            // Highlight just-merged tokens
            if (this.ids[i] === this.lastMergedIdx &&
                (this.phase === 'merge' || this.phase === 'encodeMerge')) {
                box.classList.add('just-merged');
            }

            container.appendChild(box);
        }
    }

    _colorWithAlpha(hslColor, alpha) {
        return hslColor.replace('hsl(', 'hsla(').replace(')', `, ${alpha})`);
    }

    renderPairStats() {
        const container = document.getElementById('pairStatsDisplay');
        if (!container) return;

        const keys = Object.keys(this.pairStats);
        if (keys.length === 0) {
            container.innerHTML = '<span class="empty-text">-</span>';
            return;
        }

        // Sort by count descending, show top 12
        const sorted = keys
            .map(k => ({ key: k, count: this.pairStats[k] }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 12);

        container.innerHTML = '';
        const bestKey = this.bestPair ? this.bestPair[0] + ',' + this.bestPair[1] : null;

        for (const entry of sorted) {
            const el = document.createElement('div');
            el.className = 'pair-entry';

            if (entry.key === bestKey) {
                el.classList.add('pair-best');
            }

            const parts = entry.key.split(',').map(Number);
            const decoded0 = this._displayByte(parts[0]);
            const decoded1 = this._displayByte(parts[1]);

            el.innerHTML = `<span class="pair-key">(${decoded0}, ${decoded1})</span><span class="pair-count">: ${entry.count}</span>`;
            container.appendChild(el);
        }
    }

    renderMergeTable() {
        const container = document.getElementById('mergeTableDisplay');
        if (!container) return;

        if (this.mergeList.length === 0) {
            container.innerHTML = '<span class="empty-text">No merges yet</span>';
            return;
        }

        container.innerHTML = '';

        for (let i = 0; i < this.mergeList.length; i++) {
            const m = this.mergeList[i];
            const el = document.createElement('div');
            el.className = 'merge-entry';

            if (i === this.mergeList.length - 1) {
                el.classList.add('latest');
            }

            const decoded0 = this._displayByte(m.pair[0]);
            const decoded1 = this._displayByte(m.pair[1]);
            const color = this._getTokenColor(m.newId);

            el.innerHTML = `<span class="merge-pair">(${decoded0}, ${decoded1})</span>` +
                `<span class="merge-arrow">&rarr;</span>` +
                `<span class="merge-new-id" style="color:${color}">${m.newId}</span>` +
                `<span class="merge-decoded">"${m.decoded}"</span>`;

            container.appendChild(el);
        }

        // Scroll to bottom
        container.scrollTop = container.scrollHeight;
    }

    renderTokenOutput() {
        const textContainer = document.getElementById('colorizedTextDisplay');
        const idsContainer = document.getElementById('tokenIdsDisplay');
        const countHeader = document.getElementById('tokenCountHeader');

        if (this.ids.length === 0) {
            if (textContainer) textContainer.innerHTML = '<span class="empty-text">Tokens will appear here after processing</span>';
            if (idsContainer) idsContainer.innerHTML = '<span class="empty-text">Token IDs will appear here</span>';
            if (countHeader) countHeader.textContent = '-';
            return;
        }

        // Update token count header
        if (countHeader) {
            countHeader.textContent = this.ids.length;
        }

        // Render colorized inline text (tiktokenizer style)
        if (textContainer) {
            textContainer.innerHTML = '';
            for (let i = 0; i < this.ids.length; i++) {
                const id = this.ids[i];
                const decoded = this._decodeToken(id);
                const color = this._getTokenColor(id);

                const span = document.createElement('span');
                span.className = 'token-span';
                span.textContent = decoded;
                span.style.backgroundColor = this._colorWithAlpha(color, 0.25);
                span.style.color = color;
                span.title = `Token ID: ${id}`;

                textContainer.appendChild(span);
            }
        }

        // Render token IDs
        if (idsContainer) {
            idsContainer.textContent = this.ids.join(', ');
        }
    }

    updateInfoPanel() {
        // Phase
        const phaseEl = document.getElementById('phaseValue');
        if (phaseEl) {
            let phaseText = '-';
            let badgeClass = '';
            if (this.phase === 'idle') {
                phaseText = 'Ready';
            } else if (['initBytes', 'countPairs', 'findBest', 'merge'].includes(this.phase)) {
                phaseText = 'Train';
                badgeClass = 'train';
            } else if (this.phase === 'trainDone') {
                phaseText = 'Trained';
                badgeClass = 'train';
            } else if (['encodeInit', 'encodeCountPairs', 'encodeFindBest', 'encodeMerge'].includes(this.phase)) {
                phaseText = 'Encode';
                badgeClass = 'encode';
            } else if (this.phase === 'done') {
                phaseText = 'Done';
                badgeClass = 'done';
            }
            phaseEl.innerHTML = badgeClass
                ? `<span class="phase-badge ${badgeClass}">${phaseText}</span>`
                : phaseText;
        }

        this.updateInfoBox('mergesValue', this.mergeList.length);
        this.updateInfoBox('tokenCountValue', this.ids.length > 0 ? this.ids.length : '-');

        // Compression ratio
        const comprEl = document.getElementById('compressionValue');
        if (comprEl) {
            if (this.originalIds.length > 0 && this.ids.length > 0) {
                const ratio = (this.originalIds.length / this.ids.length).toFixed(2);
                comprEl.textContent = ratio + 'x';
            } else {
                comprEl.textContent = '-';
            }
        }
    }

    // --- Step State Machine ---

    step() {
        if (this.isFinished) return;

        switch (this.phase) {
            case 'idle':
                this._stepInitBytes();
                break;
            case 'initBytes':
                this._stepCountPairs();
                break;
            case 'countPairs':
                this._stepFindBest();
                break;
            case 'findBest':
                this._stepMerge();
                break;
            case 'merge':
                this._stepAfterMerge();
                break;
            case 'trainDone':
                this._stepEncodeInit();
                break;
            case 'encodeInit':
                this._stepEncodeCountPairs();
                break;
            case 'encodeCountPairs':
                this._stepEncodeFindBest();
                break;
            case 'encodeFindBest':
                this._stepEncodeMerge();
                break;
            case 'encodeMerge':
                this._stepEncodeCountPairs();
                break;
        }
    }

    _stepInitBytes() {
        this.ids = this._textToBytes(this.text);
        this.originalIds = [...this.ids];
        this.mergeIndex = 0;
        this.lastMergedIdx = -1;
        this.phase = 'initBytes';

        this.highlightCode(1);
        this.renderIds();
        this.renderTokenOutput();
        this.updateInfoPanel();
        this.updateStatus(`Converted text to ${this.ids.length} UTF-8 byte IDs`);
    }

    _stepCountPairs() {
        this.lastMergedIdx = -1;
        this.bestPair = null;
        this.pairStats = this._getConsecutivePairStats(this.ids);

        if (Object.keys(this.pairStats).length === 0) {
            // No pairs left, training done
            this.phase = 'trainDone';
            this.highlightCode(7);
            this.renderPairStats();
            this.renderIds();
            this.updateInfoPanel();
            this.updateStatus('Training complete! No more pairs to merge.');
            return;
        }

        this.phase = 'countPairs';
        this.highlightCode(3);
        this.renderIds();
        this.renderPairStats();
        this.updateInfoPanel();

        const numPairs = Object.keys(this.pairStats).length;
        this.updateStatus(`Counted pair frequencies: ${numPairs} unique pair(s)`);
    }

    _stepFindBest() {
        // Find the most frequent pair
        let bestKey = null;
        let bestCount = -1;

        for (const key in this.pairStats) {
            if (this.pairStats[key] > bestCount) {
                bestCount = this.pairStats[key];
                bestKey = key;
            }
        }

        this.bestPair = bestKey.split(',').map(Number);
        this.phase = 'findBest';

        this.highlightCode(4);
        this.renderIds();
        this.renderPairStats();
        this.updateInfoPanel();

        const d0 = this._displayByte(this.bestPair[0]);
        const d1 = this._displayByte(this.bestPair[1]);
        this.updateStatus(`Best pair: (${d0}, ${d1}) with count ${bestCount}`);
    }

    _stepMerge() {
        const newId = 256 + this.mergeIndex;
        const pairKey = this.bestPair[0] + ',' + this.bestPair[1];

        // Perform the merge
        const prevLen = this.ids.length;
        this.ids = this._mergeConsecutivePair(this.ids, this.bestPair, newId);

        // Update merges and vocab
        this.merges[pairKey] = newId;
        this.vocab[newId] = [...(this.vocab[this.bestPair[0]] || []), ...(this.vocab[this.bestPair[1]] || [])];

        const decoded = this._decodeToken(newId);
        this.mergeList.push({
            pair: [...this.bestPair],
            newId: newId,
            decoded: decoded
        });

        this.lastMergedIdx = newId;
        this.mergeIndex++;
        this.phase = 'merge';

        this.highlightCode(6);
        this.renderIds();
        this.renderPairStats();
        this.renderMergeTable();
        this.renderTokenOutput();
        this.updateInfoPanel();

        const d0 = this._displayByte(this.bestPair[0]);
        const d1 = this._displayByte(this.bestPair[1]);
        this.updateStatus(`Merged (${d0}, ${d1}) → ${newId} "${decoded}". Length: ${prevLen} → ${this.ids.length}`);
    }

    _stepAfterMerge() {
        // Check if we should continue training
        if (this.mergeIndex >= this.nMerges || this.ids.length < 2) {
            this.phase = 'trainDone';
            this.bestPair = null;
            this.lastMergedIdx = -1;
            this.pairStats = {};

            this.highlightCode(7);
            this.renderIds();
            this.renderPairStats();
            this.renderTokenOutput();
            this.updateInfoPanel();
            this.updateStatus(`Training complete! Learned ${this.mergeList.length} merge(s). Step again to see encoding.`);
        } else {
            // Continue with next merge iteration
            this._stepCountPairs();
        }
    }

    _stepEncodeInit() {
        // Reset to raw bytes for encoding phase
        this.ids = this._textToBytes(this.text);
        this.bestPair = null;
        this.lastMergedIdx = -1;
        this.pairStats = {};
        this.phase = 'encodeInit';

        this.highlightCode(9);
        this.renderIds();
        this.renderPairStats();
        this.renderTokenOutput();
        this.updateInfoPanel();
        this.updateStatus(`Encoding phase: reset to ${this.ids.length} raw UTF-8 bytes. Applying learned merges in priority order.`);
    }

    _stepEncodeCountPairs() {
        this.lastMergedIdx = -1;
        this.bestPair = null;

        if (this.ids.length < 2) {
            this._stepFinish();
            return;
        }

        this.pairStats = this._getConsecutivePairStats(this.ids);
        this.phase = 'encodeCountPairs';

        this.highlightCode(10);
        this.renderIds();
        this.renderPairStats();
        this.updateInfoPanel();

        const numPairs = Object.keys(this.pairStats).length;
        this.updateStatus(`Encode: counted ${numPairs} unique pair(s). Finding lowest-priority merge...`);
    }

    _stepEncodeFindBest() {
        // Find the pair with the smallest merge index (earliest learned)
        let bestKey = null;
        let bestMergeId = Infinity;

        for (const key in this.pairStats) {
            if (key in this.merges && this.merges[key] < bestMergeId) {
                bestMergeId = this.merges[key];
                bestKey = key;
            }
        }

        if (bestKey === null) {
            // No learned pair found - done
            this._stepFinish();
            return;
        }

        this.bestPair = bestKey.split(',').map(Number);
        this.phase = 'encodeFindBest';

        this.highlightCode(11);
        this.renderIds();
        this.renderPairStats();
        this.updateInfoPanel();

        const d0 = this._displayByte(this.bestPair[0]);
        const d1 = this._displayByte(this.bestPair[1]);
        this.updateStatus(`Encode: applying merge (${d0}, ${d1}) → ${bestMergeId}`);
    }

    _stepEncodeMerge() {
        const pairKey = this.bestPair[0] + ',' + this.bestPair[1];
        const newId = this.merges[pairKey];
        const prevLen = this.ids.length;

        this.ids = this._mergeConsecutivePair(this.ids, this.bestPair, newId);
        this.lastMergedIdx = newId;
        this.phase = 'encodeMerge';

        this.highlightCode(13);
        this.renderIds();
        this.renderPairStats();
        this.renderTokenOutput();
        this.updateInfoPanel();

        const decoded = this._decodeToken(newId);
        this.updateStatus(`Encoded: merged to ${newId} "${decoded}". Length: ${prevLen} → ${this.ids.length}`);
    }

    _stepFinish() {
        this.phase = 'done';
        this.bestPair = null;
        this.lastMergedIdx = -1;
        this.pairStats = {};

        this.highlightCode(13);
        this.renderIds();
        this.renderPairStats();
        this.renderTokenOutput();
        this.updateInfoPanel();
        this.finish();

        const ratio = (this.originalIds.length / this.ids.length).toFixed(2);
        this.updateStatus(
            `Done! ${this.originalIds.length} bytes → ${this.ids.length} tokens (${ratio}x compression) using ${this.mergeList.length} merge(s)`,
            'success'
        );
    }
}

// Initialize
const visualizer = new BPETokenizerVisualizer();

window.onload = () => {
    visualizer.bindControls();
    visualizer.init();
};
