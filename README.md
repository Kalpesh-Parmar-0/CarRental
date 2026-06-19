# 🚗 Car Rental — Full-Stack Car Rental Platform

A full-stack **MERN** (MongoDB, Express, React, Node.js) car rental web application where users can browse and book cars, and car owners can list, manage, and track their fleet through a dedicated dashboard.

**[📂 Source Code](https://github.com/Kalpesh-Parmar-0/CarRental)**

![Home Page](./screenshots/home.png)

## ✨ Features

### For Renters (Users)

- Browse all available cars with images, specs, and daily pricing
- Search and filter cars by location, category, and availability dates
- View detailed car page (brand, model, year, fuel type, transmission, seating capacity, features)
- Check real-time car availability before booking
- Book a car by selecting pickup and return dates
- View personal booking history and status (`pending`, `confirmed`, `cancelled`) on **My Bookings**
- User authentication (register/login) with secure session handling

### For Car Owners

- One-click "Become an Owner" role upgrade for any registered user
- Owner dashboard with key stats (total cars, bookings, revenue, etc.)
- Add a new car listing with **multiple images**, pricing, and full specs
- Manage car listings — toggle availability, edit, or delete
- Manage incoming bookings — approve or cancel requests
- Update profile picture and details

### Platform-wide

- JWT-based authentication stored in HTTP-only cookies
- Image uploads and hosting via **ImageKit**
- Fully responsive UI built with **Tailwind CSS v4**
- Smooth page/element animations using **Motion** (Framer Motion)
- Toast notifications for instant user feedback

## 🛠️ Tech Stack

| Layer            | Technology                                                                         |
| ---------------- | ---------------------------------------------------------------------------------- |
| **Frontend**     | React 19, React Router v7, Tailwind CSS v4, Vite 7, Motion, Axios, React Hot Toast |
| **Backend**      | Node.js, Express 5                                                                 |
| **Database**     | MongoDB with Mongoose                                                              |
| **Auth**         | JWT (jsonwebtoken), bcrypt for password hashing, cookie-parser                     |
| **File Uploads** | Multer + ImageKit (cloud image storage & delivery)                                 |
| **Dev Tools**    | Nodemon, ESLint                                                                    |

**Architecture:** Decoupled client/server — a Vite-powered React SPA consumes a REST API served by Express, with MongoDB Atlas as the data layer and ImageKit as the media CDN.

---

## 📁 Project Structure

```
CarRental/
├── client/                 # React frontend (Vite)
│   └── src/
│       ├── components/     # Navbar, Hero, CarCard, Login, owner/* etc.
│       ├── pages/          # Home, Cars, CarDetails, MyBookings, owner/*
│       ├── context/        # Global app state (AppContext)
│       └── assets/
└── server/                 # Express backend
    ├── configs/            # DB connection, ImageKit config
    ├── controllers/        # userController, ownerController, bookingController
    ├── middelware/         # auth (JWT), multer (uploads)
    ├── models/             # User, Car, Booking (Mongoose schemas)
    ├── routes/             # userRoutes, ownerRoutes, bookingRoutes
    └── server.js            # App entry point
```

---

## 🔌 API Overview

| Method | Endpoint                           | Description                    | Auth |
| ------ | ---------------------------------- | ------------------------------ | ---- |
| POST   | `/api/user/register`               | Register a new user            | ❌   |
| POST   | `/api/user/login`                  | Log in                         | ❌   |
| POST   | `/api/user/logout`                 | Log out                        | ❌   |
| GET    | `/api/user/data`                   | Get logged-in user data        | ✅   |
| GET    | `/api/user/cars`                   | List all cars                  | ❌   |
| GET    | `/api/user/cities`                 | List supported cities          | ❌   |
| POST   | `/api/owner/change-role`           | Upgrade user → owner           | ✅   |
| POST   | `/api/owner/add-car`               | Add a car (with images)        | ✅   |
| POST   | `/api/owner/update-car`            | Edit a car listing             | ✅   |
| GET    | `/api/owner/cars`                  | Get cars owned by current user | ✅   |
| POST   | `/api/owner/toggle-car`            | Toggle car availability        | ✅   |
| POST   | `/api/owner/delete-car`            | Delete a car                   | ✅   |
| GET    | `/api/owner/dashboard`             | Owner dashboard stats          | ✅   |
| POST   | `/api/owner/update-profile`        | Update owner profile/photo     | ✅   |
| POST   | `/api/bookings/check-availability` | Check date availability        | ❌   |
| POST   | `/api/bookings/create`             | Create a booking               | ✅   |
| POST   | `/api/bookings/update`             | Update a booking               | ✅   |
| GET    | `/api/bookings/user`               | Get current user's bookings    | ✅   |
| GET    | `/api/bookings/owner`              | Get bookings for owner's cars  | ✅   |
| POST   | `/api/bookings/change-status`      | Approve/cancel a booking       | ✅   |

---

## ⚙️ Getting Started Locally

### Prerequisites

- Node.js (v18+)
- A free [MongoDB Atlas](https://www.mongodb.com/cloud/atlas/register) cluster
- A free [ImageKit](https://imagekit.io/) account (for image uploads)

### 1. Clone the repo

```bash
git clone https://github.com/<your-username>/CarRental.git
cd CarRental
```

### 2. Backend setup

```bash
cd server
npm install
```

Create a `.env` file in `/server`:

```env
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
IMAGEKIT_PUBLIK_KEY=your_imagekit_public_key
IMAGEKIT_PRIVATE_KEY=your_imagekit_private_key
IMAGEKIT_URL_ENDPOINT=your_imagekit_url_endpoint
PORT=3000
```

Run the server:

```bash
npm run server   # nodemon, auto-restarts
# or
npm start
```

### 3. Frontend setup

```bash
cd ../client
npm install
```

Create a `.env` file in `/client`:

```env
VITE_CURRENCY=$
VITE_BASE_URL=http://localhost:3000
```

Run the client:

```bash
npm run dev
```

The app will be available at `http://localhost:5173`, with the API running at `http://localhost:3000`.

## 👤 Author

Built by **Kalpesh Parmar** — [LinkedIn](www.linkedin.com/in/kalpesh-parmar-797b04245) · [GitHub](https://github.com/Kalpesh-Parmar-0)
