# LuxeStay - MERN Hotel Booking Platform

A premium, production-ready hotel booking platform built with the MERN stack, featuring role-based access control, real-time availability, and a luxurious design system.

## 🚀 Features

### For Customers
- **Global Search**: Find hotels by location and rating.
- **Premium UI**: Experience a glass-morphic, responsive design with smooth animations.
- **Real-time Availability**: See room availability updates instantly via Socket.io.
- **Booking Management**: Book rooms, view history, and cancel bookings from a personalized dashboard.
- **Review System**: Share experiences and rate hotels.

### For Hotel Managers
- **Property Management**: Register hotels and define room types (Single, Double, Suite, Deluxe).
- **Manager Dashboard**: Monitor bookings and manage property details.
- **Image Uploads**: Integrated with Cloudinary for high-performance image delivery.

### For Platform Admins
- **Admin Panel**: Monitor platform-wide stats (Total Users, Hotels, Bookings, Revenue).
- **Approval System**: Review and approve/reject new hotel registrations.
- **Analytics**: Track revenue growth and user engagement.

## 🛠️ Tech Stack
- **Frontend**: React.js, Vite, Framer Motion, Lucide Icons, Axios, React Router.
- **Backend**: Node.js, Express.js, JWT, Socket.io, Multer, Helmet, Morgan.
- **Database**: MongoDB Atlas.
- **Storage**: Cloudinary.
- **Payments**: Stripe/Razorpay (Integration-ready logic).

## 📂 Project Structure
```
Hotel Management/
├── backend/            # Express.js Server
│   ├── config/         # Database & Cloudinary config
│   ├── controllers/    # API Business logic
│   ├── models/         # Mongoose Schemas
│   ├── routes/         # Express Routes
│   ├── middleware/     # Auth & Protection
│   └── server.js       # Entry Point
├── frontend/           # React Application
│   ├── src/
│   │   ├── components/ # Reusable UI pieces
│   │   ├── pages/      # Full-page views
│   │   ├── context/    # Global Auth state
│   │   ├── services/   # Axios instance
│   │   └── hooks/      # Custom React hooks (Socket, etc)
└── deployment_guide.md # Step-by-step production setup
```

## 🏁 Getting Started

### 1. Prerequisites
- Node.js installed.
- MongoDB Atlas cluster.
- Cloudinary account.

### 2. Backend Setup
```bash
cd backend
npm install
```
Create a `.env` file in the `backend` folder using the template provided in the code.

### 3. Frontend Setup
```bash
cd frontend
npm install
```
Create a `.env` file in the `frontend` folder:
```
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
```

### 4. Running the App
- Backend: `node server.js`
- Frontend: `npm run dev`

## 🛡️ Security
- Password hashing with **BcryptJS**.
- Protected routes with **JWT Authentication**.
- **Helmet.js** for secure HTTP headers.
- Role-based authorization (Customer vs Manager vs Admin).

## 📄 License
MIT
