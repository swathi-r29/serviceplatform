import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from '../api/axios';
import BookingSidebar from '../components/booking/BookingSidebar';
import { FaStar, FaCheckCircle, FaMapMarkerAlt, FaShieldAlt, FaClock } from 'react-icons/fa';

const SERVER_URL = 'http://localhost:5000';

const ServiceDetails = () => {
    const { id } = useParams();
    const [service, setService] = useState(null);
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchServiceAndReviews = async () => {
            try {
                const { data: serviceData } = await axios.get(`/services/${id}`);
                setService(serviceData);
                
                // Fetch reviews for the first worker if available
                if (serviceData.workers && serviceData.workers.length > 0) {
                    const workerId = serviceData.workers[0]._id || serviceData.workers[0];
                    const { data: reviewData } = await axios.get(`/reviews/worker/${workerId}`);
                    setReviews(reviewData);
                }
            } catch (err) {
                console.error(err);
                setError('Failed to load service details.');
            } finally {
                setLoading(false);
            }
        };
        fetchServiceAndReviews();
    }, [id]);

    if (loading) return (
        <div className="flex justify-center items-center min-h-screen">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
        </div>
    );

    if (error || !service) return (
        <div className="text-center py-20 text-red-600 font-bold">{error || 'Service not found'}</div>
    );

    const imageUrl = service.image ? (service.image.startsWith('http') ? service.image : `${SERVER_URL}${service.image}`) : 'https://via.placeholder.com/800x400';

    return (
        <div className="min-h-screen bg-[#faf8f5] font-lato pb-20">
            {/* Hero Section */}
            <div className="relative h-[400px] w-full bg-gray-900">
                <img
                    src={imageUrl}
                    alt={service.name}
                    className="w-full h-full object-cover opacity-60"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-transparent to-transparent"></div>

                <div className="absolute bottom-0 left-0 w-full p-8 md:p-16">
                    <div className="max-w-7xl mx-auto">
                        <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-4 inline-block">
                            {service.category}
                        </span>
                        <h1 className="text-4xl md:text-5xl font-bold text-white font-playfair mb-4">
                            {service.name}
                        </h1>
                        <p className="text-gray-200 text-lg max-w-2xl mb-6 line-clamp-2">
                            {service.description}
                        </p>

                        <div className="flex flex-wrap gap-6 text-white text-sm font-medium">
                            <div className="flex items-center gap-2">
                                <FaStar className="text-yellow-400 text-lg" />
                                <span className="text-xl font-bold">4.9</span>
                                <span className="text-gray-400">(1,240 Reviews)</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <FaShieldAlt className="text-green-400 text-lg" />
                                <span>Verified Professionals</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <FaClock className="text-blue-400 text-lg" />
                                <span>{service.duration} Hours Avg.</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-10 relative z-10">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* Left Content */}
                    <div className="lg:col-span-2 space-y-8">

                        {/* About Service */}
                        <div className="bg-white rounded-2xl p-8 shadow-sm">
                            <h2 className="text-2xl font-bold text-gray-900 font-playfair mb-4">About This Service</h2>
                            <p className="text-gray-600 leading-relaxed mb-6">
                                {service.description}. Our {service.category.toLowerCase()} professionals are trained to deliver high-quality service with transparent pricing.
                                We ensure safety protocols and use top-grade equipment for the best results.
                            </p>

                        </div>

                        {/* What's Included (Features) */}
                        <div className="bg-white rounded-2xl p-8 shadow-sm">
                            <h2 className="text-2xl font-bold text-gray-900 font-playfair mb-6">What's Included</h2>

                            {service.features && service.features.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {service.features.map((feature, index) => (
                                        <div key={index} className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition">
                                            <FaCheckCircle className="text-green-500 flex-shrink-0" />
                                            <span className="text-gray-700 font-medium">{feature}</span>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-gray-500 italic">Standard service inclusions apply.</p>
                            )}
                        </div>

                        {/* Reviews */}
                        <div className="bg-white rounded-2xl p-8 shadow-sm">
                            <h2 className="text-2xl font-bold text-gray-900 font-playfair mb-6">Customer Reviews</h2>
                            <div className="space-y-6">
                                {reviews.length > 0 ? (
                                    reviews.map((review) => (
                                        <div key={review._id} className="border-b border-gray-100 pb-6 last:border-0 last:pb-0">
                                            <div className="flex justify-between items-start mb-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center font-bold text-gray-600">
                                                        {review.user?.name?.charAt(0) || 'U'}
                                                    </div>
                                                    <div>
                                                        <div className="flex items-center gap-2">
                                                            <span className="font-bold text-gray-900">{review.user?.name}</span>
                                                            {review.isVerified && (
                                                                <span className="flex items-center gap-1 text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-bold uppercase">
                                                                    <FaCheckCircle size={8} /> Verified
                                                                </span>
                                                            )}
                                                        </div>
                                                        <div className="flex text-yellow-400 text-xs">
                                                            {[...Array(5)].map((_, i) => (
                                                                <FaStar key={i} className={i < review.rating ? 'fill-current' : 'text-gray-200'} />
                                                            ))}
                                                        </div>
                                                    </div>
                                                </div>
                                                <span className="text-xs text-gray-400">
                                                    {new Date(review.createdAt).toLocaleDateString()}
                                                </span>
                                            </div>
                                            <p className="text-gray-600 text-sm mb-3">{review.comment}</p>
                                            {review.tags && review.tags.length > 0 && (
                                                <div className="flex flex-wrap gap-2">
                                                    {review.tags.map((tag, idx) => (
                                                        <span key={idx} className="text-[10px] bg-gray-100 text-gray-500 px-2 py-1 rounded-md font-medium">
                                                            #{tag}
                                                        </span>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center py-8 text-gray-400">
                                        No reviews yet for this specific service.
                                    </div>
                                )}
                            </div>
                        </div>

                    </div>

                    {/* Right Sidebar - Booking */}
                    <div className="lg:col-span-1">
                        <BookingSidebar service={service} />
                    </div>

                </div>
            </div>
        </div>
    );
};

export default ServiceDetails;
