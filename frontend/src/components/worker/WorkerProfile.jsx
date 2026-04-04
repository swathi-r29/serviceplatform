import { useState, useEffect, useContext } from 'react';
import axios from '../../api/axios';
import { AuthContext } from '../../context/AuthContext';
import LocationPicker from '../common/LocationPicker';

const WorkerProfile = () => {
  const { user } = useContext(AuthContext);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    location: '',
    skillRates: [], // [{ skillName, rate, estimatedTime, pricingType }]
    isAvailable: true,
    coordinates: null,
    hourlyRate: '',
    serviceCharge: '',
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
      const response = await axios.get('/worker/profile');
      const data = response.data;

      setFormData({
        name: data.name || '',
        phone: data.phone || '',
        location: data.location || '',
        skillRates: Array.isArray(data.skillRates) ? data.skillRates : [],
        isAvailable: data.isAvailable !== undefined ? data.isAvailable : true,
        coordinates: data.coordinates || null,
        hourlyRate: data.hourlyRate || 0,
        serviceCharge: data.serviceCharge || 0,
        password: ''
      });

      if (data.profileImage) {
        const imageUrl = data.profileImage.startsWith('http')
          ? data.profileImage
          : `http://localhost:5000${data.profileImage}`;
        setImagePreview(imageUrl);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      if (error.response) {
        setError(error.response.data?.message || 'Failed to load profile');
      } else {
        setError('Failed to load profile');
      }
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    // Prevent negative numbers for rate fields
    if ((name === 'hourlyRate' || name === 'serviceCharge') && parseFloat(value) < 0) return;
    setFormData({ ...formData, [name]: value });
  };

  const handleSkillChange = (index, field, value) => {
    const updatedRates = [...formData.skillRates];
    if ((field === 'rate' || field === 'estimatedTime') && parseFloat(value) < 0) return;
    updatedRates[index] = { ...updatedRates[index], [field]: value };
    setFormData({ ...formData, skillRates: updatedRates });
  };

  const addSkill = () => {
    setFormData({
      ...formData,
      skillRates: [...formData.skillRates, { skillName: '', rate: 0, estimatedTime: 1, pricingType: 'hourly' }]
    });
  };

  const removeSkill = (index) => {
    const updatedRates = formData.skillRates.filter((_, i) => i !== index);
    setFormData({ ...formData, skillRates: updatedRates });
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
      if (!formData.name.trim() || !formData.phone.trim() || !formData.location.trim()) {
        setError('Please fill in all required fields');
        setLoading(false);
        return;
      }

      const submitData = new FormData();
      submitData.append('name', formData.name.trim());
      submitData.append('phone', formData.phone.trim());
      submitData.append('location', formData.location.trim());

      submitData.append('isAvailable', formData.isAvailable.toString());

      // 🚀 Hybrid Pricing Upgrade
      submitData.append('skillRates', JSON.stringify(formData.skillRates));

      if (formData.hourlyRate !== undefined) submitData.append('hourlyRate', formData.hourlyRate);
      if (formData.serviceCharge !== undefined) submitData.append('serviceCharge', formData.serviceCharge);

      if (formData.coordinates) {
        submitData.append('coordinates', JSON.stringify(formData.coordinates));
      }

      if (formData.password && formData.password.trim() !== '') {
        submitData.append('password', formData.password);
      }

      if (profileImage) {
        submitData.append('profileImage', profileImage);
      }

      await axios.put('/worker/profile', submitData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      setSuccess('Profile updated successfully!');
      setFormData({ ...formData, password: '' });
      setProfileImage(null);
      await fetchProfile();
      setTimeout(() => setSuccess(''), 3000);

    } catch (err) {
      if (err.response) {
        setError(err.response.data?.message || `Server error: ${err.response.status}`);
      } else {
        setError('Failed to update profile. Please try again.');
      }
      setTimeout(() => setError(''), 5000);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#faf8f5] py-12 px-4 sm:px-6 lg:px-8 font-['Lato']">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Hero Banner */}
          <div className="h-48 bg-gradient-to-r from-[#fdf2e9] via-[#fae5d3] to-[#f6cba6] relative">
            <div className="absolute inset-0 bg-white/10 backdrop-blur-[2px]"></div>
          </div>

          <div className="relative px-8 pb-8">
            {/* Profile Header */}
            <div className="relative -mt-20 mb-8 flex flex-col items-center sm:items-start sm:flex-row sm:space-x-6">
              <div className="relative group">
                <div className="w-40 h-40 rounded-full border-4 border-white shadow-lg overflow-hidden bg-white">
                  {imagePreview ? (
                    <img
                      src={imagePreview}
                      alt="Profile"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-[#f3f4f6] flex items-center justify-center">
                      <svg className="w-20 h-20 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                      </svg>
                    </div>
                  )}

                  {/* Image Upload Overlay */}
                  <label className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <input type="file" className="hidden" accept="image/*" onChange={handleImageChange} />
                  </label>
                </div>
              </div>

              <div className="mt-6 sm:mt-20 text-center sm:text-left flex-1">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900 font-['Playfair_Display']">
                      {formData.name || 'Service Provider'}
                    </h1>
                    <p className="text-gray-500 font-medium">{user?.email}</p>
                  </div>

                  {/* Availability Toggle */}
                  <div className="mt-4 sm:mt-0 flex items-center bg-gray-50 px-4 py-2 rounded-full border border-gray-200">
                    <div className="flex items-center">
                      <span className={`h-3 w-3 rounded-full mr-2 ${formData.isAvailable ? 'bg-green-500' : 'bg-gray-400'}`}></span>
                      <span className="text-sm font-medium text-gray-700 mr-3">
                        {formData.isAvailable ? 'Available for Bookings' : 'Unavailable'}
                      </span>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        className="sr-only peer"
                        checked={formData.isAvailable}
                        onChange={(e) => setFormData({ ...formData, isAvailable: e.target.checked })}
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-[#e67e22] rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#e67e22]"></div>
                    </label>
                  </div>
                </div>
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
              {/* Professional Details */}
              <div>
                <h3 className="text-lg font-medium leading-6 text-gray-900 border-b pb-2 mb-4">
                  Professional Details
                </h3>
                <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Full Name <span className="text-red-500">*</span>
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
                        value={formData.name}
                        onChange={handleChange}
                        className="focus:ring-[#e67e22] focus:border-[#e67e22] block w-full pl-10 sm:text-sm border-gray-300 rounded-lg py-3"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Phone Number <span className="text-red-500">*</span>
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
                        value={formData.phone}
                        onChange={handleChange}
                        className="focus:ring-[#e67e22] focus:border-[#e67e22] block w-full pl-10 sm:text-sm border-gray-300 rounded-lg py-3"
                        required
                      />
                    </div>
                  </div>

                  <div className="sm:col-span-2">
                    <LocationPicker 
                      onLocationSelect={(loc) => setFormData({
                        ...formData,
                        location: loc.address,
                        coordinates: { lat: loc.latitude, lng: loc.longitude }
                      })}
                      initialCoords={formData.coordinates}
                    />
                  </div>

                    {/* Hybrid Skill-Specific Rates Section */}
                    <div className="sm:col-span-2 mt-4">
                      <div className="flex items-center justify-between mb-4">
                        <label className="block text-sm font-bold text-gray-700">
                          Skill Pricing & Estimation
                        </label>
                        <button
                          type="button"
                          onClick={addSkill}
                          className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded-full shadow-sm text-white bg-[#e67e22] hover:bg-[#d35400] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#e67e22]"
                        >
                          + Add Skill Rate
                        </button>
                      </div>
                      
                      <div className="space-y-4">
                        {formData.skillRates.map((skill, index) => (
                          <div key={index} className="bg-gray-50 p-4 rounded-xl border border-gray-200 animate-in fade-in zoom-in duration-200">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
                              <div className="flex-1">
                                <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1">Category</label>
                                <select
                                  value={skill.skillName}
                                  onChange={(e) => handleSkillChange(index, 'skillName', e.target.value)}
                                  className="block w-full sm:text-sm border-gray-300 rounded-lg py-2 focus:ring-[#e67e22] focus:border-[#e67e22]"
                                >
                                  <option value="">Select Category</option>
                                  {['Plumbing', 'Electrical', 'Cleaning', 'Carpentry', 'Painting', 'AC Repair', 'Cooking', 'Pest Control', 'Appliance Repair', 'Moving & Packing', 'Home Tutoring', 'Salon & Spa', 'Gardening', 'Smart Home', 'Other'].map(cat => (
                                    <option key={cat} value={cat}>{cat}</option>
                                  ))}
                                </select>
                              </div>

                              <div>
                                <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1">Pricing Type</label>
                                <select
                                  value={skill.pricingType}
                                  onChange={(e) => handleSkillChange(index, 'pricingType', e.target.value)}
                                  className="block w-full sm:text-sm border-gray-300 rounded-lg py-2 focus:ring-[#e67e22] focus:border-[#e67e22]"
                                >
                                  <option value="hourly">Hourly</option>
                                  <option value="fixed">Fixed Price</option>
                                </select>
                              </div>

                              <div className="relative">
                                <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1">Rate (₹)</label>
                                <div className="absolute inset-y-0 left-0 pl-3 pt-4 flex items-center pointer-events-none text-gray-400 font-bold text-xs">
                                  ₹
                                </div>
                                <input
                                  type="number"
                                  value={skill.rate}
                                  onChange={(e) => handleSkillChange(index, 'rate', e.target.value)}
                                  className="block w-full pl-7 sm:text-sm border-gray-300 rounded-lg py-2 focus:ring-[#e67e22] focus:border-[#e67e22]"
                                  placeholder="0"
                                  min="0"
                                />
                              </div>

                              <div className="flex items-center gap-2">
                                <div className="flex-1">
                                  <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1">Est. Time (Hrs)</label>
                                  <input
                                    type="number"
                                    value={skill.estimatedTime}
                                    onChange={(e) => handleSkillChange(index, 'estimatedTime', e.target.value)}
                                    className="block w-full sm:text-sm border-gray-300 rounded-lg py-2 focus:ring-[#e67e22] focus:border-[#e67e22]"
                                    placeholder="1"
                                    min="0"
                                    step="0.5"
                                  />
                                </div>
                                <button
                                  type="button"
                                  onClick={() => removeSkill(index)}
                                  className="text-red-500 hover:text-red-700 p-1 mb-1"
                                >
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                                  </svg>
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                        {formData.skillRates.length === 0 && (
                          <p className="text-sm text-gray-500 italic text-center py-4 bg-gray-50 rounded-xl border border-dashed border-gray-300">
                            No skill rates added yet.
                          </p>
                        )}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        General Hourly Rate (₹)
                      </label>
                      <div className="mt-1 relative rounded-md shadow-sm">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400 font-bold">
                          ₹
                        </div>
                        <input
                          type="number"
                          name="hourlyRate"
                          value={formData.hourlyRate}
                          onChange={handleChange}
                          className="focus:ring-[#e67e22] focus:border-[#e67e22] block w-full pl-10 sm:text-sm border-gray-300 rounded-lg py-3"
                          placeholder="0.00"
                          min="0"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Base Service Charge (₹)
                      </label>
                      <div className="mt-1 relative rounded-md shadow-sm">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400 font-bold">
                          ₹
                        </div>
                        <input
                          type="number"
                          name="serviceCharge"
                          value={formData.serviceCharge}
                          onChange={handleChange}
                          className="focus:ring-[#e67e22] focus:border-[#e67e22] block w-full pl-10 sm:text-sm border-gray-300 rounded-lg py-3"
                          placeholder="0.00"
                        />
                      </div>
                      {!formData.serviceCharge && !formData.hourlyRate && (
                        <div className="mt-4 p-4 bg-[#fdf2e9] border border-[#fae5d3] rounded-2xl flex gap-3 items-start animate-pulse">
                          <div className="p-1 bg-[#e67e22]/10 rounded-lg">
                            <svg className="w-4 h-4 text-[#e67e22]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          </div>
                          <div>
                            <p className="text-[11px] font-bold text-[#e67e22] uppercase tracking-wider mb-1">Expert Matching Tip</p>
                            <p className="text-[12px] text-gray-600 leading-relaxed font-medium italic">
                              "Setting your own rates helps our AI Matcher recommend you more accurately and shows customers exactly what to expect. Profiles with setup rates are 3x more likely to be selected."
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                </div>
              </div>

              {/* Security */}
              <div>
                <h3 className="text-lg font-medium leading-6 text-gray-900 border-b pb-2 mb-4">
                  Security
                </h3>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
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
                      value={formData.password}
                      onChange={handleChange}
                      className="focus:ring-[#e67e22] focus:border-[#e67e22] block w-full pl-10 sm:text-sm border-gray-300 rounded-lg py-3"
                      placeholder="Leave blank to keep current password"
                      autoComplete="new-password"
                    />
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="pt-5 border-t border-gray-200">
                <div className="flex justify-end space-x-4">
                  <button
                    type="button"
                    onClick={() => fetchProfile()}
                    className="px-6 py-3 border border-gray-300 rounded-full text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#e67e22] font-medium transition-colors"
                  >
                    Reset Changes
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="inline-flex justify-center py-3 px-8 border border-transparent shadow-sm text-sm font-medium rounded-full text-white bg-[#e67e22] hover:bg-[#d35400] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#e67e22] transition-all duration-200 transform hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed"
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
  );
};

export default WorkerProfile;