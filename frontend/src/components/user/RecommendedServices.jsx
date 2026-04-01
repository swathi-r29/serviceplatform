import { useState, useEffect } from 'react';
import { FaMagic, FaStar, FaChevronRight, FaRobot } from 'react-icons/fa';
import axios from '../../api/axios';
import { Link } from 'react-router-dom';

const RecommendedServices = () => {
    const [recommendations, setRecommendations] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchRecommendations = async () => {
            try {
                const { data } = await axios.get('/ai/recommendations');
                setRecommendations(data.slice(0, 3));
            } catch (error) {
                console.error('Failed to fetch recommendations:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchRecommendations();
    }, []);

    if (loading) return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-pulse">
            {[1, 2, 3].map(i => (
                <div key={i} className="h-48 bg-gray-100 rounded-2xl border border-gray-200"></div>
            ))}
        </div>
    );

    if (recommendations.length === 0) return null;

    return (
        <div className="mb-12">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 text-blue-600 rounded-xl shadow-inner">
                        <FaRobot className="text-xl animate-pulse" />
                    </div>
                    <div>
                        <h2 className="text-xl font-extrabold text-gray-900 font-playfair tracking-tight">Smart Recommendations</h2>
                        <p className="text-xs text-gray-500 font-medium flex items-center gap-1"><FaMagic className="text-yellow-500" size={10} /> AI-Curated for You</p>
                    </div>
                </div>
                <Link to="/user/services" className="text-sm font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 group transition-all">
                    View All <FaChevronRight size={10} className="group-hover:translate-x-1 transition-transform" />
                </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {recommendations.map((service) => (
                    <div key={service._id} className="group bg-white rounded-3xl p-5 shadow-sm border border-gray-100 hover:shadow-xl hover:border-blue-100 transition-all duration-300 relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                            <FaMagic className="text-4xl text-blue-600 -rotate-12" />
                        </div>
                        
                        <div className="flex flex-col h-full">
                            <div className="mb-4">
                                <span className="px-2 py-1 bg-blue-50 text-blue-600 rounded-lg text-[10px] font-bold uppercase tracking-wider">
                                    {service.category}
                                </span>
                                <h3 className="text-lg font-bold text-gray-900 mt-2 line-clamp-1">{service.name}</h3>
                                <p className="text-xs font-semibold text-blue-700 bg-blue-50/50 p-2 rounded-xl border border-blue-100 mt-3 leading-snug">
                                    " {service.recommendationReason} "
                                </p>
                            </div>

                            <div className="mt-auto flex items-center justify-between">
                                <div>
                                    <p className="text-[10px] text-gray-400 font-bold uppercase">Starting From</p>
                                    <p className="text-xl font-black text-gray-900">₹{service.price}</p>
                                </div>
                                <Link 
                                    to={`/user/booking/create/${service._id}`}
                                    className="p-3 bg-gray-900 text-white rounded-2xl hover:bg-blue-600 transition-colors shadow-lg shadow-gray-200"
                                >
                                    <FaChevronRight />
                                </Link>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default RecommendedServices;
