import express from 'express';
import Notification from '../models/Notification.js';

const router = express.Router();

// ➕ Create notification
router.post('/', async (req, res) => {
  try {
    const { message, type } = req.body;
    if (!message) return res.status(400).json({ message: 'Message is required' });

    const notification = new Notification({ message, type });
    await notification.save();

    // If you have Socket.io integrated, you can emit here
    if (req.io) {
      req.io.emit('new-notification', notification);
    }

    res.status(201).json(notification);
  } catch (err) {
    res.status(500).json({ message: 'Failed to create notification', error: err.message });
  }
});

// 🔄 Get all notifications (Admin)
router.get('/admin', async (req, res) => {
  try {
    const notifications = await Notification.find().sort({ createdAt: -1 });
    res.json(notifications);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch notifications' });
  }
});

// 🌍 Get active notifications (Public)
router.get('/active', async (req, res) => {
  try {
    const notifications = await Notification.find({ isActive: true }).sort({ createdAt: -1 });
    res.json(notifications);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch active notifications' });
  }
});

// ✏️ Update notification (Toggle isActive or change message)
router.patch('/:id', async (req, res) => {
  try {
    const updated = await Notification.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updated) return res.status(404).json({ message: 'Notification not found' });
    
    if (req.io) {
      req.io.emit('update-notification', updated);
    }
    
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: 'Failed to update' });
  }
});

// 🗑️ Delete notification
router.delete('/:id', async (req, res) => {
  try {
    await Notification.findByIdAndDelete(req.params.id);
    if (req.io) {
      req.io.emit('delete-notification', req.params.id);
    }
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete' });
  }
});

export default router;
