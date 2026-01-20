/**
 * KMP Pattern Matching Algorithm Visualization
 * Find pattern in text using prefix table
 */

class KMPVisualizer extends VisualizerBase {
    constructor() {
        super({
            codeLineCount: 10,
        });

        this.haystack = "";
        this.needle = "";
        this.piTable = [];
        this.i = 0;
        this.j = 0;
        this.foundIndex = -1;
    }

    init() {
        // Parse inputs
        this.haystack = this.parseStringInput("haystackInput") || "ababcabcabababd";
        this.needle = this.parseStringInput("needleInput") || "ababd";

        // Reset state
        this.i = 0;
        this.j = 0;
        this.foundIndex = -1;
        this.isFinished = false;

        if (this.isPlaying) {
            this.pause();
        }

        // Build pi table
        this.piTable = this.createPiTable(this.needle);

        // Render
        this.renderHaystack();
        this.renderNeedle();
        this.renderPiTable();
        this.updateInfoPanel();
        this.clearCodeHighlight();
        this.highlightCode(0);
        this.updateStatus('Click "Step" or "Play" to start the visualization');
    }

    createPiTable(pattern) {
        const pi = new Array(pattern.length).fill(0);

        for (let i = 0; i < pattern.length; i++) {
            const sub = pattern.slice(0, i + 1);
            const prefixes = new Set();
            const suffixes = new Set();

            // Create prefix set
            for (let j = 1; j < sub.length; j++) {
                prefixes.add(sub.slice(0, j));
            }

            // Create suffix set
            for (let j = sub.length - 1; j > 0; j--) {
                suffixes.add(sub.slice(j));
            }

            // Find longest common prefix-suffix
            let maxLen = 0;
            for (const prefix of prefixes) {
                if (suffixes.has(prefix) && prefix.length > maxLen) {
                    maxLen = prefix.length;
                }
            }
            pi[i] = maxLen;
        }

        return pi;
    }

    renderHaystack() {
        const container = document.getElementById("haystackDisplay");
        container.innerHTML = "";

        for (let idx = 0; idx < this.haystack.length; idx++) {
            const wrapper = document.createElement("div");
            wrapper.style.position = "relative";
            wrapper.style.display = "inline-flex";
            wrapper.style.flexDirection = "column";
            wrapper.style.alignItems = "center";

            const box = document.createElement("div");
            box.className = "char-box";
            box.id = `hay-${idx}`;
            box.textContent = this.haystack[idx];

            // Highlight matched portion
            if (this.foundIndex >= 0 && idx >= this.foundIndex && idx < this.foundIndex + this.needle.length) {
                box.classList.add("match");
            } else if (!this.isFinished && idx === this.i) {
                box.classList.add("current");
            } else if (!this.isFinished && idx >= this.i - this.j && idx < this.i) {
                box.classList.add("matched");
            }

            wrapper.appendChild(box);

            // Add i pointer
            if (idx === this.i && !this.isFinished) {
                const pointer = document.createElement("div");
                pointer.className = "pointer-i";
                pointer.innerHTML = "i<br>▼";
                pointer.style.position = "absolute";
                pointer.style.top = "-30px";
                wrapper.appendChild(pointer);
            }

            container.appendChild(wrapper);
        }
    }

    renderNeedle() {
        const container = document.getElementById("needleDisplay");
        container.innerHTML = "";

        // Calculate offset to align with haystack
        const offset = this.i - this.j;

        for (let idx = 0; idx < this.needle.length; idx++) {
            const wrapper = document.createElement("div");
            wrapper.style.position = "relative";
            wrapper.style.display = "inline-flex";
            wrapper.style.flexDirection = "column";
            wrapper.style.alignItems = "center";

            const box = document.createElement("div");
            box.className = "char-box";
            box.id = `needle-${idx}`;
            box.textContent = this.needle[idx];

            // Highlight current comparison
            if (this.foundIndex >= 0) {
                box.classList.add("match");
            } else if (!this.isFinished && idx === this.j) {
                box.classList.add("current");
            } else if (!this.isFinished && idx < this.j) {
                box.classList.add("matched");
            }

            wrapper.appendChild(box);

            // Add j pointer
            if (idx === this.j && !this.isFinished) {
                const pointer = document.createElement("div");
                pointer.className = "pointer-j";
                pointer.innerHTML = "▲<br>j";
                pointer.style.position = "absolute";
                pointer.style.bottom = "-30px";
                wrapper.appendChild(pointer);
            }

            container.appendChild(wrapper);
        }

        // Add margin to align with haystack position
        if (offset > 0) {
            container.style.marginLeft = `${offset * 44}px`; // 40px width + 4px gap
        } else {
            container.style.marginLeft = "0";
        }
    }

    renderPiTable() {
        const charsRow = document.getElementById("piChars");
        const valuesRow = document.getElementById("piValues");

        charsRow.innerHTML = "<th>Char</th>";
        valuesRow.innerHTML = "<th>Pi</th>";

        for (let i = 0; i < this.needle.length; i++) {
            const charCell = document.createElement("td");
            charCell.textContent = this.needle[i];
            charsRow.appendChild(charCell);

            const valueCell = document.createElement("td");
            valueCell.textContent = this.piTable[i];
            valueCell.id = `pi-${i}`;
            valuesRow.appendChild(valueCell);
        }
    }

    highlightPiValue(index) {
        // Clear previous highlights
        for (let i = 0; i < this.needle.length; i++) {
            const cell = document.getElementById(`pi-${i}`);
            if (cell) cell.classList.remove("highlight");
        }

        // Highlight current
        if (index >= 0) {
            const cell = document.getElementById(`pi-${index}`);
            if (cell) cell.classList.add("highlight");
        }
    }

    updateInfoPanel() {
        this.updateInfoBox("iValue", this.i);
        this.updateInfoBox("jValue", this.j);

        if (this.i < this.haystack.length && this.j < this.needle.length) {
            this.updateInfoBox("comparing", `'${this.haystack[this.i]}' vs '${this.needle[this.j]}'`);
        } else {
            this.updateInfoBox("comparing", "-");
        }

        if (this.foundIndex >= 0) {
            this.updateInfoBox("matchStatus", "Found!");
        } else if (this.isFinished) {
            this.updateInfoBox("matchStatus", "Not Found");
        } else {
            this.updateInfoBox("matchStatus", "-");
        }
    }

    step() {
        if (this.isFinished) {
            return;
        }

        // Check termination
        if (this.i >= this.haystack.length || this.j >= this.needle.length) {
            this.finish();
            this.highlightCode(9);
            this.renderHaystack();
            this.renderNeedle();
            this.updateStatus("Pattern not found in text.", "error");
            this.updateInfoPanel();
            return;
        }

        this.highlightCode(2); // while condition
        this.renderHaystack();
        this.renderNeedle();
        this.updateInfoPanel();

        setTimeout(() => {
            this.highlightCode(3); // comparison

            const hayChar = this.haystack[this.i];
            const needleChar = this.needle[this.j];

            if (hayChar === needleChar) {
                // Match
                this.updateStatus(`Match! '${hayChar}' == '${needleChar}'. Moving both pointers forward.`);

                setTimeout(() => {
                    this.highlightCode(4);
                    this.i++;
                    this.j++;

                    this.renderHaystack();
                    this.renderNeedle();
                    this.updateInfoPanel();

                    // Check if complete match
                    setTimeout(() => {
                        this.highlightCode(5);

                        if (this.j === this.needle.length) {
                            this.foundIndex = this.i - this.j;
                            this.finish();
                            this.renderHaystack();
                            this.renderNeedle();
                            this.updateInfoPanel();
                            this.updateStatus(
                                `Pattern found at index ${this.foundIndex}!`,
                                "success"
                            );
                        }
                    }, this.getSpeed() / 4);
                }, this.getSpeed() / 3);
            } else {
                // Mismatch
                const hayBox = document.getElementById(`hay-${this.i}`);
                const needleBox = document.getElementById(`needle-${this.j}`);
                if (hayBox) hayBox.classList.add("mismatch");
                if (needleBox) needleBox.classList.add("mismatch");

                setTimeout(() => {
                    this.highlightCode(6);
                    this.updateStatus(`Mismatch! '${hayChar}' != '${needleChar}'.`);

                    setTimeout(() => {
                        if (this.j > 0) {
                            this.highlightCode(7);
                            const oldJ = this.j;
                            this.j = this.piTable[this.j - 1];
                            this.highlightPiValue(oldJ - 1);
                            this.updateStatus(
                                `j > 0, so j = pi[${oldJ - 1}] = ${this.j}. Jump pattern to reuse matched prefix.`
                            );

                            // Add jump animation
                            const needleContainer = document.getElementById("needleDisplay");
                            if (needleContainer) {
                                needleContainer.classList.add("jumping");
                                setTimeout(() => needleContainer.classList.remove("jumping"), 300);
                            }
                        } else {
                            this.highlightCode(8);
                            this.i++;
                            this.highlightPiValue(-1);
                            this.updateStatus("j = 0, so increment i to continue search.");
                        }

                        this.renderHaystack();
                        this.renderNeedle();
                        this.updateInfoPanel();
                    }, this.getSpeed() / 3);
                }, this.getSpeed() / 4);
            }
        }, this.getSpeed() / 4);
    }
}

// Initialize
const visualizer = new KMPVisualizer();

window.onload = () => {
    visualizer.bindControls();
    visualizer.init();
};
