/**
 * Best Time to Buy and Sell Stock Visualization
 * Find maximum profit from buying and selling stock
 */

class StockProfitVisualizer extends VisualizerBase {
    constructor() {
        super({
            codeLineCount: 7,
        });

        this.prices = [];
        this.currentIndex = 0;
        this.minPrice = Infinity;
        this.minPriceIndex = 0;
        this.maxProfit = 0;
        this.sellDayIndex = -1;
        this.buyDayIndex = 0;
    }

    init() {
        // Parse input
        this.prices = this.parseArrayInput("arrayInput", (n) => n >= 0);

        if (this.prices.length === 0) {
            this.prices = [7, 1, 5, 3, 6, 4];
        }

        // Reset state
        this.currentIndex = 0;
        this.minPrice = this.prices[0];
        this.minPriceIndex = 0;
        this.maxProfit = 0;
        this.sellDayIndex = -1;
        this.buyDayIndex = 0;
        this.isFinished = false;

        if (this.isPlaying) {
            this.pause();
        }

        // Render
        this.renderChart();
        this.updateInfoPanel();
        this.updateCalculation("-");
        this.clearCodeHighlight();
        this.highlightCode(0);
        this.updateStatus('Click "Step" or "Play" to start the visualization');
    }

    generateRandom() {
        const length = Math.floor(Math.random() * 5) + 5; // 5-9 elements
        const arr = [];
        for (let i = 0; i < length; i++) {
            arr.push(Math.floor(Math.random() * 15) + 1); // 1 to 15
        }
        document.getElementById("arrayInput").value = arr.join(", ");
        this.init();
    }

    renderChart() {
        const container = document.getElementById("priceChart");
        container.innerHTML = "";

        const maxPrice = Math.max(...this.prices);

        this.prices.forEach((price, idx) => {
            const barWrapper = document.createElement("div");
            barWrapper.style.display = "flex";
            barWrapper.style.flexDirection = "column";
            barWrapper.style.alignItems = "center";
            barWrapper.style.position = "relative";

            const bar = document.createElement("div");
            bar.className = "price-bar";
            bar.id = `bar-${idx}`;

            // Calculate height (minimum 20px, max based on container)
            const height = Math.max(20, (price / maxPrice) * 180);
            bar.style.height = `${height}px`;

            // Apply states
            if (this.isFinished) {
                if (idx === this.buyDayIndex) {
                    bar.classList.add("min-price");
                }
                if (idx === this.sellDayIndex) {
                    bar.classList.add("sell-day");
                }
            } else {
                if (idx === this.currentIndex) {
                    bar.classList.add("current");
                }
                if (idx === this.minPriceIndex && idx < this.currentIndex) {
                    bar.classList.add("min-price");
                }
            }

            // Price value on top
            const value = document.createElement("div");
            value.className = "bar-value";
            value.textContent = price;
            bar.appendChild(value);

            // Day label at bottom
            const label = document.createElement("div");
            label.className = "bar-label";
            label.textContent = `Day ${idx}`;
            bar.appendChild(label);

            barWrapper.appendChild(bar);
            container.appendChild(barWrapper);
        });
    }

    updateInfoPanel() {
        this.updateInfoBox("currentDay", this.currentIndex);
        this.updateInfoBox(
            "currentPrice",
            this.prices[this.currentIndex] || "-",
        );
        this.updateInfoBox(
            "minPrice",
            this.minPrice === Infinity ? "-" : this.minPrice,
        );
        this.updateInfoBox("maxProfit", this.maxProfit);
        this.updateInfoBox("buyDay", `Day: ${this.minPriceIndex}`);
        this.updateInfoBox(
            "sellDay",
            this.sellDayIndex >= 0
                ? `Sell Day: ${this.sellDayIndex}`
                : "Sell Day: -",
        );
    }

    updateCalculation(formula) {
        document.getElementById("calcFormula").innerHTML = formula;
    }

    step() {
        if (this.isFinished) {
            return;
        }

        // First step: initialize
        if (this.currentIndex === 0) {
            this.highlightCode(1);
            this.updateStatus(
                `Initialize: min price = ${this.prices[0]} (Day 0)`,
            );
            this.currentIndex = 1;
            this.renderChart();
            this.updateInfoPanel();
            return;
        }

        if (this.currentIndex >= this.prices.length) {
            this.finish();
            this.highlightCode(6);
            this.renderChart();

            if (this.maxProfit > 0) {
                this.updateStatus(
                    `Done! Max profit = ${this.maxProfit} (Buy on Day ${this.buyDayIndex} at $${this.prices[this.buyDayIndex]}, Sell on Day ${this.sellDayIndex} at $${this.prices[this.sellDayIndex]})`,
                    "success",
                );
            } else {
                this.updateStatus(
                    "Done! No profitable transaction possible. Max profit = 0",
                    "success",
                );
            }
            return;
        }

        const currentPrice = this.prices[this.currentIndex];
        this.highlightCode(2);

        setTimeout(() => {
            // Calculate potential profit
            this.highlightCode(3);
            const cost = currentPrice - this.minPrice;
            const costClass = cost >= 0 ? "positive" : "negative";
            this.updateCalculation(
                `${currentPrice} - ${this.minPrice} = <span class="${costClass}">${cost}</span>`,
            );

            setTimeout(() => {
                // Update max profit if better
                this.highlightCode(4);

                if (cost > this.maxProfit) {
                    this.maxProfit = cost;
                    this.sellDayIndex = this.currentIndex;
                    this.buyDayIndex = this.minPriceIndex;
                    this.updateStatus(
                        `New max profit! Buy at $${this.minPrice} (Day ${this.minPriceIndex}), Sell at $${currentPrice} (Day ${this.currentIndex}) = $${this.maxProfit}`,
                    );

                    // Flash profit display
                    const profitBox = document.querySelector(
                        ".profit-box .info-value",
                    );
                    if (profitBox) {
                        profitBox.classList.add("profit-highlight");
                        setTimeout(
                            () =>
                                profitBox.classList.remove("profit-highlight"),
                            500,
                        );
                    }
                } else {
                    this.updateStatus(
                        `Profit ${cost} is not better than current max ${this.maxProfit}`,
                    );
                }

                this.updateInfoPanel();

                setTimeout(() => {
                    // Update min price if lower
                    this.highlightCode(5);

                    if (currentPrice < this.minPrice) {
                        this.minPrice = currentPrice;
                        this.minPriceIndex = this.currentIndex;
                        this.updateStatus(
                            `Found new minimum price: $${this.minPrice} on Day ${this.currentIndex}`,
                        );
                    }

                    this.currentIndex++;
                    this.renderChart();
                    this.updateInfoPanel();
                }, this.getSpeed() / 3);
            }, this.getSpeed() / 3);
        }, this.getSpeed() / 4);
    }
}

// Initialize
const visualizer = new StockProfitVisualizer();

window.onload = () => {
    visualizer.bindControls();
    visualizer.init();

    // Bind random button
    document.getElementById("randomBtn").addEventListener("click", () => {
        visualizer.generateRandom();
    });
};
