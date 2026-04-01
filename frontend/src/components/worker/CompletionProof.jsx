import { useState } from 'react';
import axios from '../../api/axios';

const CompletionProof = ({ booking, onSuccess }) => {
  const [beforePhotos, setBeforePhotos] = useState([]);
  const [afterPhotos, setAfterPhotos] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [step, setStep] = useState('before'); // 'before', 'after', 'complete'

  const handleFileSelect = (e, type) => {
    const files = Array.from(e.target.files);
    if (type === 'before') {
      setBeforePhotos(files);
    } else {
      setAfterPhotos(files);
    }
  };

  const uploadPhotos = async (type) => {
    setUploading(true);
    try {
      const formData = new FormData();
      const photos = type === 'before' ? beforePhotos : afterPhotos;
      
      photos.forEach(photo => {
        formData.append('photos', photo);
      });
      formData.append('type', type);

      await axios.post(`/bookings/${booking._id}/completion-proof`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      alert(`${type === 'before' ? 'Before' : 'After'} photos uploaded successfully!`);
      
      if (type === 'before') {
        setStep('after');
      } else {
        setStep('complete');
        onSuccess();
      }
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to upload photos');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h3 className="text-2xl font-bold mb-6">Job Completion Proof</h3>

      {/* Progress Steps */}
      <div className="flex items-center justify-between mb-8">
        <div className={`flex items-center gap-2 ${step === 'before' ? 'text-blue-600' : 'text-green-600'}`}>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
            step === 'before' ? 'bg-blue-600 text-white' : 'bg-green-600 text-white'
          }`}>
            {step !== 'before' ? '✓' : '1'}
          </div>
          <span className="font-semibold">Before Photos</span>
        </div>
        
        <div className={`flex-1 h-1 mx-4 ${step !== 'before' ? 'bg-green-600' : 'bg-gray-300'}`}></div>
        
        <div className={`flex items-center gap-2 ${
          step === 'before' ? 'text-gray-400' : step === 'after' ? 'text-blue-600' : 'text-green-600'
        }`}>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
            step === 'before' ? 'bg-gray-300 text-gray-600' : 
            step === 'after' ? 'bg-blue-600 text-white' : 'bg-green-600 text-white'
          }`}>
            {step === 'complete' ? '✓' : '2'}
          </div>
          <span className="font-semibold">After Photos</span>
        </div>
        
        <div className={`flex-1 h-1 mx-4 ${step === 'complete' ? 'bg-green-600' : 'bg-gray-300'}`}></div>
        
        <div className={`flex items-center gap-2 ${step === 'complete' ? 'text-green-600' : 'text-gray-400'}`}>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
            step === 'complete' ? 'bg-green-600 text-white' : 'bg-gray-300 text-gray-600'
          }`}>
            {step === 'complete' ? '✓' : '3'}
          </div>
          <span className="font-semibold">Complete</span>
        </div>
      </div>

      {/* Before Photos Section */}
      {step === 'before' && (
        <div className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
            <h4 className="font-semibold text-blue-900 mb-2">📸 Before Photos</h4>
            <p className="text-sm text-blue-700">
              Take photos of the work area before starting the job. This helps document the initial condition.
            </p>
          </div>

          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={(e) => handleFileSelect(e, 'before')}
              className="hidden"
              id="before-upload"
            />
            <label htmlFor="before-upload" className="cursor-pointer">
              <div className="flex flex-col items-center gap-2">
                <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span className="text-gray-600">Click to upload before photos</span>
                <span className="text-sm text-gray-500">or drag and drop</span>
              </div>
            </label>
          </div>

          {beforePhotos.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm font-semibold text-gray-700">Selected photos:</p>
              <div className="grid grid-cols-3 gap-2">
                {beforePhotos.map((photo, idx) => (
                  <div key={idx} className="text-sm text-gray-600 bg-gray-50 p-2 rounded">
                    📷 {photo.name}
                  </div>
                ))}
              </div>
              <button
                onClick={() => uploadPhotos('before')}
                disabled={uploading}
                className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 disabled:bg-blue-300 font-semibold mt-4"
              >
                {uploading ? 'Uploading...' : 'Upload Before Photos'}
              </button>
            </div>
          )}
        </div>
      )}

      {/* After Photos Section */}
      {step === 'after' && (
        <div className="space-y-4">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
            <h4 className="font-semibold text-green-900 mb-2">✅ After Photos</h4>
            <p className="text-sm text-green-700">
              Take photos after completing the job to show the finished work. This helps verify job quality.
            </p>
          </div>

          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={(e) => handleFileSelect(e, 'after')}
              className="hidden"
              id="after-upload"
            />
            <label htmlFor="after-upload" className="cursor-pointer">
              <div className="flex flex-col items-center gap-2">
                <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span className="text-gray-600">Click to upload after photos</span>
                <span className="text-sm text-gray-500">or drag and drop</span>
              </div>
            </label>
          </div>

          {afterPhotos.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm font-semibold text-gray-700">Selected photos:</p>
              <div className="grid grid-cols-3 gap-2">
                {afterPhotos.map((photo, idx) => (
                  <div key={idx} className="text-sm text-gray-600 bg-gray-50 p-2 rounded">
                    📷 {photo.name}
                  </div>
                ))}
              </div>
              <button
                onClick={() => uploadPhotos('after')}
                disabled={uploading}
                className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 disabled:bg-green-300 font-semibold mt-4"
              >
                {uploading ? 'Uploading...' : 'Upload After Photos & Complete'}
              </button>
            </div>
          )}
        </div>
      )}

      {/* Completion Message */}
      {step === 'complete' && (
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-2">Photos Uploaded!</h3>
          <p className="text-gray-600 mb-4">
            Ask the customer to verify the OTP to complete the booking.
          </p>
        </div>
      )}
    </div>
  );
};

export default CompletionProof;