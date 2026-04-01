import { useState, useEffect } from 'react';
import axios from '../../api/axios';

const WorkerLevel = () => {
  const [levelData, setLevelData] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLevelData();
    fetchStats();
  }, []);

  const fetchLevelData = async () => {
    try {
      const { data } = await axios.get('/workers/my-level');
      setLevelData(data);
    } catch (error) {
      console.error('Failed to fetch level data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const { data } = await axios.get('/workers/my-stats');
      setStats(data);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  };

  const getLevelColor = (level) => {
    const colors = {
      bronze: 'from-orange-600 to-orange-800',
      silver: 'from-gray-400 to-gray-600',
      gold: 'from-yellow-500 to-yellow-700',
      platinum: 'from-purple-500 to-purple-700'
    };
    return colors[level] || 'from-gray-400 to-gray-600';
  };

  const getLevelIcon = (level) => {
    const icons = {
      bronze: '🥉',
      silver: '🥈',
      gold: '🥇',
      platinum: '💎'
    };
    return icons[level] || '🏅';
  };

  const getNextLevel = (currentLevel) => {
    const levels = ['bronze', 'silver', 'gold', 'platinum'];
    const currentIndex = levels.indexOf(currentLevel);
    return currentIndex < levels.length - 1 ? levels[currentIndex + 1] : null;
  };

  const getNextLevelRequirements = (currentLevel) => {
    const requirements = {
      bronze: { jobs: 20, rating: 4.0, level: 'silver' },
      silver: { jobs: 50, rating: 4.5, level: 'gold' },
      gold: { jobs: 100, rating: 4.8, level: 'platinum' },
      platinum: null
    };
    return requirements[currentLevel];
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!levelData) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">Failed to load level data</p>
      </div>
    );
  }

  const nextLevel = getNextLevel(levelData.level);
  const nextRequirements = getNextLevelRequirements(levelData.level);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Main Level Card */}
      <div className={`bg-gradient-to-r ${getLevelColor(levelData.level)} rounded-3xl shadow-2xl overflow-hidden mb-8`}>
        <div className="p-8 text-white">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="text-7xl">{getLevelIcon(levelData.level)}</div>
              <div>
                <h1 className="text-4xl font-bold capitalize mb-2">{levelData.level} Worker</h1>
                <p className="text-white/90 text-lg">Your current achievement level</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-white/80 text-sm mb-1">Overall Rating</p>
              <div className="flex items-center gap-2">
                <span className="text-5xl font-bold">{levelData.rating?.toFixed(1) || '0.0'}</span>
                <span className="text-3xl">⭐</span>
              </div>
            </div>
          </div>

          {/* Progress to Next Level */}
          {nextLevel && (
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{getLevelIcon(nextLevel)}</span>
                  <div>
                    <p className="font-semibold capitalize">Next: {nextLevel}</p>
                    <p className="text-sm text-white/80">Keep improving to unlock!</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-3xl font-bold">{Math.round(levelData.levelProgress)}%</p>
                  <p className="text-xs text-white/80">Progress</p>
                </div>
              </div>
              
              <div className="w-full bg-white/20 rounded-full h-4 mb-4">
                <div
                  className="bg-white rounded-full h-4 transition-all duration-500 flex items-center justify-end pr-2"
                  style={{ width: `${levelData.levelProgress}%` }}
                >
                  {levelData.levelProgress > 10 && (
                    <span className="text-xs font-bold text-gray-800">{Math.round(levelData.levelProgress)}%</span>
                  )}
                </div>
              </div>

              {nextRequirements && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white/10 rounded-lg p-3">
                    <p className="text-xs text-white/70 mb-1">Jobs Required</p>
                    <p className="font-bold">
                      {levelData.completedJobs} / {nextRequirements.jobs}
                    </p>
                  </div>
                  <div className="bg-white/10 rounded-lg p-3">
                    <p className="text-xs text-white/70 mb-1">Rating Required</p>
                    <p className="font-bold">
                      {levelData.rating?.toFixed(1) || '0.0'} / {nextRequirements.rating.toFixed(1)}
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Platinum Achievement */}
          {levelData.level === 'platinum' && (
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 text-center">
              <div className="text-5xl mb-3">🎉</div>
              <h3 className="text-2xl font-bold mb-2">Maximum Level Achieved!</h3>
              <p className="text-white/80">You've reached the highest level. Keep maintaining your excellence!</p>
            </div>
          )}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <span className="text-xs text-gray-500 font-medium">TOTAL</span>
          </div>
          <p className="text-3xl font-bold text-gray-900 mb-1">{levelData.completedJobs}</p>
          <p className="text-sm text-gray-600">Completed Jobs</p>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            </div>
            <span className="text-xs text-gray-500 font-medium">ALL TIME</span>
          </div>
          <p className="text-3xl font-bold text-gray-900 mb-1">{levelData.rating?.toFixed(2) || '0.00'}</p>
          <p className="text-sm text-gray-600">Average Rating</p>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
            <span className="text-xs text-gray-500 font-medium">RECENT</span>
          </div>
          <p className="text-3xl font-bold text-gray-900 mb-1">{levelData.recentRatingAverage?.toFixed(2) || '0.00'}</p>
          <p className="text-sm text-gray-600">Last 10 Ratings</p>
        </div>
      </div>

      {/* Badges Section */}
      <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
          <span className="text-3xl">🏆</span>
          Your Badges
        </h2>

        {levelData.badges && levelData.badges.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {levelData.badges.map((badge, idx) => (
              <div
                key={idx}
                className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-xl p-6 border-2 border-yellow-200 hover:shadow-lg transition-shadow"
              >
                <div className="text-center">
                  <div className="text-5xl mb-3">{badge.icon}</div>
                  <h3 className="font-bold text-gray-900 mb-1">{badge.name}</h3>
                  <p className="text-xs text-gray-600 mb-2">{badge.description}</p>
                  <p className="text-xs text-gray-500">
                    Earned {new Date(badge.earnedAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🎖️</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Badges Yet</h3>
            <p className="text-gray-600">Complete more jobs and maintain high ratings to earn badges!</p>
          </div>
        )}
      </div>

      {/* Level Benefits */}
      <div className="bg-white rounded-2xl shadow-lg p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Level Benefits</h2>
        
        <div className="grid md:grid-cols-4 gap-6">
          {/* Bronze */}
          <div className={`rounded-xl p-6 ${
            levelData.level === 'bronze' 
              ? 'bg-gradient-to-br from-orange-100 to-orange-200 border-2 border-orange-400' 
              : 'bg-gray-50 border border-gray-200'
          }`}>
            <div className="text-4xl mb-3">🥉</div>
            <h3 className="font-bold text-gray-900 mb-2">Bronze</h3>
            <ul className="space-y-2 text-sm text-gray-700">
              <li className="flex items-start gap-2">
                <svg className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>Basic profile listing</span>
              </li>
              <li className="flex items-start gap-2">
                <svg className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>Standard support</span>
              </li>
            </ul>
          </div>

          {/* Silver */}
          <div className={`rounded-xl p-6 ${
            levelData.level === 'silver' 
              ? 'bg-gradient-to-br from-gray-200 to-gray-300 border-2 border-gray-400' 
              : 'bg-gray-50 border border-gray-200'
          }`}>
            <div className="text-4xl mb-3">🥈</div>
            <h3 className="font-bold text-gray-900 mb-2">Silver</h3>
            <ul className="space-y-2 text-sm text-gray-700">
              <li className="flex items-start gap-2">
                <svg className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>Featured in search</span>
              </li>
              <li className="flex items-start gap-2">
                <svg className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>Priority support</span>
              </li>
              <li className="flex items-start gap-2">
                <svg className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>Level badge</span>
              </li>
            </ul>
          </div>

          {/* Gold */}
          <div className={`rounded-xl p-6 ${
            levelData.level === 'gold' 
              ? 'bg-gradient-to-br from-yellow-200 to-yellow-300 border-2 border-yellow-500' 
              : 'bg-gray-50 border border-gray-200'
          }`}>
            <div className="text-4xl mb-3">🥇</div>
            <h3 className="font-bold text-gray-900 mb-2">Gold</h3>
            <ul className="space-y-2 text-sm text-gray-700">
              <li className="flex items-start gap-2">
                <svg className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>Top search results</span>
              </li>
              <li className="flex items-start gap-2">
                <svg className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>Premium badge</span>
              </li>
              <li className="flex items-start gap-2">
                <svg className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>Premium support</span>
              </li>
              <li className="flex items-start gap-2">
                <svg className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>More bookings</span>
              </li>
            </ul>
          </div>

          {/* Platinum */}
          <div className={`rounded-xl p-6 ${
            levelData.level === 'platinum' 
              ? 'bg-gradient-to-br from-purple-200 to-purple-300 border-2 border-purple-500' 
              : 'bg-gray-50 border border-gray-200'
          }`}>
            <div className="text-4xl mb-3">💎</div>
            <h3 className="font-bold text-gray-900 mb-2">Platinum</h3>
            <ul className="space-y-2 text-sm text-gray-700">
              <li className="flex items-start gap-2">
                <svg className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>Elite status</span>
              </li>
              <li className="flex items-start gap-2">
                <svg className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>Exclusive badge</span>
              </li>
              <li className="flex items-start gap-2">
                <svg className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>VIP support</span>
              </li>
              <li className="flex items-start gap-2">
                <svg className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>Highest priority</span>
              </li>
              <li className="flex items-start gap-2">
                <svg className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>Maximum bookings</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorkerLevel;