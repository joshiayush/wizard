/**
 * Longest Palindromic Substring Visualization
 * Find the longest palindrome using brute force
 */

class PalindromeVisualizer extends VisualizerBase {
    constructor() {
        super({
            codeLineCount: 7,
        });

        this.str = "";
        this.i = 0;
        this.j = 0;
        this.longest = "";
        this.longestStart = -1;
        this.longestEnd = -1;
        this.foundPalindromes = new Set();
    }

    init() {
        // Parse input
        this.str = this.parseStringInput("stringInput") || "babad";

        // Reset state
        this.i = 0;
        this.j = 0;
        this.longest = "";
        this.longestStart = -1;
        this.longestEnd = -1;
        this.foundPalindromes = new Set();
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
        this.highlightCode(0);
        this.updateStatus('Click "Step" or "Play" to start the visualization');
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

    isPalindrome(s) {
        return s === s.split("").reverse().join("");
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
            if (
                this.isFinished &&
                idx >= this.longestStart &&
                idx <= this.longestEnd
            ) {
                box.classList.add("longest");
            } else if (!this.isFinished && idx >= this.i && idx <= this.j) {
                box.classList.add("in-range");
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
                checkText.textContent = `"${sub}" reversed is "${sub.split("").reverse().join("")}" ✓ Palindrome!`;
                checkText.className = "palindrome-check yes";
            } else {
                subBox.classList.add("not-palindrome");
                checkText.textContent = `"${sub}" reversed is "${sub.split("").reverse().join("")}" ✗ Not a palindrome`;
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

        sorted.forEach((p, idx) => {
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
        this.updateInfoBox("iValue", this.i);
        this.updateInfoBox("jValue", this.j);
        this.updateInfoBox("longestValue", this.longest || "-");
        this.updateInfoBox("lengthValue", this.longest.length);
    }

    step() {
        if (this.isFinished) {
            return;
        }

        // Check if we've gone through all substrings
        if (this.i >= this.str.length) {
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

        // Get current substring
        this.highlightCode(2);
        const sub = this.str.slice(this.i, this.j + 1);

        this.renderString();
        this.updateInfoPanel();

        setTimeout(() => {
            // Check if palindrome
            this.highlightCode(3);
            const isPalin = this.isPalindrome(sub);
            this.renderSubstring(sub, isPalin);

            setTimeout(() => {
                if (isPalin) {
                    // Add to found palindromes if length > 1
                    if (sub.length > 1) {
                        this.foundPalindromes.add(sub);
                        this.renderPalindromeList();
                    }

                    this.highlightCode(4);

                    if (sub.length > this.longest.length) {
                        setTimeout(() => {
                            this.highlightCode(5);
                            this.longest = sub;
                            this.longestStart = this.i;
                            this.longestEnd = this.j;
                            this.updateInfoPanel();
                            this.renderPalindromeList();
                            this.updateStatus(
                                `New longest palindrome found: "${sub}" (length ${sub.length})`
                            );
                            this.moveToNext();
                        }, this.getSpeed() / 4);
                    } else {
                        this.updateStatus(
                            `"${sub}" is a palindrome but not longer than "${this.longest}"`
                        );
                        this.moveToNext();
                    }
                } else {
                    this.updateStatus(`"${sub}" is not a palindrome`);
                    this.moveToNext();
                }
            }, this.getSpeed() / 3);
        }, this.getSpeed() / 4);
    }

    moveToNext() {
        // Move to next substring
        this.j++;
        if (this.j >= this.str.length) {
            this.i++;
            this.j = this.i;
            this.highlightCode(0);
        } else {
            this.highlightCode(1);
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
