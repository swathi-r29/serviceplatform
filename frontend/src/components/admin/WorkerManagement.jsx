import { useState, useEffect } from 'react';
import axios from '../../api/axios';

// Edit Worker Modal Component
const EditWorkerModal = ({ worker, isOpen, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    name: worker?.name || '',
    email: worker?.email || '',
    phone: worker?.phone || '',
    location: worker?.location || '',
    skills: worker?.skills?.join(', ') || '',
    isAvailable: worker?.isAvailable || false
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const updatedData = {
      ...formData,
      skills: formData.skills.split(',').map(skill => skill.trim()).filter(skill => skill)
    };
    onSave(updatedData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-6 w-full max-w-md mx-4">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Edit Worker</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
            <input
              type="text"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Skills (comma separated)</label>
            <input
              type="text"
              value={formData.skills}
              onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="e.g. Plumbing, Electrical, Carpentry"
            />
          </div>
          <div className="flex items-center">
            <input
              type="checkbox"
              id="isAvailable"
              checked={formData.isAvailable}
              onChange={(e) => setFormData({ ...formData, isAvailable: e.target.checked })}
              className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
            />
            <label htmlFor="isAvailable" className="ml-2 block text-sm text-gray-900">
              Available for work
            </label>
          </div>
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Send Message Modal Component
const SendMessageModal = ({ worker, isOpen, onClose, onSend }) => {
  const [message, setMessage] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (message.trim()) {
      onSend(message.trim());
      setMessage('');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-6 w-full max-w-md mx-4">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Send Message to {worker?.name}</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
              rows={4}
              placeholder="Type your message here..."
              required
            />
          </div>
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              Send Message
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const WorkerManagement = () => {
  const [workers, setWorkers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showEditModal, setShowEditModal] = useState(false);
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [editingWorker, setEditingWorker] = useState(null);
  const [messagingWorker, setMessagingWorker] = useState(null);

  useEffect(() => {
    fetchWorkers();
  }, []);

  const fetchWorkers = async () => {
    try {
      const { data } = await axios.get('/admin/workers');
      setWorkers(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this worker?')) {
      try {
        await axios.delete(`/admin/users/${id}`);
        fetchWorkers();
        if (currentIndex >= workers.length - 1) {
          setCurrentIndex(Math.max(0, currentIndex - 1));
        }
      } catch (error) {
        alert(error.response?.data?.message || 'Failed to delete worker');
      }
    }
  };

  const handleEditWorker = async (updatedData) => {
    try {
      await axios.put(`/admin/users/${currentWorker._id}`, updatedData);
      setShowEditModal(false);
      fetchWorkers();
      alert('Worker updated successfully!');
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to update worker');
    }
  };

  const handleSendMessage = async (message) => {
    try {
      await axios.post(`/admin/users/${currentWorker._id}/message`, { message });
      setShowMessageModal(false);
      alert('Message sent successfully!');
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to send message');
    }
  };

  const handleApprove = async (id) => {
    try {
      await axios.patch(`/admin/workers/${id}/approve`);
      fetchWorkers();
      alert('Worker approved successfully!');
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to approve worker');
    }
  };

  const handleReject = async (id) => {
    if (window.confirm('Are you sure you want to reject this worker?')) {
      try {
        await axios.patch(`/admin/workers/${id}/reject`);
        fetchWorkers();
        alert('Worker rejected successfully!');
      } catch (error) {
        alert(error.response?.data?.message || 'Failed to reject worker');
      }
    }
  };

  // Get initials for avatar
  const getInitials = (name) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  // Filter workers
  const getFilteredWorkers = () => {
    let filtered = workers.filter(worker => {
      // Exclude pending workers from this general management view
      if (worker.status === 'pending') return false;

      return (
        worker.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        worker.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        worker.skills.some(skill => skill.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    });

    if (filterStatus !== 'all') {
      filtered = filtered.filter(worker => worker.status === filterStatus);
    }

    return filtered;
  };

  const filteredWorkers = getFilteredWorkers();
  const currentWorker = filteredWorkers[currentIndex];

  // Navigation functions
  const goToNext = () => {
    if (currentIndex < filteredWorkers.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const goToPrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.key === 'ArrowRight') {
        goToNext();
      } else if (e.key === 'ArrowLeft') {
        goToPrevious();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [currentIndex, filteredWorkers.length]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading workers...</p>
        </div>
      </div>
    );
  }

  if (filteredWorkers.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Worker Management</h1>
            <p className="text-gray-600">Navigate through worker profiles</p>
          </div>

          {/* Search and Filters */}
          <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <input
                  type="text"
                  placeholder="Search workers..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentIndex(0);
                  }}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => { setFilterStatus('all'); setCurrentIndex(0); }}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${filterStatus === 'all'
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                >
                  All
                </button>
                <button
                  onClick={() => { setFilterStatus('pending'); setCurrentIndex(0); }}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${filterStatus === 'pending'
                    ? 'bg-yellow-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                >
                  Pending
                </button>
                <button
                  onClick={() => { setFilterStatus('approved'); setCurrentIndex(0); }}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${filterStatus === 'approved'
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                >
                  Approved
                </button>
                <button
                  onClick={() => { setFilterStatus('rejected'); setCurrentIndex(0); }}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${filterStatus === 'rejected'
                    ? 'bg-red-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                >
                  Rejected
                </button>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm p-12 text-center">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No workers found</h3>
            <p className="text-gray-600">Try adjusting your search or filters</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Worker Management</h1>
          <p className="text-gray-600">Navigate through worker profiles using the arrows</p>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search by name, email, or skills..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentIndex(0);
                }}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => { setFilterStatus('all'); setCurrentIndex(0); }}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${filterStatus === 'all'
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
              >
                All
              </button>
              <button
                onClick={() => { setFilterStatus('pending'); setCurrentIndex(0); }}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${filterStatus === 'pending'
                  ? 'bg-yellow-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
              >
                Pending
              </button>
              <button
                onClick={() => { setFilterStatus('approved'); setCurrentIndex(0); }}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${filterStatus === 'approved'
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
              >
                Approved
              </button>
              <button
                onClick={() => { setFilterStatus('rejected'); setCurrentIndex(0); }}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${filterStatus === 'rejected'
                  ? 'bg-red-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
              >
                Rejected
              </button>
            </div>
          </div>
        </div>

        {/* Worker Card with Navigation */}
        <div className="relative">
          {/* Previous Arrow */}
          <button
            onClick={goToPrevious}
            disabled={currentIndex === 0}
            className={`absolute left-0 top-1/2 -translate-y-1/2 -translate-x-16 z-10 w-12 h-12 rounded-full bg-white shadow-lg flex items-center justify-center transition-all ${currentIndex === 0
              ? 'opacity-30 cursor-not-allowed'
              : 'hover:bg-purple-50 hover:shadow-xl hover:scale-110'
              }`}
          >
            <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          {/* Next Arrow */}
          <button
            onClick={goToNext}
            disabled={currentIndex === filteredWorkers.length - 1}
            className={`absolute right-0 top-1/2 -translate-y-1/2 translate-x-16 z-10 w-12 h-12 rounded-full bg-white shadow-lg flex items-center justify-center transition-all ${currentIndex === filteredWorkers.length - 1
              ? 'opacity-30 cursor-not-allowed'
              : 'hover:bg-purple-50 hover:shadow-xl hover:scale-110'
              }`}
          >
            <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>

          {/* Worker Profile Card */}
          <div className="bg-white rounded-3xl shadow-lg overflow-hidden">
            {/* Header with Gradient */}
            <div className="bg-gradient-to-r from-purple-500 to-purple-700 px-8 py-10">
              <div className="flex items-center gap-6">
                <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center text-white font-bold text-2xl border-2 border-white/30 overflow-hidden">
                  {currentWorker.profileImage ? (
                    <img
                      src={`http://localhost:5000${currentWorker.profileImage}`}
                      alt={currentWorker.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(currentWorker.name)}&background=random`;
                      }}
                    />
                  ) : (
                    getInitials(currentWorker.name)
                  )}
                </div>
                <div className="flex-1">
                  <h2 className="text-3xl font-bold text-white mb-2">{currentWorker.name}</h2>
                  <div className="flex items-center text-purple-100">
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    <span className="text-lg">{currentWorker.email}</span>
                  </div>
                </div>
                <div className="text-white text-right">
                  <span className="text-sm opacity-80">Worker</span>
                  <p className="text-2xl font-bold">{currentIndex + 1}/{filteredWorkers.length}</p>
                </div>
              </div>
            </div>

            {/* Stats Section */}
            <div className="grid grid-cols-3 gap-4 px-8 py-6 bg-gray-50">
              <div className="bg-white rounded-2xl p-6 text-center shadow-sm">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <p className="text-xs text-gray-500 font-medium uppercase mb-1">Member Since</p>
                <p className="text-sm font-bold text-gray-900">January 2026</p>
              </div>

              <div className="bg-white rounded-2xl p-6 text-center shadow-sm">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-3 ${currentWorker.isAvailable ? 'bg-green-100' : 'bg-red-100'
                  }`}>
                  <svg className={`w-6 h-6 ${currentWorker.isAvailable ? 'text-green-600' : 'text-red-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <p className="text-xs text-gray-500 font-medium uppercase mb-1">Account Status</p>
                <p className={`text-sm font-bold ${currentWorker.status === 'approved' ? 'text-green-600' :
                  currentWorker.status === 'pending' ? 'text-yellow-600' : 'text-red-600'
                  }`}>
                  {currentWorker.status.charAt(0).toUpperCase() + currentWorker.status.slice(1)}
                </p>
              </div>

              <div className="bg-white rounded-2xl p-6 text-center shadow-sm">
                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <svg className="w-6 h-6 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                </div>
                <p className="text-xs text-gray-500 font-medium uppercase mb-1">Rating</p>
                <p className="text-sm font-bold text-gray-900">{currentWorker.rating?.toFixed(1) || '0.0'}</p>
              </div>
            </div>

            {/* Contact Information */}
            <div className="px-8 py-8">
              <div className="flex items-center gap-2 mb-6">
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <h3 className="text-xl font-bold text-gray-900">Contact Information</h3>
              </div>

              <div className="space-y-4">
                {/* Email */}
                <div className="flex items-start gap-4 p-5 bg-blue-50 rounded-2xl">
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-gray-600 font-semibold uppercase mb-1">Email Address</p>
                    <p className="text-gray-900 font-bold text-lg">{currentWorker.email}</p>
                  </div>
                </div>

                {/* Phone */}
                <div className="flex items-start gap-4 p-5 bg-green-50 rounded-2xl">
                  <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-gray-600 font-semibold uppercase mb-1">Phone Number</p>
                    <p className="text-gray-900 font-bold text-lg">{currentWorker.phone}</p>
                  </div>
                </div>

                {/* Location */}
                <div className="flex items-start gap-4 p-5 bg-purple-50 rounded-2xl">
                  <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-gray-600 font-semibold uppercase mb-1">Address</p>
                    <p className="text-gray-900 font-bold text-lg">{currentWorker.location}</p>
                  </div>
                </div>

                {/* Skills */}
                <div className="flex items-start gap-4 p-5 bg-yellow-50 rounded-2xl">
                  <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-gray-600 font-semibold uppercase mb-2">Skills</p>
                    <div className="flex flex-wrap gap-2">
                      {currentWorker.skills.map((skill, idx) => (
                        <span
                          key={idx}
                          className="px-3 py-1.5 bg-white text-gray-900 text-sm font-semibold rounded-lg border border-gray-200"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Earnings */}
                <div className="flex items-start gap-4 p-5 bg-emerald-50 rounded-2xl">
                  <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-gray-600 font-semibold uppercase mb-1">Total Earnings</p>
                    <p className="text-gray-900 font-bold text-lg">₹{currentWorker.earnings || 0}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Account Actions */}
            <div className="px-8 pb-8">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Account Actions</h3>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowMessageModal(true)}
                  className="flex-1 px-6 py-3.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-semibold flex items-center justify-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  Send Message
                </button>
                <button
                  onClick={() => setShowEditModal(true)}
                  className="px-6 py-3.5 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors font-semibold flex items-center justify-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  Edit Profile
                </button>

                <button
                  onClick={() => handleDelete(currentWorker._id)}
                  className="px-6 py-3.5 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition-colors font-semibold flex items-center justify-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  Delete User
                </button>
              </div>
            </div>
          </div>

          {/* Navigation Hint */}
          <div className="text-center mt-6">
            <p className="text-sm text-gray-500">
              Use arrow buttons or keyboard ← → to navigate • {currentIndex + 1} of {filteredWorkers.length}
            </p>
          </div>
        </div>
      </div>

      {/* Modals */}
      <EditWorkerModal
        worker={currentWorker}
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        onSave={handleEditWorker}
      />
      <SendMessageModal
        worker={currentWorker}
        isOpen={showMessageModal}
        onClose={() => setShowMessageModal(false)}
        onSend={handleSendMessage}
      />
    </div>
  );
};

export default WorkerManagement;