/**
 * DSA Visualizations - Base Visualizer Class
 * Provides common functionality for all algorithm visualizations
 */

class VisualizerBase {
    constructor(config = {}) {
        // Element IDs
        this.containerId = config.containerId || 'arrayDisplay';
        this.statusId = config.statusId || 'status';
        this.speedSliderId = config.speedSliderId || 'speedSlider';
        this.playBtnId = config.playBtnId || 'playBtn';
        this.stepBtnId = config.stepBtnId || 'stepBtn';
        this.resetBtnId = config.resetBtnId || 'resetBtn';
        this.codeLinePrefix = config.codeLinePrefix || 'code-';
        this.codeLineCount = config.codeLineCount || 0;

        // State
        this.isPlaying = false;
        this.isFinished = false;
        this.playInterval = null;

        // Bind methods
        this.togglePlay = this.togglePlay.bind(this);
        this.step = this.step.bind(this);
        this.init = this.init.bind(this);
    }

    /**
     * Initialize the visualization - override in subclass
     */
    init() {
        this.isFinished = false;
        if (this.isPlaying) {
            this.pause();
        }
        this.clearCodeHighlight();
        this.updateStatus('Click "Step" or "Play" to start the visualization');
    }

    /**
     * Perform one step of the algorithm - must override in subclass
     */
    step() {
        throw new Error('step() must be implemented by subclass');
    }

    /**
     * Get current speed from slider (returns ms delay)
     */
    getSpeed() {
        const slider = document.getElementById(this.speedSliderId);
        if (slider) {
            return 2100 - parseInt(slider.value);
        }
        return 1000;
    }

    /**
     * Toggle play/pause state
     */
    togglePlay() {
        if (this.isPlaying) {
            this.pause();
        } else {
            this.play();
        }
    }

    /**
     * Start auto-playing
     */
    play() {
        if (this.isFinished) return;

        this.isPlaying = true;
        const btn = document.getElementById(this.playBtnId);
        if (btn) btn.textContent = 'Pause';

        this.playInterval = setInterval(() => {
            if (!this.isFinished) {
                this.step();
            } else {
                this.pause();
            }
        }, this.getSpeed());
    }

    /**
     * Pause auto-playing
     */
    pause() {
        this.isPlaying = false;
        const btn = document.getElementById(this.playBtnId);
        if (btn) btn.textContent = 'Play';

        if (this.playInterval) {
            clearInterval(this.playInterval);
            this.playInterval = null;
        }
    }

    /**
     * Mark visualization as finished
     */
    finish() {
        this.isFinished = true;
        if (this.isPlaying) {
            this.pause();
        }
    }

    /**
     * Update status message
     */
    updateStatus(message, type = 'normal') {
        const status = document.getElementById(this.statusId);
        if (status) {
            status.textContent = message;
            status.className = 'status';
            if (type === 'success') {
                status.classList.add('success');
            } else if (type === 'error') {
                status.classList.add('error');
            }
        }
    }

    /**
     * Highlight a specific code line
     */
    highlightCode(lineIndex) {
        this.clearCodeHighlight();
        if (lineIndex >= 0) {
            const line = document.getElementById(`${this.codeLinePrefix}${lineIndex}`);
            if (line) {
                line.classList.add('active');
            }
        }
    }

    /**
     * Clear all code highlighting
     */
    clearCodeHighlight() {
        for (let i = 0; i < this.codeLineCount; i++) {
            const line = document.getElementById(`${this.codeLinePrefix}${i}`);
            if (line) {
                line.classList.remove('active');
            }
        }
    }

    /**
     * Render an array as box elements
     */
    renderArray(arr, options = {}) {
        const container = document.getElementById(options.containerId || this.containerId);
        if (!container) return;

        container.innerHTML = '';

        arr.forEach((value, idx) => {
            const element = document.createElement('div');
            element.className = 'array-element';

            const box = document.createElement('div');
            box.className = 'array-box';
            if (options.small) box.classList.add('small');
            box.id = `${options.boxPrefix || 'box'}-${idx}`;
            box.textContent = value;

            // Apply custom class based on callback
            if (options.getBoxClass) {
                const customClass = options.getBoxClass(value, idx);
                if (customClass) {
                    box.classList.add(customClass);
                }
            }

            element.appendChild(box);

            // Add index label if requested
            if (options.showIndex !== false) {
                const index = document.createElement('div');
                index.className = 'array-index';
                index.textContent = `[${idx}]`;
                element.appendChild(index);
            }

            // Add custom label if provided
            if (options.getLabel) {
                const label = options.getLabel(value, idx);
                if (label) {
                    const labelEl = document.createElement('div');
                    labelEl.className = 'array-index';
                    labelEl.style.color = label.color || '#666';
                    labelEl.textContent = label.text;
                    element.appendChild(labelEl);
                }
            }

            container.appendChild(element);
        });
    }

    /**
     * Render a string as character boxes
     */
    renderString(str, options = {}) {
        const container = document.getElementById(options.containerId || this.containerId);
        if (!container) return;

        container.innerHTML = '';

        for (let i = 0; i < str.length; i++) {
            const box = document.createElement('div');
            box.className = 'char-box';
            box.id = `${options.boxPrefix || 'char'}-${i}`;
            box.textContent = str[i];

            if (options.getBoxClass) {
                const customClass = options.getBoxClass(str[i], i);
                if (customClass) {
                    box.classList.add(customClass);
                }
            }

            container.appendChild(box);
        }
    }

    /**
     * Render a 2D grid
     */
    renderGrid(grid, options = {}) {
        const container = document.getElementById(options.containerId || this.containerId);
        if (!container) return;

        container.innerHTML = '';

        const gridEl = document.createElement('div');
        gridEl.className = 'grid';
        gridEl.style.gridTemplateColumns = `repeat(${grid[0].length}, 1fr)`;

        for (let i = 0; i < grid.length; i++) {
            for (let j = 0; j < grid[i].length; j++) {
                const cell = document.createElement('div');
                cell.className = 'grid-cell';
                cell.id = `${options.cellPrefix || 'cell'}-${i}-${j}`;
                cell.textContent = grid[i][j];

                if (options.getCellClass) {
                    const customClass = options.getCellClass(grid[i][j], i, j);
                    if (customClass) {
                        cell.classList.add(customClass);
                    }
                }

                gridEl.appendChild(cell);
            }
        }

        container.appendChild(gridEl);
    }

    /**
     * Animate a swap between two elements
     */
    animateSwap(idx1, idx2, callback, boxPrefix = 'box') {
        const box1 = document.getElementById(`${boxPrefix}-${idx1}`);
        const box2 = document.getElementById(`${boxPrefix}-${idx2}`);

        if (box1 && box2 && idx1 !== idx2) {
            box1.classList.add('swapping');
            box2.classList.add('swapping');

            setTimeout(() => {
                box1.classList.remove('swapping');
                box2.classList.remove('swapping');
                if (callback) callback();
            }, 400);
        } else {
            if (callback) callback();
        }
    }

    /**
     * Add a class to an element temporarily
     */
    flashClass(elementId, className, duration = 300) {
        const el = document.getElementById(elementId);
        if (el) {
            el.classList.add(className);
            setTimeout(() => {
                el.classList.remove(className);
            }, duration);
        }
    }

    /**
     * Update an info box value
     */
    updateInfoBox(elementId, value) {
        const el = document.getElementById(elementId);
        if (el) {
            el.textContent = value;
        }
    }

    /**
     * Bind control buttons to their handlers
     */
    bindControls() {
        const playBtn = document.getElementById(this.playBtnId);
        const stepBtn = document.getElementById(this.stepBtnId);
        const resetBtn = document.getElementById(this.resetBtnId);

        if (playBtn) {
            playBtn.addEventListener('click', this.togglePlay);
        }
        if (stepBtn) {
            stepBtn.addEventListener('click', this.step);
        }
        if (resetBtn) {
            resetBtn.addEventListener('click', this.init);
        }
    }

    /**
     * Parse comma-separated array input
     */
    parseArrayInput(inputId, filterFn = null) {
        const input = document.getElementById(inputId);
        if (!input) return [];

        let arr = input.value.split(',')
            .map(n => parseInt(n.trim()))
            .filter(n => !isNaN(n));

        if (filterFn) {
            arr = arr.filter(filterFn);
        }

        return arr;
    }

    /**
     * Parse string input
     */
    parseStringInput(inputId) {
        const input = document.getElementById(inputId);
        return input ? input.value : '';
    }

    /**
     * Parse number input
     */
    parseNumberInput(inputId, defaultValue = 0) {
        const input = document.getElementById(inputId);
        if (!input) return defaultValue;
        const val = parseInt(input.value);
        return isNaN(val) ? defaultValue : val;
    }

    /**
     * Generate random array
     */
    static randomArray(length, min, max) {
        const arr = [];
        for (let i = 0; i < length; i++) {
            arr.push(Math.floor(Math.random() * (max - min + 1)) + min);
        }
        return arr;
    }

    /**
     * Generate random string
     */
    static randomString(length, chars = 'abcdefghijklmnopqrstuvwxyz') {
        let result = '';
        for (let i = 0; i < length; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return result;
    }

    /**
     * Delay helper for async operations
     */
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

// Export for use in modules if needed
if (typeof module !== 'undefined' && module.exports) {
    module.exports = VisualizerBase;
}
