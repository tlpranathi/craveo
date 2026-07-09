# Craveo

A full-stack food ordering platform — React frontend, Node/Express/MongoDB backend — built as a personal project to go deep on things a typical CRUD app skips: real payment verification, role-based access, rate limiting, and consistent error handling across the API.

**Status:** Core flow is live end-to-end — signup through to a paid, tracked order. See [Roadmap](#roadmap) for what's next.

## Live Demo

| | |
|---|---|
| Frontend | [craveoo.vercel.app](https://craveoo.vercel.app/) |
| Backend API | [craveo-tkyw.onrender.com](https://craveo-tkyw.onrender.com) |

> Backend is on Render's free tier — the first request after a period of inactivity can take ~30-50s to spin up.

---


## Features

**Users**
- Signup/login (JWT + bcrypt), profile editing, password change
- Browse restaurants with search, cuisine filters, and pagination
- Cart persists in localStorage across refreshes
- Checkout via Razorpay, with server-verified pricing and payment signatures
- Order history, live status, and cancellation within a short window after placing
- Rate and review restaurants after ordering

**Admin**
- Role-gated dashboard, separate from regular user access
- Full CRUD on restaurants and their menus
- Move orders through their lifecycle (pending → confirmed → preparing → delivered)

---

## Stack

| Layer | Tech |
|---|---|
| Frontend | React (Vite), React Router, Tailwind CSS, Axios |
| Backend | Node.js, Express |
| Database | MongoDB, Mongoose |
| Auth | JWT, bcrypt |
| Payments | Razorpay |
| Security | Helmet, express-validator, CORS allowlist, custom rate limiter |
| Hosting | Vercel (frontend), Render (backend) |

---

## API Reference

**Auth**
```
POST   /api/auth/signup
POST   /api/auth/login              rate-limited: 5 req / 15 min
```

**Restaurants**
```
GET    /api/restaurants             ?search= &cuisine=  (paginated)
GET    /api/restaurants/:id
POST   /api/restaurants             admin
PUT    /api/restaurants/:id         admin
DELETE /api/restaurants/:id         admin
```

**Menu**
```
GET    /api/menu/:restaurantId
POST   /api/menu                    admin
PUT    /api/menu/:id                admin
DELETE /api/menu/:id                admin
```

**Orders**
```
POST   /api/orders
GET    /api/orders/my-orders
GET    /api/orders                  admin
PATCH  /api/orders/:id/status
```

**Payments**
```
POST   /api/payment/create-order
POST   /api/payment/verify
```

**Reviews**
```
POST   /api/reviews
GET    /api/reviews/:restaurantId
```

**Users**
```
GET    /api/users/profile
PUT    /api/users/profile
PUT    /api/users/change-password
```

---

## Project Structure

```
craveo/
├── backend/
│   ├── config/           # DB connection, Razorpay client
│   ├── controllers/
│   ├── middleware/       # auth, admin gate, error handler, rate limiter, validator
│   ├── models/
│   ├── routes/
│   ├── validators/
│   ├── utils/
│   └── server.js
│
└── frontend/
    └── src/
        ├── components/    # incl. ReviewSection, StarRating, carousels
        ├── context/
        ├── pages/
        ├── pages/admin/
        └── services/
```

---

## Running Locally

**Requirements:** Node 18+, MongoDB (local or Atlas), a Razorpay account (test keys work fine)

**Backend**
```bash
cd backend
npm install
```

Create `backend/.env`:
```
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=7d
PORT=5000
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
```

```bash
npm run dev
```

**Frontend**
```bash
cd frontend
npm install
npm run dev
```

Frontend runs on `localhost:5173`, backend on `localhost:5000`.

---

## Roadmap

- [ ] Image upload for restaurants/menu items
- [ ] Email verification (signup + password changes) and transactional emails (welcome, order updates)
- [ ] Restaurant owner dashboard — scoped access to manage just their own restaurant
- [ ] Real-time order status via sockets, instead of polling/refresh
- [ ] Coupon codes (order-count based, one redeemable per order)
- [ ] Load testing — simulate concurrent users to find Craveo's actual capacity
