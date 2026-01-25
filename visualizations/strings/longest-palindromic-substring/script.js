/**
 * Longest Palindromic Substring Visualization
 * Find the longest palindrome using expand-around-center approach
 * Time: O(n²), Space: O(1)
 */

class PalindromeVisualizer extends VisualizerBase {
    constructor() {
        super({
            codeLineCount: 7,
        });

        this.str = "";
        this.center = 0;
        this.left = 0;
        this.right = 0;
        this.phase = "odd"; // 'odd' or 'even'
        this.expanding = false;
        this.longest = "";
        this.longestStart = -1;
        this.longestEnd = -1;
        this.foundPalindromes = new Set();
        this.currentPalindromeStart = -1;
        this.currentPalindromeEnd = -1;
    }

    init() {
        // Parse input
        this.str = this.parseStringInput("stringInput") || "babad";

        // Reset state
        this.center = 0;
        this.left = 0;
        this.right = 0;
        this.phase = "odd";
        this.expanding = false;
        this.longest = this.str.length > 0 ? this.str[0] : "";
        this.longestStart = 0;
        this.longestEnd = 0;
        this.foundPalindromes = new Set();
        this.currentPalindromeStart = -1;
        this.currentPalindromeEnd = -1;
        this.isFinished = false;

        if (this.isPlaying) {
            this.pause();
        }

        // Render
        this.renderString();
        this.renderSubstring("-", false);
        this.renderPalindromeList();
        this.updateInfoPanel();
        this.clearCodeHighlight();
        this.highlightCode(3);
        this.updateStatus('Click "Step" or "Play" to start. Center 0, trying odd-length expansion.');
    }

    generateRandom() {
        const words = [
            "racecar",
            "level",
            "rotator",
            "civic",
            "radar",
            "refer",
            "deified",
            "noon",
            "kayak",
            "madam",
        ];
        const bases = ["abc", "xyz", "test", "code", "algo"];

        // Mix a palindrome into a random base
        const palindrome = words[Math.floor(Math.random() * words.length)];
        const base = bases[Math.floor(Math.random() * bases.length)];
        const pos = Math.floor(Math.random() * (base.length + 1));

        const result = base.slice(0, pos) + palindrome + base.slice(pos);
        document.getElementById("stringInput").value = result;
        this.init();
    }

    renderString() {
        const container = document.getElementById("stringDisplay");
        container.innerHTML = "";

        for (let idx = 0; idx < this.str.length; idx++) {
            const box = document.createElement("div");
            box.className = "char-box";
            box.id = `char-${idx}`;
            box.textContent = this.str[idx];

            // Highlight states
            if (this.isFinished && idx >= this.longestStart && idx <= this.longestEnd) {
                box.classList.add("longest");
            } else if (!this.isFinished) {
                // Show center
                if (this.phase === "odd" && idx === this.center) {
                    box.classList.add("center");
                } else if (this.phase === "even" && (idx === this.center || idx === this.center + 1)) {
                    box.classList.add("center");
                }

                // Show expansion range (current palindrome being expanded)
                if (this.expanding && idx >= this.left && idx <= this.right) {
                    box.classList.add("in-range");
                }

                // Show current palindrome found in this expansion
                if (this.currentPalindromeStart !== -1 &&
                    idx >= this.currentPalindromeStart &&
                    idx <= this.currentPalindromeEnd) {
                    box.classList.add("palindrome");
                }
            }

            container.appendChild(box);
        }
    }

    renderSubstring(sub, isPalin) {
        const subBox = document.getElementById("currentSubstring");
        const checkText = document.getElementById("palindromeCheck");

        subBox.textContent = sub || "-";
        subBox.className = "substring-box";

        if (sub && sub !== "-") {
            if (isPalin) {
                subBox.classList.add("is-palindrome");
                checkText.textContent = `"${sub}" is a palindrome!`;
                checkText.className = "palindrome-check yes";
            } else {
                subBox.classList.add("not-palindrome");
                checkText.textContent = `s[${this.left}]='${this.str[this.left]}' ≠ s[${this.right}]='${this.str[this.right]}' - stop expanding`;
                checkText.className = "palindrome-check no";
            }
        } else {
            checkText.textContent = "-";
            checkText.className = "palindrome-check";
        }
    }

    renderPalindromeList() {
        const container = document.getElementById("palindromeList");

        if (this.foundPalindromes.size === 0) {
            container.innerHTML = '<span class="empty-text">None found yet</span>';
            return;
        }

        container.innerHTML = "";

        // Sort by length descending
        const sorted = Array.from(this.foundPalindromes).sort(
            (a, b) => b.length - a.length
        );

        sorted.forEach((p) => {
            const item = document.createElement("span");
            item.className = "palindrome-item";
            if (p === this.longest) {
                item.classList.add("longest");
            }
            item.textContent = `"${p}" (${p.length})`;
            container.appendChild(item);
        });
    }

    updateInfoPanel() {
        this.updateInfoBox("centerValue", this.center);
        this.updateInfoBox("expandValue", `${this.left} / ${this.right}`);
        this.updateInfoBox("longestValue", this.longest || "-");
        this.updateInfoBox("lengthValue", this.longest.length);
    }

    step() {
        if (this.isFinished) {
            return;
        }

        // Check if we've processed all centers
        if (this.center >= this.str.length) {
            this.finish();
            this.highlightCode(6);
            this.renderString();
            this.renderSubstring(this.longest, true);
            this.updateStatus(
                `Done! Longest palindrome is "${this.longest}" with length ${this.longest.length}`,
                "success"
            );
            return;
        }

        // Starting a new center?
        if (!this.expanding) {
            this.startExpansion();
            return;
        }

        // Currently expanding - try to expand further
        this.continueExpansion();
    }

    startExpansion() {
        this.expanding = true;
        this.currentPalindromeStart = -1;
        this.currentPalindromeEnd = -1;

        if (this.phase === "odd") {
            // Odd-length: start with center character
            this.left = this.center;
            this.right = this.center;
            this.highlightCode(4);
            this.updateStatus(`Center ${this.center}: Trying odd-length expansion (single char "${this.str[this.center]}")`);
        } else {
            // Even-length: start between center and center+1
            this.left = this.center;
            this.right = this.center + 1;
            this.highlightCode(5);

            if (this.right >= this.str.length) {
                // No room for even expansion, move to next center
                this.expanding = false;
                this.moveToNextCenter();
                return;
            }

            this.updateStatus(`Center ${this.center}: Trying even-length expansion between indices ${this.left} and ${this.right}`);
        }

        this.renderString();
        this.updateInfoPanel();
    }

    continueExpansion() {
        // Check if current left/right match
        const canExpand = this.left >= 0 &&
                          this.right < this.str.length &&
                          this.str[this.left] === this.str[this.right];

        if (canExpand) {
            // Characters match! This is part of a palindrome
            this.highlightCode(1);
            this.currentPalindromeStart = this.left;
            this.currentPalindromeEnd = this.right;

            const currentPalindrome = this.str.slice(this.left, this.right + 1);
            this.renderSubstring(currentPalindrome, true);

            // Add to found palindromes if length > 1
            if (currentPalindrome.length > 1) {
                this.foundPalindromes.add(currentPalindrome);
                this.renderPalindromeList();
            }

            // Check if this is the new longest
            if (currentPalindrome.length > this.longest.length) {
                this.longest = currentPalindrome;
                this.longestStart = this.left;
                this.longestEnd = this.right;
                this.highlightCode(6);
                this.updateStatus(`New longest palindrome: "${currentPalindrome}" (length ${currentPalindrome.length})`);
            } else {
                this.updateStatus(`Found palindrome "${currentPalindrome}" - expanding further...`);
            }

            // Expand outward for next step
            this.highlightCode(2);
            this.left--;
            this.right++;

            this.renderString();
            this.updateInfoPanel();
        } else {
            // Can't expand further - mismatch or boundary
            if (this.left >= 0 && this.right < this.str.length) {
                // Mismatch
                this.renderSubstring(null, false);
                this.updateStatus(`Mismatch: s[${this.left}]='${this.str[this.left]}' ≠ s[${this.right}]='${this.str[this.right]}' - stopping expansion`);
            } else {
                // Boundary reached
                this.updateStatus(`Reached boundary - stopping expansion`);
            }

            // Done with this expansion, move to next phase or center
            this.expanding = false;
            this.currentPalindromeStart = -1;
            this.currentPalindromeEnd = -1;

            if (this.phase === "odd") {
                // Switch to even-length expansion
                this.phase = "even";
            } else {
                // Move to next center
                this.moveToNextCenter();
            }

            this.renderString();
            this.updateInfoPanel();
        }
    }

    moveToNextCenter() {
        this.center++;
        this.phase = "odd";
        this.highlightCode(3);

        if (this.center < this.str.length) {
            this.updateStatus(`Moving to center ${this.center}`);
        }
    }
}

// Initialize
const visualizer = new PalindromeVisualizer();

window.onload = () => {
    visualizer.bindControls();
    visualizer.init();

    // Bind random button
    document.getElementById("randomBtn").addEventListener("click", () => {
        visualizer.generateRandom();
    });
};
