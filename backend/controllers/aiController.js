const { GoogleGenerativeAI } = require("@google/generative-ai");
const Service = require("../models/Service");
const Booking = require("../models/Booking");
const User = require("../models/User");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Helper for seasonal context
const getSeasonalContext = () => {
    const month = new Date().getMonth();
    const seasons = {
        summer: [2, 3, 4, 5], // Mar-Jun
        monsoon: [6, 7, 8],     // Jul-Sep
        winter: [9, 10, 11, 0, 1] // Oct-Feb
    };

    if (seasons.summer.includes(month)) return "Summer - High demand for AC Repair, Pest Control, and Cooling solutions.";
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
            const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
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

        const categories = ['Plumbing', 'Electrical', 'Cleaning', 'Carpentry', 'Painting', 'AC Repair', 'Cooking', 'Pest Control', 'Appliance Repair', 'Moving & Packing', 'Home Tutoring', 'Salon & Spa', 'Gardening', 'Smart Home', 'Other'];

        try {
            const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
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

            return res.json({ searchParams, services });

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

// Helper for Haversine distance
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

        // Process top 2 providers with travel info
        const providerData = providers.map(p => {
            const distance = calculateDistance(
                userCoords?.lat, userCoords?.lng, 
                p.coordinates?.lat, p.coordinates?.lng
            );

            // 🔍 LIVE GPS AUDIT: Diagnosing the 68km vs 21km mismatch
            console.log(`\n📡 --- GPS AUDIT: ${p.name} ---`);
            console.log(`📍 USER PIN:    Lat: ${userCoords?.lat}, Lng: ${userCoords?.lng}`);
            console.log(`📍 PRO BASE:    Lat: ${p.coordinates?.lat}, Lng: ${p.coordinates?.lng}`);
            console.log(`📏 CALC DIST:   ${distance} km`);
            console.log('------------------------------------\n');

            const travelExpense = distance ? Math.max(50, Math.round(distance * 10)) : 50; // ₹10/km, min ₹50
            
            // ✅ Use service-specific price, then worker rate, then service base price
            const workerCharge = p.serviceSpecificPrice || p.serviceCharge || p.hourlyRate || service.price;
            
            return {
                id: p._id,
                name: p.name,
                rating: p.rating || 4.5,
                serviceCharge: workerCharge,      // ✅ per-worker rate
                travelExpense,
                total: workerCharge + travelExpense,  // ✅ real comparison
                distance: distance ? `${distance} km` : (!userCoords ? 'Set location for distance' : 'N/A')
            };
        }).sort((a, b) => a.total - b.total).slice(0, 2);

        if (providerData.length < 1) {
            return res.json({ 
                category: "INSUFFICIENT_PROV", 
                reasoning: "No nearby professionals found for comparison.",
                smartScore: 0
            });
        }

        try {
            const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
            const prompt = `
You are a "Smart Choice" Professional Choice AI. 
Your goal is to compare TWO internal professionals (e.g. Sam, Mansha) and recommend the best one for the customer based on total cost (Service + Travel) and ratings.

⚠️ CRITICAL RULES:
1. ONLY use names and data from PROVIDER_DATA.
2. NEVER mention external websites like Urban Company, TaskRabbit, or others.
3. NEVER hallucinate price data outside of what is provided.
4. If one is cheaper or closer, highlight that specific advantage.
5. Provide a "winner" name and a "reasoning".

📥 PROVIDER_DATA:
${JSON.stringify(providerData)}

🎯 TASK:
Break down the costs and name the winner. Focus on saving the user money on travel. 
CRITICAL: Use the specific "distance" and "travelExpense" provided in the PROVIDER_DATA for each professional. NEVER invent or say "Unknown" if a distance is provided.

🧾 OUTPUT FORMAT (STRICT JSON ONLY):
{
  "winner": "Name of winning provider",
  "comparison": [
    { "name": "string", "charge": "₹SC", "travel": "₹TE", "total": "₹T", "distance": "km" }
  ],
  "reasoning": "1-sentence explaination why winner was chosen",
  "smartScore": number (0-100 logic: 100 = huge distance saving/best rating, <50 = long distance),
  "savingsDetail": "How much they save vs the other option"
}
            `;

            const result = await model.generateContent(prompt);
            const response = await result.response;
            let responseText = response.text().trim();
            
            if (responseText.includes("```")) {
                responseText = responseText.match(/```(?:json)?([\s\S]*?)```/)?.[1] || responseText;
            }

            const analysis = JSON.parse(responseText.trim());
            return res.json(analysis);

        } catch (aiError) {
            console.error("AI Provider Analysis Error:", aiError.message);
            // Simple Fallback Comparison
            const p1 = providerData[0];
            const p2 = providerData[1] || p1;
            return res.json({
                winner: p1.name,
                comparison: providerData.map(p => ({
                    name: p.name,
                    charge: `₹${p.serviceCharge}`,
                    travel: `₹${p.travelExpense}`,
                    total: `₹${p.total}`,
                    distance: `${p.distance} km`
                })),
                reasoning: `${p1.name} is the best choice based on total cost and availability.`,
                smartScore: 90,
                savingsDetail: p2 ? `Save ₹${p2.total - p1.total} compared to ${p2.name}` : "Only provider available"
            });
        }
    } catch (error) {
        console.error("Provider Analysis Critical Failure:", error);
        res.status(500).json({ message: "Provider analysis failed" });
    }
};


