
import mongoose from 'mongoose';

const { Schema } = mongoose;

const NewsSchema = new Schema({
  thumbnail: String,
  title: String,
  description: String,
  tournament: { type: mongoose.Schema.Types.ObjectId, ref: 'Tournament' },
  createdAt: { type: Date, default: Date.now }
});

const News = mongoose.model('News', NewsSchema);

export default News;
