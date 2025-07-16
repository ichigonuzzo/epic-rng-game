# Epic RNG Game

A comprehensive clicker game featuring random number generation, rebirth mechanics, and extensive progression systems.

## Features

### Core Gameplay
- **RNG Clicking**: Click to generate random numbers based on your current rebirth layer
- **Progressive Scaling**: Higher layers unlock better RNG ranges (1-10 at Novice, up to 5,000-25,000 at Omnipotent)
- **Visual Feedback**: Floating text animations show score gains, achievements, and special events

### Rebirth System (11 Layers)
1. **Novice** (1-10 range, 2x multiplier)
2. **Apprentice** (5-25 range, 3x multiplier) 
3. **Journeyman** (10-50 range, 5x multiplier)
4. **Expert** (25-100 range, 8x multiplier)
5. **Master** (50-250 range, 12x multiplier)
6. **Grandmaster** (100-500 range, 20x multiplier)
7. **Legendary** (250-1,000 range, 30x multiplier)
8. **Mythical** (500-2,500 range, 50x multiplier)
9. **Divine** (1,000-5,000 range, 80x multiplier)
10. **Transcendent** (2,500-10,000 range, 120x multiplier)
11. **Omnipotent** (5,000-25,000 range, 200x multiplier)

### Upgrade System
- **Click Power**: Multiply your click damage (2x → 12x)
- **Auto Clicker**: Automatic clicking (1-5 clicks per second)
- **Lucky Chance**: Chance for 10x score multiplier (5%-15%)

### Achievement System
- **First Steps**: Make your first click
- **Getting Started**: Make 100 clicks
- **Clicking Master**: Make 1,000 clicks
- **New Beginning**: Perform your first rebirth
- **Halfway There**: Reach rebirth layer 5
- **Ultimate Power**: Reach the maximum rebirth layer
- **Millionaire**: Accumulate 1,000,000 total score
- **Speed Demon**: Make 10 clicks in 1 second

### Save System
- **Auto-save**: Game saves every 30 seconds automatically
- **Manual Export/Import**: Save your progress to a file
- **Persistent Progress**: Game state preserved between sessions

## Files

- `game.js` - Main game logic and mechanics
- `index.html` - Game interface with styling
- `test_console.html` - Minimal test page for development
- `simulate_purchase.html` - Upgrade testing page

## How to Play

1. Click the "🎲 CLICK FOR RNG! 🎲" button to generate random scores
2. Accumulate points to purchase upgrades that increase your efficiency
3. Save up for rebirth to unlock higher layers with better multipliers and ranges
4. Unlock achievements by reaching various milestones
5. Progress through all 11 rebirth layers to achieve ultimate power

## Technical Details

The game is built with vanilla JavaScript and uses:
- localStorage for save/load functionality
- CSS animations for visual feedback
- Event-driven architecture for UI updates
- Modular upgrade and achievement systems
- Exponential scaling mathematics for balanced progression

## Installation

Simply serve the files from a web server:
```bash
python3 -m http.server 8000
```
Then open `http://localhost:8000` in your browser.