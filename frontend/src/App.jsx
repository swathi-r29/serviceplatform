import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/common/Navbar';
import Footer from './components/common/Footer';
import ProtectedRoute from './components/common/ProtectedRoute';
import Home from './pages/Home';
import Services from './pages/Services';
import CategoryServices from './components/common/Categoryservices';
import Contact from './pages/Contact';
import Login from './pages/Login';
import Register from './pages/Register';
import VerifyOTP from './pages/VerifyOTP';
import UserDashboard from './components/user/UserDashboard';
import CreateBooking from './components/user/CreateBooking';
import MyBookings from './components/user/MyBookings';
import UserProfile from './components/user/UserProfile';
import Favorites from './components/user/Favorites';
import WorkerDashboard from './components/worker/WorkerDashboard';
import WorkerBookings from './components/worker/WorkerBookings';
import WorkerProfile from './components/worker/WorkerProfile';
import Earnings from './components/worker/Earnings';
import AvailabilityCalendar from './components/worker/AvailabilityCalendar';
import WorkerLayout from './components/worker/WorkerLayout';
import WorkerSettings from './components/worker/WorkerSettings';
import AdminDashboard from './components/admin/AdminDashboard';
import ServiceManagement from './components/admin/ServiceManagement';
import AddService from './components/admin/AddService';
import EditService from './components/admin/EditService';
import UserManagement from './components/admin/UserManagement';
import WorkerManagement from './components/admin/WorkerManagement';
import BookingManagement from './components/admin/BookingManagement';
import AnalyticsDashboard from './components/admin/AnalyticsDashboard';
import AdminSettings from './components/admin/AdminSettings';
import NotFound from './pages/NotFound';
import Support from './pages/Support';
import HowItWorksPage from './pages/howitworks';
import GoogleCallback from './pages/GoogleCallback';
import Chat from './components/common/Chat';
import Cart from './components/user/Cart';
import Chatbot from './components/common/Chatbot';
import { AssistantProvider } from './context/AssistantContext';

import { WebRTCProvider, useWebRTC } from './context/WebRTCContext';
import IncomingCallAlert from './components/common/IncomingCallAlert';
import VideoCallModal from './components/common/VideoCallModal';
import { useState } from 'react';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AssistantProvider>
          <WebRTCProvider>
            <AppContent />
          </WebRTCProvider>
        </AssistantProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

function AppContent() {
  const { isCallModalOpen, setIsCallModalOpen } = useWebRTC();
  const location = useLocation();

  const isDashboard =
    location.pathname.startsWith('/worker') ||
    location.pathname.startsWith('/admin') ||
    location.pathname.startsWith('/user/dashboard');

  const hideNavbar =
    location.pathname.startsWith('/worker') ||
    location.pathname.startsWith('/admin');

  const hideFooter = isDashboard;

  return (
    <div className="flex flex-col min-h-screen">
      {!hideNavbar && <Navbar />}
      <main className="flex-grow">
        <Routes>
          {/* ── Public Routes ─────────────────────────────── */}
          <Route path="/" element={<Home />} />
          <Route path="/how-it-works" element={<HowItWorksPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/worker/register" element={<Register />} />
          <Route path="/verify-otp" element={<VerifyOTP />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/support" element={<Support />} />
          <Route path="/auth/google/callback" element={<GoogleCallback />} />

          {/* ── Services ──────────────────────────────────── */}
          <Route path="/services" element={<Services />} />
          <Route path="/services/category/:categoryName" element={<CategoryServices />} />

          {/* ── User Routes ───────────────────────────────── */}
          <Route
            path="/user/dashboard"
            element={
              <ProtectedRoute allowedRoles={['user']}>
                <UserDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/user/booking/create/:serviceId"
            element={
              <ProtectedRoute allowedRoles={['user']}>
                <CreateBooking />
              </ProtectedRoute>
            }
          />
          <Route
            path="/user/bookings"
            element={
              <ProtectedRoute allowedRoles={['user']}>
                <MyBookings />
              </ProtectedRoute>
            }
          />
          <Route
            path="/user/profile"
            element={
              <ProtectedRoute allowedRoles={['user']}>
                <UserProfile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/user/favorites"
            element={
              <ProtectedRoute allowedRoles={['user']}>
                <Favorites />
              </ProtectedRoute>
            }
          />
          <Route
            path="/user/cart"
            element={
              <ProtectedRoute allowedRoles={['user']}>
                <Cart />
              </ProtectedRoute>
            }
          />

          {/* ── Worker Routes (nested under WorkerLayout) ─── */}
          <Route
            path="/worker"
            element={
              <ProtectedRoute allowedRoles={['worker']}>
                <WorkerLayout />
              </ProtectedRoute>
            }
          >
            <Route path="dashboard" element={<WorkerDashboard />} />
            <Route path="bookings" element={<WorkerBookings />} />
            <Route path="profile" element={<WorkerProfile />} />
            <Route path="earnings" element={<Earnings />} />
            <Route path="availability" element={<AvailabilityCalendar />} />
            <Route path="schedule" element={<AvailabilityCalendar />} />
            <Route path="settings" element={<WorkerSettings />} />
          </Route>

          {/* ── Chat Routes ───────────────────────────────── */}
          <Route
            path="/chat/booking/:bookingId"
            element={
              <ProtectedRoute allowedRoles={['user', 'worker']}>
                <Chat />
              </ProtectedRoute>
            }
          />
          <Route
            path="/chat/user/:userId"
            element={
              <ProtectedRoute allowedRoles={['user', 'worker']}>
                <Chat />
              </ProtectedRoute>
            }
          />

          {/* ── Admin Routes ──────────────────────────────── */}
          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/services"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <ServiceManagement />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/services/add"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AddService />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/services/edit/:id"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <EditService />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/users"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <UserManagement />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/workers"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <WorkerManagement />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/bookings"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <BookingManagement />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/analytics"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AnalyticsDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/settings"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminSettings />
              </ProtectedRoute>
            }
          />

          {/* ── 404 ───────────────────────────────────────── */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <Chatbot />
      <IncomingCallAlert onAnswer={() => setIsCallModalOpen(true)} />
      <VideoCallModal isOpen={isCallModalOpen} onClose={() => setIsCallModalOpen(false)} />
      {!hideFooter && <Footer />}
    </div>
  );
}

export default App;