// Epic RNG Game JavaScript - Basic functionality for CSS demonstration

class EpicRNGGame {
    constructor() {
        this.points = 0;
        this.level = 1;
        this.rebirths = 0;
        this.multiplier = 1;
        this.autoRoller = false;
        this.upgrades = {
            click: 0,
            auto: false,
            luck: 0
        };
        
        this.init();
    }
    
    init() {
        this.bindEvents();
        this.updateDisplay();
        this.startAutoRoller();
    }
    
    bindEvents() {
        const rngButton = document.getElementById('rng-button');
        const upgradeButtons = document.querySelectorAll('.upgrade-button');
        const rebirthButtons = document.querySelectorAll('.rebirth-button');
        
        rngButton.addEventListener('click', () => this.roll());
        
        upgradeButtons.forEach((button, index) => {
            button.addEventListener('click', () => this.buyUpgrade(index));
        });
        
        rebirthButtons.forEach((button, index) => {
            button.addEventListener('click', () => this.rebirth(index));
        });
    }
    
    roll() {
        // Generate random number between 1-100, modified by luck
        const baseRoll = Math.floor(Math.random() * 100) + 1;
        const luckBonus = this.upgrades.luck * 10;
        const roll = Math.min(baseRoll + luckBonus, 100);
        
        // Calculate points gained
        const pointsGained = Math.floor(roll * this.multiplier);
        this.points += pointsGained;
        
        // Update level based on points
        this.level = Math.floor(this.points / 1000) + 1;
        
        // Animate the number display
        const numberDisplay = document.getElementById('current-number');
        numberDisplay.textContent = roll;
        numberDisplay.classList.add('animate');
        
        setTimeout(() => {
            numberDisplay.classList.remove('animate');
        }, 600);
        
        // Add pulse animation to button
        const rngButton = document.getElementById('rng-button');
        rngButton.style.animation = 'buttonPress 0.2s ease-out';
        setTimeout(() => {
            rngButton.style.animation = 'float 3s ease-in-out infinite';
        }, 200);
        
        this.updateDisplay();
        this.checkUpgrades();
    }
    
    buyUpgrade(index) {
        const costs = [10, 100, 500];
        const cost = costs[index] * Math.pow(2, this.upgrades.click || 0);
        
        if (this.points >= cost) {
            this.points -= cost;
            
            switch(index) {
                case 0: // Better Rolls
                    this.upgrades.click++;
                    this.multiplier += 0.5;
                    break;
                case 1: // Auto Roller
                    this.upgrades.auto = true;
                    break;
                case 2: // Lucky Charm
                    this.upgrades.luck++;
                    break;
            }
            
            this.updateDisplay();
            this.checkUpgrades();
            
            // Add success animation
            const button = document.querySelectorAll('.upgrade-button')[index];
            button.style.background = 'linear-gradient(45deg, #4ade80, #22d3ee)';
            setTimeout(() => {
                button.style.background = 'linear-gradient(45deg, var(--success), #22d3ee)';
            }, 300);
        }
    }
    
    rebirth(layer) {
        const requirements = [10000, 100000, 1000000];
        const rebirthRequirements = [0, 1, 10];
        
        if (this.points >= requirements[layer] && this.rebirths >= rebirthRequirements[layer]) {
            this.rebirths++;
            this.points = 0;
            this.level = 1;
            this.multiplier *= (layer + 2);
            
            // Add special effects
            document.body.style.animation = 'none';
            setTimeout(() => {
                document.body.style.animation = '';
            }, 100);
            
            this.updateDisplay();
            this.checkUpgrades();
        }
    }
    
    updateDisplay() {
        document.getElementById('points').textContent = this.formatNumber(this.points);
        document.getElementById('level').textContent = this.level;
        document.getElementById('rebirths').textContent = this.rebirths;
        document.getElementById('multiplier').textContent = this.multiplier.toFixed(1);
        
        // Update upgrade costs
        const upgradeCards = document.querySelectorAll('.upgrade-card');
        const costs = [10, 100, 500];
        
        upgradeCards.forEach((card, index) => {
            const costValue = card.querySelector('.cost-value');
            const button = card.querySelector('.upgrade-button');
            const cost = costs[index] * Math.pow(2, this.upgrades.click || 0);
            
            costValue.textContent = this.formatNumber(cost);
            
            if (this.points >= cost) {
                button.disabled = false;
                card.classList.add('pulse');
            } else {
                button.disabled = true;
                card.classList.remove('pulse');
            }
        });
    }
    
    checkUpgrades() {
        // Check rebirth availability
        const rebirthButtons = document.querySelectorAll('.rebirth-button');
        const requirements = [10000, 100000, 1000000];
        const rebirthRequirements = [0, 1, 10];
        
        rebirthButtons.forEach((button, index) => {
            const layer = button.closest('.rebirth-layer');
            if (this.points >= requirements[index] && this.rebirths >= rebirthRequirements[index]) {
                button.disabled = false;
                layer.classList.add('glow');
            } else {
                button.disabled = true;
                layer.classList.remove('glow');
            }
        });
    }
    
    formatNumber(num) {
        if (num >= 1e6) {
            return (num / 1e6).toFixed(2) + 'M';
        } else if (num >= 1e3) {
            return (num / 1e3).toFixed(1) + 'K';
        }
        return num.toString();
    }
    
    startAutoRoller() {
        setInterval(() => {
            if (this.upgrades.auto) {
                this.roll();
            }
        }, 1000);
    }
}

// Initialize game when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new EpicRNGGame();
    
    // Add some visual effects on load
    setTimeout(() => {
        document.querySelectorAll('.upgrade-card').forEach((card, index) => {
            setTimeout(() => {
                card.classList.add('fade-in');
            }, index * 100);
        });
    }, 1000);
    
    setTimeout(() => {
        document.querySelectorAll('.rebirth-layer').forEach((layer, index) => {
            setTimeout(() => {
                layer.classList.add('fade-in');
            }, index * 150);
        });
    }, 1500);
});