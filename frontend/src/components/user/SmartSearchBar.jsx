import { useState } from 'react';
import { FaRobot, FaSearch, FaMagic, FaCalendarAlt, FaClock } from 'react-icons/fa';
import axios from '../../api/axios';
import { useNavigate } from 'react-router-dom';

const SmartSearchBar = ({ onResultsFound }) => {
    const [query, setQuery] = useState('');
    const [loading, setLoading] = useState(false);
    const [aiParams, setAiParams] = useState(null);
    const navigate = useNavigate();

    const handleSmartSearch = async (e) => {
        e.preventDefault();
        if (!query.trim()) return;

        setLoading(true);
        try {
            const { data } = await axios.post('/ai/search', { query });
            setAiParams(data.searchParams);
            onResultsFound(data.services, data.searchParams);
        } catch (error) {
            console.error('Smart search failed:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="w-full max-w-4xl mx-auto mb-12">
            <form onSubmit={handleSmartSearch} className="relative group">
                <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                    <FaRobot className={`text-2xl ${loading ? 'text-blue-500 animate-bounce' : 'text-gray-400 group-hover:text-blue-500'} transition-colors`} />
                </div>
                <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Try: 'I need a plumber for tomorrow morning' or 'Suggest cleaning for next Monday'"
                    className="w-full pl-14 pr-32 py-5 bg-white border-2 border-gray-100 rounded-2xl shadow-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-50/50 outline-none text-lg transition-all font-lato"
                />
                <button
                    type="submit"
                    disabled={loading}
                    className="absolute right-3 top-3 bottom-3 px-6 bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-xl font-bold flex items-center gap-2 hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-70"
                >
                    {loading ? (
                        <div className="animate-spin h-5 w-5 border-2 border-white/30 border-t-white rounded-full"></div>
                    ) : (
                        <><FaMagic /> Ask AI</>
                    )}
                </button>
            </form>

            {aiParams && (
                <div className="mt-4 flex flex-wrap gap-3 animate-in">
                    <span className="text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1.5 rounded-full border border-blue-100 flex items-center gap-2">
                        <FaMagic size={10} /> AI Extracted:
                    </span>
                    {aiParams.category && (
                        <span className="text-xs font-medium text-gray-600 bg-white px-3 py-1.5 rounded-full border border-gray-200 shadow-sm">
                            Category: <b className="text-gray-900">{aiParams.category}</b>
                        </span>
                    )}
                    {aiParams.date && (
                        <span className="text-xs font-medium text-gray-600 bg-white px-3 py-1.5 rounded-full border border-gray-200 shadow-sm flex items-center gap-2">
                            <FaCalendarAlt size={10} className="text-pink-500" /> {aiParams.date}
                        </span>
                    )}
                    {aiParams.time && (
                        <span className="text-xs font-medium text-gray-600 bg-white px-3 py-1.5 rounded-full border border-gray-200 shadow-sm flex items-center gap-2">
                            <FaClock size={10} className="text-yellow-500" /> {aiParams.time}
                        </span>
                    )}
                </div>
            )}

            <style jsx="true">{`
                .animate-in {
                    animation: slideUp 0.4s ease-out forwards;
                }
                @keyframes slideUp {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            `}</style>
        </div>
    );
};

export default SmartSearchBar;
