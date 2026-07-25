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
- Role-based access control across three roles: customer, restaurant owner, and superadmin, enforced at the middleware layer

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

### Restaurant Owner Dashboard
- Scoped to the owner's own restaurant only — ownership is re-verified server-side on every write, not trusted from the request
- Menu CRUD, with duplicate menu item prevention per restaurant
- Order management and status updates for their restaurant
- View reviews for their restaurant
- Restaurant-level analytics

### Superadmin Dashboard
- Platform-wide restaurant CRUD
- Platform-wide menu management across all restaurants
- Order management across the platform
- Cloudinary image uploads
- Platform-wide analytics

### Notifications
- Transactional emails via Resend: welcome email on signup, order-delivered email with order and restaurant details

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
| Emails | Resend |
| Validation | express-validator |
| Security | Helmet, Rate Limiting, CORS |
| Deployment | Vercel, Render |

---

## Technical Highlights

- Server-side Razorpay payment verification
- Socket.IO powered real-time order updates
- JWT authentication with protected frontend and backend routes
- Role-based authorization for owner and superadmin operations
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

APIs are organized into three tiers: public/user routes (`/api/...`), owner routes (`/api/owner/...`), and superadmin routes (`/api/admin/...`).

### Authentication
- `POST /api/auth/signup` — registers a new user account and returns a JWT
- `POST /api/auth/login` — authenticates a user and returns a JWT

### Restaurants
- `GET /api/restaurants` — fetches all restaurants, paginated
- `GET /api/restaurants?search=...` — searches restaurants by name or location
- `GET /api/restaurants?cuisine=...` — filters restaurants by cuisine
- `GET /api/restaurants/:id` — fetches a single restaurant
- `POST /api/restaurants` (Superadmin) — creates a restaurant
- `PUT /api/restaurants/:id` (Superadmin) — updates a restaurant
- `DELETE /api/restaurants/:id` (Superadmin) — deletes a restaurant

### Menu
- `GET /api/menu/:restaurantId` — fetches all menu items for a restaurant
- `POST /api/menu` (Superadmin) — creates a menu item for any restaurant
- `PUT /api/menu/:id` (Superadmin) — updates any menu item
- `DELETE /api/menu/:id` (Superadmin) — deletes any menu item
- `GET /api/owner/menu` (Owner) — fetches menu items for the owner's restaurant
- `POST /api/owner/menu` (Owner) — creates a menu item for the owner's restaurant
- `PUT /api/owner/menu/:id` (Owner) — updates a menu item belonging to the owner's restaurant
- `DELETE /api/owner/menu/:id` (Owner) — deletes a menu item belonging to the owner's restaurant
- `GET /api/admin/menu` (Superadmin) — fetches all menu items across every restaurant

### Orders
- `POST /api/orders` — places a new order for the logged-in user
- `GET /api/orders/my-orders` — fetches the logged-in user's order history
- `PATCH /api/orders/:id/status` — updates an order's status; users can cancel only their own pending order within 1 minute, owners can update orders for their own restaurant, superadmins can update any order
- `PATCH /api/orders/:id/cancel` — cancels an eligible pending order
- `GET /api/owner/orders` (Owner) — fetches all orders for the owner's restaurant
- `GET /api/admin/orders` (Superadmin) — fetches all orders across the platform
- `GET /api/owner/stats` (Owner) — dashboard stats for the owner's restaurant: total revenue, total orders, average rating, top 5 popular menu items
- `GET /api/admin/stats` (Superadmin) — platform-wide dashboard stats: total revenue, total orders, average rating, top 5 popular menu items

### Users
- `GET /api/users/profile` — fetches the logged-in user's profile
- `PUT /api/users/profile` — updates the logged-in user's profile
- `PUT /api/users/change-password` — changes the logged-in user's password

### Reviews
- `POST /api/reviews` — creates a review for a delivered order
- `GET /api/reviews/:restaurantId` — fetches a restaurant's reviews, paginated
- `PUT /api/reviews/:id` — updates the logged-in user's review
- `DELETE /api/reviews/:id` — deletes the logged-in user's review
- `GET /api/owner/reviews` (Owner) — fetches all reviews for the owner's restaurant
- `GET /api/admin/reviews` (Superadmin) — fetches all reviews across the platform

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
RESEND_API_KEY=
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
- Forgot password / reset flow
- Full email verification (current signup validation is regex-based only)
- Coupons & loyalty system
- Toast notification system
- Cart replace-item flow when adding items from a different restaurant
- Automated testing with Jest
- Load testing with k6