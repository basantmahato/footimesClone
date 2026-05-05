// models/Fixture.js
import mongoose from 'mongoose';

const FixtureSchema = new mongoose.Schema({
  teamA: String,
  teamB: String,
  matchDate: Date,
  venue: String,
  tournament: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tournament',
    required: true
  },
  matchRound: {
    type: String,
    required: true
  }
});

const Fixture = mongoose.model('Fixture', FixtureSchema);
export default Fixture;
