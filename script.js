// Epic RNG Game JavaScript

class EpicRNGGame {
    constructor() {
        // Game state
        this.gameState = {
            points: 0,
            rebirths: 0,
            multiplier: 1,
            baseMultiplier: 1,
            rebirthMultiplier: 1,
            prestigeMultiplier: 1,
            minRange: 1,
            maxRange: 10,
            autoClickerOwned: false,
            autoClickerInterval: null,
            
            // Upgrade costs and levels
            upgrades: {
                multiplier: { cost: 10, level: 0, baseCost: 10 },
                range: { cost: 25, level: 0, baseCost: 25 },
                auto: { cost: 100, level: 0, baseCost: 100 }
            },
            
            // Rebirth system
            rebirth: {
                requirement: 1000,
                bonus: 0.1,
                baseRequirement: 1000
            },
            
            // Prestige system
            prestige: {
                level: 0,
                requirement: 10
            },
            
            // Achievements
            achievements: [
                { id: 'first_click', name: 'First Click!', description: 'Click the RNG button for the first time', unlocked: false },
                { id: 'hundred_points', name: 'Century', description: 'Reach 100 points', unlocked: false },
                { id: 'first_rebirth', name: 'Born Again', description: 'Perform your first rebirth', unlocked: false },
                { id: 'thousand_points', name: 'Millennium', description: 'Reach 1000 points', unlocked: false },
                { id: 'auto_clicker', name: 'Automation', description: 'Buy the auto clicker', unlocked: false }
            ]
        };
        
        // Initialize the game
        this.init();
        this.loadGame();
        this.updateDisplay();
        this.checkUpgradeAvailability();
        this.checkRebirthAvailability();
        this.checkPrestigeAvailability();
    }
    
    init() {
        // Get DOM elements
        this.elements = {
            points: document.getElementById('points'),
            rebirths: document.getElementById('rebirths'),
            multiplier: document.getElementById('multiplier'),
            rngButton: document.getElementById('rng-button'),
            rngResult: document.getElementById('rng-result'),
            minRange: document.getElementById('min-range'),
            maxRange: document.getElementById('max-range'),
            
            // Upgrade elements
            multiplierCost: document.getElementById('multiplier-cost'),
            rangeCost: document.getElementById('range-cost'),
            autoCost: document.getElementById('auto-cost'),
            buyMultiplier: document.getElementById('buy-multiplier'),
            buyRange: document.getElementById('buy-range'),
            buyAuto: document.getElementById('buy-auto'),
            
            // Rebirth elements
            rebirthButton: document.getElementById('rebirth-button'),
            rebirthBonus: document.getElementById('rebirth-bonus'),
            rebirthRequirement: document.getElementById('rebirth-requirement'),
            
            // Prestige elements
            prestigeButton: document.getElementById('prestige-1-button'),
            prestigeRequirement: document.getElementById('prestige-1-req'),
            
            // Achievement element
            latestAchievement: document.getElementById('latest-achievement')
        };
        
        // Add event listeners
        this.elements.rngButton.addEventListener('click', () => this.clickRNG());
        this.elements.buyMultiplier.addEventListener('click', () => this.buyUpgrade('multiplier'));
        this.elements.buyRange.addEventListener('click', () => this.buyUpgrade('range'));
        this.elements.buyAuto.addEventListener('click', () => this.buyUpgrade('auto'));
        this.elements.rebirthButton.addEventListener('click', () => this.performRebirth());
        this.elements.prestigeButton.addEventListener('click', () => this.performPrestige());
        
        // Auto-save every 10 seconds
        setInterval(() => this.saveGame(), 10000);
        
        // Auto-click interval (if owned)
        if (this.gameState.autoClickerOwned) {
            this.startAutoClicker();
        }
    }
    
    clickRNG() {
        // Generate random number in range
        const randomValue = Math.floor(Math.random() * (this.gameState.maxRange - this.gameState.minRange + 1)) + this.gameState.minRange;
        const totalMultiplier = this.gameState.multiplier * this.gameState.rebirthMultiplier * this.gameState.prestigeMultiplier;
        const pointsGained = Math.floor(randomValue * totalMultiplier);
        
        // Add points
        this.gameState.points += pointsGained;
        
        // Show result with animation
        this.showRNGResult(pointsGained);
        
        // Add click animation
        this.elements.rngButton.classList.add('clicked');
        setTimeout(() => this.elements.rngButton.classList.remove('clicked'), 500);
        
        // Check achievements
        this.checkAchievements();
        
        // Update display
        this.updateDisplay();
        this.checkUpgradeAvailability();
        this.checkRebirthAvailability();
        this.checkPrestigeAvailability();
    }
    
    showRNGResult(points) {
        this.elements.rngResult.textContent = `+${points}`;
        this.elements.rngResult.classList.add('show');
        
        setTimeout(() => {
            this.elements.rngResult.classList.remove('show');
        }, 1000);
    }
    
    buyUpgrade(type) {
        const upgrade = this.gameState.upgrades[type];
        
        if (this.gameState.points >= upgrade.cost) {
            this.gameState.points -= upgrade.cost;
            upgrade.level++;
            
            switch (type) {
                case 'multiplier':
                    this.gameState.multiplier += 0.5;
                    upgrade.cost = Math.floor(upgrade.baseCost * Math.pow(1.5, upgrade.level));
                    break;
                    
                case 'range':
                    this.gameState.maxRange += 5;
                    upgrade.cost = Math.floor(upgrade.baseCost * Math.pow(1.8, upgrade.level));
                    break;
                    
                case 'auto':
                    if (!this.gameState.autoClickerOwned) {
                        this.gameState.autoClickerOwned = true;
                        this.startAutoClicker();
                        this.unlockAchievement('auto_clicker');
                    }
                    upgrade.cost = Math.floor(upgrade.baseCost * Math.pow(2, upgrade.level));
                    break;
            }
            
            this.updateDisplay();
            this.checkUpgradeAvailability();
        }
    }
    
    startAutoClicker() {
        if (this.gameState.autoClickerInterval) {
            clearInterval(this.gameState.autoClickerInterval);
        }
        
        this.gameState.autoClickerInterval = setInterval(() => {
            this.clickRNG();
        }, 1000); // Auto-click every second
    }
    
    performRebirth() {
        if (this.gameState.points >= this.gameState.rebirth.requirement) {
            // Reset points and upgrades
            this.gameState.points = 0;
            this.gameState.multiplier = 1;
            this.gameState.minRange = 1;
            this.gameState.maxRange = 10;
            this.gameState.autoClickerOwned = false;
            
            if (this.gameState.autoClickerInterval) {
                clearInterval(this.gameState.autoClickerInterval);
                this.gameState.autoClickerInterval = null;
            }
            
            // Reset upgrade costs
            Object.keys(this.gameState.upgrades).forEach(key => {
                const upgrade = this.gameState.upgrades[key];
                upgrade.cost = upgrade.baseCost;
                upgrade.level = 0;
            });
            
            // Increase rebirth count and multiplier
            this.gameState.rebirths++;
            this.gameState.rebirthMultiplier += this.gameState.rebirth.bonus;
            
            // Increase rebirth requirement
            this.gameState.rebirth.requirement = Math.floor(this.gameState.rebirth.baseRequirement * Math.pow(2, this.gameState.rebirths));
            
            // Check for first rebirth achievement
            if (this.gameState.rebirths === 1) {
                this.unlockAchievement('first_rebirth');
            }
            
            this.updateDisplay();
            this.checkUpgradeAvailability();
            this.checkRebirthAvailability();
            this.checkPrestigeAvailability();
        }
    }
    
    performPrestige() {
        if (this.gameState.rebirths >= this.gameState.prestige.requirement) {
            // Reset everything
            this.gameState.points = 0;
            this.gameState.rebirths = 0;
            this.gameState.multiplier = 1;
            this.gameState.rebirthMultiplier = 1;
            this.gameState.minRange = 1;
            this.gameState.maxRange = 10;
            this.gameState.autoClickerOwned = false;
            
            if (this.gameState.autoClickerInterval) {
                clearInterval(this.gameState.autoClickerInterval);
                this.gameState.autoClickerInterval = null;
            }
            
            // Reset upgrade costs
            Object.keys(this.gameState.upgrades).forEach(key => {
                const upgrade = this.gameState.upgrades[key];
                upgrade.cost = upgrade.baseCost;
                upgrade.level = 0;
            });
            
            // Reset rebirth requirement
            this.gameState.rebirth.requirement = this.gameState.rebirth.baseRequirement;
            
            // Increase prestige
            this.gameState.prestige.level++;
            this.gameState.prestigeMultiplier += 1; // +1x multiplier per prestige
            this.gameState.prestige.requirement += 5; // Increase requirement
            
            this.updateDisplay();
            this.checkUpgradeAvailability();
            this.checkRebirthAvailability();
            this.checkPrestigeAvailability();
        }
    }
    
    checkAchievements() {
        const achievements = this.gameState.achievements;
        
        // First click
        if (!achievements.find(a => a.id === 'first_click').unlocked) {
            this.unlockAchievement('first_click');
        }
        
        // Hundred points
        if (this.gameState.points >= 100 && !achievements.find(a => a.id === 'hundred_points').unlocked) {
            this.unlockAchievement('hundred_points');
        }
        
        // Thousand points
        if (this.gameState.points >= 1000 && !achievements.find(a => a.id === 'thousand_points').unlocked) {
            this.unlockAchievement('thousand_points');
        }
    }
    
    unlockAchievement(achievementId) {
        const achievement = this.gameState.achievements.find(a => a.id === achievementId);
        if (achievement && !achievement.unlocked) {
            achievement.unlocked = true;
            this.elements.latestAchievement.textContent = `🏆 ${achievement.name}: ${achievement.description}`;
            this.elements.latestAchievement.parentElement.classList.add('glow');
            
            setTimeout(() => {
                this.elements.latestAchievement.parentElement.classList.remove('glow');
            }, 3000);
        }
    }
    
    updateDisplay() {
        // Update main stats
        this.elements.points.textContent = this.formatNumber(this.gameState.points);
        this.elements.rebirths.textContent = this.gameState.rebirths;
        this.elements.multiplier.textContent = `${(this.gameState.multiplier * this.gameState.rebirthMultiplier * this.gameState.prestigeMultiplier).toFixed(1)}x`;
        
        // Update RNG range
        this.elements.minRange.textContent = this.gameState.minRange;
        this.elements.maxRange.textContent = this.gameState.maxRange;
        
        // Update upgrade costs
        this.elements.multiplierCost.textContent = this.formatNumber(this.gameState.upgrades.multiplier.cost);
        this.elements.rangeCost.textContent = this.formatNumber(this.gameState.upgrades.range.cost);
        this.elements.autoCost.textContent = this.formatNumber(this.gameState.upgrades.auto.cost);
        
        // Update rebirth info
        this.elements.rebirthBonus.textContent = this.gameState.rebirth.bonus.toFixed(1);
        this.elements.rebirthRequirement.textContent = this.formatNumber(this.gameState.rebirth.requirement);
        
        // Update prestige info
        this.elements.prestigeRequirement.textContent = this.gameState.prestige.requirement;
    }
    
    checkUpgradeAvailability() {
        this.elements.buyMultiplier.disabled = this.gameState.points < this.gameState.upgrades.multiplier.cost;
        this.elements.buyRange.disabled = this.gameState.points < this.gameState.upgrades.range.cost;
        this.elements.buyAuto.disabled = this.gameState.points < this.gameState.upgrades.auto.cost;
    }
    
    checkRebirthAvailability() {
        this.elements.rebirthButton.disabled = this.gameState.points < this.gameState.rebirth.requirement;
    }
    
    checkPrestigeAvailability() {
        this.elements.prestigeButton.disabled = this.gameState.rebirths < this.gameState.prestige.requirement;
    }
    
    formatNumber(num) {
        if (num >= 1000000) {
            return (num / 1000000).toFixed(1) + 'M';
        } else if (num >= 1000) {
            return (num / 1000).toFixed(1) + 'K';
        }
        return num.toString();
    }
    
    saveGame() {
        const saveData = {
            ...this.gameState,
            autoClickerInterval: null // Don't save interval reference
        };
        localStorage.setItem('epicRNGGame', JSON.stringify(saveData));
    }
    
    loadGame() {
        const savedData = localStorage.getItem('epicRNGGame');
        if (savedData) {
            try {
                const gameData = JSON.parse(savedData);
                this.gameState = { ...this.gameState, ...gameData };
                
                // Restart auto-clicker if owned
                if (this.gameState.autoClickerOwned) {
                    this.startAutoClicker();
                }
            } catch (error) {
                console.log('Failed to load game data:', error);
            }
        }
    }
    
    resetGame() {
        localStorage.removeItem('epicRNGGame');
        location.reload();
    }
}

// Initialize the game when the page loads
document.addEventListener('DOMContentLoaded', () => {
    window.game = new EpicRNGGame();
});

// Add keyboard shortcuts
document.addEventListener('keydown', (event) => {
    if (event.code === 'Space') {
        event.preventDefault();
        if (window.game) {
            window.game.clickRNG();
        }
    }
});