# Craveo

A full-stack food ordering platform — React frontend, Node/Express/MongoDB backend — built to go deep on things a typical CRUD app skips: real payment verification, role-based access, rate limiting, and consistent error handling across the API.

Craveo lets users discover restaurants, place orders, pay securely online, track orders in real time, and leave reviews after delivery. It focuses on real-world backend concepts beyond basic CRUD, including JWT authentication, role-based authorization, server-side payment verification, Socket.IO, Cloudinary image uploads, rate limiting, centralized error handling, and secure REST APIs.

**Status:** Core flow is fully functional — from signup to secure payment, real-time order tracking, and restaurant reviews.

---

## Links

| Resource | Link |
|---|---|
| Source Code | https://github.com/tlpranathi/craveo |
| Live App | https://craveoo.vercel.app/ |
| Backend API | https://craveo-tkyw.onrender.com |

> **Note:** The backend is hosted on Render's free tier. The first request after inactivity may take 30–50 seconds while the server wakes up.

---

## Screenshots & Demo

_Coming soon — screenshots and a walkthrough video will be added here._

---

## Features

### Authentication
- JWT authentication
- Password hashing with bcrypt
- Persistent login
- Protected routes
- Profile management
- Password change

### Restaurant Discovery
- Browse restaurants
- Search with debouncing (400ms)
- Cuisine filters
- Pagination
- Dynamic restaurant ratings
- Review statistics

### Ordering
- Shopping cart with quantity controls
- Single-restaurant cart restriction
- Razorpay payment integration
- Server-side payment verification
- Order history
- Order status flow: pending → confirmed → preparing → delivered
- Real-time order status updates via Socket.IO
- Cancellation window: available for 1 minute after placing, or until the restaurant confirms the order — whichever comes first

### Reviews
- Review only after delivery
- One review per order, editable and deletable by the reviewer
- Dynamic average rating calculation, updated without a page reload
- Paginated reviews

### Admin Dashboard
- Restaurant CRUD
- Menu CRUD
- Order management
- Cloudinary image uploads
- Role-based authorization
- Duplicate menu item prevention per restaurant

### Notifications
- Transactional emails via Nodemailer: welcome email on signup, order-delivered email with order and restaurant details

### Frontend Engineering
- Auth and cart state persisted across page refresh via localStorage
- JWT automatically attached to requests through an Axios interceptor
- Conditional navbar based on auth state
- Login/register buttons disabled during the request to prevent duplicate submissions
- Quantity controls replace the "Add to Cart" button once an item is in the cart
- Optimistic UI update on order cancellation
- Loading, error, and empty states handled throughout
- Search input debounced at 400ms

### Security
- JWT authentication (7-day token expiry; session ends on expiry)
- Helmet
- express-validator
- Rate limiting
- Centralized error handling
- Standardized API responses

---

## Tech Stack

| Category | Technologies |
|---|---|
| Frontend | React, Vite, React Router, Tailwind CSS, Axios |
| Backend | Node.js, Express |
| Database | MongoDB, Mongoose |
| Authentication | JWT, bcrypt |
| Payments | Razorpay |
| Realtime | Socket.IO |
| Image Storage | Cloudinary |
| Emails | Nodemailer |
| Validation | express-validator |
| Security | Helmet, Rate Limiting, CORS |
| Deployment | Vercel, Render |

---

## Technical Highlights

- Server-side Razorpay payment verification
- Socket.IO powered real-time order updates
- JWT authentication with protected frontend and backend routes
- Role-based authorization for admin operations
- Dynamic restaurant rating recalculation
- Pagination for restaurants, orders, and reviews
- Cloudinary image uploads
- Duplicate menu prevention
- Centralized error handling using custom middleware
- Consistent API response format

---

## Project Structure

```text
craveo/
├── backend/
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── validators/
│   ├── utils/
│   └── server.js
└── frontend/
    └── src/
        ├── components/
        ├── context/
        ├── pages/
        ├── pages/admin/
        └── services/
```

---

## API Overview

### Authentication
- `POST /api/auth/signup` — registers a new user account and returns a JWT
- `POST /api/auth/login` — authenticates a user and returns a JWT

### Restaurants
- `GET /api/restaurants` — fetches all restaurants, paginated
- `GET /api/restaurants?search=...` — searches restaurants by name or location
- `GET /api/restaurants?cuisine=...` — filters restaurants by cuisine
- `GET /api/restaurants/:id` — fetches a single restaurant
- `POST /api/restaurants` (Admin) — creates a restaurant
- `PUT /api/restaurants/:id` (Admin) — updates a restaurant
- `DELETE /api/restaurants/:id` (Admin) — deletes a restaurant

### Menu
- `GET /api/menu/:restaurantId` — fetches all menu items for a restaurant
- `POST /api/menu` (Admin) — creates a menu item
- `PUT /api/menu/:id` (Admin) — updates a menu item
- `DELETE /api/menu/:id` (Admin) — deletes a menu item

### Orders
- `POST /api/orders` — places a new order for the logged-in user
- `GET /api/orders/my-orders` — fetches the logged-in user's order history
- `PATCH /api/orders/:id/status` (Admin) — updates an order's status
- `PATCH /api/orders/:id/cancel` — cancels an order if still eligible

### Users
- `GET /api/users/profile` — fetches the logged-in user's profile
- `PUT /api/users/profile` — updates the logged-in user's profile
- `PUT /api/users/change-password` — changes the logged-in user's password

### Reviews
- `POST /api/reviews` — creates a review for a delivered order
- `GET /api/reviews/:restaurantId` — fetches a restaurant's reviews, paginated
- `PUT /api/reviews/:id` — updates the logged-in user's review
- `DELETE /api/reviews/:id` — deletes the logged-in user's review

### Payments
- `POST /api/payment/create-order` — creates a Razorpay order
- `POST /api/payment/verify` — verifies the Razorpay payment signature

---

## Running Locally

### Backend

```bash
cd backend
npm install
npm run dev
```

Create `backend/.env`:

```env
MONGO_URI=
JWT_SECRET=
JWT_EXPIRES_IN=7d
PORT=5000
RAZORPAY_KEY_ID=
RAZORPAY_KEY_SECRET=
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
EMAIL_USER=
EMAIL_PASS=
FRONTEND_URL=http://localhost:5173
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Create `frontend/.env`:

```env
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
```

---

## Future Improvements

- AI-powered review summaries
- Restaurant owner dashboards (dedicated access for individual restaurant owners)
- Forgot password / reset flow
- Full email verification (current signup validation is regex-based only)
- Coupons & loyalty system
- Toast notification system
- Cart replace-item flow when adding items from a different restaurant
- Automated testing with Jest
- Load testing with k6
- Analytics dashboard (restaurant-wise stats for admin)