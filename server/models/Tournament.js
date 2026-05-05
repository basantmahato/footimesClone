import mongoose from 'mongoose';

const { Schema } = mongoose;

const TournamentSchema = new Schema({
  name: { type: String, required: true, unique: true },
  location: { type: String },
});

const Tournament = mongoose.model('Tournament', TournamentSchema);

export default Tournament;