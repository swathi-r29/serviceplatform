# Project Module-Wise Architecture

This document provides a logical breakdown of the Service Platform project into functional modules. Each module encompasses frontend components, backend routes/controllers, and relevant database models.

---

## 1. Authentication Module
**Responsibility**: User registration, login, session management, and role-based access control (RBAC).
- **Frontend**: 
  - `Login.jsx`, `Register.jsx`, `VerifyOTP.jsx` (Pages)
  - `AuthContext.jsx` (State management)
- **Backend**:
  - `authRoutes.js`, `authController.js`
  - `passport.js` (Google OAuth configuration)
- **Database**: `User.js` (Schema for both customers and workers)

---

## 2. Admin Dashboard Module
**Responsibility**: Comprehensive platform management, analytics, and moderation.
- **Frontend**: 
  - `AdminDashboard.jsx` (Overview)
  - `UserManagement.jsx`, `WorkerManagement.jsx`, `BookingManagement.jsx`, `ServiceManagement.jsx`
- **Backend**:
  - `adminRoutes.js`, `adminAnalyticsRoutes.js`, `adminCreationRoutes.js`
  - `adminController.js`, `adminAnalyticsController.js`

---

## 3. Service Module
**Responsibility**: Management and display of service offerings and categories.
- **Frontend**: 
  - `Services.jsx`, `Categoryservices.jsx`
  - `AddService.jsx`, `EditService.jsx` (Admin only)
- **Backend**:
  - `serviceRoutes.js`, `serviceController.js`
- **Database**: `Service.js`

---

## 4. Order (Booking & Tracking) Module
**Responsibility**: End-to-end booking process, real-time worker tracking, and payments.
- **Frontend**: 
  - `CreateBooking.jsx`, `MyBookings.jsx`, `Cart.jsx`, `Payment.jsx`
  - `ServiceMapView.jsx` (Tracking)
- **Backend**:
  - `bookingRoutes.js`, `cartRoutes.js`, `paymentRoutes.js`
  - `bookingController.js`, `cartController.js`, `paymentController.js`
  - `server.js` (Socket.IO signaling for tracking)
- **Database**: `Booking.js`, `Cart.js`

---

## 5. Provider / Worker Module
**Responsibility**: Specialized portal for service providers to manage their work life.
- **Frontend**: 
  - `WorkerDashboard.jsx`, `WorkerProfile.jsx`
  - `AvailabilityCalendar.jsx`, `Earnings.jsx`, `SkillPricingManager.jsx`
- **Backend**:
  - `workerRoutes.js`, `workerEarningsRoutes.js`, `availabilityRoutes.js`
  - `workerController.js`, `workerEarningsController.js`, `availabilityController.js`

---

## 6. Customer Module
**Responsibility**: Features exclusive to end-consumers.
- **Frontend**: 
  - `UserDashboard.jsx`, `UserProfile.jsx`
  - `Favorites.jsx`, `ReviewForm.jsx`
- **Backend**:
  - `userRoutes.js`, `favoriteRoutes.js`, `reviewRoutes.js`
- **Database**: `Favorite.js`, `Review.js`

---

## 7. Communication Module
**Responsibility**: Real-time interaction between users and support.
- **Frontend**: `Chat.jsx`, `Chatbot.jsx`, `VideoCallModal.jsx`
- **Backend**: `chatRoutes.js`, `chatbotRoutes.js`, `aiRoutes.js`
- **Database**: `Chat.js`, `ChatHistory.js`
