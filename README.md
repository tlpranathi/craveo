# Craveo

A full-stack food discovery and ordering app, similar to Zomato/Swiggy but built from scratch as a learning project — React on the frontend, Node/Express/MongoDB on the backend.

**Status:** Core app is working — auth, ordering, admin dashboard, search/filtering. Reviews, image upload, real-time updates, and payments are still being added.

---

## Live Demo

- Frontend: [link coming after deployment]
- Backend API: [link coming after deployment]

---

## What it does

Users can browse restaurants, search and filter by cuisine, add items to a cart, place orders, and track them through to delivery. There's also a separate admin side where restaurants, menus, and order status can all be managed.

### Auth
- Signup/login with JWT, passwords hashed with bcrypt
- Middleware checks the token on protected routes and attaches the logged-in user to the request
- Regular users vs admins have different permissions
- Users can update their profile and change their password

### Ordering
- Search restaurants by name/location, filter by cuisine — both handled server-side, with the search box debounced so it's not firing a request on every keystroke
- Paginated restaurant lists
- Cart stays in localStorage so it survives refreshes, quantities update live
- Place an order, see your order history, track status, cancel within a short window after placing it
- UI styled with Tailwind, including a custom theme and a mobile nav

### Admin
- Only accessible if your account has the admin role
- Add/edit/delete restaurants and menu items, with menu management nested under each restaurant
- Move orders through their statuses (pending → confirmed → preparing → delivered)
- Cancelling an order (customer) and advancing its status (admin) go through two different checks — one verifies you own the order and it's within the time limit, the other just checks you're an admin

### Backend
- MVC structure — models, controllers, routes kept separate
- One custom error class and one error-handling middleware used everywhere, so every error returns the same shape
- All API responses follow the same `{ success, message, data }` format

---

## Stack

| | |
|---|---|
| Frontend | React (Vite), React Router, Tailwind CSS, Axios |
| Backend | Node.js, Express |
| Database | MongoDB, Mongoose |
| Auth | JWT, bcrypt |

---

## API

**Auth**
```
POST   /api/auth/signup
POST   /api/auth/login
```

**Restaurants**
```
GET    /api/restaurants            (supports ?search= and ?cuisine=, paginated)
POST   /api/restaurants            admin only
PUT    /api/restaurants/:id        admin only
DELETE /api/restaurants/:id        admin only
```

**Menu**
```
GET    /api/menu/:restaurantId
POST   /api/menu                   admin only
PUT    /api/menu/:id               admin only
DELETE /api/menu/:id               admin only
```

**Orders**
```
POST   /api/orders
GET    /api/orders/my-orders
GET    /api/orders                 admin only
PATCH  /api/orders/:id/status
```

**Users**
```
GET    /api/users/profile
PUT    /api/users/profile
PUT    /api/users/change-password
```

---

## Project structure

```
craveo/
├── backend/
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── utils/
│   └── server.js
│
└── frontend/
    └── src/
        ├── components/
        ├── context/
        ├── pages/
        ├── pages/admin/
        └── services/
```

---

## Running it locally

**Requirements:** Node 18+, MongoDB (local or Atlas)

**Backend**
```bash
cd backend
npm install
```

Create a `.env` in `backend/`:
```env
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=7d
PORT=5000
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
