import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import http from 'http';
import { Server } from 'socket.io';

/* ------------ Route imports ------------ */
import authRoutes from './routes/authRoutes.js';
import newsRoutes from './routes/newsRoutes.js';
import tournamentRoutes from './routes/tournamentRoutes.js';
import fixtureRoutes from './routes/fixtureRoutes.js';
import livescoreRoutes from './routes/livescore.js';
import leadRoutes from './routes/leadRoutes.js';
import categoryRoutes from './routes/categoryRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';

/* ------------ Config ------------ */
dotenv.config();

/* ------------ App & Server FIRST ------------ */
const app = express();
const server = http.createServer(app);

/* ------------ Allowed Origins ------------ */
const allowedOrigins = [
  'https://footimes.com',
  'https://www.footimes.com',
  'http://localhost:5173',
  'http://localhost:3000'
];

/* ------------ Socket.IO AFTER server ------------ */
const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ['GET', 'POST'],
    credentials: true
  }
});

/* ------------ Express CORS ------------ */
app.use(
  cors({
    origin(origin, cb) {
      if (!origin || allowedOrigins.includes(origin)) return cb(null, true);
      return cb(new Error(`CORS blocked for origin: ${origin}`));
    },
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
  })
);

/* ------------ Middleware ------------ */
app.use(express.json());

app.use((req, res, next) => {
  req.io = io;
  next();
});

/* ------------ Routes ------------ */
app.use('/api/admin', authRoutes);
app.use('/api/news', newsRoutes);
app.use('/api/livescore', livescoreRoutes);
app.use('/api/tournaments', tournamentRoutes);
app.use('/api/fixtures', fixtureRoutes);
app.use('/api/leads', leadRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/notifications', notificationRoutes);

/* ------------ Socket Events ------------ */
io.on('connection', socket => {
  console.log(`🟢 Socket connected: ${socket.id}`);

  socket.on('disconnect', () => {
    console.log(`🔴 Socket disconnected: ${socket.id}`);
  });
});

/* ------------ DB + Server Start ------------ */
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    const PORT = process.env.PORT || 5000;
    server.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  })
  .catch(err => {
    console.error('❌ MongoDB connection error:', err);
    process.exit(1);
  });
