import { useState, useEffect } from 'react';
import axios from '../../api/axios';

const AvailabilityZones = () => {
  const [formData, setFormData] = useState({
    serviceRadius: 10,
    preferredLocalities: [],
    lat: null,
    lng: null
  });
  const [localityInput, setLocalityInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [currentLocation, setCurrentLocation] = useState(null);

  useEffect(() => {
    fetchCurrentZones();
    getCurrentLocation();
  }, []);

  const fetchCurrentZones = async () => {
    try {
      const { data } = await axios.get('/workers/my-zones');
      if (data.availabilityZones) {
        setFormData({
          serviceRadius: data.availabilityZones.serviceRadius || 10,
          preferredLocalities: data.availabilityZones.preferredLocalities || [],
          lat: data.availabilityZones.centerLocation?.coordinates[1] || null,
          lng: data.availabilityZones.centerLocation?.coordinates[0] || null
        });
      }
    } catch (error) {
      console.error('Failed to fetch zones:', error);
    }
  };

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setCurrentLocation({ lat: latitude, lng: longitude });
          
          // Set as default if no zones configured
          if (!formData.lat && !formData.lng) {
            setFormData(prev => ({
              ...prev,
              lat: latitude,
              lng: longitude
            }));
          }
        },
        (error) => {
          console.error('Error getting location:', error);
          setMessage('Please enable location access to set your service zone');
        }
      );
    }
  };

  const handleRadiusChange = (e) => {
    setFormData({ ...formData, serviceRadius: parseInt(e.target.value) });
  };

  const addLocality = () => {
    if (localityInput.trim() && !formData.preferredLocalities.includes(localityInput.trim())) {
      setFormData({
        ...formData,
        preferredLocalities: [...formData.preferredLocalities, localityInput.trim()]
      });
      setLocalityInput('');
    }
  };

  const removeLocality = (locality) => {
    setFormData({
      ...formData,
      preferredLocalities: formData.preferredLocalities.filter(l => l !== locality)
    });
  };

  const useCurrentLocation = () => {
    if (currentLocation) {
      setFormData({
        ...formData,
        lat: currentLocation.lat,
        lng: currentLocation.lng
      });
      setMessage('Using your current location as service center');
    } else {
      setMessage('Please enable location access');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.lat || !formData.lng) {
      setMessage('Please set your service center location');
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      await axios.put('/workers/availability-zones', formData);
      setMessage('Availability zones updated successfully!');
    } catch (error) {
      setMessage(error.response?.data?.message || 'Failed to update zones');
    } finally {
      setLoading(false);
    }
  };

  const radiusOptions = [5, 10, 15, 20, 25, 30, 40, 50];

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-8">
          <h2 className="text-3xl font-bold mb-2">Service Availability Zones</h2>
          <p className="text-blue-100">Define where you provide services to get relevant bookings</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-8 space-y-8">
          {/* Message */}
          {message && (
            <div className={`p-4 rounded-lg ${
              message.includes('success') 
                ? 'bg-green-50 text-green-700 border border-green-200' 
                : 'bg-blue-50 text-blue-700 border border-blue-200'
            }`}>
              {message}
            </div>
          )}

          {/* Service Center Location */}
          <div>
            <label className="block text-lg font-semibold text-gray-900 mb-4">
              Service Center Location
            </label>
            <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
              <p className="text-sm text-gray-600 mb-4">
                This is the center point of your service area. We'll use this to calculate distance to customer locations.
              </p>
              
              <div className="grid md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Latitude</label>
                  <input
                    type="number"
                    step="any"
                    value={formData.lat || ''}
                    onChange={(e) => setFormData({ ...formData, lat: parseFloat(e.target.value) })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., 13.0827"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Longitude</label>
                  <input
                    type="number"
                    step="any"
                    value={formData.lng || ''}
                    onChange={(e) => setFormData({ ...formData, lng: parseFloat(e.target.value) })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., 80.2707"
                  />
                </div>
              </div>

              <button
                type="button"
                onClick={useCurrentLocation}
                className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Use My Current Location
              </button>

              {formData.lat && formData.lng && (
                <div className="mt-4 p-3 bg-green-50 rounded-lg border border-green-200">
                  <p className="text-sm text-green-700 flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Location set: {formData.lat.toFixed(4)}, {formData.lng.toFixed(4)}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Service Radius */}
          <div>
            <label className="block text-lg font-semibold text-gray-900 mb-4">
              Service Radius
            </label>
            <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
              <p className="text-sm text-gray-600 mb-4">
                How far are you willing to travel from your center location?
              </p>
              
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-2xl font-bold text-blue-600">{formData.serviceRadius} km</span>
                  <span className="text-sm text-gray-500">Maximum distance</span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="50"
                  step="5"
                  value={formData.serviceRadius}
                  onChange={handleRadiusChange}
                  className="w-full h-2 bg-blue-200 rounded-lg appearance-none cursor-pointer"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>5 km</span>
                  <span>50 km</span>
                </div>
              </div>

              <div className="grid grid-cols-4 md:grid-cols-8 gap-2">
                {radiusOptions.map(radius => (
                  <button
                    key={radius}
                    type="button"
                    onClick={() => setFormData({ ...formData, serviceRadius: radius })}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      formData.serviceRadius === radius
                        ? 'bg-blue-600 text-white'
                        : 'bg-white border border-gray-300 text-gray-700 hover:border-blue-300'
                    }`}
                  >
                    {radius} km
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Preferred Localities */}
          <div>
            <label className="block text-lg font-semibold text-gray-900 mb-4">
              Preferred Localities (Optional)
            </label>
            <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
              <p className="text-sm text-gray-600 mb-4">
                Add specific areas or neighborhoods you prefer to work in. This helps us prioritize bookings from these areas.
              </p>
              
              <div className="flex gap-2 mb-4">
                <input
                  type="text"
                  value={localityInput}
                  onChange={(e) => setLocalityInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addLocality())}
                  placeholder="e.g., T. Nagar, Anna Nagar"
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
                <button
                  type="button"
                  onClick={addLocality}
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  Add
                </button>
              </div>

              {formData.preferredLocalities.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {formData.preferredLocalities.map((locality, idx) => (
                    <div
                      key={idx}
                      className="bg-blue-100 text-blue-800 px-4 py-2 rounded-full flex items-center gap-2 border border-blue-200"
                    >
                      <span className="font-medium">{locality}</span>
                      <button
                        type="button"
                        onClick={() => removeLocality(locality)}
                        className="hover:bg-blue-200 rounded-full p-1 transition-colors"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-400">
                  <svg className="w-12 h-12 mx-auto mb-2 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  </svg>
                  <p className="text-sm">No preferred localities added yet</p>
                </div>
              )}
            </div>
          </div>

          {/* Visual Summary */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6 border border-blue-200">
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
              </svg>
              Your Service Zone Summary
            </h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-white rounded-lg p-4">
                <p className="text-sm text-gray-600 mb-1">Service Area</p>
                <p className="text-2xl font-bold text-blue-600">{formData.serviceRadius} km radius</p>
              </div>
              <div className="bg-white rounded-lg p-4">
                <p className="text-sm text-gray-600 mb-1">Preferred Areas</p>
                <p className="text-2xl font-bold text-indigo-600">
                  {formData.preferredLocalities.length} {formData.preferredLocalities.length === 1 ? 'locality' : 'localities'}
                </p>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex gap-4">
            <button
              type="submit"
              disabled={loading || !formData.lat || !formData.lng}
              className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-4 rounded-lg hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed font-semibold text-lg transition-all shadow-lg hover:shadow-xl"
            >
              {loading ? 'Saving...' : 'Save Availability Zones'}
            </button>
          </div>
        </form>
      </div>

      {/* Info Section */}
      <div className="mt-8 bg-blue-50 rounded-lg p-6 border border-blue-200">
        <h3 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Why set availability zones?
        </h3>
        <ul className="space-y-2 text-sm text-blue-800">
          <li className="flex items-start gap-2">
            <svg className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span>Get bookings only from areas you can easily serve</span>
          </li>
          <li className="flex items-start gap-2">
            <svg className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span>Save time by avoiding long-distance travel</span>
          </li>
          <li className="flex items-start gap-2">
            <svg className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span>Higher priority for instant bookings in your service area</span>
          </li>
          <li className="flex items-start gap-2">
            <svg className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span>Build a strong reputation in specific neighborhoods</span>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default AvailabilityZones;