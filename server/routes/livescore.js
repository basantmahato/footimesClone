import express from 'express';
import LiveMatch from '../models/LiveMatch.js';

const router = express.Router();

// GET /api/livescore/fixture/:fixtureId
router.get('/fixture/:fixtureId', async (req, res) => {
  try {
    const live = await LiveMatch.findOne({ fixtureId: req.params.fixtureId });
    if (!live) return res.status(404).json({ message: 'Live score not found' });
    res.json(live);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// PATCH: Update match status (start, end, reset)
// PATCH: Update match status (start, end, reset, pause, resume)
router.patch('/:fixtureId/status', async (req, res) => {
  try {
    const { fixtureId } = req.params;
    const { status, startedAt } = req.body;

    const updateFields = {};
    if (status) updateFields.status = status;
    if (startedAt) updateFields.startedAt = startedAt;
    if (status === 'reset') {
      updateFields.status = 'not_started';
      updateFields.startedAt = null;
    }

    const updated = await LiveMatch.findOneAndUpdate(
      { fixtureId },
      updateFields,
      { new: true }
    );

    if (!updated) return res.status(404).json({ error: 'Match not found' });

    const io = req.app.get('io');

    // Emit status-based events
    if (status === 'live') io?.emit('matchResumed', fixtureId);
    if (status === 'paused') io?.emit('matchPaused', fixtureId);
    if (status === 'ended') io?.emit('matchEnded', fixtureId);
    if (status === 'not_started') io?.emit('matchReset', fixtureId);

    res.json({ message: 'Status updated', match: updated });
  } catch (err) {
    console.error('PATCH /livescore/:fixtureId/status error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});


// POST: Create or upsert a live match
router.post('/', async (req, res) => {
  try {
    const {
  fixtureId, teamA, teamB, tournamentName,
  scoreA = 0, scoreB = 0, startedAt,
  resultA, resultB
} = req.body;

    if (!fixtureId) {
      return res.status(400).json({ error: 'fixtureId is required' });
    }

    const match = await LiveMatch.findOneAndUpdate(
      { fixtureId },
      {
  fixtureId,
  teamA,
  teamB,
  tournamentName,
  scoreA,
  scoreB,
  resultA,
  resultB,
  startedAt,
  status: 'not_started',
},
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    req.app.get('io')?.emit('matchStarted', { fixtureId, startedAt });
    res.status(200).json({ message: 'Live match saved', match });
  } catch (err) {
    console.error('POST /livescore error:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// PATCH: Update match (score/players if needed)
router.patch('/:fixtureId', async (req, res) => {
  try {
    const { fixtureId } = req.params;
    const updatedData = req.body;

    const updatedMatch = await LiveMatch.findOneAndUpdate(
      { fixtureId },
      updatedData,
      { new: true }
    );

    if (!updatedMatch) {
      return res.status(404).json({ error: 'Live match not found to update' });
    }

    req.app.get('io')?.emit('liveMatchUpdated', updatedMatch);
    res.json({ message: 'Live match updated', match: updatedMatch });
  } catch (err) {
    console.error('PATCH /livescore/:fixtureId error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET: Get all live matches or by fixtureId
router.get('/', async (req, res) => {
  try {
    const { fixtureId } = req.query;

    if (fixtureId) {
      const match = await LiveMatch.findOne({ fixtureId });
      if (!match) return res.status(404).json({ error: 'Match not found' });
      return res.json(match);
    }

    const matches = await LiveMatch.find({ status: 'live' }).sort({ startedAt: -1 });
    res.json(matches);
  } catch (err) {
    console.error('GET /livescore error:', err);
    res.status(500).json({ error: 'Failed to fetch matches' });
  }
});

// GET: Get all (live + ended + not_started)
router.get('/all', async (req, res) => {
  try {
    const allMatches = await LiveMatch.find().sort({ startedAt: -1 });
    res.json(allMatches);
  } catch (err) {
    console.error('GET /livescore/all error:', err);
    res.status(500).json({ error: 'Failed to fetch all matches' });
  }
});

router.delete('/:fixtureId', async (req, res) => {
    try {
        const { fixtureId } = req.params;

        // Use deleteOne to remove the document based on fixtureId
        const result = await LiveMatch.deleteOne({ fixtureId });

        if (result.deletedCount === 0) {
            return res.status(404).json({ message: 'Live match data not found for deletion.' });
        }

        // Emit a socket event to inform all connected clients about the deletion
        const io = req.app.get('io');
        if (io) {
            io.emit('liveMatchDeleted', { fixtureId }); // Send the fixtureId of the deleted match
        }

        res.status(200).json({ message: 'Live match data deleted successfully.' });
    } catch (err) {
        console.error('DELETE /livescore/:fixtureId error:', err);
        res.status(500).json({ message: 'Server error during deletion.', error: err.message });
    }
});




// GET /api/livescore/standings/:tournamentName
router.get('/standings/:tournamentName', async (req, res) => {
  try {
    const { tournamentName } = req.params;
    const endedMatches = await LiveMatch.find({
      tournamentName: tournamentName,
      status: 'ended'
    });

    const standingsMap = {};

    endedMatches.forEach(match => {
      const { teamA, teamB, scoreA, scoreB, resultA, resultB } = match;

      if (!standingsMap[teamA]) {
        standingsMap[teamA] = { team: teamA, mp: 0, w: 0, d: 0, l: 0, gf: 0, ga: 0, gd: 0, pts: 0 };
      }
      if (!standingsMap[teamB]) {
        standingsMap[teamB] = { team: teamB, mp: 0, w: 0, d: 0, l: 0, gf: 0, ga: 0, gd: 0, pts: 0 };
      }

      const teamAStats = standingsMap[teamA];
      const teamBStats = standingsMap[teamB];

      teamAStats.mp += 1;
      teamBStats.mp += 1;
      teamAStats.gf += scoreA;
      teamAStats.ga += scoreB;
      teamBStats.gf += scoreB;
      teamBStats.ga += scoreA;
      teamAStats.gd = teamAStats.gf - teamAStats.ga;
      teamBStats.gd = teamBStats.gf - teamBStats.ga;

      if (resultA === 'win') {
        teamAStats.w += 1;
        teamAStats.pts += 3;
        teamBStats.l += 1;
      } else if (resultB === 'win') {
        teamBStats.w += 1;
        teamBStats.pts += 3;
        teamAStats.l += 1;
      } else if (resultA === 'draw' || resultB === 'draw') {
        teamAStats.d += 1;
        teamAStats.pts += 1;
        teamBStats.d += 1;
        teamBStats.pts += 1;
      }
    });

    const standings = Object.values(standingsMap).sort((a, b) => {
      if (b.pts !== a.pts) return b.pts - a.pts;
      if (b.gd !== a.gd) return b.gd - a.gd;
      return b.gf - a.gf;
    });

    res.json(standings);
  } catch (err) {
    console.error('GET /livescore/standings error:', err);
    res.status(500).json({ error: 'Failed to calculate standings' });
  }
});

export default router;
