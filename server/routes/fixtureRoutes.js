import express from 'express';
import Fixture from '../models/Fixture.js';

const router = express.Router();

// POST /api/fixtures
router.post('/', async (req, res) => {
  try {
    const { teamA, teamB, matchDate, venue, tournament, matchRound } = req.body;

    if (!matchRound) {
      return res.status(400).json({ error: 'matchRound is required' });
    }

    console.log('📩 New fixture POST body:', req.body); // 🧪 Log everything

    const fixture = new Fixture({
      teamA,
      teamB,
      matchDate,
      venue,
      tournament,
      matchRound,
    });

    await fixture.save();
    console.log('✅ Saved Fixture:', fixture);
    res.status(201).json(fixture);
  } catch (err) {
    console.error('❌ Error saving fixture:', err);
    res.status(500).json({ message: 'Failed to add fixture', error: err.message });
  }
});



// PATCH /api/fixtures/:id/start
router.patch('/:id/start', async (req, res) => {
  const { startedAt } = req.body;
  try {
    const fixture = await Fixture.findByIdAndUpdate(
      req.params.id,
      { startedAt },
      { new: true }
    );
    res.json(fixture);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update match start time' });
  }
});


// 🔄 Get all fixtures (optionally filter by tournament)
router.get('/', async (req, res) => {
  try {
    const { tournament } = req.query;
    const query = tournament ? { tournament } : {};
    const fixtures = await Fixture.find(query).populate('tournament');
    res.json(fixtures);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch fixtures' });
  }
});

// ✏️ Update a fixture
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updated = await Fixture.findByIdAndUpdate(id, req.body, { new: true });
    if (!updated) return res.status(404).json({ message: 'Fixture not found' });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: 'Failed to update fixture', error: err.message });
  }
});

// ❌ Delete a fixture
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Fixture.findByIdAndDelete(id);
    if (!deleted) return res.status(404).json({ message: 'Fixture not found' });
    res.json({ message: 'Fixture deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete fixture', error: err.message });
  }
});

// ✅ Correct route to match /api/fixtures/:id
router.get('/:id', async (req, res) => {
  try {
    const fixture = await Fixture.findById(req.params.id);
    if (!fixture) return res.status(404).json({ message: 'Fixture not found' });
    res.json(fixture);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});



export default router;
