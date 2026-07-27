const fs = require('fs');

const text = fs.readFileSync('data.js', 'utf8');

console.log("--- TOPRAK / RAZGAT SEARCH ---");
const lines = text.split('\n');
lines.forEach((line, idx) => {
  if (line.includes('TOPRAK') || line.includes('RAZGAT') || line.includes('Toprak')) {
    console.log(`Line ${idx + 1}: ${line.trim()}`);
  }
});

console.log("\n--- STANDINGS / PILOTS IN DATA.JS ---");
// Let's parse or search for pilot arrays in data.js
const matchesWithI = text.match(/"driver":\s*"[^"]*İ[^"]*"/g);
console.log("Driver matches with İ:", matchesWithI);

const matchesWithI2 = text.match(/"name":\s*"[^"]*İ[^"]*"/g);
console.log("Name matches with İ (first 20):", matchesWithI2 ? matchesWithI2.slice(0, 20) : null);
