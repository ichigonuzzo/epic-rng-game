// Epic RNG Game - Save/Load System

class SaveSystem {
    constructor(game) {
        this.game = game;
        this.saveKey = 'epicRngGameSave';
        this.autoSaveInterval = 30000; // 30 seconds
        this.compressionEnabled = true;
        
        this.startAutoSave();
    }

    // Enhanced save game with compression and validation
    saveGame(isAuto = false) {
        try {
            const saveData = this.createSaveData();
            const serializedData = this.serializeData(saveData);
            
            localStorage.setItem(this.saveKey, serializedData);
            
            // Also save to backup slot
            if (!isAuto) {
                localStorage.setItem(this.saveKey + '_backup', serializedData);
            }
            
            if (!isAuto) {
                this.showNotification('Game saved successfully!', 'success');
            }
            
            return true;
        } catch (error) {
            console.error('Failed to save game:', error);
            if (!isAuto) {
                this.showNotification('Failed to save game!', 'error');
            }
            return false;
        }
    }

    // Enhanced load game with validation and error recovery
    loadGame() {
        try {
            let saveData = this.loadFromStorage(this.saveKey);
            
            // If main save fails, try backup
            if (!saveData) {
                saveData = this.loadFromStorage(this.saveKey + '_backup');
                if (saveData) {
                    this.showNotification('Loaded from backup save!', 'warning');
                }
            }
            
            if (!saveData) {
                this.showNotification('No save data found!', 'error');
                return false;
            }
            
            if (this.validateSaveData(saveData)) {
                this.applySaveData(saveData);
                this.showNotification('Game loaded successfully!', 'success');
                return true;
            } else {
                this.showNotification('Save data is corrupted!', 'error');
                return false;
            }
        } catch (error) {
            console.error('Failed to load game:', error);
            this.showNotification('Failed to load game!', 'error');
            return false;
        }
    }

    loadFromStorage(key) {
        try {
            const serializedData = localStorage.getItem(key);
            if (serializedData) {
                return this.deserializeData(serializedData);
            }
        } catch (error) {
            console.error('Failed to load from storage:', error);
        }
        return null;
    }

    createSaveData() {
        const saveData = {
            version: '1.0.0',
            timestamp: Date.now(),
            gameState: { ...this.game.gameState },
            
            // Include upgrade data if available
            upgradeData: window.upgradeSystem ? window.upgradeSystem.saveData() : null,
            
            // Include rolling system data if available
            rollingData: this.game.rollingSystem ? {
                rollHistory: this.game.rollingSystem.rollHistory.slice(0, 50), // Save last 50 rolls
                multiRollCount: this.game.rollingSystem.multiRollCount
            } : null,
            
            // Game statistics
            statistics: {
                totalPlayTime: this.getTotalPlayTime(),
                sessionsPlayed: this.getSessionsPlayed() + 1,
                highestLayer: Math.max(this.game.gameState.currentLayer, this.getHighestLayer()),
                totalPointsEarned: this.getTotalPointsEarned() + this.game.gameState.points
            }
        };
        
        return saveData;
    }

    applySaveData(saveData) {
        // Apply game state
        Object.assign(this.game.gameState, saveData.gameState);
        
        // Apply upgrade data
        if (saveData.upgradeData && window.upgradeSystem) {
            window.upgradeSystem.loadData(saveData.upgradeData);
        }
        
        // Apply rolling data
        if (saveData.rollingData && this.game.rollingSystem) {
            this.game.rollingSystem.rollHistory = saveData.rollingData.rollHistory || [];
            this.game.rollingSystem.multiRollCount = saveData.rollingData.multiRollCount || 1;
        }
        
        // Update statistics
        if (saveData.statistics) {
            this.updateStatistics(saveData.statistics);
        }
        
        // Restart auto-roll if it was enabled
        if (this.game.gameState.autoRollEnabled) {
            this.game.toggleAutoRoll();
            this.game.toggleAutoRoll(); // Toggle twice to restart properly
        }
        
        // Update all displays
        this.game.updateDisplay();
        this.game.renderLayers();
        this.game.renderUpgrades();
        this.game.showUnlockedFeatures();
    }

    validateSaveData(saveData) {
        // Basic validation checks
        if (!saveData || typeof saveData !== 'object') return false;
        if (!saveData.version || !saveData.gameState) return false;
        
        // Validate game state structure
        const requiredFields = ['points', 'currentLayer', 'multiplier', 'totalRolls'];
        for (const field of requiredFields) {
            if (typeof saveData.gameState[field] !== 'number') return false;
        }
        
        // Validate ranges
        if (saveData.gameState.currentLayer < 1 || saveData.gameState.currentLayer > 11) return false;
        if (saveData.gameState.points < 0) return false;
        if (saveData.gameState.multiplier < 0) return false;
        
        return true;
    }

    serializeData(data) {
        const jsonString = JSON.stringify(data);
        
        if (this.compressionEnabled) {
            // Simple compression by removing common patterns
            return this.compressString(jsonString);
        }
        
        return jsonString;
    }

    deserializeData(serializedData) {
        let jsonString = serializedData;
        
        if (this.compressionEnabled) {
            jsonString = this.decompressString(serializedData);
        }
        
        return JSON.parse(jsonString);
    }

    compressString(str) {
        // Simple compression - replace common patterns
        const patterns = {
            '"gameState"': '£1',
            '"currentLayer"': '£2',
            '"multiplier"': '£3',
            '"totalRolls"': '£4',
            '"points"': '£5',
            '"upgradeData"': '£6',
            '"purchasedUpgrades"': '£7'
        };
        
        let compressed = str;
        Object.entries(patterns).forEach(([original, replacement]) => {
            compressed = compressed.replace(new RegExp(original, 'g'), replacement);
        });
        
        return compressed;
    }

    decompressString(str) {
        // Reverse the compression
        const patterns = {
            '£1': '"gameState"',
            '£2': '"currentLayer"',
            '£3': '"multiplier"',
            '£4': '"totalRolls"',
            '£5': '"points"',
            '£6': '"upgradeData"',
            '£7': '"purchasedUpgrades"'
        };
        
        let decompressed = str;
        Object.entries(patterns).forEach(([compressed, original]) => {
            decompressed = decompressed.replace(new RegExp(compressed, 'g'), original);
        });
        
        return decompressed;
    }

    // Export save to file
    exportSave() {
        try {
            const saveData = this.createSaveData();
            const serializedData = this.serializeData(saveData);
            
            const blob = new Blob([serializedData], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            
            const a = document.createElement('a');
            a.href = url;
            a.download = `epic-rng-save-${new Date().toISOString().split('T')[0]}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            
            this.showNotification('Save exported successfully!', 'success');
        } catch (error) {
            console.error('Failed to export save:', error);
            this.showNotification('Failed to export save!', 'error');
        }
    }

    // Import save from file
    importSave() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        
        input.onchange = (event) => {
            const file = event.target.files[0];
            if (!file) return;
            
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const serializedData = e.target.result;
                    const saveData = this.deserializeData(serializedData);
                    
                    if (this.validateSaveData(saveData)) {
                        if (confirm('This will overwrite your current progress. Continue?')) {
                            this.applySaveData(saveData);
                            this.showNotification('Save imported successfully!', 'success');
                        }
                    } else {
                        this.showNotification('Invalid save file!', 'error');
                    }
                } catch (error) {
                    console.error('Failed to import save:', error);
                    this.showNotification('Failed to import save!', 'error');
                }
            };
            reader.readAsText(file);
        };
        
        input.click();
    }

    // Reset game with confirmation
    resetGame() {
        const confirmText = 'Are you sure you want to reset ALL progress? This cannot be undone!\n\nType "RESET" to confirm:';
        const userInput = prompt(confirmText);
        
        if (userInput === 'RESET') {
            this.clearAllSaves();
            this.showNotification('Game reset successfully!', 'success');
            setTimeout(() => location.reload(), 1000);
        } else {
            this.showNotification('Reset cancelled.', 'info');
        }
    }

    clearAllSaves() {
        localStorage.removeItem(this.saveKey);
        localStorage.removeItem(this.saveKey + '_backup');
        localStorage.removeItem(this.saveKey + '_statistics');
    }

    // Statistics tracking
    getTotalPlayTime() {
        const stats = this.getStatistics();
        return stats.totalPlayTime || 0;
    }

    getSessionsPlayed() {
        const stats = this.getStatistics();
        return stats.sessionsPlayed || 0;
    }

    getHighestLayer() {
        const stats = this.getStatistics();
        return stats.highestLayer || 1;
    }

    getTotalPointsEarned() {
        const stats = this.getStatistics();
        return stats.totalPointsEarned || 0;
    }

    getStatistics() {
        try {
            const statsData = localStorage.getItem(this.saveKey + '_statistics');
            return statsData ? JSON.parse(statsData) : {};
        } catch (error) {
            return {};
        }
    }

    updateStatistics(newStats) {
        try {
            localStorage.setItem(this.saveKey + '_statistics', JSON.stringify(newStats));
        } catch (error) {
            console.error('Failed to update statistics:', error);
        }
    }

    // Auto-save functionality
    startAutoSave() {
        setInterval(() => {
            if (this.game && this.game.gameState) {
                this.saveGame(true);
            }
        }, this.autoSaveInterval);
    }

    // Notification system
    showNotification(message, type = 'info') {
        // Create notification element if it doesn't exist
        let notificationContainer = document.getElementById('notification-container');
        if (!notificationContainer) {
            notificationContainer = document.createElement('div');
            notificationContainer.id = 'notification-container';
            notificationContainer.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                z-index: 1000;
                max-width: 300px;
            `;
            document.body.appendChild(notificationContainer);
        }

        // Create notification
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        notification.style.cssText = `
            background: ${this.getNotificationColor(type)};
            color: white;
            padding: 12px 16px;
            margin-bottom: 8px;
            border-radius: 6px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            animation: slideIn 0.3s ease-out;
            cursor: pointer;
        `;

        // Add click to dismiss
        notification.addEventListener('click', () => {
            notification.style.animation = 'slideOut 0.3s ease-in';
            setTimeout(() => notification.remove(), 300);
        });

        notificationContainer.appendChild(notification);

        // Auto-remove after 5 seconds
        setTimeout(() => {
            if (notification.parentNode) {
                notification.style.animation = 'slideOut 0.3s ease-in';
                setTimeout(() => notification.remove(), 300);
            }
        }, 5000);

        // Add CSS animations if not already present
        if (!document.getElementById('notification-styles')) {
            const style = document.createElement('style');
            style.id = 'notification-styles';
            style.textContent = `
                @keyframes slideIn {
                    from { transform: translateX(100%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
                @keyframes slideOut {
                    from { transform: translateX(0); opacity: 1; }
                    to { transform: translateX(100%); opacity: 0; }
                }
            `;
            document.head.appendChild(style);
        }
    }

    getNotificationColor(type) {
        const colors = {
            success: '#4CAF50',
            error: '#f44336',
            warning: '#FF9800',
            info: '#2196F3'
        };
        return colors[type] || colors.info;
    }

    // Get save data size information
    getSaveInfo() {
        try {
            const mainSave = localStorage.getItem(this.saveKey);
            const backupSave = localStorage.getItem(this.saveKey + '_backup');
            const stats = localStorage.getItem(this.saveKey + '_statistics');
            
            const mainSize = mainSave ? new Blob([mainSave]).size : 0;
            const backupSize = backupSave ? new Blob([backupSave]).size : 0;
            const statsSize = stats ? new Blob([stats]).size : 0;
            
            return {
                mainSaveSize: mainSize,
                backupSaveSize: backupSize,
                statisticsSize: statsSize,
                totalSize: mainSize + backupSize + statsSize,
                hasMainSave: !!mainSave,
                hasBackupSave: !!backupSave,
                hasStatistics: !!stats
            };
        } catch (error) {
            console.error('Failed to get save info:', error);
            return null;
        }
    }
}

// Initialize save system when game loads
if (typeof window !== 'undefined') {
    document.addEventListener('DOMContentLoaded', () => {
        // Wait for game to initialize
        setTimeout(() => {
            if (window.game) {
                window.saveSystem = new SaveSystem(window.game);
                
                // Override game's save/load methods to use the enhanced system
                window.game.saveGame = (isAuto = false) => window.saveSystem.saveGame(isAuto);
                window.game.loadGame = () => window.saveSystem.loadGame();
                window.game.resetGame = () => window.saveSystem.resetGame();
                
                // Add export/import buttons to the UI
                const saveControls = document.getElementById('save-controls');
                if (saveControls) {
                    const exportBtn = document.createElement('button');
                    exportBtn.textContent = 'Export Save';
                    exportBtn.className = 'utility-btn';
                    exportBtn.onclick = () => window.saveSystem.exportSave();
                    
                    const importBtn = document.createElement('button');
                    importBtn.textContent = 'Import Save';
                    importBtn.className = 'utility-btn';
                    importBtn.onclick = () => window.saveSystem.importSave();
                    
                    saveControls.appendChild(exportBtn);
                    saveControls.appendChild(importBtn);
                }
                
                // Try to load existing save on initialization
                if (localStorage.getItem('epicRngGameSave')) {
                    window.saveSystem.loadGame();
                }
            }
        }, 200);
    });
}