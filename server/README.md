# ⚽ Footimes — Backend API Server

A production-ready **Express.js + Socket.IO** REST API that powers the Footimes football news and live-score platform. Built with **Node.js**, **MongoDB Atlas**, and **Cloudinary** for media storage.

---

## 📋 Table of Contents

- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Environment Variables](#-environment-variables)
- [Getting Started](#-getting-started)
- [Docker](#-docker)
- [API Overview](#-api-overview)
- [Socket.IO Events](#-socketio-events)
- [Authentication](#-authentication)
- [Deployment (Dokploy / VPS)](#-deployment-dokploy--vps)

---

## 🛠 Tech Stack

| Layer        | Technology                        |
|--------------|-----------------------------------|
| Runtime      | Node.js 20 (ESM)                  |
| Framework    | Express.js 5                      |
| Database     | MongoDB Atlas via Mongoose 8      |
| Real-time    | Socket.IO 4                       |
| Auth         | JSON Web Tokens (jsonwebtoken)    |
| Media Upload | Cloudinary + multer-storage-cloudinary |
| Password     | bcryptjs                          |
| Dev server   | nodemon                           |

---

## 📁 Project Structure

```
server/
├── config/
│   └── cloudinary.js        # Cloudinary SDK init
├── controllers/
│   ├── adminController.js   # Admin login handler
│   ├── authController.js    # Auth utilities
│   └── newsController.js    # News CRUD helpers
├── middleware/
│   └── auth.js              # JWT verifyToken middleware
├── models/
│   ├── Admin.js             # Admin user schema
│   ├── Fixture.js           # Match fixture schema
│   ├── LiveMatch.js         # Live score schema
│   ├── News.js              # News article schema
│   └── Tournament.js        # Tournament schema
├── routes/
│   ├── authRoutes.js        # POST /api/admin/login
│   ├── newsRoutes.js        # /api/news  (full CRUD + image upload)
│   ├── tournamentRoutes.js  # /api/tournaments (full CRUD)
│   ├── fixtureRoutes.js     # /api/fixtures (full CRUD)
│   └── livescore.js         # /api/livescore (live match management)
├── .dockerignore
├── .env                     # ⚠️ Never commit this
├── Dockerfile
├── package.json
├── README.md
├── ROUTES.md
└── server.js                # App entry point
```

---

## 🔐 Environment Variables

Create a `.env` file in the `server/` directory:

```env
# MongoDB Atlas connection string
MONGO_URI=mongodb+srv://<user>:<password>@<cluster>.mongodb.net/<dbname>?retryWrites=true&w=majority

# JWT secret — use a long random string in production
JWT_SECRET=your_super_secret_key

# Cloudinary credentials
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Server port (optional, defaults to 5000)
PORT=5000
```

> **⚠️ Warning:** Never commit `.env` to version control. It is already listed in `.gitignore` and `.dockerignore`.

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ (20 recommended)
- A MongoDB Atlas cluster
- A Cloudinary account

### Install & Run

```bash
# 1. Navigate to the server directory
cd server

# 2. Install dependencies
npm install

# 3. Create your .env file (see section above)

# 4. Start dev server (with hot-reload via nodemon)
npm run dev

# 5. Start production server
npm start
```

The server will start on `http://localhost:5000` by default.

---

## 🐳 Docker

A production-ready multi-stage `Dockerfile` is included.

```bash
# Build the image
docker build -t footimes-server .

# Run the container (pass env vars at runtime)
docker run -p 5000:5000 \
  -e MONGO_URI="your_uri" \
  -e JWT_SECRET="your_secret" \
  -e CLOUDINARY_CLOUD_NAME="your_cloud" \
  -e CLOUDINARY_API_KEY="your_key" \
  -e CLOUDINARY_API_SECRET="your_secret" \
  footimes-server
```

---

## 📡 API Overview

| Method | Endpoint                              | Description                     |
|--------|---------------------------------------|---------------------------------|
| POST   | `/api/admin/login`                    | Admin login, returns JWT        |
| GET    | `/api/news`                           | Get all news articles           |
| POST   | `/api/news`                           | Create a news article           |
| GET    | `/api/news/:id`                       | Get single news by ID           |
| PUT    | `/api/news/:id`                       | Update news by ID               |
| DELETE | `/api/news/:id`                       | Delete news by ID               |
| POST   | `/api/news/upload-thumbnail`          | Upload thumbnail to Cloudinary  |
| POST   | `/api/news/upload-inline-image`       | Upload inline editor image      |
| GET    | `/api/tournaments`                    | Get all tournaments             |
| POST   | `/api/tournaments`                    | Create a tournament             |
| GET    | `/api/tournaments/:id`                | Get single tournament           |
| PUT    | `/api/tournaments/:id`                | Update tournament               |
| DELETE | `/api/tournaments/:id`               | Delete tournament               |
| GET    | `/api/fixtures`                       | Get all fixtures                |
| POST   | `/api/fixtures`                       | Create a fixture                |
| GET    | `/api/fixtures/:id`                   | Get single fixture              |
| PUT    | `/api/fixtures/:id`                   | Update fixture                  |
| DELETE | `/api/fixtures/:id`                   | Delete fixture                  |
| PATCH  | `/api/fixtures/:id/start`             | Set match start time            |
| GET    | `/api/livescore`                      | Get all live matches            |
| GET    | `/api/livescore/all`                  | Get all matches (any status)    |
| POST   | `/api/livescore`                      | Create / upsert a live match    |
| GET    | `/api/livescore/fixture/:fixtureId`   | Get live data by fixture ID     |
| PATCH  | `/api/livescore/:fixtureId`           | Update score / match data       |
| PATCH  | `/api/livescore/:fixtureId/status`    | Update match status             |
| DELETE | `/api/livescore/:fixtureId`           | Delete live match data          |

> See **[ROUTES.md](./ROUTES.md)** for full request/response details for every endpoint.

---

## 🔌 Socket.IO Events

The server emits the following real-time events to all connected clients:

| Event              | Trigger                                   | Payload                        |
|--------------------|-------------------------------------------|--------------------------------|
| `matchStarted`     | Live match created via POST               | `{ fixtureId, startedAt }`    |
| `liveMatchUpdated` | Score or match data updated via PATCH     | Full `LiveMatch` document      |
| `matchResumed`     | Status set to `live`                      | `fixtureId`                   |
| `matchPaused`      | Status set to `paused`                    | `fixtureId`                   |
| `matchEnded`       | Status set to `ended`                     | `fixtureId`                   |
| `matchReset`       | Status set to `not_started` (reset)       | `fixtureId`                   |
| `liveMatchDeleted` | Live match deleted                        | `{ fixtureId }`               |

### Connecting from the Client

```js
import { io } from 'socket.io-client';

const socket = io('http://localhost:5000', { withCredentials: true });

socket.on('liveMatchUpdated', (match) => {
  console.log('Score update:', match);
});
```

---

## 🔑 Authentication

The API uses **JWT Bearer tokens** for admin-protected routes.

1. Call `POST /api/admin/login` with `{ username, password }`.
2. Store the returned token.
3. Pass it in the `Authorization` header:

```
Authorization: Bearer <your_jwt_token>
```

The `verifyToken` middleware in `middleware/auth.js` validates the token on protected routes.

---

## ☁️ Deployment (Dokploy / VPS)

1. Push the `server/` directory to your Git repository.
2. In **Dokploy**, create a new **Application** → Docker → link your repo.
3. Set the **Build Context** to `/server` (if using a mono-repo).
4. Add all environment variables in the Dokploy dashboard (see [Environment Variables](#-environment-variables)).
5. Set the exposed **Port** to `5000`.
6. Click **Deploy**.

> The included `Dockerfile` uses a multi-stage build with `node:20-alpine`, `tini` for clean signal handling, and runs as the non-root `node` user.

---

## 📜 Scripts

| Script        | Command            | Description                      |
|---------------|--------------------|----------------------------------|
| `npm start`   | `node server.js`   | Production start                 |
| `npm run dev` | `nodemon server.js`| Development with hot-reload      |

---

## 🌐 CORS

The API allows requests from:

- `https://footimes.com`
- `https://www.footimes.com`
- `http://localhost:5173` (local Vite dev server)

Update the `allowedOrigins` array in `server.js` to add more origins.
