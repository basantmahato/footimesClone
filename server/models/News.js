
import mongoose from 'mongoose';

const { Schema } = mongoose;

const NewsSchema = new Schema({
  thumbnail: String,
   title: { type: String, required: true },
   slug: { type: String, unique: true, required: true, index: true },
   description: String,
   tournament: { type: mongoose.Schema.Types.ObjectId, ref: 'Tournament', required: false },
   category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: false },
  createdAt: { type: Date, default: Date.now }
});

const News = mongoose.model('News', NewsSchema);

export default News;
