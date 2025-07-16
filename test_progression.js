// Test script to simulate game progression
console.log("Testing Epic RNG Game progression...");

// Simulate clicking the roll button many times
function simulateRolls(count) {
  for(let i = 0; i < count; i++) {
    // Simulate a roll with random result
    const roll = Math.floor(Math.random() * 6) + 1;
    console.log(`Roll ${i+1}: ${roll} points`);
  }
}

simulateRolls(20);
console.log("Game progression test complete!");
