// Epic RNG Game - Upgrades System

class UpgradeSystem {
    constructor(game) {
        this.game = game;
        this.upgrades = this.initializeUpgrades();
        this.purchasedUpgrades = {};
    }

    initializeUpgrades() {
        return {
            // Novice Layer (1) - Basic Upgrades
            novice: [
                {
                    id: 'click_power',
                    name: 'Stronger Clicks',
                    description: 'Increase click power by 50%',
                    baseCost: 50,
                    costMultiplier: 1.5,
                    maxLevel: 10,
                    effect: (level) => 1 + (level * 0.5),
                    requiredLayer: 1,
                    category: 'basic'
                },
                {
                    id: 'point_multiplier',
                    name: 'Point Amplifier',
                    description: 'Multiply all points by 25%',
                    baseCost: 100,
                    costMultiplier: 2,
                    maxLevel: 5,
                    effect: (level) => 1 + (level * 0.25),
                    requiredLayer: 1,
                    category: 'basic'
                }
            ],

            // Apprentice Layer (2) - Auto-clicker Upgrades
            apprentice: [
                {
                    id: 'auto_speed',
                    name: 'Auto-Roll Speed',
                    description: 'Increase auto-roll speed by 20%',
                    baseCost: 200,
                    costMultiplier: 1.8,
                    maxLevel: 15,
                    effect: (level) => Math.max(200, 1000 - (level * 50)), // Faster intervals
                    requiredLayer: 2,
                    category: 'automation'
                },
                {
                    id: 'auto_efficiency',
                    name: 'Auto-Roll Efficiency',
                    description: 'Auto-rolls gain 30% more points',
                    baseCost: 500,
                    costMultiplier: 2.2,
                    maxLevel: 8,
                    effect: (level) => 1 + (level * 0.3),
                    requiredLayer: 2,
                    category: 'automation'
                }
            ],

            // Journeyman Layer (3) - Lucky & Combo Upgrades
            journeyman: [
                {
                    id: 'lucky_chance',
                    name: 'Lucky Fortune',
                    description: 'Increase lucky roll chance by 5%',
                    baseCost: 1000,
                    costMultiplier: 2.5,
                    maxLevel: 10,
                    effect: (level) => level * 0.05,
                    requiredLayer: 3,
                    category: 'luck'
                },
                {
                    id: 'combo_power',
                    name: 'Combo Master',
                    description: 'Combo bonuses are 50% stronger',
                    baseCost: 1500,
                    costMultiplier: 2.8,
                    maxLevel: 6,
                    effect: (level) => 1 + (level * 0.5),
                    requiredLayer: 3,
                    category: 'combo'
                },
                {
                    id: 'combo_threshold',
                    name: 'Combo Sensitivity',
                    description: 'Easier to maintain combos (lower threshold)',
                    baseCost: 2000,
                    costMultiplier: 3,
                    maxLevel: 5,
                    effect: (level) => level * 0.1, // Reduces threshold by 10% per level
                    requiredLayer: 3,
                    category: 'combo'
                }
            ],

            // Expert Layer (4) - Critical Hit Upgrades
            expert: [
                {
                    id: 'critical_chance',
                    name: 'Critical Mastery',
                    description: 'Increase critical hit chance by 3%',
                    baseCost: 4000,
                    costMultiplier: 3.2,
                    maxLevel: 12,
                    effect: (level) => level * 0.03,
                    requiredLayer: 4,
                    category: 'critical'
                },
                {
                    id: 'critical_power',
                    name: 'Critical Devastation',
                    description: 'Critical hits are 100% stronger',
                    baseCost: 6000,
                    costMultiplier: 3.5,
                    maxLevel: 8,
                    effect: (level) => 1 + level,
                    requiredLayer: 4,
                    category: 'critical'
                },
                {
                    id: 'super_critical',
                    name: 'Super Critical',
                    description: 'Unlock chance for super critical hits (10x)',
                    baseCost: 10000,
                    costMultiplier: 4,
                    maxLevel: 1,
                    effect: (level) => level > 0 ? 0.02 : 0, // 2% chance when purchased
                    requiredLayer: 4,
                    category: 'critical'
                }
            ],

            // Master Layer (5) - Streak Upgrades
            master: [
                {
                    id: 'streak_power',
                    name: 'Streak Amplifier',
                    description: 'Streak bonuses are 75% stronger',
                    baseCost: 15000,
                    costMultiplier: 3.8,
                    maxLevel: 10,
                    effect: (level) => 1 + (level * 0.75),
                    requiredLayer: 5,
                    category: 'streak'
                },
                {
                    id: 'streak_protection',
                    name: 'Streak Guardian',
                    description: 'Protect streaks from breaking (chance)',
                    baseCost: 25000,
                    costMultiplier: 4.2,
                    maxLevel: 5,
                    effect: (level) => level * 0.15, // 15% protection chance per level
                    requiredLayer: 5,
                    category: 'streak'
                },
                {
                    id: 'mega_streak',
                    name: 'Mega Streak',
                    description: 'Unlock mega streak bonuses at 25+ streak',
                    baseCost: 40000,
                    costMultiplier: 5,
                    maxLevel: 1,
                    effect: (level) => level > 0 ? 2 : 1, // 2x bonus at 25+ streak
                    requiredLayer: 5,
                    category: 'streak'
                }
            ],

            // Grandmaster Layer (6) - Multi-roll Upgrades
            grandmaster: [
                {
                    id: 'multi_roll_count',
                    name: 'Extra Dice',
                    description: 'Roll one additional die',
                    baseCost: 60000,
                    costMultiplier: 4.5,
                    maxLevel: 3,
                    effect: (level) => level,
                    requiredLayer: 6,
                    category: 'multiroll'
                },
                {
                    id: 'multi_roll_synergy',
                    name: 'Dice Synergy',
                    description: 'Multi-rolls gain 50% synergy bonus',
                    baseCost: 80000,
                    costMultiplier: 5,
                    maxLevel: 6,
                    effect: (level) => 1 + (level * 0.5),
                    requiredLayer: 6,
                    category: 'multiroll'
                },
                {
                    id: 'perfect_roll',
                    name: 'Perfect Harmony',
                    description: 'Chance for all dice to roll maximum',
                    baseCost: 120000,
                    costMultiplier: 6,
                    maxLevel: 1,
                    effect: (level) => level > 0 ? 0.01 : 0, // 1% chance when purchased
                    requiredLayer: 6,
                    category: 'multiroll'
                }
            ],

            // Legendary Layer (7) - Prestige Upgrades
            legendary: [
                {
                    id: 'prestige_generation',
                    name: 'Prestige Flow',
                    description: 'Generate prestige currency automatically',
                    baseCost: 150000,
                    costMultiplier: 5.5,
                    maxLevel: 10,
                    effect: (level) => level * 0.1, // 0.1 prestige per second per level
                    requiredLayer: 7,
                    category: 'prestige'
                },
                {
                    id: 'prestige_power',
                    name: 'Prestige Amplifier',
                    description: 'Prestige currency is 100% more effective',
                    baseCost: 200000,
                    costMultiplier: 6,
                    maxLevel: 8,
                    effect: (level) => 1 + level,
                    requiredLayer: 7,
                    category: 'prestige'
                },
                {
                    id: 'prestige_investment',
                    name: 'Prestige Investment',
                    description: 'Spend prestige to multiply all gains by 10x for 60s',
                    baseCost: 300000,
                    costMultiplier: 8,
                    maxLevel: 1,
                    effect: (level) => level > 0 ? true : false,
                    requiredLayer: 7,
                    category: 'prestige'
                }
            ],

            // Mythical Layer (8) - Challenge Upgrades
            mythical: [
                {
                    id: 'challenge_rewards',
                    name: 'Challenge Champion',
                    description: 'Challenge mode rewards are 200% higher',
                    baseCost: 400000,
                    costMultiplier: 7,
                    maxLevel: 5,
                    effect: (level) => 1 + (level * 2),
                    requiredLayer: 8,
                    category: 'challenge'
                },
                {
                    id: 'challenge_mastery',
                    name: 'Challenge Mastery',
                    description: 'Reduce challenge failure rates by 20%',
                    baseCost: 500000,
                    costMultiplier: 8,
                    maxLevel: 4,
                    effect: (level) => level * 0.2,
                    requiredLayer: 8,
                    category: 'challenge'
                }
            ],

            // Divine Layer (9) - Transcendence Upgrades
            divine: [
                {
                    id: 'transcendence_power',
                    name: 'Divine Ascension',
                    description: 'Transcendent rolls are 300% stronger',
                    baseCost: 750000,
                    costMultiplier: 9,
                    maxLevel: 6,
                    effect: (level) => 1 + (level * 3),
                    requiredLayer: 9,
                    category: 'transcendence'
                },
                {
                    id: 'reality_anchor',
                    name: 'Reality Anchor',
                    description: 'Prevent reality warp failures',
                    baseCost: 1000000,
                    costMultiplier: 10,
                    maxLevel: 1,
                    effect: (level) => level > 0 ? true : false,
                    requiredLayer: 9,
                    category: 'transcendence'
                }
            ],

            // Transcendent Layer (10) - Reality Warp Upgrades
            transcendent: [
                {
                    id: 'reality_control',
                    name: 'Reality Mastery',
                    description: 'Control reality warp outcomes',
                    baseCost: 2000000,
                    costMultiplier: 12,
                    maxLevel: 3,
                    effect: (level) => level * 0.33, // 33% control per level
                    requiredLayer: 10,
                    category: 'reality'
                },
                {
                    id: 'dimension_break',
                    name: 'Dimensional Break',
                    description: 'Break through dimensional barriers for massive bonuses',
                    baseCost: 3000000,
                    costMultiplier: 15,
                    maxLevel: 1,
                    effect: (level) => level > 0 ? 1000 : 1, // 1000x multiplier when purchased
                    requiredLayer: 10,
                    category: 'reality'
                }
            ],

            // Omnipotent Layer (11) - Infinity Upgrades
            omnipotent: [
                {
                    id: 'infinity_engine',
                    name: 'Infinity Engine',
                    description: 'Infinite scaling becomes exponential',
                    baseCost: 10000000,
                    costMultiplier: 20,
                    maxLevel: 10,
                    effect: (level) => Math.pow(2, level), // Exponential growth
                    requiredLayer: 11,
                    category: 'infinity'
                },
                {
                    id: 'omnipotence',
                    name: 'True Omnipotence',
                    description: 'Transcend all limitations',
                    baseCost: 50000000,
                    costMultiplier: 50,
                    maxLevel: 1,
                    effect: (level) => level > 0 ? true : false,
                    requiredLayer: 11,
                    category: 'infinity'
                }
            ]
        };
    }

    getAvailableUpgrades() {
        const availableUpgrades = [];
        const currentLayer = this.game.gameState.currentLayer;
        
        Object.keys(this.upgrades).forEach(layerKey => {
            this.upgrades[layerKey].forEach(upgrade => {
                if (upgrade.requiredLayer <= currentLayer) {
                    const currentLevel = this.purchasedUpgrades[upgrade.id] || 0;
                    if (currentLevel < upgrade.maxLevel) {
                        availableUpgrades.push({
                            ...upgrade,
                            currentLevel,
                            currentCost: this.calculateCost(upgrade, currentLevel)
                        });
                    }
                }
            });
        });
        
        return availableUpgrades.sort((a, b) => a.currentCost - b.currentCost);
    }

    calculateCost(upgrade, currentLevel) {
        return Math.floor(upgrade.baseCost * Math.pow(upgrade.costMultiplier, currentLevel));
    }

    purchaseUpgrade(upgradeId) {
        const availableUpgrades = this.getAvailableUpgrades();
        const upgrade = availableUpgrades.find(u => u.id === upgradeId);
        
        if (!upgrade) {
            console.log('Upgrade not available');
            return false;
        }
        
        if (this.game.gameState.points < upgrade.currentCost) {
            console.log('Not enough points');
            return false;
        }
        
        // Purchase upgrade
        this.game.gameState.points -= upgrade.currentCost;
        this.purchasedUpgrades[upgradeId] = (this.purchasedUpgrades[upgradeId] || 0) + 1;
        
        // Apply upgrade effects immediately
        this.applyUpgradeEffects();
        
        // Update display
        this.render();
        this.game.updateDisplay();
        
        console.log(`Purchased ${upgrade.name} level ${this.purchasedUpgrades[upgradeId]}`);
        return true;
    }

    applyUpgradeEffects() {
        // Reset multipliers
        let totalMultiplier = this.game.layers[this.game.gameState.currentLayer - 1].multiplier;
        
        // Apply all purchased upgrade effects
        Object.keys(this.purchasedUpgrades).forEach(upgradeId => {
            const level = this.purchasedUpgrades[upgradeId];
            if (level > 0) {
                const upgrade = this.findUpgradeById(upgradeId);
                if (upgrade) {
                    const effect = upgrade.effect(level);
                    
                    // Apply different types of effects based on upgrade category
                    switch (upgrade.category) {
                        case 'basic':
                            if (upgradeId === 'click_power' || upgradeId === 'point_multiplier') {
                                totalMultiplier *= effect;
                            }
                            break;
                        case 'automation':
                            // Auto-roll effects are handled separately
                            break;
                        case 'luck':
                        case 'combo':
                        case 'critical':
                        case 'streak':
                        case 'multiroll':
                        case 'prestige':
                        case 'challenge':
                        case 'transcendence':
                        case 'reality':
                        case 'infinity':
                            // These effects are applied during rolling
                            break;
                    }
                }
            }
        });
        
        this.game.gameState.multiplier = totalMultiplier;
    }

    findUpgradeById(upgradeId) {
        for (const layerKey of Object.keys(this.upgrades)) {
            const upgrade = this.upgrades[layerKey].find(u => u.id === upgradeId);
            if (upgrade) return upgrade;
        }
        return null;
    }

    getUpgradeEffect(upgradeId) {
        const level = this.purchasedUpgrades[upgradeId] || 0;
        if (level === 0) return null;
        
        const upgrade = this.findUpgradeById(upgradeId);
        return upgrade ? upgrade.effect(level) : null;
    }

    render() {
        const container = document.getElementById('upgrades-container');
        const availableUpgrades = this.getAvailableUpgrades();
        
        if (availableUpgrades.length === 0) {
            container.innerHTML = '<p>No upgrades available at this layer.</p>';
            return;
        }
        
        container.innerHTML = availableUpgrades.map(upgrade => {
            const canAfford = this.game.gameState.points >= upgrade.currentCost;
            const isMaxLevel = upgrade.currentLevel >= upgrade.maxLevel;
            
            return `
                <div class="upgrade-card ${canAfford ? 'affordable' : 'expensive'}">
                    <h4>${upgrade.name} ${upgrade.currentLevel > 0 ? `(Lv.${upgrade.currentLevel})` : ''}</h4>
                    <p>${upgrade.description}</p>
                    <div class="upgrade-cost">
                        Cost: ${upgrade.currentCost.toLocaleString()} points
                    </div>
                    <div class="upgrade-level">
                        Level: ${upgrade.currentLevel} / ${upgrade.maxLevel}
                    </div>
                    <button 
                        class="upgrade-btn" 
                        onclick="window.upgradeSystem.purchaseUpgrade('${upgrade.id}')"
                        ${!canAfford || isMaxLevel ? 'disabled' : ''}
                    >
                        ${isMaxLevel ? 'MAX LEVEL' : 'Purchase'}
                    </button>
                </div>
            `;
        }).join('');
    }

    // Get upgrade bonuses for rolling system
    getLuckyChanceBonus() {
        return this.getUpgradeEffect('lucky_chance') || 0;
    }

    getComboMultiplierBonus() {
        return this.getUpgradeEffect('combo_power') || 1;
    }

    getCriticalChanceBonus() {
        return this.getUpgradeEffect('critical_chance') || 0;
    }

    getCriticalPowerBonus() {
        return this.getUpgradeEffect('critical_power') || 1;
    }

    getStreakPowerBonus() {
        return this.getUpgradeEffect('streak_power') || 1;
    }

    getStreakProtection() {
        return this.getUpgradeEffect('streak_protection') || 0;
    }

    getMultiRollBonus() {
        return this.getUpgradeEffect('multi_roll_count') || 0;
    }

    getAutoRollSpeed() {
        return this.getUpgradeEffect('auto_speed') || 1000;
    }

    getAutoRollEfficiency() {
        return this.getUpgradeEffect('auto_efficiency') || 1;
    }

    // Save/Load upgrade data
    saveData() {
        return {
            purchasedUpgrades: this.purchasedUpgrades
        };
    }

    loadData(data) {
        if (data && data.purchasedUpgrades) {
            this.purchasedUpgrades = data.purchasedUpgrades;
            this.applyUpgradeEffects();
        }
    }
}

// Initialize upgrade system when game loads
if (typeof window !== 'undefined') {
    document.addEventListener('DOMContentLoaded', () => {
        // Wait for game to initialize first
        setTimeout(() => {
            if (window.game) {
                window.upgradeSystem = new UpgradeSystem(window.game);
                
                // Override game's renderUpgrades method
                window.game.renderUpgrades = () => {
                    window.upgradeSystem.render();
                };
                
                // Override save/load to include upgrade data
                const originalSaveGame = window.game.saveGame;
                window.game.saveGame = function(isAuto = false) {
                    this.gameState.upgradeData = window.upgradeSystem.saveData();
                    return originalSaveGame.call(this, isAuto);
                };
                
                const originalLoadGame = window.game.loadGame;
                window.game.loadGame = function() {
                    const result = originalLoadGame.call(this);
                    if (this.gameState.upgradeData) {
                        window.upgradeSystem.loadData(this.gameState.upgradeData);
                    }
                    return result;
                };
                
                // Initial render
                window.upgradeSystem.render();
            }
        }, 100);
    });
}