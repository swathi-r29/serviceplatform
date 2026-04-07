const { GoogleGenerativeAI } = require("@google/generative-ai");
const Service = require("../models/Service");
const Booking = require("../models/Booking");
const User = require("../models/User");
const { getServicePrice, getStartingPriceForService, calculateTravelFee } = require("../utils/pricingHelper");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Helper for seasonal context
const getSeasonalContext = () => {
    const month = new Date().getMonth();
    const seasons = {
        summer: [2, 3, 4, 5], // Mar-Jun
        monsoon: [6, 7, 8],     // Jul-Sep
        winter: [9, 10, 11, 0, 1] // Oct-Feb
    };

    if (seasons.summer.includes(month)) return "Summer - High demand for Appliance Repair, Pest Control, and Cooling solutions.";
    if (seasons.monsoon.includes(month)) return "Monsoon - High demand for Roof Leakage, Cleaning, and Electric maintenance.";
    return "Winter - Demand for Geyser repair, Painting, and General Home Maintenance.";
};

// 1. Smart Service Recommendations
exports.getSmartRecommendations = async (req, res) => {
    try {
        const userId = req.user._id;
        const user = await User.findById(userId);
        const pastBookings = await Booking.find({ user: userId }).populate('service');
        const allServices = await Service.find({ isActive: true }).select('name category description price image duration');

        const seasonalContext = getSeasonalContext();
        const historySummary = pastBookings.map(b => b.service?.name).join(', ');

        try {
            const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
            const prompt = `
                You are an AI advisor for "ServiceHub", a multi-service platform.
                Current Context: ${seasonalContext}
                User Location: ${user.location || 'Unknown'}
                User Past Booking History: ${historySummary || 'No past bookings'}
                Available Services: ${JSON.stringify(allServices)}

                Based on the context, location, and history, recommend 3 services.
                Return ONLY a JSON array of objects with the following format:
                [{ "serviceId": "id", "reason": "short 1-sentence reason why this is recommended" }]
                Ensure the serviceId matches the _id from Available Services.
            `;

            const result = await model.generateContent(prompt);
            const response = await result.response;
            const responseText = response.text();
            
            console.log("AI Raw Response:", responseText);

            let jsonContent = responseText.trim();
            if (jsonContent.includes("```")) {
                jsonContent = jsonContent.match(/```(?:json)?([\s\S]*?)```/)?.[1] || jsonContent;
            }
            const recommendations = JSON.parse(jsonContent.trim());

            const recommendedServices = [];
            for (const rec of recommendations) {
                const service = await Service.findById(rec.serviceId);
                if (service) {
                    recommendedServices.push({ 
                        ...service.toObject(), 
                        recommendationReason: rec.reason 
                    });
                }
            }

            if (recommendedServices.length > 0) {
                return res.json(recommendedServices);
            }
            throw new Error("No valid services recommended by AI");

        } catch (aiError) {
            console.error("Gemini AI Error, using Fallback:", aiError.message);
            // Fallback: Just suggest the first 3 active services
            const fallbackServices = allServices.slice(0, 3).map(s => ({
                ...s.toObject(),
                recommendationReason: "Recommended based on seasonal demand in your area."
            }));
            return res.json(fallbackServices);
        }
    } catch (error) {
        console.error("AI Controller Critical Failure:", error);
        res.status(500).json({ message: "Internal server error in AI controller" });
    }
};

// 2. Smart NLP Search
exports.smartSearch = async (req, res) => {
    try {
        const { query } = req.body;
        if (!query) return res.status(400).json({ message: "Query is required" });

        const categories = ['Plumbing', 'Electrical', 'Cleaning', 'Carpentry', 'Painting', 'Pest Control', 'Appliance Repair', 'Packers & Movers', 'Salon Services', 'Gardening', 'Smart Home', 'Other'];

        try {
            const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
            const prompt = `
                Convert the following natural language service request into a structured search object.
                Query: "${query}"
                Available Categories: ${categories.join(', ')}

                Rules:
                1. Map the query to the most relevant category.
                2. Extract any requested date (YYYY-MM-DD format) or "tomorrow", "today", "next Monday".
                3. Extract requested time (e.g., "morning" -> 09:00, "evening" -> 17:00).
                
                Return ONLY a JSON object:
                { "category": "CategoryName", "date": "YYYY-MM-DD", "time": "HH:MM", "extractedNotes": "Any specific instructions extracted" }
                If any field is missing, use null. Use current year [2026] for dates.
            `;

            const result = await model.generateContent(prompt);
            const response = await result.response;
            const responseText = response.text();
            
            console.log("AI Search Raw:", responseText);

            let jsonContent = responseText.trim();
            if (jsonContent.includes("```")) {
                jsonContent = jsonContent.match(/```(?:json)?([\s\S]*?)```/)?.[1] || jsonContent;
            }
            const searchParams = JSON.parse(jsonContent.trim());

            const services = await Service.find({ 
                category: { $regex: new RegExp(`^${searchParams.category}$`, 'i') },
                isActive: true 
            });

            const processedServices = services.map(s => {
                const serviceObj = s.toObject();
                // 🩹 HEAL LEGACY DATA
                const healedWorkers = (serviceObj.workers || []).map(w => {
                    if (w && typeof w === 'object' && (w.worker || w._id)) return w;
                    return { worker: w, price: serviceObj.price || 0 };
                });
                serviceObj.workers = healedWorkers;
                serviceObj.startingPrice = getStartingPriceForService(serviceObj);
                return serviceObj;
            });

            return res.json({ searchParams, services: processedServices });

        } catch (aiError) {
            console.error("AI Search Gemini Error, using Fallback:", aiError.message);
            // Fallback: Simple keyword search
            const services = await Service.find({
                $or: [
                    { name: { $regex: query, $options: 'i' } },
                    { category: { $regex: query, $options: 'i' } }
                ],
                isActive: true
            });
            return res.json({ 
                searchParams: { category: "Search Results", date: null, time: null, extractedNotes: "Manual search fallback" }, 
                services 
            });
        }
    } catch (error) {
        console.error("AI Search Controller Critical Failure:", error);
        res.status(500).json({ message: "Smart search failed" });
    }
};

/**
 * Pure deterministic match score for a single provider.
 * No DB calls, no async — all data comes from built providerData.
 * @param {Object} provider  - single entry from providerData
 * @param {Object[]} allProviders - full providerData array
 * @returns {{ total: number, priceScore: number, proximityScore: number, ratingScore: number, rateTypeBonus: number }}
 */
const calculateMatchScore = (provider, allProviders) => {
    // --- 1. PRICE COMPETITIVENESS (35 pts) ---
    const cheapestTotal = Math.min(...allProviders.map(p => p.total));
    const priceDiffRatio = cheapestTotal > 0
        ? (provider.total - cheapestTotal) / cheapestTotal
        : 0;
    let priceScore;
    if (provider.total === cheapestTotal)  priceScore = 35;
    else if (priceDiffRatio <= 0.10)       priceScore = 25;
    else if (priceDiffRatio <= 0.25)       priceScore = 15;
    else                                   priceScore = 5;

    // --- 2. PROXIMITY SCORE (30 pts) ---
    // provider.distanceKm is the raw numeric km value
    let proximityScore;
    const km = provider.distanceKm;
    if (km === null || km === undefined)    proximityScore = 15; // neutral
    else if (km <= 3)                       proximityScore = 30;
    else if (km <= 7)                       proximityScore = 22;
    else if (km <= 15)                      proximityScore = 14;
    else if (km <= 30)                      proximityScore =  7;
    else                                    proximityScore =  2;

    // --- 3. RATING SCORE (25 pts) ---
    const rating = provider.rating || 0;
    let ratingScore;
    if (rating >= 4.8)      ratingScore = 25;
    else if (rating >= 4.5) ratingScore = 20;
    else if (rating >= 4.0) ratingScore = 15;
    else if (rating >= 3.5) ratingScore = 10;
    else                    ratingScore =  5;

    // --- 4. RATE TYPE BONUS (10 pts) ---
    let rateTypeBonus;
    if (provider.rateType === 'fixed')      rateTypeBonus = 10;
    else if (provider.rateType === 'hourly') rateTypeBonus = 5;
    else                                    rateTypeBonus =  3;

    return {
        total: priceScore + proximityScore + ratingScore + rateTypeBonus,
        priceScore,
        proximityScore,
        ratingScore,
        rateTypeBonus
    };
};

const calculateDistance = (lat1, lon1, lat2, lon2) => {
    if (!lat1 || !lon1 || !lat2 || !lon2) return null;
    const R = 6371; // Radius of the earth in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const d = R * c; // Distance in km
    return Math.round(d * 10) / 10;
};

// 3. AI Price Analysis (Provider-to-Provider Comparison)
exports.predictFairPrice = async (req, res) => {
    try {
        const { serviceId, userCoords } = req.body;
        const service = await Service.findById(serviceId).populate('workers.worker');
        
        if (!service) return res.status(404).json({ message: "Service not found" });

        // Get active workers for this service
        let providers = [];
        console.log(`\n🔍 --- COMPARISON AUDIT: ${service.name} ---`);
        console.log(`📂 Category: ${service.category}`);

        // ✅ DATA HEALING: Handle both [{worker, price}] and [ObjectId] structures
        let normalizedWorkers = [];
        if (service.workers && service.workers.length > 0) {
            normalizedWorkers = service.workers.map(w => {
                // If it's already an object with worker property (populated)
                if (w && typeof w === 'object' && w.worker) return w;
                // If it's just a worker object directly (populated legacy array)
                if (w && typeof w === 'object' && w.status) return { worker: w, price: service.price };
                return null;
            }).filter(Boolean);
        }

        console.log(`👥 Normalized Workers found: ${normalizedWorkers.length}`);

        // ✅ ASSIGNED WORKERS (Primary Match)
        if (normalizedWorkers.length > 0) {
            providers = normalizedWorkers
                .filter(w => {
                    const isApproved = w.worker && w.worker.status === 'approved';
                    // 🔍 Audit Log: Why are they filtered?
                    if (!isApproved) console.log(`⚠️  EXCLUSION: ${w.worker?.name || 'Unknown'} is not 'approved'. Status: ${w.worker?.status}`);
                    return isApproved;
                })
                .map(w => ({
                    ...(w.worker.toObject ? w.worker.toObject() : w.worker),
                    serviceSpecificPrice: w.price
                }));
            console.log(`✅ ASSIGNED MATCHES FOUND: ${providers.length}`);
        }

        // ✅ CATEGORY FALLBACK (Only if no assigned workers match)
        if (providers.length === 0) {
            console.log('🔄 Attempting Category Fallback...');
            providers = await User.find({ 
                role: 'worker',
                status: 'approved',
                skills: { $regex: new RegExp(service.category, 'i') }
            });
            console.log(`🔎 CATEGORY RESULTS: ${providers.length}`);
        }

        // --- Build providerData with raw distanceKm for scoring ---
        const providerData = providers.map(p => {
            const distanceKm = calculateDistance(
                userCoords?.lat, userCoords?.lng,
                p.coordinates?.lat, p.coordinates?.lng
            );

            // 🔍 LIVE GPS AUDIT
            console.log(`\n📡 --- GPS AUDIT: ${p.name} ---`);
            console.log(`📍 USER PIN:    Lat: ${userCoords?.lat}, Lng: ${userCoords?.lng}`);
            console.log(`📍 PRO BASE:    Lat: ${p.coordinates?.lat}, Lng: ${p.coordinates?.lng}`);
            console.log(`📏 CALC DIST:   ${distanceKm} km`);
            console.log('------------------------------------\n');

            const travelExpense = calculateTravelFee(distanceKm);

            // skillPricing-aware rateType
            const skillEntry = p.skillPricing?.find(
                sp => sp.skill.toLowerCase() === service.category.toLowerCase() && sp.isActive
            );
            const rateType = skillEntry?.rateType || (p.serviceCharge ? 'fixed' : null);

            const pricing = getServicePrice(p, service.category, service, travelExpense);

            return {
                id: p._id,
                name: p.name,
                rating: p.rating || 4.5,
                serviceCharge: pricing.basePrice,
                travelExpense,
                total: pricing.total,
                distanceKm,                             // raw number for scoring
                distance: distanceKm !== null
                    ? `${distanceKm} km`
                    : (!userCoords ? 'Set location for distance' : 'N/A'),
                estimatedTime: pricing.estimatedTime,
                pricingType: pricing.pricingType,
                rateType: rateType || 'fixed'
            };
        }).sort((a, b) => a.total - b.total).slice(0, 2);

        // --- Deterministic scoring (pure, no DB) ---
        const scoredProviders = providerData.map(p => {
            const breakdown = calculateMatchScore(p, providerData);
            return { ...p, matchScore: breakdown.total, scoreBreakdown: breakdown };
        });

        // Winner = highest matchScore
        const winner = scoredProviders.reduce(
            (best, p) => p.matchScore > best.matchScore ? p : best,
            scoredProviders[0]
        );

        if (scoredProviders.length < 1) {
            return res.status(200).json({
                category: 'INSUFFICIENT_PROV',
                reasoning: 'No nearby professionals found for comparison.',
                matchScore: 0
            });
        }

        // Build unified comparison array
        const comparisonArray = scoredProviders.map(p => ({
            name: p.name,
            charge: `₹${p.serviceCharge}`,
            travel: `₹${p.travelExpense}`,
            total: `₹${p.total}`,
            distance: p.distance,
            rating: p.rating,
            rateType: p.rateType,
            matchScore: p.matchScore
        }));

        const loser = scoredProviders.find(p => p.name !== winner.name) || winner;
        const savingsDetail = loser.total > winner.total
            ? `Save ₹${loser.total - winner.total} vs ${loser.name}`
            : 'Only provider available';

        // --- Gemini: one-sentence reasoning ONLY (deterministic score already set) ---
        let reasoning = `${winner.name} leads with the best combined score across price, distance, and rating.`;
        try {
            const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
            const p1 = scoredProviders[0];
            const p2 = scoredProviders[1] || p1;
            const prompt = `You are a smart assistant for a home services platform.
Two professionals are being compared:
Provider 1: ${p1.name}, Total: ₹${p1.total}, Distance: ${p1.distance}, Rating: ${p1.rating}, Rate Type: ${p1.rateType}
Provider 2: ${p2.name}, Total: ₹${p2.total}, Distance: ${p2.distance}, Rating: ${p2.rating}, Rate Type: ${p2.rateType}
Winner: ${winner.name} (Match Score: ${winner.matchScore}/100)
Write ONE sentence explaining why ${winner.name} is the better choice.
Be specific about which number made the difference. Max 20 words.
Return ONLY the sentence, no JSON, no quotes.`;

            const result = await model.generateContent(prompt);
            const raw = result.response.text().trim();
            if (raw && raw.length < 300) reasoning = raw;
        } catch (aiError) {
            console.error('Gemini reasoning failed, using fallback:', aiError.message);
            // reasoning already set to deterministic fallback string above
        }

        return res.status(200).json({
            winner: winner.name,
            matchScore: winner.matchScore,
            scoreBreakdown: winner.scoreBreakdown,
            comparison: comparisonArray,
            reasoning,
            savingsDetail
        });
    } catch (error) {
        console.error("Provider Analysis Critical Failure:", error);
        res.status(500).json({ message: "Provider analysis failed" });
    }
};


