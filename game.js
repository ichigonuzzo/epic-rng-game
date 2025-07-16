// Epic RNG Game - Core Game Logic

class EpicRNGGame {
    constructor() {
        this.gameState = {
            points: 0,
            currentLayer: 1,
            layerProgress: 0,
            multiplier: 1,
            autoRollEnabled: false,
            autoRollInterval: null,
            combo: 0,
            streak: 0,
            totalRolls: 0,
            goodRolls: 0,
            criticalHits: 0,
            achievements: [],
            unlockedFeatures: []
        };

        this.layers = [
            {
                id: 1,
                name: "Novice",
                description: "Learn the basics of rolling dice",
                requirement: 100,
                multiplier: 1,
                range: [1, 6],
                features: ["Basic clicking", "Simple upgrades"],
                unlocks: []
            },
            {
                id: 2,
                name: "Apprentice", 
                description: "Automation begins to help your journey",
                requirement: 500,
                multiplier: 2,
                range: [1, 10],
                features: ["Auto-clicker upgrades"],
                unlocks: ["auto-roll"]
            },
            {
                id: 3,
                name: "Journeyman",
                description: "Lucky rolls and combos enhance your power",
                requirement: 2000,
                multiplier: 4,
                range: [1, 15],
                features: ["Lucky rolls", "Combo system"],
                unlocks: ["combo-system", "lucky-rolls"]
            },
            {
                id: 4,
                name: "Expert",
                description: "Critical hits multiply your success",
                requirement: 8000,
                multiplier: 8,
                range: [1, 20],
                features: ["Critical hits (2x-5x multiplier)"],
                unlocks: ["critical-hits"]
            },
            {
                id: 5,
                name: "Master",
                description: "Consistency rewards streaks of greatness",
                requirement: 25000,
                multiplier: 16,
                range: [1, 30],
                features: ["Streak bonuses"],
                unlocks: ["streak-bonuses"]
            },
            {
                id: 6,
                name: "Grandmaster",
                description: "Multiple dice roll with each click",
                requirement: 75000,
                multiplier: 32,
                range: [1, 40],
                features: ["Multi-roll system"],
                unlocks: ["multi-roll"]
            },
            {
                id: 7,
                name: "Legendary",
                description: "Prestige currency flows like a river",
                requirement: 200000,
                multiplier: 64,
                range: [1, 60],
                features: ["Prestige currency generation"],
                unlocks: ["prestige-currency"]
            },
            {
                id: 8,
                name: "Mythical",
                description: "Challenges test your ultimate skill",
                requirement: 500000,
                multiplier: 128,
                range: [1, 80],
                features: ["Challenge modes"],
                unlocks: ["challenge-modes"]
            },
            {
                id: 9,
                name: "Divine",
                description: "Transcend mortal limitations",
                requirement: 1500000,
                multiplier: 256,
                range: [1, 100],
                features: ["Transcendence mechanics"],
                unlocks: ["transcendence"]
            },
            {
                id: 10,
                name: "Transcendent",
                description: "Reality bends to your will",
                requirement: 5000000,
                multiplier: 512,
                range: [1, 150],
                features: ["Reality warping"],
                unlocks: ["reality-warp"]
            },
            {
                id: 11,
                name: "Omnipotent",
                description: "Infinity is just the beginning",
                requirement: 20000000,
                multiplier: 1024,
                range: [1, 200],
                features: ["Infinity progression"],
                unlocks: ["infinity-mode"]
            }
        ];

        this.currentEvent = null;
        this.eventTimer = null;

        this.init();
    }

    init() {
        this.updateDisplay();
        this.setupEventListeners();
        this.renderLayers();
        this.renderUpgrades();
        
        // Start auto-save every 30 seconds
        setInterval(() => this.autoSave(), 30000);
        
        // Start random events
        this.startRandomEvents();
    }

    setupEventListeners() {
        // Roll button
        document.getElementById('roll-btn').addEventListener('click', () => this.roll());
        
        // Auto roll toggle
        document.getElementById('auto-roll-btn').addEventListener('click', () => this.toggleAutoRoll());
        
        // Risk roll
        document.getElementById('risk-roll-btn').addEventListener('click', () => this.riskRoll());
        
        // Rebirth button
        document.getElementById('rebirth-btn').addEventListener('click', () => this.rebirth());
        
        // Save/Load buttons
        document.getElementById('save-btn').addEventListener('click', () => this.saveGame());
        document.getElementById('load-btn').addEventListener('click', () => this.loadGame());
        document.getElementById('reset-btn').addEventListener('click', () => this.resetGame());
    }

    roll(isRisk = false) {
        const currentLayerData = this.layers[this.gameState.currentLayer - 1];
        const rollResult = this.performRoll(currentLayerData, isRisk);
        
        this.gameState.totalRolls++;
        this.animateDice();
        
        // Update display after animation
        setTimeout(() => {
            this.displayRollResult(rollResult);
            this.updateProgress(rollResult);
            this.checkAchievements();
            this.updateDisplay();
        }, 500);
    }

    performRoll(layerData, isRisk = false) {
        const [min, max] = layerData.range;
        let baseRoll = Math.floor(Math.random() * (max - min + 1)) + min;
        let points = baseRoll * this.gameState.multiplier;
        let rollType = "normal";
        let multiplierBonus = 1;

        // Apply risk multiplier
        if (isRisk) {
            if (Math.random() < 0.3) { // 30% chance for risk to fail
                points = Math.floor(points * 0.1); // Only 10% points on failure
                rollType = "risk-fail";
            } else {
                points *= 2; // Double points on success
                rollType = "risk-success";
            }
        }

        // Critical hits (Expert layer and above)
        if (this.gameState.currentLayer >= 4 && Math.random() < 0.15) {
            const critMultiplier = 2 + Math.random() * 3; // 2x to 5x
            points *= critMultiplier;
            rollType = "critical";
            multiplierBonus = critMultiplier;
            this.gameState.criticalHits++;
        }

        // Super rolls (rare)
        if (this.gameState.currentLayer >= 6 && Math.random() < 0.05) {
            points *= 10;
            rollType = "super";
            multiplierBonus = 10;
        }

        // Divine rolls (very rare)
        if (this.gameState.currentLayer >= 9 && Math.random() < 0.01) {
            points *= 50;
            rollType = "divine";
            multiplierBonus = 50;
        }

        // Combo system (Journeyman layer and above)
        if (this.gameState.currentLayer >= 3) {
            if (baseRoll >= max * 0.7) { // Good roll (top 30%)
                this.gameState.combo++;
                this.gameState.goodRolls++;
                points *= (1 + this.gameState.combo * 0.1); // 10% bonus per combo
            } else if (baseRoll < max * 0.3) { // Bad roll (bottom 30%)
                this.gameState.combo = 0;
            }
        }

        // Streak bonuses (Master layer and above)
        if (this.gameState.currentLayer >= 5) {
            if (baseRoll >= max * 0.6) { // Decent roll
                this.gameState.streak++;
                points *= (1 + this.gameState.streak * 0.05); // 5% bonus per streak
            } else {
                this.gameState.streak = 0;
            }
        }

        // Apply event bonuses
        if (this.currentEvent && this.currentEvent.type === 'lucky-streak') {
            points *= 2;
        }

        return {
            baseRoll,
            finalPoints: Math.floor(points),
            rollType,
            multiplierBonus
        };
    }

    animateDice() {
        const dice = document.getElementById('dice');
        dice.classList.add('rolling');
        setTimeout(() => dice.classList.remove('rolling'), 500);
    }

    displayRollResult(result) {
        const resultElement = document.getElementById('roll-result');
        const typeElement = document.getElementById('roll-type');
        
        resultElement.textContent = `Rolled ${result.baseRoll} → ${result.finalPoints.toLocaleString()} points!`;
        
        let typeText = "";
        let typeClass = "roll-normal";
        
        switch (result.rollType) {
            case "critical":
                typeText = `CRITICAL HIT! (${result.multiplierBonus.toFixed(1)}x)`;
                typeClass = "roll-critical";
                break;
            case "super":
                typeText = "SUPER ROLL! (10x)";
                typeClass = "roll-super";
                break;
            case "divine":
                typeText = "DIVINE ROLL! (50x)";
                typeClass = "roll-divine";
                break;
            case "risk-success":
                typeText = "RISK SUCCESS! (2x)";
                typeClass = "roll-critical";
                break;
            case "risk-fail":
                typeText = "RISK FAILED! (0.1x)";
                typeClass = "roll-normal";
                break;
        }
        
        typeElement.textContent = typeText;
        typeElement.className = typeClass;
        
        // Add pulse animation
        resultElement.classList.add('pulse');
        setTimeout(() => resultElement.classList.remove('pulse'), 500);
    }

    updateProgress(rollResult) {
        this.gameState.points += rollResult.finalPoints;
        
        const currentLayerData = this.layers[this.gameState.currentLayer - 1];
        if (currentLayerData) {
            this.gameState.layerProgress = Math.min(
                this.gameState.points, 
                currentLayerData.requirement
            );
        }
    }

    toggleAutoRoll() {
        if (this.gameState.currentLayer < 2) return; // Unlocked at Apprentice layer
        
        this.gameState.autoRollEnabled = !this.gameState.autoRollEnabled;
        const btn = document.getElementById('auto-roll-btn');
        
        if (this.gameState.autoRollEnabled) {
            btn.textContent = "Auto Roll: ON";
            btn.classList.add('active');
            this.gameState.autoRollInterval = setInterval(() => this.roll(), 1000);
        } else {
            btn.textContent = "Auto Roll: OFF";
            btn.classList.remove('active');
            if (this.gameState.autoRollInterval) {
                clearInterval(this.gameState.autoRollInterval);
                this.gameState.autoRollInterval = null;
            }
        }
    }

    riskRoll() {
        if (this.gameState.currentLayer < 3) return; // Unlocked at Journeyman layer
        this.roll(true);
    }

    rebirth() {
        if (this.gameState.currentLayer >= 11) return; // Max layer reached
        
        const currentLayerData = this.layers[this.gameState.currentLayer - 1];
        if (this.gameState.points < currentLayerData.requirement) return;
        
        // Reset progress but keep upgrades and achievements
        this.gameState.points = 0;
        this.gameState.layerProgress = 0;
        this.gameState.currentLayer++;
        this.gameState.multiplier = this.layers[this.gameState.currentLayer - 1].multiplier;
        this.gameState.combo = 0;
        this.gameState.streak = 0;
        
        // Unlock new features
        const newLayer = this.layers[this.gameState.currentLayer - 1];
        newLayer.unlocks.forEach(unlock => {
            if (!this.gameState.unlockedFeatures.includes(unlock)) {
                this.gameState.unlockedFeatures.push(unlock);
            }
        });
        
        this.updateDisplay();
        this.renderUpgrades();
        this.showUnlockedFeatures();
    }

    showUnlockedFeatures() {
        const featuresElement = document.getElementById('unlocked-features');
        const currentLayerData = this.layers[this.gameState.currentLayer - 1];
        
        featuresElement.innerHTML = `
            <h4>Unlocked in ${currentLayerData.name}:</h4>
            <ul>
                ${currentLayerData.features.map(feature => `<li>${feature}</li>`).join('')}
            </ul>
        `;
        featuresElement.classList.add('fade-in');
    }

    startRandomEvents() {
        const triggerEvent = () => {
            if (this.gameState.currentLayer >= 3 && Math.random() < 0.1) {
                this.triggerRandomEvent();
            }
            
            // Schedule next check
            setTimeout(triggerEvent, 10000 + Math.random() * 20000); // 10-30 seconds
        };
        
        triggerEvent();
    }

    triggerRandomEvent() {
        const events = [
            {
                type: 'lucky-streak',
                name: 'Lucky Streak',
                description: 'All rolls give 2x points for 30 seconds!',
                duration: 30000
            },
            {
                type: 'bonus-points',
                name: 'Point Shower',
                description: 'Instant bonus points!',
                duration: 0,
                bonus: this.gameState.points * 0.1
            },
            {
                type: 'combo-boost',
                name: 'Combo Mastery',
                description: 'Your combo counter increases by 5!',
                duration: 0
            }
        ];
        
        const event = events[Math.floor(Math.random() * events.length)];
        this.currentEvent = event;
        
        const eventsSection = document.getElementById('events-section');
        const eventDisplay = document.getElementById('event-display');
        
        eventDisplay.innerHTML = `
            <h3>${event.name}</h3>
            <p>${event.description}</p>
        `;
        
        eventsSection.style.display = 'block';
        eventsSection.classList.add('fade-in');
        
        // Apply event effects
        switch (event.type) {
            case 'bonus-points':
                this.gameState.points += Math.floor(event.bonus);
                break;
            case 'combo-boost':
                this.gameState.combo += 5;
                break;
        }
        
        // Hide event after duration
        if (event.duration > 0) {
            setTimeout(() => {
                this.currentEvent = null;
                eventsSection.style.display = 'none';
            }, event.duration);
        } else {
            setTimeout(() => {
                eventsSection.style.display = 'none';
            }, 5000);
        }
        
        this.updateDisplay();
    }

    updateDisplay() {
        // Update stats bar
        document.getElementById('points').textContent = this.gameState.points.toLocaleString();
        
        const currentLayerData = this.layers[this.gameState.currentLayer - 1];
        document.getElementById('current-layer').textContent = 
            `${currentLayerData.name} (${this.gameState.currentLayer})`;
        document.getElementById('multiplier').textContent = `${this.gameState.multiplier}x`;
        
        // Update layer progress
        const progressPercentage = (this.gameState.layerProgress / currentLayerData.requirement) * 100;
        document.getElementById('layer-progress-fill').style.width = `${progressPercentage}%`;
        
        document.getElementById('layer-description').textContent = currentLayerData.description;
        document.getElementById('layer-requirements').textContent = 
            `Requirement: ${this.gameState.layerProgress.toLocaleString()} / ${currentLayerData.requirement.toLocaleString()} points`;
        
        // Show/hide rebirth button
        const rebirthBtn = document.getElementById('rebirth-btn');
        if (this.gameState.points >= currentLayerData.requirement && this.gameState.currentLayer < 11) {
            rebirthBtn.style.display = 'block';
        } else {
            rebirthBtn.style.display = 'none';
        }
        
        // Update combo and streak displays
        if (this.gameState.currentLayer >= 3) {
            document.getElementById('combo-counter').style.display = 'block';
            document.getElementById('combo-value').textContent = this.gameState.combo;
        }
        
        if (this.gameState.currentLayer >= 5) {
            document.getElementById('streak-counter').style.display = 'block';
            document.getElementById('streak-value').textContent = this.gameState.streak;
        }
        
        // Show/hide feature buttons
        this.updateFeatureButtons();
    }

    updateFeatureButtons() {
        // Auto roll button
        const autoRollBtn = document.getElementById('auto-roll-btn');
        if (this.gameState.currentLayer >= 2) {
            autoRollBtn.style.display = 'inline-block';
        }
        
        // Risk roll button  
        const riskRollBtn = document.getElementById('risk-roll-btn');
        if (this.gameState.currentLayer >= 3) {
            riskRollBtn.style.display = 'inline-block';
        }
    }

    renderLayers() {
        const container = document.getElementById('layers-container');
        container.innerHTML = '';
        
        this.layers.forEach(layer => {
            const layerElement = document.createElement('div');
            layerElement.className = 'layer-item';
            
            if (layer.id === this.gameState.currentLayer) {
                layerElement.classList.add('current');
            } else if (layer.id < this.gameState.currentLayer) {
                layerElement.classList.add('unlocked');
            } else {
                layerElement.classList.add('locked');
            }
            
            layerElement.innerHTML = `
                <div class="layer-name">${layer.name} (${layer.id})</div>
                <div class="layer-bonus">${layer.multiplier}x multiplier</div>
                <div class="layer-bonus">Range: ${layer.range[0]}-${layer.range[1]}</div>
            `;
            
            container.appendChild(layerElement);
        });
    }

    renderUpgrades() {
        // This will be implemented in upgrades.js
        if (window.upgradeSystem) {
            window.upgradeSystem.render();
        }
    }

    checkAchievements() {
        // Basic achievement system
        const achievements = [
            { id: 'first-roll', name: 'First Roll', condition: () => this.gameState.totalRolls >= 1 },
            { id: 'hundred-rolls', name: 'Century', condition: () => this.gameState.totalRolls >= 100 },
            { id: 'first-critical', name: 'Critical Hit', condition: () => this.gameState.criticalHits >= 1 },
            { id: 'apprentice', name: 'Apprentice', condition: () => this.gameState.currentLayer >= 2 },
            { id: 'expert', name: 'Expert', condition: () => this.gameState.currentLayer >= 4 },
            { id: 'master', name: 'Master', condition: () => this.gameState.currentLayer >= 5 }
        ];
        
        achievements.forEach(achievement => {
            if (!this.gameState.achievements.includes(achievement.id) && achievement.condition()) {
                this.gameState.achievements.push(achievement.id);
                this.showAchievement(achievement);
            }
        });
    }

    showAchievement(achievement) {
        // Simple achievement notification
        console.log(`Achievement unlocked: ${achievement.name}`);
    }

    autoSave() {
        this.saveGame(true);
    }

    saveGame(isAuto = false) {
        try {
            localStorage.setItem('epicRngGameSave', JSON.stringify(this.gameState));
            if (!isAuto) {
                alert('Game saved successfully!');
            }
        } catch (error) {
            console.error('Failed to save game:', error);
            if (!isAuto) {
                alert('Failed to save game!');
            }
        }
    }

    loadGame() {
        try {
            const saveData = localStorage.getItem('epicRngGameSave');
            if (saveData) {
                this.gameState = { ...this.gameState, ...JSON.parse(saveData) };
                this.updateDisplay();
                this.renderLayers();
                this.renderUpgrades();
                alert('Game loaded successfully!');
            } else {
                alert('No save data found!');
            }
        } catch (error) {
            console.error('Failed to load game:', error);
            alert('Failed to load game!');
        }
    }

    resetGame() {
        if (confirm('Are you sure you want to reset all progress? This cannot be undone!')) {
            localStorage.removeItem('epicRngGameSave');
            location.reload();
        }
    }
}

// Initialize game when page loads
document.addEventListener('DOMContentLoaded', () => {
    window.game = new EpicRNGGame();
});