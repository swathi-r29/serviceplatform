/**
 * Helper function for deterministic pricing calculation in the Service Marketplace.
 * 
 * @param {Object} worker - Full worker user object with skillPricing and skillRates arrays.
 * @param {string} selectedCategory - The service category being booked (e.g. "Plumbing").
 * @param {Object} service - The platform service model object for fallback pricing.
 * @param {number} travelFee - Pre-calculated travel fee (e.g. from haversine distance).
 * @returns {Object} Structured pricing response.
 */
const getServicePrice = (worker, selectedCategory, service, travelFee = 0) => {
    // 1. --- HIGHEST PRIORITY: Admin Assigned Price (Specific override for this worker-service) ---
    const assignedWorkerEntry = service?.workers?.find(
        w => (w.worker?.toString() === worker._id?.toString() || w.worker === worker._id)
    );
    const assignedPrice = parseFloat(assignedWorkerEntry?.price);

    // 2. --- SECOND PRIORITY: Authoritative skillPricing system ---
    const skillPricing = worker.skillPricing?.find(
        sp => sp.skill?.toLowerCase() === selectedCategory?.toLowerCase() && sp.isActive
    );

    // 3. --- THIRD PRIORITY: Legacy hybrid skillRates system ---
    const legacySkill = worker.skillRates?.find(
        s => s.skillName?.toLowerCase() === selectedCategory?.toLowerCase()
    );

    let basePrice = 0;
    let estimatedTime = 1;
    let pricingType = "standard";
    let isCustomRate = false;

    if (assignedPrice > 0) {
        // Admin manually set this price for this worker on this specific service
        basePrice = assignedPrice;
        pricingType = "fixed"; // Admin overrides are usually fixed
        estimatedTime = parseFloat(service?.duration) || 1;
        isCustomRate = true;
    }
    else if (skillPricing && (parseFloat(skillPricing.rate) || 0) > 0) {
        // Authoritative new system
        const rate = parseFloat(skillPricing.rate) || 0;
        // estimatedDuration is in MINUTES in skillPricing, convert to hours for standardisation
        const timeInHours = (parseFloat(skillPricing.estimatedDuration) || 60) / 60;

        if (skillPricing.rateType === "fixed") {
            basePrice = rate;
            pricingType = "fixed";
            estimatedTime = timeInHours;
        } else {
            // "hourly" logic: Total = rate * time
            basePrice = rate * timeInHours;
            pricingType = "hourly";
            estimatedTime = timeInHours;
        }
        isCustomRate = true;
    } 
    else if (legacySkill && (parseFloat(legacySkill.rate) || 0) > 0) {
        // Fallback to legacy hybrid system
        const rate = parseFloat(legacySkill.rate) || 0;
        const time = parseFloat(legacySkill.estimatedTime) || 1; // already in hours

        if (legacySkill.pricingType === "fixed") {
            basePrice = rate;
            pricingType = "fixed";
            estimatedTime = time;
        } else {
            basePrice = rate * time;
            pricingType = "hourly";
            estimatedTime = time;
        }
        isCustomRate = true;
    }
    else {
        // 4. Final Fallback to platform service standard price
        basePrice = parseFloat(service?.price) || 0;
        pricingType = "standard";
        estimatedTime = parseFloat(service?.duration) || 1;
    }

    // 4. Final Total Calculation (ensure all are numbers)
    const total = basePrice + (parseFloat(travelFee) || 0);

    // 5. Senior Developer Standard Output
    return {
        basePrice: Math.round(basePrice * 100) / 100,
        estimatedTime: Math.round(estimatedTime * 10) / 10, // Round to 0.1 hr accuracy
        travelFee: Math.round((parseFloat(travelFee) || 0) * 100) / 100,
        total: Math.round(total * 100) / 100,
        pricingType,
        isCustomRate
    };
};

/**
 * Calculates the minimum "Starting from" price for a service by analyzing assigned workers.
 * 
 * @param {Object} service - The service object populated with workers.
 * @returns {number} The minimum price found.
 */
const getStartingPriceForService = (service) => {
    if (!service.workers || service.workers.length === 0) {
        return parseFloat(service.price) || 0;
    }

    let minPrice = Infinity;

    service.workers.forEach(w => {
        // Handle both populated and ID-only worker refs
        const workerData = w.worker;
        const assignedPrice = parseFloat(w.price);

        if (assignedPrice > 0 && assignedPrice < minPrice) {
            minPrice = assignedPrice;
        }

        // If worker is populated, we could optionally check their skill registry here too
        // but for listing speed, we primarily rely on the assigned price in the service.workers array.
    });

    return minPrice === Infinity ? (parseFloat(service.price) || 0) : minPrice;
};

/**
 * Calculates a tiered travel fee based on distance.
 * - 0 to 5 km: ₹30 (Flat base fee)
 * - 5 to 25 km: ₹30 base + ₹8 per additional km
 * - Above 25 km: ₹30 base + (20 * 8) + ₹5 per additional km
 * 
 * @param {number} distance - Distance in km.
 * @returns {number} Calculated travel fee.
 */
const calculateTravelFee = (distance) => {
    if (distance === null || distance === undefined || distance < 0) return 30;
    
    let fee = 30; // Base fee (includes first 5km)
    
    if (distance > 5) {
        if (distance <= 25) {
            fee += (distance - 5) * 8;
        } else {
            // First 5km: Included in 30
            // Next 20km (5-25km): 20 * 8 = 160
            // Beyond 25km: remaining * 5
            fee += 160 + (distance - 25) * 5;
        }
    }
    
    return Math.round(fee);
};

module.exports = { getServicePrice, getStartingPriceForService, calculateTravelFee };
