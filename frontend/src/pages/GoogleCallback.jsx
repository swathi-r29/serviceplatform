import { useEffect, useContext } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const GoogleCallback = () => {
    const { setUser } = useContext(AuthContext);
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const token = params.get('token');
        const userStr = params.get('user');

        if (token && userStr) {
            try {
                const userData = JSON.parse(decodeURIComponent(userStr));
                const authData = { ...userData, token };

                // Save to localStorage
                localStorage.setItem('user', JSON.stringify(authData));

                // Update context state
                setUser(authData);

                // Redirect based on role
                if (userData.role === 'admin') navigate('/admin/dashboard');
                else if (userData.role === 'worker') {
                    if (userData.status === 'pending') navigate('/login?message=awaiting_approval');
                    else navigate('/worker/dashboard');
                }
                else navigate('/user/dashboard');
            } catch (error) {
                console.error('Error parsing Google auth data:', error);
                navigate('/login?error=auth_failed');
            }
        } else {
            navigate('/login?error=missing_data');
        }
    }, [location, setUser, navigate]);

    return (
        <div className="flex items-center justify-center min-h-screen">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            <p className="ml-4 text-gray-600">Completing login...</p>
        </div>
    );
};

export default GoogleCallback;
