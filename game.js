/**
 * Epic RNG Game - Main Game Logic
 * 
 * This JavaScript file implements the core functionality for an Epic RNG Game
 * featuring a clicker mechanism, rebirth system with 11 layers, and comprehensive
 * game mechanics.
 * 
 * Expected HTML elements:
 * - #click-button: Main RNG click button
 * - #score-display: Current score display
 * - #layer-display: Current rebirth layer display
 * - #rebirth-button: Button to trigger rebirth
 * - #rebirth-cost-display: Shows cost for next rebirth
 * - #achievements-list: Container for achievement displays
 * - #upgrades-container: Container for upgrade buttons
 * - #statistics: Container for game statistics
 */

class EpicRNGGame {
    constructor() {
        // Game state
        this.gameState = {
            score: 0,
            totalScore: 0,
            clickCount: 0,
            rebirthLayer: 0,
            rebirthCount: 0,
            multiplier: 1,
            clickPower: 1,
            achievements: [],
            upgrades: {},
            startTime: Date.now(),
            lastSave: Date.now()
        };

        // Rebirth layer configuration (11 layers)
        this.rebirthLayers = [
            { name: "Novice", cost: 1000, multiplier: 2, minRoll: 1, maxRoll: 10 },
            { name: "Apprentice", cost: 10000, multiplier: 3, minRoll: 5, maxRoll: 25 },
            { name: "Journeyman", cost: 100000, multiplier: 5, minRoll: 10, maxRoll: 50 },
            { name: "Expert", cost: 1000000, multiplier: 8, minRoll: 25, maxRoll: 100 },
            { name: "Master", cost: 10000000, multiplier: 12, minRoll: 50, maxRoll: 250 },
            { name: "Grandmaster", cost: 100000000, multiplier: 20, minRoll: 100, maxRoll: 500 },
            { name: "Legendary", cost: 1000000000, multiplier: 30, minRoll: 250, maxRoll: 1000 },
            { name: "Mythical", cost: 10000000000, multiplier: 50, minRoll: 500, maxRoll: 2500 },
            { name: "Divine", cost: 100000000000, multiplier: 80, minRoll: 1000, maxRoll: 5000 },
            { name: "Transcendent", cost: 1000000000000, multiplier: 120, minRoll: 2500, maxRoll: 10000 },
            { name: "Omnipotent", cost: 10000000000000, multiplier: 200, minRoll: 5000, maxRoll: 25000 }
        ];

        // Achievement definitions
        this.achievementDefinitions = [
            { id: "first_click", name: "First Steps", description: "Make your first click", requirement: () => this.gameState.clickCount >= 1 },
            { id: "hundred_clicks", name: "Getting Started", description: "Make 100 clicks", requirement: () => this.gameState.clickCount >= 100 },
            { id: "thousand_clicks", name: "Clicking Master", description: "Make 1,000 clicks", requirement: () => this.gameState.clickCount >= 1000 },
            { id: "first_rebirth", name: "New Beginning", description: "Perform your first rebirth", requirement: () => this.gameState.rebirthCount >= 1 },
            { id: "layer_5", name: "Halfway There", description: "Reach rebirth layer 5", requirement: () => this.gameState.rebirthLayer >= 5 },
            { id: "max_layer", name: "Ultimate Power", description: "Reach the maximum rebirth layer", requirement: () => this.gameState.rebirthLayer >= 10 },
            { id: "millionaire", name: "Millionaire", description: "Accumulate 1,000,000 total score", requirement: () => this.gameState.totalScore >= 1000000 },
            { id: "speed_demon", name: "Speed Demon", description: "Make 10 clicks in 1 second", requirement: () => this.checkSpeedClicking() }
        ];

        // Upgrade definitions
        this.upgradeDefinitions = {
            clickPower: [
                { level: 1, cost: 100, effect: 2, description: "Double click power" },
                { level: 2, cost: 500, effect: 3, description: "Triple click power" },
                { level: 3, cost: 2500, effect: 5, description: "5x click power" },
                { level: 4, cost: 12500, effect: 8, description: "8x click power" },
                { level: 5, cost: 62500, effect: 12, description: "12x click power" }
            ],
            autoClicker: [
                { level: 1, cost: 1000, effect: 1, description: "Auto-click once per second" },
                { level: 2, cost: 5000, effect: 2, description: "Auto-click twice per second" },
                { level: 3, cost: 25000, effect: 5, description: "Auto-click 5 times per second" }
            ],
            luckyChance: [
                { level: 1, cost: 2000, effect: 0.05, description: "5% chance for 10x roll" },
                { level: 2, cost: 10000, effect: 0.1, description: "10% chance for 10x roll" },
                { level: 3, cost: 50000, effect: 0.15, description: "15% chance for 10x roll" }
            ]
        };

        // Initialize upgrades
        this.gameState.upgrades = {
            clickPower: 0,
            autoClicker: 0,
            luckyChance: 0
        };

        // Click tracking for achievements
        this.recentClicks = [];

        // Auto-save interval
        this.autoSaveInterval = null;
        this.gameLoopInterval = null;

        this.init();
    }

    /**
     * Initialize the game
     */
    init() {
        this.loadGame();
        this.setupEventListeners();
        this.startGameLoop();
        this.startAutoSave();
        this.updateUI();
        console.log("Epic RNG Game initialized!");
    }

    /**
     * Setup event listeners for UI elements
     */
    setupEventListeners() {
        // Main click button
        const clickButton = document.getElementById('click-button');
        if (clickButton) {
            clickButton.addEventListener('click', () => this.performClick());
        }

        // Rebirth button
        const rebirthButton = document.getElementById('rebirth-button');
        if (rebirthButton) {
            rebirthButton.addEventListener('click', () => this.performRebirth());
        }

        // Setup upgrade buttons
        this.setupUpgradeButtons();

        // Auto-save when page is about to unload
        window.addEventListener('beforeunload', () => this.saveGame());
    }

    /**
     * Setup upgrade buttons
     */
    setupUpgradeButtons() {
        const upgradesContainer = document.getElementById('upgrades-container');
        if (!upgradesContainer) return;

        upgradesContainer.innerHTML = '';

        for (const [upgradeType, upgrades] of Object.entries(this.upgradeDefinitions)) {
            const currentLevel = this.gameState.upgrades[upgradeType];
            const nextUpgrade = upgrades[currentLevel];

            if (nextUpgrade) {
                const button = document.createElement('button');
                button.className = 'upgrade-button';
                button.innerHTML = `
                    <div class="upgrade-name">${this.formatUpgradeName(upgradeType)}</div>
                    <div class="upgrade-description">${nextUpgrade.description}</div>
                    <div class="upgrade-cost">Cost: ${this.formatNumber(nextUpgrade.cost)}</div>
                `;
                button.disabled = this.gameState.score < nextUpgrade.cost;
                button.addEventListener('click', () => this.purchaseUpgrade(upgradeType));
                upgradesContainer.appendChild(button);
            }
        }
    }

    /**
     * Format upgrade type name for display
     */
    formatUpgradeName(upgradeType) {
        const names = {
            clickPower: "Click Power",
            autoClicker: "Auto Clicker",
            luckyChance: "Lucky Chance"
        };
        return names[upgradeType] || upgradeType;
    }

    /**
     * Perform a click action
     */
    performClick() {
        const currentLayer = this.rebirthLayers[this.gameState.rebirthLayer] || this.rebirthLayers[0];
        
        // Calculate base roll range
        let minRoll = currentLayer.minRoll;
        let maxRoll = currentLayer.maxRoll;
        
        // Generate random number
        let roll = Math.floor(Math.random() * (maxRoll - minRoll + 1)) + minRoll;
        
        // Apply click power multiplier
        roll *= this.gameState.clickPower;
        
        // Apply rebirth multiplier
        roll *= this.gameState.multiplier;
        
        // Check for lucky roll
        if (this.checkLuckyRoll()) {
            roll *= 10;
            this.showFloatingText("LUCKY!", "lucky");
        }
        
        // Update game state
        this.gameState.score += roll;
        this.gameState.totalScore += roll;
        this.gameState.clickCount++;
        
        // Track recent clicks for achievements
        this.recentClicks.push(Date.now());
        this.recentClicks = this.recentClicks.filter(time => Date.now() - time < 1000);
        
        // Show floating text
        this.showFloatingText(`+${this.formatNumber(roll)}`, "score-gain");
        
        // Check achievements
        this.checkAchievements();
        
        // Update UI
        this.updateUI();
    }

    /**
     * Check if lucky roll occurs
     */
    checkLuckyRoll() {
        const luckyLevel = this.gameState.upgrades.luckyChance;
        const luckyChance = luckyLevel > 0 ? this.upgradeDefinitions.luckyChance[luckyLevel - 1].effect : 0;
        return Math.random() < luckyChance;
    }

    /**
     * Perform rebirth
     */
    performRebirth() {
        if (!this.canRebirth()) return;

        const nextLayer = this.gameState.rebirthLayer + 1;
        if (nextLayer >= this.rebirthLayers.length) return;

        // Reset game state but keep rebirth progress
        this.gameState.score = 0;
        this.gameState.rebirthLayer = nextLayer;
        this.gameState.rebirthCount++;
        
        // Calculate new multiplier
        this.gameState.multiplier = this.calculateTotalMultiplier();
        
        this.showFloatingText(`Rebirth to ${this.rebirthLayers[nextLayer].name}!`, "rebirth");
        this.updateUI();
        this.saveGame();
    }

    /**
     * Check if rebirth is possible
     */
    canRebirth() {
        const nextLayer = this.gameState.rebirthLayer + 1;
        if (nextLayer >= this.rebirthLayers.length) return false;
        
        const requiredScore = this.rebirthLayers[nextLayer].cost;
        return this.gameState.score >= requiredScore;
    }

    /**
     * Calculate total multiplier from all rebirth layers
     */
    calculateTotalMultiplier() {
        let multiplier = 1;
        for (let i = 0; i <= this.gameState.rebirthLayer; i++) {
            multiplier *= this.rebirthLayers[i].multiplier;
        }
        return multiplier;
    }

    /**
     * Purchase an upgrade
     */
    purchaseUpgrade(upgradeType) {
        const currentLevel = this.gameState.upgrades[upgradeType];
        const upgrade = this.upgradeDefinitions[upgradeType][currentLevel];
        
        if (!upgrade || this.gameState.score < upgrade.cost) return;
        
        this.gameState.score -= upgrade.cost;
        this.gameState.upgrades[upgradeType]++;
        
        // Apply upgrade effect
        if (upgradeType === 'clickPower') {
            this.gameState.clickPower = upgrade.effect;
        }
        
        this.showFloatingText(`Upgrade Purchased!`, "upgrade");
        this.updateUI();
        this.setupUpgradeButtons();
    }

    /**
     * Check and unlock achievements
     */
    checkAchievements() {
        for (const achievement of this.achievementDefinitions) {
            if (!this.gameState.achievements.includes(achievement.id) && achievement.requirement()) {
                this.gameState.achievements.push(achievement.id);
                this.showFloatingText(`Achievement: ${achievement.name}`, "achievement");
                console.log(`Achievement unlocked: ${achievement.name}`);
            }
        }
    }

    /**
     * Check speed clicking achievement
     */
    checkSpeedClicking() {
        return this.recentClicks.length >= 10;
    }

    /**
     * Update all UI elements
     */
    updateUI() {
        this.updateScoreDisplay();
        this.updateLayerDisplay();
        this.updateRebirthButton();
        this.updateAchievements();
        this.updateStatistics();
        this.setupUpgradeButtons();
    }

    /**
     * Update score display
     */
    updateScoreDisplay() {
        const scoreDisplay = document.getElementById('score-display');
        if (scoreDisplay) {
            scoreDisplay.textContent = this.formatNumber(this.gameState.score);
        }
    }

    /**
     * Update layer display
     */
    updateLayerDisplay() {
        const layerDisplay = document.getElementById('layer-display');
        if (layerDisplay) {
            const currentLayer = this.rebirthLayers[this.gameState.rebirthLayer];
            layerDisplay.textContent = `Layer ${this.gameState.rebirthLayer + 1}: ${currentLayer.name}`;
        }
    }

    /**
     * Update rebirth button
     */
    updateRebirthButton() {
        const rebirthButton = document.getElementById('rebirth-button');
        const rebirthCostDisplay = document.getElementById('rebirth-cost-display');
        
        if (!rebirthButton) return;
        
        const canRebirth = this.canRebirth();
        const nextLayer = this.gameState.rebirthLayer + 1;
        
        if (nextLayer >= this.rebirthLayers.length) {
            rebirthButton.textContent = "MAX LAYER REACHED";
            rebirthButton.disabled = true;
            if (rebirthCostDisplay) {
                rebirthCostDisplay.textContent = "You have reached the ultimate power!";
            }
        } else {
            const nextLayerData = this.rebirthLayers[nextLayer];
            rebirthButton.textContent = `Rebirth to ${nextLayerData.name}`;
            rebirthButton.disabled = !canRebirth;
            
            if (rebirthCostDisplay) {
                rebirthCostDisplay.textContent = `Cost: ${this.formatNumber(nextLayerData.cost)}`;
            }
        }
    }

    /**
     * Update achievements display
     */
    updateAchievements() {
        const achievementsList = document.getElementById('achievements-list');
        if (!achievementsList) return;
        
        achievementsList.innerHTML = '';
        
        for (const achievement of this.achievementDefinitions) {
            const isUnlocked = this.gameState.achievements.includes(achievement.id);
            const achievementElement = document.createElement('div');
            achievementElement.className = `achievement ${isUnlocked ? 'unlocked' : 'locked'}`;
            achievementElement.innerHTML = `
                <div class="achievement-name">${achievement.name}</div>
                <div class="achievement-description">${achievement.description}</div>
            `;
            achievementsList.appendChild(achievementElement);
        }
    }

    /**
     * Update statistics display
     */
    updateStatistics() {
        const statisticsContainer = document.getElementById('statistics');
        if (!statisticsContainer) return;
        
        const playTime = Math.floor((Date.now() - this.gameState.startTime) / 1000);
        const hours = Math.floor(playTime / 3600);
        const minutes = Math.floor((playTime % 3600) / 60);
        const seconds = playTime % 60;
        
        statisticsContainer.innerHTML = `
            <div class="stat">Total Score: ${this.formatNumber(this.gameState.totalScore)}</div>
            <div class="stat">Clicks: ${this.formatNumber(this.gameState.clickCount)}</div>
            <div class="stat">Rebirths: ${this.gameState.rebirthCount}</div>
            <div class="stat">Multiplier: ${this.formatNumber(this.gameState.multiplier)}x</div>
            <div class="stat">Play Time: ${hours}h ${minutes}m ${seconds}s</div>
            <div class="stat">Achievements: ${this.gameState.achievements.length}/${this.achievementDefinitions.length}</div>
        `;
    }

    /**
     * Show floating text animation
     */
    showFloatingText(text, type) {
        // This would typically create a floating text element
        // For now, we'll just log it
        console.log(`[${type.toUpperCase()}] ${text}`);
        
        // If there's a floating text container, create the animation
        const container = document.getElementById('floating-text-container');
        if (container) {
            const element = document.createElement('div');
            element.className = `floating-text ${type}`;
            element.textContent = text;
            element.style.left = Math.random() * 200 + 'px';
            container.appendChild(element);
            
            // Remove after animation
            setTimeout(() => {
                if (container.contains(element)) {
                    container.removeChild(element);
                }
            }, 2000);
        }
    }

    /**
     * Auto-clicker functionality
     */
    autoClick() {
        const autoClickerLevel = this.gameState.upgrades.autoClicker;
        if (autoClickerLevel > 0) {
            const clicksPerSecond = this.upgradeDefinitions.autoClicker[autoClickerLevel - 1].effect;
            for (let i = 0; i < clicksPerSecond; i++) {
                this.performClick();
            }
        }
    }

    /**
     * Game loop
     */
    gameLoop() {
        this.autoClick();
        this.updateUI();
    }

    /**
     * Start the game loop
     */
    startGameLoop() {
        this.gameLoopInterval = setInterval(() => this.gameLoop(), 1000);
    }

    /**
     * Start auto-save
     */
    startAutoSave() {
        this.autoSaveInterval = setInterval(() => this.saveGame(), 30000); // Save every 30 seconds
    }

    /**
     * Save game to localStorage
     */
    saveGame() {
        try {
            this.gameState.lastSave = Date.now();
            localStorage.setItem('epicRNGGameSave', JSON.stringify(this.gameState));
            console.log('Game saved successfully');
        } catch (error) {
            console.error('Failed to save game:', error);
        }
    }

    /**
     * Load game from localStorage
     */
    loadGame() {
        try {
            const savedGame = localStorage.getItem('epicRNGGameSave');
            if (savedGame) {
                const loadedState = JSON.parse(savedGame);
                
                // Merge loaded state with default state to handle new properties
                this.gameState = { ...this.gameState, ...loadedState };
                
                // Recalculate multiplier in case the formula changed
                this.gameState.multiplier = this.calculateTotalMultiplier();
                
                console.log('Game loaded successfully');
            }
        } catch (error) {
            console.error('Failed to load game:', error);
        }
    }

    /**
     * Reset game data
     */
    resetGame() {
        if (confirm('Are you sure you want to reset all progress? This cannot be undone!')) {
            localStorage.removeItem('epicRNGGameSave');
            location.reload();
        }
    }

    /**
     * Export save data
     */
    exportSave() {
        const saveData = btoa(JSON.stringify(this.gameState));
        const element = document.createElement('a');
        element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(saveData));
        element.setAttribute('download', 'epic-rng-save.txt');
        element.style.display = 'none';
        document.body.appendChild(element);
        element.click();
        document.body.removeChild(element);
    }

    /**
     * Import save data
     */
    importSave(saveData) {
        try {
            const decodedData = JSON.parse(atob(saveData));
            this.gameState = { ...this.gameState, ...decodedData };
            this.gameState.multiplier = this.calculateTotalMultiplier();
            this.updateUI();
            this.saveGame();
            alert('Save imported successfully!');
        } catch (error) {
            alert('Invalid save data!');
            console.error('Failed to import save:', error);
        }
    }

    /**
     * Format numbers for display
     */
    formatNumber(num) {
        if (num < 1000) return num.toString();
        
        const suffixes = ['', 'K', 'M', 'B', 'T', 'Qa', 'Qi', 'Sx', 'Sp', 'Oc', 'No'];
        const magnitude = Math.floor(Math.log10(num) / 3);
        
        if (magnitude >= suffixes.length) {
            return num.toExponential(2);
        }
        
        const scaled = num / Math.pow(1000, magnitude);
        return scaled.toFixed(2) + suffixes[magnitude];
    }

    /**
     * Get game statistics for debugging or API
     */
    getGameStats() {
        return {
            ...this.gameState,
            currentLayer: this.rebirthLayers[this.gameState.rebirthLayer],
            nextLayer: this.rebirthLayers[this.gameState.rebirthLayer + 1] || null,
            canRebirth: this.canRebirth(),
            playTime: Date.now() - this.gameState.startTime
        };
    }
}

// Global game instance
let game;

// Initialize game when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    game = new EpicRNGGame();
    
    // Expose game to window for debugging
    window.game = game;
});

// Expose useful functions to global scope
window.resetGame = () => game && game.resetGame();
window.exportSave = () => game && game.exportSave();
window.importSave = (data) => game && game.importSave(data);