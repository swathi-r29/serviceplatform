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

    // 2. Core Logic
    if (skill && skill.rate > 0) {
        if (skill.pricingType === "fixed") {
            basePrice = skill.rate;
            pricingType = "fixed";
            estimatedTime = skill.estimatedTime || 1;
        } else {
            // "hourly" logic: Total = rate * time
            basePrice = skill.rate * (skill.estimatedTime || 1);
            pricingType = "hourly";
            estimatedTime = skill.estimatedTime || 1;
        }
    } else {
        // 3. Fallback to platform service standard price
        basePrice = service.price;
        pricingType = "standard";
        estimatedTime = service.duration || 1;
    }

    // 4. Final Total Calculation
    const total = basePrice + travelFee;

    // 5. Senior Developer Standard Output
    return {
        basePrice,
        estimatedTime,
        travelFee,
        total,
        pricingType,
        isCustomRate: !!skill
    };
};

module.exports = { getServicePrice };
