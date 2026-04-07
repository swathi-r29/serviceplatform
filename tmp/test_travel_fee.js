const { calculateTravelFee } = require('../backend/utils/pricingHelper');

const testDistances = [
    { dist: 0, expected: 30 },
    { dist: 3, expected: 30 },
    { dist: 5, expected: 30 },
    { dist: 10, expected: 70 }, // 30 + (10-5)*8 = 30 + 40 = 70
    { dist: 25, expected: 190 }, // 30 + 20*8 = 30 + 160 = 190
    { dist: 30, expected: 215 }, // 30 + 160 + 5*5 = 190 + 25 = 215
    { dist: 88.9, expected: 510 }, // 30 + 160 + (88.9-25)*5 = 190 + 63.9*5 = 190 + 319.5 = 509.5 -> 510
    { dist: null, expected: 30 }
];

console.log('🧪 Testing Travel Fee Calculation Tiers:');
console.log('------------------------------------------');

let allPassed = true;
testDistances.forEach(({ dist, expected }) => {
    const result = calculateTravelFee(dist);
    const passed = result === expected;
    console.log(`Distance: ${dist} km | Expected: ₹${expected} | Result: ₹${result} | ${passed ? '✅ PASSED' : '❌ FAILED'}`);
    if (!passed) allPassed = false;
});

console.log('------------------------------------------');
if (allPassed) {
    console.log('🎉 All travel fee tiers calculated correctly!');
} else {
    console.log('⚠️ Some tests failed. Please review the logic.');
    process.exit(1);
}
