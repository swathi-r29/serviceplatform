import { useContext, useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { FaUser, FaRegCreditCard, FaMapMarkerAlt, FaQuestionCircle, FaSignOutAlt, FaHeart } from 'react-icons/fa';
import axios from '../../api/axios';

const SERVER_URL = 'http://localhost:5000';

const UserSidebar = () => {
    const { user, logout, updateUser } = useContext(AuthContext);
    const navigate = useNavigate();
    const [profileImageUrl, setProfileImageUrl] = useState(null);

    // Build URL from context immediately (so it shows right away if already synced)
    useEffect(() => {
        if (user?.profileImage) {
            const url = user.profileImage.startsWith('http')
                ? user.profileImage
                : `${SERVER_URL}${user.profileImage}`;
            setProfileImageUrl(url);
        }
    }, [user?.profileImage]);

    // Also fetch fresh from API on mount — catches cases where profileImage was
    // uploaded in a previous session before the sync fix was in place
    useEffect(() => {
        const fetchProfileImage = async () => {
            try {
                const { data } = await axios.get('/user/profile');
                if (data.profileImage) {
                    const url = data.profileImage.startsWith('http')
                        ? data.profileImage
                        : `${SERVER_URL}${data.profileImage}`;
                    setProfileImageUrl(url);
                    // Also sync into context so other components benefit
                    updateUser({ profileImage: data.profileImage, name: data.name });
                }
            } catch (_) {
                // silently fail — sidebar still works without the image
            }
        };
        fetchProfileImage();
    }, []);

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    const menuItems = [
        { name: 'Profile Settings', path: '/user/profile', icon: <FaUser /> },
        { name: 'Favorites', path: '/user/favorites', icon: <FaHeart /> },
        { name: 'My Bookings', path: '/user/bookings', icon: <FaRegCreditCard /> },
        { name: 'Payment Methods', path: '/user/payment-methods', icon: <FaRegCreditCard /> },
        { name: 'Saved Addresses', path: '/user/addresses', icon: <FaMapMarkerAlt /> },
        { name: 'Help Center', path: '/support', icon: <FaQuestionCircle /> },
    ];

    return (
        <aside className="w-64 bg-black text-white flex flex-col fixed h-full z-50 transition-all duration-300 hidden md:flex">

            {/* Navigation */}
            <nav className="flex-1 overflow-y-auto px-4 py-4 space-y-1 mt-6">
                <p className="px-4 text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Menu</p>
                {menuItems.map((item) => (
                    <NavLink
                        key={item.name}
                        to={item.path}
                        className={({ isActive }) =>
                            `flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors group ${isActive
                                ? 'bg-white/10 text-white shadow-sm'
                                : 'text-gray-400 hover:bg-white/5 hover:text-white'
                            }`
                        }
                    >
                        {({ isActive }) => (
                            <>
                                <span className={isActive ? 'text-[#c4975d]' : 'text-gray-500 group-hover:text-gray-300'}>
                                    {item.icon}
                                </span>
                                {item.name}
                            </>
                        )}
                    </NavLink>
                ))}
            </nav>

            {/* Profile Footer */}
            <div className="p-4 bg-[#142036]">
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center overflow-hidden border-2 border-[#c4975d] text-gray-300 flex-shrink-0">
                        {profileImageUrl ? (
                            <img
                                src={profileImageUrl}
                                alt={user?.name || 'Profile'}
                                className="w-full h-full object-cover"
                                onError={() => setProfileImageUrl(null)}
                            />
                        ) : user?.name ? (
                            <span className="text-lg font-bold">{user.name.charAt(0).toUpperCase()}</span>
                        ) : (
                            <FaUser />
                        )}
                    </div>
                    <div className="overflow-hidden">
                        <h4 className="text-white text-sm font-bold leading-tight truncate">{user?.name || 'User'}</h4>
                        <p className="text-[10px] font-bold text-[#c4975d] uppercase tracking-wider">Diamond Member</p>
                    </div>
                </div>
                <button
                    onClick={handleLogout}
                    className="w-full flex items-center justify-center gap-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 font-bold py-2.5 rounded-lg text-xs uppercase tracking-wider transition-colors border border-red-500/20"
                >
                    <FaSignOutAlt /> Sign Out
                </button>
            </div>
        </aside>
    );
};

export default UserSidebar;
