import express from 'express';
import Tournament from '../models/Tournament.js';

const router = express.Router();

// ➕ Add new tournament
router.post('/', async (req, res) => {
  try {
    const { name, location } = req.body;
    const existing = await Tournament.findOne({ name });
    if (existing) return res.status(400).json({ message: 'Tournament already exists' });

    const tournament = new Tournament({ name, location });
    await tournament.save();
    res.status(201).json(tournament);
  } catch (err) {
    res.status(500).json({ message: 'Failed to add tournament', error: err.message });
  }
});

// 🔄 Get all tournaments
router.get('/', async (req, res) => {
  try {
    const tournaments = await Tournament.find().sort({ name: 1 });
    res.json(tournaments);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch tournaments' });
  }
});

// 🗑️ Delete tournament
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await Tournament.findByIdAndDelete(id);
    res.json({ message: 'Tournament deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete' });
  }
});

// ✏️ Update tournament
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, location } = req.body;

    const updated = await Tournament.findByIdAndUpdate(
      id,
      { name, location },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ message: 'Tournament not found' });
    }

    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: 'Failed to update', error: err.message });
  }
});

// ⭐⭐⭐ ADD THIS ROUTE TO YOUR tournaments.js FILE ⭐⭐⭐
// 🔍 Get single tournament by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params; // Extract the ID from the URL parameter

    // Use Mongoose's findById method to find a tournament by its _id
    const tournament = await Tournament.findById(id);

    if (!tournament) {
      // If no tournament is found with that ID, return a 404 Not Found
      return res.status(404).json({ error: 'Tournament not found' });
    }

    // If found, return the tournament data
    res.json(tournament);
  } catch (err) {
    console.error('Error fetching single tournament by ID:', err);
    // Specifically handle cases where the ID format is invalid for MongoDB
    if (err.kind === 'ObjectId') {
      return res.status(400).json({ error: 'Invalid Tournament ID format.' });
    }
    res.status(500).json({ error: 'Internal server error.' });
  }
});

export default router;
