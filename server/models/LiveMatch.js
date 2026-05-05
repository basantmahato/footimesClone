import mongoose from 'mongoose';

const playerSchema = new mongoose.Schema({
  name: { type: String, required: true },
  number: Number,
  position: String,
});

const liveMatchSchema = new mongoose.Schema({
  fixtureId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Fixture',
    required: true,
    unique: true,
  },
  tournamentName: String,

  teamA: String,
  teamB: String,

  scoreA: { type: Number, default: 0 },
  scoreB: { type: Number, default: 0 },

  playersA: [playerSchema],
  playersB: [playerSchema],

  subsA: [playerSchema],
  subsB: [playerSchema],

  resultA: {
    type: String,
    enum: ['win', 'lose', 'draw', ''],
    default: '',
  },
  resultB: {
    type: String,
    enum: ['win', 'lose', 'draw', ''],
    default: '',
  },

  startedAt: {
    type: Date,
    default: Date.now,
  },

  status: {
    type: String,
    enum: ['live', 'ended', 'paused', 'not_started'],
    default: 'not_started',
  },
}, { timestamps: true });

export default mongoose.model('LiveMatch', liveMatchSchema);
