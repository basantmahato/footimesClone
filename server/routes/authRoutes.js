import express from 'express';
import { login } from '../controllers/adminController.js'; // or whatever your controller file is named

const router = express.Router();

// Set the route: POST /api/auth/login
router.post('/login', login);

export default router;
