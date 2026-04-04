/**
 * Helper function for deterministic pricing calculation in the Service Marketplace.
 * 
 * @param {Object} worker - Full worker user object with skillRates array.
 * @param {string} selectedCategory - The service category being booked (e.g. "Plumbing").
 * @param {Object} service - The platform service model object for fallback pricing.
 * @param {number} travelFee - Pre-calculated travel fee (e.g. from haversine distance).
 * @returns {Object} Structured pricing response.
 */
const getServicePrice = (worker, selectedCategory, service, travelFee = 0) => {
    // 1. Find matching skill (Case-insensitive normalize)
    const skill = worker.skillRates?.find(
        s => s.skillName.toLowerCase() === selectedCategory.toLowerCase()
    );

    let basePrice = 0;
    let estimatedTime = 1;
    let pricingType = "hourly";

    // 2. Core Logic with Number Safety
    if (skill && (parseFloat(skill.rate) || 0) > 0) {
        const rate = parseFloat(skill.rate) || 0;
        const time = parseFloat(skill.estimatedTime) || 1;

        if (skill.pricingType === "fixed") {
            basePrice = rate;
            pricingType = "fixed";
            estimatedTime = time;
        } else {
            // "hourly" logic: Total = rate * time
            basePrice = rate * time;
            pricingType = "hourly";
            estimatedTime = time;
        }
    } else {
        // 3. Fallback to platform service standard price
        basePrice = parseFloat(service.price) || 0;
        pricingType = "standard";
        estimatedTime = parseFloat(service.duration) || 1;
    }

    // 4. Final Total Calculation (ensure all are numbers)
    const total = basePrice + (parseFloat(travelFee) || 0);

    // 5. Senior Developer Standard Output
    return {
        basePrice: Math.round(basePrice * 100) / 100,
        estimatedTime,
        travelFee: Math.round((parseFloat(travelFee) || 0) * 100) / 100,
        total: Math.round(total * 100) / 100,
        pricingType,
        isCustomRate: !!skill
    };
};

module.exports = { getServicePrice };
