import mongoose from 'mongoose';

const { Schema } = mongoose;

const TournamentSchema = new Schema({
  name: { type: String, required: true, unique: true },
  location: { type: String },
  status: { 
    type: String, 
    enum: ['past', 'current', 'upcoming'], 
    default: 'current' 
  },
});

const Tournament = mongoose.model('Tournament', TournamentSchema);

export default Tournament;