import { useState, useEffect, useContext } from 'react';
import axios from '../../api/axios';
import { AuthContext } from '../../context/AuthContext';
import UserSidebar from './UserSidebar';

const SERVER_URL = 'http://localhost:5000';

const buildImageUrl = (path) => {
  if (!path) return null;
  return path.startsWith('http') ? path : `${SERVER_URL}${path}`;
};

const UserProfile = () => {
  const { user, updateUser } = useContext(AuthContext);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: '',
    password: ''
  });
  const [profileImage, setProfileImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const { data } = await axios.get('/user/profile');
      setFormData({
        name: data.name,
        phone: data.phone,
        address: data.address || '',
        password: ''
      });
      if (data.profileImage) {
        setImagePreview(buildImageUrl(data.profileImage));
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError('Image size should be less than 5MB');
        return;
      }

      if (!file.type.startsWith('image/')) {
        setError('Please select a valid image file');
        return;
      }

      setProfileImage(file);

      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const data = new FormData();
      data.append('name', formData.name);
      data.append('phone', formData.phone);
      data.append('address', formData.address);
      if (formData.password) data.append('password', formData.password);
      if (profileImage) data.append('profileImage', profileImage);

      const response = await axios.put('/user/profile', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      // Immediately sync the updated user (including profileImage) into AuthContext + localStorage
      updateUser(response.data);

      // Update the preview image with the saved URL from the server
      if (response.data.profileImage) {
        setImagePreview(buildImageUrl(response.data.profileImage));
      }

      setSuccess('Profile updated successfully');
      setFormData({ ...formData, password: '' });
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#faf8f5] font-['Lato']">
      <UserSidebar />
      <div className="md:ml-64 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            {/* Hero/Cover Section with Dark Background */}
            <div className="h-48 bg-[#2d2d2d] relative">
              <div className="absolute inset-0 bg-black/10"></div>
            </div>

            <div className="relative px-8 pb-8">
              {/* Profile Image Section */}
              <div className="relative -mt-20 mb-6 flex flex-col items-center sm:items-start sm:flex-row sm:space-x-6">
                <div className="relative group">
                  <div className="w-40 h-40 rounded-full border-4 border-white shadow-lg overflow-hidden bg-white">
                    {imagePreview ? (
                      <img
                        src={imagePreview}
                        alt="Profile"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-[#f3f4f6] flex items-center justify-center text-4xl font-bold text-[#9ca3af]">
                        {formData.name.charAt(0).toUpperCase()}
                      </div>
                    )}

                    {/* Overlay for Image Upload */}
                    <label className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <input type="file" className="hidden" accept="image/*" onChange={handleImageChange} />
                    </label>
                  </div>
                </div>

                <div className="mt-6 sm:mt-20 text-center sm:text-left">
                  <h1 className="text-3xl font-bold text-gray-900 font-['Playfair_Display']">
                    {formData.name || 'Your Name'}
                  </h1>
                  <p className="text-gray-500 font-medium">{user?.email}</p>
                </div>
              </div>

              {/* Messages */}
              {error && (
                <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded-r shadow-sm">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-red-700">{error}</p>
                    </div>
                  </div>
                </div>
              )}

              {success && (
                <div className="mb-6 bg-green-50 border-l-4 border-green-500 p-4 rounded-r shadow-sm">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-green-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-green-700">{success}</p>
                    </div>
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-8">
                {/* Personal Information */}
                <div>
                  <h3 className="text-lg font-medium leading-6 text-gray-900 border-b pb-2 mb-4">
                    Personal Information
                  </h3>
                  <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                        Full Name
                      </label>
                      <div className="mt-1 relative rounded-md shadow-sm">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                        </div>
                        <input
                          type="text"
                          name="name"
                          id="name"
                          value={formData.name}
                          onChange={handleChange}
                          className="focus:ring-[#e67e22] focus:border-[#e67e22] block w-full pl-10 sm:text-sm border-gray-300 rounded-lg py-3"
                          placeholder="John Doe"
                        />
                      </div>
                    </div>

                    <div>
                      <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                        Phone Number
                      </label>
                      <div className="mt-1 relative rounded-md shadow-sm">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                          </svg>
                        </div>
                        <input
                          type="tel"
                          name="phone"
                          id="phone"
                          value={formData.phone}
                          onChange={handleChange}
                          className="focus:ring-[#e67e22] focus:border-[#e67e22] block w-full pl-10 sm:text-sm border-gray-300 rounded-lg py-3"
                          placeholder="+91 98765 43210"
                        />
                      </div>
                    </div>

                    <div className="sm:col-span-2">
                      <label htmlFor="address" className="block text-sm font-medium text-gray-700">
                        Address
                      </label>
                      <div className="mt-1 relative rounded-md shadow-sm">
                        <div className="absolute inset-y-0 left-0 pl-3 pt-3 pointer-events-none">
                          <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                        </div>
                        <textarea
                          name="address"
                          id="address"
                          rows="3"
                          value={formData.address}
                          onChange={handleChange}
                          className="focus:ring-[#e67e22] focus:border-[#e67e22] block w-full pl-10 sm:text-sm border-gray-300 rounded-lg py-3"
                          placeholder="Your full address"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Security */}
                <div>
                  <h3 className="text-lg font-medium leading-6 text-gray-900 border-b pb-2 mb-4">
                    Security
                  </h3>
                  <div>
                    <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                      New Password
                    </label>
                    <div className="mt-1 relative rounded-md shadow-sm">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                      </div>
                      <input
                        type="password"
                        name="password"
                        id="password"
                        value={formData.password}
                        onChange={handleChange}
                        className="focus:ring-[#e67e22] focus:border-[#e67e22] block w-full pl-10 sm:text-sm border-gray-300 rounded-lg py-3"
                        placeholder="Leave blank to keep current password"
                      />
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="pt-5 border-t border-gray-200">
                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={loading}
                      className="ml-3 inline-flex justify-center py-3 px-8 border border-transparent shadow-sm text-sm font-medium rounded-full text-white bg-[#e67e22] hover:bg-[#d35400] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#e67e22] transition-all duration-200 transform hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loading ? (
                        <>
                          <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Updating Profile...
                        </>
                      ) : (
                        'Save Changes'
                      )}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
