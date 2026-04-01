export const API_BASE_URL = 'http://localhost:5000/api';

export const SERVICE_CATEGORIES = [
  'Plumbing',
  'Electrical',
  'Cleaning',
  'Carpentry',
  'Painting',
  'AC Repair',
  'Pest Control',
  'Appliance Repair',
  'Moving & Packing',
  'Home Tutoring',
  'Salon & Spa',
  'Gardening',
  'Smart Home',
  'Other'
];

export const BOOKING_STATUS = {
  PENDING: 'pending',
  ACCEPTED: 'accepted',
  REJECTED: 'rejected',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled'
};

export const PAYMENT_STATUS = {
  PENDING: 'pending',
  PAID: 'paid'
};

export const PAYMENT_METHODS = {
  CASH: 'cash',
  CARD: 'card',
  UPI: 'upi'
};

export const USER_ROLES = {
  USER: 'user',
  WORKER: 'worker',
  ADMIN: 'admin'
};

export const STATUS_COLORS = {
  pending: 'bg-yellow-100 text-yellow-800',
  accepted: 'bg-blue-100 text-blue-800',
  rejected: 'bg-red-100 text-red-800',
  completed: 'bg-green-100 text-green-800',
  cancelled: 'bg-gray-100 text-gray-800'
};