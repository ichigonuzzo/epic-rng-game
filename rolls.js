// Epic RNG Game - Enhanced Rolling System

class RollingSystem {
    constructor(game) {
        this.game = game;
        this.multiRollCount = 1;
        this.rollHistory = [];
        this.maxHistoryLength = 100;
    }

    // Multi-roll system (Grandmaster layer and above)
    performMultiRoll() {
        if (this.game.gameState.currentLayer < 6) {
            return this.game.performRoll(this.game.layers[this.game.gameState.currentLayer - 1]);
        }

        const rollCount = this.getMultiRollCount();
        const results = [];
        let totalPoints = 0;
        let bestRoll = null;

        for (let i = 0; i < rollCount; i++) {
            const result = this.game.performRoll(this.game.layers[this.game.gameState.currentLayer - 1]);
            results.push(result);
            totalPoints += result.finalPoints;
            
            if (!bestRoll || result.finalPoints > bestRoll.finalPoints) {
                bestRoll = result;
            }
        }

        // Combine results
        const combinedResult = {
            baseRoll: bestRoll.baseRoll,
            finalPoints: totalPoints,
            rollType: bestRoll.rollType,
            multiplierBonus: bestRoll.multiplierBonus,
            multiRoll: true,
            rollCount: rollCount,
            allRolls: results
        };

        this.addToHistory(combinedResult);
        return combinedResult;
    }

    getMultiRollCount() {
        const layer = this.game.gameState.currentLayer;
        if (layer >= 10) return 5; // Transcendent+: 5 rolls
        if (layer >= 8) return 4;  // Mythical+: 4 rolls
        if (layer >= 6) return 3;  // Grandmaster+: 3 rolls
        return 1; // Default: 1 roll
    }

    // Lucky roll system (enhanced probability manipulation)
    performLuckyRoll() {
        if (this.game.gameState.currentLayer < 3) {
            return this.game.performRoll(this.game.layers[this.game.gameState.currentLayer - 1]);
        }

        const currentLayerData = this.game.layers[this.game.gameState.currentLayer - 1];
        const [min, max] = currentLayerData.range;
        
        // Lucky rolls bias toward higher values
        let baseRoll = this.generateLuckyNumber(min, max);
        let points = baseRoll * this.game.gameState.multiplier;
        let rollType = "lucky";
        let multiplierBonus = 1;

        // Enhanced critical chance for lucky rolls
        if (this.game.gameState.currentLayer >= 4 && Math.random() < 0.25) { // 25% critical chance instead of 15%
            const critMultiplier = 3 + Math.random() * 4; // 3x to 7x instead of 2x to 5x
            points *= critMultiplier;
            rollType = "lucky-critical";
            multiplierBonus = critMultiplier;
            this.game.gameState.criticalHits++;
        }

        // Apply combo and streak bonuses
        this.applyComboBonus(baseRoll, max);
        this.applyStreakBonus(baseRoll, max);

        return {
            baseRoll,
            finalPoints: Math.floor(points * this.getComboMultiplier() * this.getStreakMultiplier()),
            rollType,
            multiplierBonus,
            isLucky: true
        };
    }

    generateLuckyNumber(min, max) {
        // Use multiple random numbers and take the best one
        const attempts = 3;
        let bestRoll = min;
        
        for (let i = 0; i < attempts; i++) {
            const roll = Math.floor(Math.random() * (max - min + 1)) + min;
            if (roll > bestRoll) {
                bestRoll = roll;
            }
        }
        
        return bestRoll;
    }

    // Transcendence rolling mechanics (Divine layer and above)
    performTranscendentRoll() {
        if (this.game.gameState.currentLayer < 9) {
            return this.performMultiRoll();
        }

        const baseResult = this.performMultiRoll();
        
        // Transcendent bonus: chance to multiply by layer number
        if (Math.random() < 0.1) { // 10% chance
            baseResult.finalPoints *= this.game.gameState.currentLayer;
            baseResult.rollType = "transcendent";
            baseResult.multiplierBonus = this.game.gameState.currentLayer;
        }

        // Reality warping (Transcendent layer and above)
        if (this.game.gameState.currentLayer >= 10) {
            baseResult.finalPoints = this.applyRealityWarp(baseResult.finalPoints);
        }

        // Infinity mode (Omnipotent layer)
        if (this.game.gameState.currentLayer >= 11) {
            baseResult.finalPoints = this.applyInfinityBonus(baseResult.finalPoints);
        }

        return baseResult;
    }

    applyRealityWarp(points) {
        // Reality warping can dramatically alter results
        const warpChance = Math.random();
        
        if (warpChance < 0.05) { // 5% chance for reality break
            return points * 100; // 100x multiplier
        } else if (warpChance < 0.15) { // 10% chance for major warp
            return points * 10; // 10x multiplier
        } else if (warpChance < 0.3) { // 15% chance for minor warp
            return points * 3; // 3x multiplier
        }
        
        return points;
    }

    applyInfinityBonus(points) {
        // Infinity mode: points can exceed normal limits
        const infinityMultiplier = 1 + (this.game.gameState.totalRolls / 10000); // Grows with total rolls
        return Math.floor(points * infinityMultiplier);
    }

    applyComboBonus(baseRoll, maxRoll) {
        if (this.game.gameState.currentLayer >= 3) {
            if (baseRoll >= maxRoll * 0.7) { // Good roll
                this.game.gameState.combo++;
                this.game.gameState.goodRolls++;
            } else if (baseRoll < maxRoll * 0.3) { // Bad roll
                this.game.gameState.combo = 0;
            }
        }
    }

    applyStreakBonus(baseRoll, maxRoll) {
        if (this.game.gameState.currentLayer >= 5) {
            if (baseRoll >= maxRoll * 0.6) { // Decent roll
                this.game.gameState.streak++;
            } else {
                this.game.gameState.streak = 0;
            }
        }
    }

    getComboMultiplier() {
        if (this.game.gameState.currentLayer < 3) return 1;
        return 1 + (this.game.gameState.combo * 0.1); // 10% per combo
    }

    getStreakMultiplier() {
        if (this.game.gameState.currentLayer < 5) return 1;
        return 1 + (this.game.gameState.streak * 0.05); // 5% per streak
    }

    // Challenge mode rolling (Mythical layer and above)
    performChallengeRoll(challengeType) {
        if (this.game.gameState.currentLayer < 8) {
            return this.performTranscendentRoll();
        }

        let baseResult = this.performTranscendentRoll();

        switch (challengeType) {
            case 'high-risk':
                // 50% chance for 10x points, 50% chance for 0.1x points
                if (Math.random() < 0.5) {
                    baseResult.finalPoints *= 10;
                    baseResult.rollType = "challenge-success";
                } else {
                    baseResult.finalPoints = Math.floor(baseResult.finalPoints * 0.1);
                    baseResult.rollType = "challenge-fail";
                }
                break;
                
            case 'precision':
                // Must hit exact value for massive bonus
                const targetValue = Math.floor(Math.random() * 20) + 1;
                if (baseResult.baseRoll === targetValue) {
                    baseResult.finalPoints *= 50;
                    baseResult.rollType = "precision-perfect";
                } else {
                    baseResult.finalPoints = Math.floor(baseResult.finalPoints * 0.5);
                    baseResult.rollType = "precision-miss";
                }
                break;
                
            case 'endurance':
                // Points multiply based on current streak
                const streakBonus = Math.max(1, this.game.gameState.streak);
                baseResult.finalPoints *= streakBonus;
                baseResult.rollType = "endurance-boost";
                break;
        }

        return baseResult;
    }

    addToHistory(result) {
        this.rollHistory.unshift(result);
        if (this.rollHistory.length > this.maxHistoryLength) {
            this.rollHistory.pop();
        }
    }

    getStatistics() {
        if (this.rollHistory.length === 0) return null;

        const totalRolls = this.rollHistory.length;
        const totalPoints = this.rollHistory.reduce((sum, roll) => sum + roll.finalPoints, 0);
        const averagePoints = totalPoints / totalRolls;
        const bestRoll = this.rollHistory.reduce((best, roll) => 
            roll.finalPoints > best.finalPoints ? roll : best
        );

        const criticalHits = this.rollHistory.filter(roll => 
            roll.rollType.includes('critical')).length;
        const criticalRate = (criticalHits / totalRolls) * 100;

        return {
            totalRolls,
            totalPoints,
            averagePoints: Math.floor(averagePoints),
            bestRoll,
            criticalRate: criticalRate.toFixed(1)
        };
    }

    // Special event rolls
    performEventRoll(eventType) {
        let baseResult = this.performTranscendentRoll();

        switch (eventType) {
            case 'meteor-shower':
                // Multiple small bonuses
                baseResult.finalPoints += Math.floor(Math.random() * 1000) * this.game.gameState.currentLayer;
                baseResult.rollType = "meteor-shower";
                break;
                
            case 'divine-blessing':
                // Guaranteed critical with massive multiplier
                baseResult.finalPoints *= (5 + this.game.gameState.currentLayer);
                baseResult.rollType = "divine-blessing";
                break;
                
            case 'chaos-storm':
                // Completely random outcome
                const chaosMultiplier = 0.1 + Math.random() * 19.9; // 0.1x to 20x
                baseResult.finalPoints = Math.floor(baseResult.finalPoints * chaosMultiplier);
                baseResult.rollType = "chaos-storm";
                break;
        }

        return baseResult;
    }

    // Display enhanced roll result
    displayEnhancedRollResult(result) {
        const resultElement = document.getElementById('roll-result');
        const typeElement = document.getElementById('roll-type');
        
        let resultText = `Rolled ${result.baseRoll}`;
        if (result.multiRoll) {
            resultText = `Multi-roll (${result.rollCount}x)`;
        }
        resultText += ` → ${result.finalPoints.toLocaleString()} points!`;
        
        resultElement.textContent = resultText;
        
        let typeText = "";
        let typeClass = "roll-normal";
        
        switch (result.rollType) {
            case "lucky":
                typeText = "LUCKY ROLL!";
                typeClass = "roll-critical";
                break;
            case "lucky-critical":
                typeText = `LUCKY CRITICAL! (${result.multiplierBonus.toFixed(1)}x)`;
                typeClass = "roll-critical";
                break;
            case "transcendent":
                typeText = `TRANSCENDENT! (${result.multiplierBonus}x)`;
                typeClass = "roll-divine";
                break;
            case "challenge-success":
                typeText = "CHALLENGE SUCCESS! (10x)";
                typeClass = "roll-super";
                break;
            case "challenge-fail":
                typeText = "Challenge Failed (0.1x)";
                typeClass = "roll-normal";
                break;
            case "precision-perfect":
                typeText = "PERFECT PRECISION! (50x)";
                typeClass = "roll-divine";
                break;
            case "precision-miss":
                typeText = "Precision Miss (0.5x)";
                typeClass = "roll-normal";
                break;
            case "endurance-boost":
                typeText = `ENDURANCE BOOST! (${this.game.gameState.streak}x)`;
                typeClass = "roll-super";
                break;
            default:
                // Use original display logic for standard rolls
                return this.game.displayRollResult(result);
        }
        
        typeElement.textContent = typeText;
        typeElement.className = typeClass;
        
        // Add pulse animation
        resultElement.classList.add('pulse');
        setTimeout(() => resultElement.classList.remove('pulse'), 500);
    }
}

// Enhanced roll method for the main game class
if (typeof window !== 'undefined') {
    document.addEventListener('DOMContentLoaded', () => {
        // Override the roll method to use enhanced rolling system
        const originalGameClass = window.EpicRNGGame;
        if (originalGameClass) {
            originalGameClass.prototype.initRollingSystem = function() {
                this.rollingSystem = new RollingSystem(this);
            };

            // Override the roll method
            const originalRoll = originalGameClass.prototype.roll;
            originalGameClass.prototype.roll = function(isRisk = false) {
                if (!this.rollingSystem) {
                    this.initRollingSystem();
                }

                const currentLayerData = this.layers[this.gameState.currentLayer - 1];
                let rollResult;

                // Determine which rolling method to use based on layer and conditions
                if (isRisk) {
                    rollResult = this.performRoll(currentLayerData, true);
                } else if (this.gameState.currentLayer >= 9) {
                    rollResult = this.rollingSystem.performTranscendentRoll();
                } else if (this.gameState.currentLayer >= 6) {
                    rollResult = this.rollingSystem.performMultiRoll();
                } else if (this.gameState.currentLayer >= 3 && Math.random() < 0.2) { // 20% chance for lucky roll
                    rollResult = this.rollingSystem.performLuckyRoll();
                } else {
                    rollResult = this.performRoll(currentLayerData);
                }
                
                this.gameState.totalRolls++;
                this.animateDice();
                
                // Update display after animation
                setTimeout(() => {
                    if (this.rollingSystem && (rollResult.isLucky || rollResult.multiRoll || rollResult.rollType.includes('transcendent') || rollResult.rollType.includes('challenge'))) {
                        this.rollingSystem.displayEnhancedRollResult(rollResult);
                    } else {
                        this.displayRollResult(rollResult);
                    }
                    this.updateProgress(rollResult);
                    this.checkAchievements();
                    this.updateDisplay();
                }, 500);
            };
        }
    });
}