// Epic RNG Game - Enhanced Edition
// Performance optimized with debouncing, requestAnimationFrame, and efficient DOM manipulation

class EpicRNGGame {
    constructor() {
        // Game state
        this.gameState = {
            points: 0,
            multiplier: 1.0,
            streak: 0,
            bestRoll: 0,
            minRange: 1,
            maxRange: 10,
            currentRoll: 0,
            prestigeLevel: 0,
            prestigeBonus: 0,
            autoClickerActive: false,
            luckBonus: 0
        };

        // Upgrade levels and costs
        this.upgrades = {
            multiplier: { level: 0, baseCost: 10, costMultiplier: 1.5 },
            range: { level: 0, baseCost: 25, costMultiplier: 1.8 },
            auto: { level: 0, baseCost: 100, costMultiplier: 2.0 },
            luck: { level: 0, baseCost: 250, costMultiplier: 2.2 }
        };

        // Achievements system
        this.achievements = [
            { id: 'firstClick', name: 'First Steps', description: 'Roll for the first time', icon: '🎲', unlocked: false, requirement: () => this.gameState.currentRoll > 0 },
            { id: 'century', name: 'Century Club', description: 'Reach 100 points', icon: '💯', unlocked: false, requirement: () => this.gameState.points >= 100 },
            { id: 'millennium', name: 'Millennium', description: 'Reach 1,000 points', icon: '🏆', unlocked: false, requirement: () => this.gameState.points >= 1000 },
            { id: 'highRoller', name: 'High Roller', description: 'Roll the maximum value', icon: '🎯', unlocked: false, requirement: () => this.gameState.currentRoll === this.gameState.maxRange },
            { id: 'streakMaster', name: 'Streak Master', description: 'Achieve a 10-roll streak', icon: '🔥', unlocked: false, requirement: () => this.gameState.streak >= 10 },
            { id: 'multiplierMaster', name: 'Power Player', description: 'Reach 5x multiplier', icon: '⚡', unlocked: false, requirement: () => this.gameState.multiplier >= 5 },
            { id: 'autoClicker', name: 'Automation', description: 'Purchase auto clicker', icon: '🤖', unlocked: false, requirement: () => this.upgrades.auto.level > 0 },
            { id: 'prestige', name: 'Prestige Master', description: 'Perform your first prestige', icon: '👑', unlocked: false, requirement: () => this.gameState.prestigeLevel > 0 }
        ];

        // Settings
        this.settings = {
            animationsEnabled: true,
            particlesEnabled: true,
            autoSaveEnabled: true,
            musicEnabled: true,
            sfxEnabled: true,
            masterVolume: 0.5
        };

        // Performance optimization
        this.animationQueue = [];
        this.isRolling = false;
        this.lastUpdateTime = 0;
        this.debounceTimeout = null;

        // Audio system
        this.audioContext = null;
        this.sounds = {};
        this.musicLoop = null;

        // DOM elements cache
        this.elements = {};

        this.init();
    }

    async init() {
        this.cacheElements();
        this.setupEventListeners();
        await this.initAudioSystem();
        this.loadGameState();
        this.updateDisplay();
        this.startGameLoop();
        this.startAutoSave();
        
        console.log('Epic RNG Game Enhanced Edition loaded successfully!');
    }

    // Cache DOM elements for performance
    cacheElements() {
        const elementIds = [
            'points', 'multiplier', 'streak', 'bestRoll', 'currentRoll',
            'minRange', 'maxRange', 'rollButton', 'floatingNumbers',
            'multiplierLevel', 'multiplierCost', 'buyMultiplier',
            'rangeLevel', 'rangeCost', 'buyRange',
            'autoLevel', 'autoCost', 'buyAuto',
            'luckLevel', 'luckCost', 'buyLuck',
            'prestigeLevel', 'prestigeBonus', 'prestigeButton',
            'achievementsList', 'settingsModal', 'settingsButton',
            'toggleMusic', 'toggleSfx', 'volumeSlider',
            'musicIcon', 'sfxIcon', 'particleContainer'
        ];

        elementIds.forEach(id => {
            this.elements[id] = document.getElementById(id);
        });
    }

    // Setup event listeners with debouncing
    setupEventListeners() {
        // Roll button
        this.elements.rollButton.addEventListener('click', this.debounce(() => this.performRoll(), 100));
        
        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.code === 'Space' && !e.repeat) {
                e.preventDefault();
                this.performRoll();
            }
        });

        // Upgrade buttons
        this.elements.buyMultiplier.addEventListener('click', () => this.buyUpgrade('multiplier'));
        this.elements.buyRange.addEventListener('click', () => this.buyUpgrade('range'));
        this.elements.buyAuto.addEventListener('click', () => this.buyUpgrade('auto'));
        this.elements.buyLuck.addEventListener('click', () => this.buyUpgrade('luck'));

        // Prestige button
        this.elements.prestigeButton.addEventListener('click', () => this.performPrestige());

        // Settings
        this.elements.settingsButton.addEventListener('click', () => this.openSettings());
        document.querySelector('.modal-close').addEventListener('click', () => this.closeSettings());
        
        // Audio controls
        this.elements.toggleMusic.addEventListener('click', () => this.toggleMusic());
        this.elements.toggleSfx.addEventListener('click', () => this.toggleSfx());
        this.elements.volumeSlider.addEventListener('input', (e) => this.setVolume(e.target.value / 100));

        // Settings toggles
        document.getElementById('animationToggle').addEventListener('change', (e) => {
            this.settings.animationsEnabled = e.target.checked;
            this.saveSettings();
        });

        document.getElementById('particleToggle').addEventListener('change', (e) => {
            this.settings.particlesEnabled = e.target.checked;
            this.saveSettings();
        });

        document.getElementById('autoSaveToggle').addEventListener('change', (e) => {
            this.settings.autoSaveEnabled = e.target.checked;
            this.saveSettings();
        });

        document.getElementById('resetProgress').addEventListener('click', () => this.resetProgress());

        // Close modal when clicking outside
        this.elements.settingsModal.addEventListener('click', (e) => {
            if (e.target === this.elements.settingsModal) {
                this.closeSettings();
            }
        });
    }

    // Audio System Implementation
    async initAudioSystem() {
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            
            // Create sound effects using Web Audio API
            await this.createSounds();
            
            // Create background music
            this.createBackgroundMusic();
            
        } catch (error) {
            console.warn('Audio system initialization failed:', error);
        }
    }

    async createSounds() {
        const soundConfigs = {
            roll: { frequency: 440, duration: 0.1, type: 'sine' },
            win: { frequency: 880, duration: 0.3, type: 'sine' },
            upgrade: { frequency: 660, duration: 0.2, type: 'triangle' },
            achievement: { frequency: 1320, duration: 0.5, type: 'sine' },
            prestige: { frequency: 220, duration: 1.0, type: 'sawtooth' }
        };

        for (const [name, config] of Object.entries(soundConfigs)) {
            this.sounds[name] = this.createSoundEffect(config);
        }
    }

    createSoundEffect(config) {
        return () => {
            if (!this.settings.sfxEnabled || !this.audioContext) return;

            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();

            oscillator.connect(gainNode);
            gainNode.connect(this.audioContext.destination);

            oscillator.frequency.setValueAtTime(config.frequency, this.audioContext.currentTime);
            oscillator.type = config.type;

            gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
            gainNode.gain.linearRampToValueAtTime(this.settings.masterVolume * 0.3, this.audioContext.currentTime + 0.01);
            gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + config.duration);

            oscillator.start(this.audioContext.currentTime);
            oscillator.stop(this.audioContext.currentTime + config.duration);
        };
    }

    createBackgroundMusic() {
        if (!this.audioContext) return;

        // Simple ambient background music using oscillators
        this.musicLoop = () => {
            if (!this.settings.musicEnabled) return;

            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();

            oscillator.connect(gainNode);
            gainNode.connect(this.audioContext.destination);

            const frequencies = [261.63, 293.66, 329.63, 349.23, 392.00]; // C major pentatonic
            const frequency = frequencies[Math.floor(Math.random() * frequencies.length)];

            oscillator.frequency.setValueAtTime(frequency, this.audioContext.currentTime);
            oscillator.type = 'sine';

            gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
            gainNode.gain.linearRampToValueAtTime(this.settings.masterVolume * 0.05, this.audioContext.currentTime + 0.5);
            gainNode.gain.linearRampToValueAtTime(0, this.audioContext.currentTime + 2);

            oscillator.start(this.audioContext.currentTime);
            oscillator.stop(this.audioContext.currentTime + 2);

            if (this.settings.musicEnabled) {
                setTimeout(this.musicLoop, 3000 + Math.random() * 2000);
            }
        };

        if (this.settings.musicEnabled) {
            setTimeout(this.musicLoop, 1000);
        }
    }

    // Performance optimized roll function with requestAnimationFrame
    performRoll() {
        if (this.isRolling) return;
        
        this.isRolling = true;
        this.elements.rollButton.classList.add('rolling');
        this.elements.currentRoll.classList.add('rolling');

        // Play roll sound
        if (this.sounds.roll) this.sounds.roll();

        // Generate roll with luck bonus
        const roll = this.generateRoll();
        const pointsGained = Math.floor(roll * this.gameState.multiplier);

        // Animate roll using requestAnimationFrame
        this.animateRoll(roll, () => {
            this.gameState.currentRoll = roll;
            this.gameState.points += pointsGained;
            
            // Update streak
            if (roll > this.gameState.maxRange * 0.7) {
                this.gameState.streak++;
            } else {
                this.gameState.streak = 0;
            }

            // Update best roll
            if (roll > this.gameState.bestRoll) {
                this.gameState.bestRoll = roll;
            }

            // Create floating number effect
            this.createFloatingNumber(pointsGained, roll);
            
            // Create particle effects
            if (this.settings.particlesEnabled) {
                this.createParticleEffect(roll);
            }

            // Check achievements
            this.checkAchievements();

            // Update display
            this.updateDisplay();

            // Play win sound for high rolls
            if (roll > this.gameState.maxRange * 0.8 && this.sounds.win) {
                this.sounds.win();
            }

            this.isRolling = false;
            this.elements.rollButton.classList.remove('rolling');
            this.elements.currentRoll.classList.remove('rolling');
        });
    }

    generateRoll() {
        let roll = Math.floor(Math.random() * (this.gameState.maxRange - this.gameState.minRange + 1)) + this.gameState.minRange;
        
        // Apply luck bonus (increases chance of higher rolls)
        if (this.gameState.luckBonus > 0) {
            const luckRoll = Math.floor(Math.random() * (this.gameState.maxRange - this.gameState.minRange + 1)) + this.gameState.minRange;
            if (luckRoll > roll) {
                roll = luckRoll;
            }
        }

        return roll;
    }

    // Smooth roll animation using requestAnimationFrame
    animateRoll(finalValue, callback) {
        const startTime = performance.now();
        const duration = 500; // 0.5 seconds
        const startValue = this.gameState.currentRoll;

        const animate = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);

            // Easing function for smooth animation
            const easeProgress = this.easeOutCubic(progress);
            
            if (progress < 0.8) {
                // Random numbers during animation
                const currentValue = Math.floor(Math.random() * (this.gameState.maxRange - this.gameState.minRange + 1)) + this.gameState.minRange;
                this.elements.currentRoll.textContent = currentValue;
            } else {
                // Smooth transition to final value
                const currentValue = Math.floor(startValue + (finalValue - startValue) * easeProgress);
                this.elements.currentRoll.textContent = currentValue;
            }

            if (progress < 1) {
                requestAnimationFrame(animate);
            } else {
                this.elements.currentRoll.textContent = finalValue;
                callback();
            }
        };

        requestAnimationFrame(animate);
    }

    // Easing function for smooth animations
    easeOutCubic(t) {
        return 1 - Math.pow(1 - t, 3);
    }

    // Create floating number effect
    createFloatingNumber(points, roll) {
        const container = this.elements.floatingNumbers;
        const element = document.createElement('div');
        element.className = 'floating-number';
        element.textContent = `+${points}`;

        // Add rarity classes based on roll value
        const rollPercent = roll / this.gameState.maxRange;
        if (rollPercent >= 0.9) {
            element.classList.add('legendary');
        } else if (rollPercent >= 0.8) {
            element.classList.add('epic');
        } else if (rollPercent >= 0.7) {
            element.classList.add('rare');
        }

        // Random horizontal offset
        const offset = (Math.random() - 0.5) * 100;
        element.style.left = `${offset}px`;

        container.appendChild(element);

        // Remove element after animation
        setTimeout(() => {
            if (element.parentNode) {
                element.parentNode.removeChild(element);
            }
        }, 2000);
    }

    // Create particle effects
    createParticleEffect(roll) {
        const container = this.elements.particleContainer;
        const particleCount = Math.floor(roll / 2) + 5;

        for (let i = 0; i < particleCount; i++) {
            setTimeout(() => {
                const particle = document.createElement('div');
                particle.className = 'particle';

                // Random size and color based on roll value
                const size = Math.random() * 8 + 4;
                const rollPercent = roll / this.gameState.maxRange;
                
                let color;
                if (rollPercent >= 0.9) {
                    color = `hsl(${240 + Math.random() * 40}, 100%, 70%)`; // Blue/Purple
                } else if (rollPercent >= 0.8) {
                    color = `hsl(${300 + Math.random() * 40}, 100%, 70%)`; // Pink/Purple
                } else if (rollPercent >= 0.7) {
                    color = `hsl(${40 + Math.random() * 20}, 100%, 70%)`; // Orange/Yellow
                } else {
                    color = `hsl(${Math.random() * 360}, 70%, 70%)`;
                }

                particle.style.width = `${size}px`;
                particle.style.height = `${size}px`;
                particle.style.backgroundColor = color;
                particle.style.left = `${Math.random() * window.innerWidth}px`;
                particle.style.top = `${Math.random() * 200}px`;

                container.appendChild(particle);

                // Remove particle after animation
                setTimeout(() => {
                    if (particle.parentNode) {
                        particle.parentNode.removeChild(particle);
                    }
                }, 3000);
            }, i * 50);
        }
    }

    // Buy upgrade system
    buyUpgrade(type) {
        const upgrade = this.upgrades[type];
        const cost = this.calculateUpgradeCost(type);

        if (this.gameState.points >= cost) {
            this.gameState.points -= cost;
            upgrade.level++;

            // Apply upgrade effects
            this.applyUpgradeEffect(type);

            // Play upgrade sound
            if (this.sounds.upgrade) this.sounds.upgrade();

            this.updateDisplay();
            this.saveGameState();
        }
    }

    calculateUpgradeCost(type) {
        const upgrade = this.upgrades[type];
        return Math.floor(upgrade.baseCost * Math.pow(upgrade.costMultiplier, upgrade.level));
    }

    applyUpgradeEffect(type) {
        switch (type) {
            case 'multiplier':
                this.gameState.multiplier += 0.5;
                break;
            case 'range':
                this.gameState.maxRange += 5;
                break;
            case 'auto':
                if (!this.gameState.autoClickerActive && this.upgrades.auto.level === 1) {
                    this.startAutoClicker();
                }
                break;
            case 'luck':
                this.gameState.luckBonus = this.upgrades.luck.level * 0.1;
                break;
        }
    }

    // Auto clicker functionality
    startAutoClicker() {
        this.gameState.autoClickerActive = true;
        const autoClick = () => {
            if (this.gameState.autoClickerActive && this.upgrades.auto.level > 0) {
                this.performRoll();
                setTimeout(autoClick, Math.max(500, 1000 - (this.upgrades.auto.level * 50)));
            }
        };
        setTimeout(autoClick, 1000);
    }

    // Prestige system
    performPrestige() {
        const required = 10000 * Math.pow(2, this.gameState.prestigeLevel);
        if (this.gameState.points >= required) {
            if (confirm('Are you sure you want to prestige? This will reset your progress but give you permanent bonuses!')) {
                this.gameState.prestigeLevel++;
                this.gameState.prestigeBonus = this.gameState.prestigeLevel * 10;
                
                // Reset game state but keep prestige
                const prestigeLevel = this.gameState.prestigeLevel;
                const prestigeBonus = this.gameState.prestigeBonus;
                
                this.gameState = {
                    points: 0,
                    multiplier: 1.0 + (prestigeBonus / 100),
                    streak: 0,
                    bestRoll: 0,
                    minRange: 1,
                    maxRange: 10,
                    currentRoll: 0,
                    prestigeLevel,
                    prestigeBonus,
                    autoClickerActive: false,
                    luckBonus: 0
                };

                // Reset upgrades
                Object.keys(this.upgrades).forEach(key => {
                    this.upgrades[key].level = 0;
                });

                // Play prestige sound
                if (this.sounds.prestige) this.sounds.prestige();

                this.updateDisplay();
                this.saveGameState();
            }
        }
    }

    // Achievement system
    checkAchievements() {
        this.achievements.forEach(achievement => {
            if (!achievement.unlocked && achievement.requirement()) {
                achievement.unlocked = true;
                this.showAchievementNotification(achievement);
                if (this.sounds.achievement) this.sounds.achievement();
            }
        });
        this.updateAchievementsDisplay();
    }

    showAchievementNotification(achievement) {
        // Create achievement notification
        const notification = document.createElement('div');
        notification.className = 'achievement-notification';
        notification.innerHTML = `
            <div class="achievement-popup">
                <span class="achievement-icon">${achievement.icon}</span>
                <div>
                    <h4>Achievement Unlocked!</h4>
                    <p>${achievement.name}</p>
                </div>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        // Remove after animation
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 3000);
    }

    updateAchievementsDisplay() {
        const container = this.elements.achievementsList;
        container.innerHTML = '';

        this.achievements.forEach(achievement => {
            const element = document.createElement('div');
            element.className = `achievement ${achievement.unlocked ? 'unlocked' : ''}`;
            element.innerHTML = `
                <span class="achievement-icon">${achievement.icon}</span>
                <div class="achievement-info">
                    <h4>${achievement.name}</h4>
                    <p>${achievement.description}</p>
                </div>
            `;
            container.appendChild(element);
        });
    }

    // Optimized display update using batch DOM manipulation
    updateDisplay() {
        // Batch DOM updates for performance
        const updates = {
            points: this.formatNumber(this.gameState.points),
            multiplier: `${this.gameState.multiplier.toFixed(1)}x`,
            streak: this.gameState.streak.toString(),
            bestRoll: this.gameState.bestRoll.toString(),
            currentRoll: this.gameState.currentRoll.toString(),
            minRange: this.gameState.minRange.toString(),
            maxRange: this.gameState.maxRange.toString(),
            prestigeLevel: this.gameState.prestigeLevel.toString(),
            prestigeBonus: `${this.gameState.prestigeBonus}%`
        };

        // Apply all updates at once
        Object.entries(updates).forEach(([key, value]) => {
            if (this.elements[key]) {
                this.elements[key].textContent = value;
            }
        });

        // Update upgrade displays
        this.updateUpgradeDisplays();
        this.updatePrestigeButton();
    }

    updateUpgradeDisplays() {
        const upgradeTypes = ['multiplier', 'range', 'auto', 'luck'];
        
        upgradeTypes.forEach(type => {
            const level = this.upgrades[type].level;
            const cost = this.calculateUpgradeCost(type);
            const canAfford = this.gameState.points >= cost;

            if (this.elements[`${type}Level`]) {
                this.elements[`${type}Level`].textContent = level.toString();
            }
            if (this.elements[`${type}Cost`]) {
                this.elements[`${type}Cost`].textContent = this.formatNumber(cost);
            }
            if (this.elements[`buy${type.charAt(0).toUpperCase() + type.slice(1)}`]) {
                const button = this.elements[`buy${type.charAt(0).toUpperCase() + type.slice(1)}`];
                button.disabled = !canAfford;
                button.textContent = canAfford ? 'Buy' : 'Not enough points';
            }
        });
    }

    updatePrestigeButton() {
        const required = 10000 * Math.pow(2, this.gameState.prestigeLevel);
        const canPrestige = this.gameState.points >= required;
        
        this.elements.prestigeButton.disabled = !canPrestige;
        this.elements.prestigeButton.textContent = canPrestige ? 
            `Prestige (Reset for +10% bonus)` : 
            `Prestige (Requires ${this.formatNumber(required)} points)`;
    }

    // Number formatting for better readability
    formatNumber(num) {
        if (num >= 1e9) return (num / 1e9).toFixed(2) + 'B';
        if (num >= 1e6) return (num / 1e6).toFixed(2) + 'M';
        if (num >= 1e3) return (num / 1e3).toFixed(1) + 'K';
        return Math.floor(num).toString();
    }

    // Audio controls
    toggleMusic() {
        this.settings.musicEnabled = !this.settings.musicEnabled;
        this.elements.musicIcon.textContent = this.settings.musicEnabled ? '🔊' : '🔇';
        
        if (this.settings.musicEnabled && this.musicLoop) {
            setTimeout(this.musicLoop, 1000);
        }
        
        this.saveSettings();
    }

    toggleSfx() {
        this.settings.sfxEnabled = !this.settings.sfxEnabled;
        this.elements.sfxIcon.textContent = this.settings.sfxEnabled ? '🔔' : '🔕';
        this.saveSettings();
    }

    setVolume(volume) {
        this.settings.masterVolume = volume;
        this.saveSettings();
    }

    // Settings modal
    openSettings() {
        this.elements.settingsModal.classList.add('open');
        this.elements.settingsModal.setAttribute('aria-hidden', 'false');
        
        // Update settings toggles
        document.getElementById('animationToggle').checked = this.settings.animationsEnabled;
        document.getElementById('particleToggle').checked = this.settings.particlesEnabled;
        document.getElementById('autoSaveToggle').checked = this.settings.autoSaveEnabled;
    }

    closeSettings() {
        this.elements.settingsModal.classList.remove('open');
        this.elements.settingsModal.setAttribute('aria-hidden', 'true');
    }

    resetProgress() {
        if (confirm('Are you sure you want to reset ALL progress? This cannot be undone!')) {
            localStorage.removeItem('epicRngGameState');
            localStorage.removeItem('epicRngGameSettings');
            location.reload();
        }
    }

    // Local storage for game state persistence
    saveGameState() {
        if (this.settings.autoSaveEnabled) {
            const saveData = {
                gameState: this.gameState,
                upgrades: this.upgrades,
                achievements: this.achievements.map(a => ({ ...a }))
            };
            localStorage.setItem('epicRngGameState', JSON.stringify(saveData));
        }
    }

    loadGameState() {
        try {
            const saved = localStorage.getItem('epicRngGameState');
            if (saved) {
                const data = JSON.parse(saved);
                this.gameState = { ...this.gameState, ...data.gameState };
                this.upgrades = { ...this.upgrades, ...data.upgrades };
                
                if (data.achievements) {
                    data.achievements.forEach((savedAch, index) => {
                        if (this.achievements[index]) {
                            this.achievements[index].unlocked = savedAch.unlocked;
                        }
                    });
                }

                // Restart auto clicker if it was active
                if (this.gameState.autoClickerActive && this.upgrades.auto.level > 0) {
                    this.startAutoClicker();
                }
            }
        } catch (error) {
            console.warn('Failed to load game state:', error);
        }

        this.loadSettings();
    }

    saveSettings() {
        localStorage.setItem('epicRngGameSettings', JSON.stringify(this.settings));
    }

    loadSettings() {
        try {
            const saved = localStorage.getItem('epicRngGameSettings');
            if (saved) {
                this.settings = { ...this.settings, ...JSON.parse(saved) };
                
                // Apply loaded settings
                this.elements.volumeSlider.value = this.settings.masterVolume * 100;
                this.elements.musicIcon.textContent = this.settings.musicEnabled ? '🔊' : '🔇';
                this.elements.sfxIcon.textContent = this.settings.sfxEnabled ? '🔔' : '🔕';
            }
        } catch (error) {
            console.warn('Failed to load settings:', error);
        }
    }

    // Game loop with requestAnimationFrame
    startGameLoop() {
        const gameLoop = (timestamp) => {
            if (timestamp - this.lastUpdateTime >= 16) { // ~60 FPS
                this.updateDisplay();
                this.lastUpdateTime = timestamp;
            }
            requestAnimationFrame(gameLoop);
        };
        requestAnimationFrame(gameLoop);
    }

    // Auto-save system
    startAutoSave() {
        setInterval(() => {
            if (this.settings.autoSaveEnabled) {
                this.saveGameState();
            }
        }, 10000); // Save every 10 seconds
    }

    // Debounce utility for performance
    debounce(func, wait) {
        return (...args) => {
            clearTimeout(this.debounceTimeout);
            this.debounceTimeout = setTimeout(() => func.apply(this, args), wait);
        };
    }
}

// CSS for achievement notifications
const notificationStyles = `
.achievement-notification {
    position: fixed;
    top: 20px;
    right: 20px;
    z-index: 3000;
    animation: slideInRight 0.5s ease-out;
}

.achievement-popup {
    background: linear-gradient(135deg, #10b981, #059669);
    color: white;
    padding: 1rem;
    border-radius: 0.75rem;
    display: flex;
    align-items: center;
    gap: 0.75rem;
    box-shadow: 0 10px 40px rgba(16, 185, 129, 0.3);
    border: 1px solid rgba(255, 255, 255, 0.2);
    min-width: 300px;
}

.achievement-popup .achievement-icon {
    font-size: 2rem;
}

.achievement-popup h4 {
    margin: 0 0 0.25rem 0;
    font-weight: 600;
}

.achievement-popup p {
    margin: 0;
    opacity: 0.9;
}

@keyframes slideInRight {
    from {
        transform: translateX(100%);
        opacity: 0;
    }
    to {
        transform: translateX(0);
        opacity: 1;
    }
}
`;

// Add notification styles to document
const styleSheet = document.createElement('style');
styleSheet.textContent = notificationStyles;
document.head.appendChild(styleSheet);

// Initialize game when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.epicRngGame = new EpicRNGGame();
});

// Expose game instance for debugging
window.EpicRNGGame = EpicRNGGame;