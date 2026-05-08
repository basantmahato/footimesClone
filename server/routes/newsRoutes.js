// routes/news.js
import express from 'express';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';
import News from '../models/News.js';
import Tournament from '../models/Tournament.js';
import Category from '../models/Category.js';
import cloudinary from '../config/cloudinary.js';
import { CloudinaryStorage } from 'multer-storage-cloudinary';

const router = express.Router();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ✅ Cloudinary Storage setup for INLINE content images (editor images)
const contentStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'news_content_images',
    allowed_formats: ['jpg', 'jpeg', 'png', 'gif'],
    transformation: [{ width: 1000, crop: 'limit' }]
  },
});
const uploadContent = multer({ storage: contentStorage });

// ✅ Cloudinary Storage setup for THUMBNAIL images
const thumbnailStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'news_thumbnails',
    allowed_formats: ['jpg', 'jpeg', 'png'],
    transformation: [{ width: 600, height: 400, crop: 'fill' }]
  },
});
const uploadThumbnail = multer({ storage: thumbnailStorage });

/**
 * ✅ POST /api/news/upload-thumbnail
 */
router.post('/upload-thumbnail', uploadThumbnail.single('file'), async (req, res) => {
  try {
    if (!req.file || !req.file.path) {
      return res.status(400).json({ message: "No thumbnail file provided for upload." });
    }
    res.status(200).json({ imageUrl: req.file.path });
  } catch (error) {
    console.error("Error uploading thumbnail image:", error);
    res.status(500).json({ message: 'Failed to upload thumbnail', details: error.message });
  }
});

/**
 * ✅ POST /api/news
 */
router.post('/', async (req, res) => {
  try {
    const { title, description, tournamentId, categoryId, thumbnail } = req.body;

    if (!title || !description || !thumbnail) {
      return res.status(400).json({ message: 'Title, description, and thumbnail are required.' });
    }

    if (tournamentId && !mongoose.Types.ObjectId.isValid(tournamentId)) {
      return res.status(400).json({ message: 'Invalid tournament ID format.' });
    }
    if (categoryId && !mongoose.Types.ObjectId.isValid(categoryId)) {
      return res.status(400).json({ message: 'Invalid category ID format.' });
    }

    const news = new News({
      title,
      description,
      tournament: tournamentId || null,
      category: categoryId || null,
      thumbnail
    });

    await news.save();
    res.status(201).json({ message: 'News created successfully', news });
  } catch (error) {
    console.error("News creation failed:", error);
    res.status(500).json({ message: 'Server error while creating news.', details: error.message });
  }
});

/**
 * ✅ POST /api/news/upload-inline-image
 */
router.post('/upload-inline-image', uploadContent.single('image'), async (req, res) => {
  try {
    if (!req.file || !req.file.path) {
      return res.status(400).json({ message: "No image file provided for inline upload." });
    }
    res.status(200).json({ imageUrl: req.file.path });
  } catch (error) {
    console.error("Error uploading inline image:", error);
    res.status(500).json({ message: 'Failed to upload inline image', details: error.message });
  }
});

/**
 * ✅ GET /api/news/tournaments
 */
router.get('/tournaments', async (req, res) => {
  try {
    const tournaments = await Tournament.find();
    res.json(tournaments);
  } catch (error) {
    console.error("Error fetching tournaments:", error);
    res.status(500).json({ error: 'Failed to load tournaments' });
  }
});

/**
 * ✅ GET /api/news/categories
 */
router.get('/categories', async (req, res) => {
  try {
    const categories = await Category.find();
    res.json(categories);
  } catch (error) {
    console.error("Error fetching categories:", error);
    res.status(500).json({ error: 'Failed to load categories' });
  }
});

/**
 * ✅ GET /api/news
 */
router.get('/', async (req, res) => {
  try {
    const news = await News.find().populate('tournament').populate('category').sort({ createdAt: -1 });
    res.json(news);
  } catch (error) {
    console.error("Failed to load news:", error);
    res.status(500).json({ error: "Failed to load news" });
  }
});

/**
 * ✅ GET /api/news/:id
 */
router.get('/:id', async (req, res) => {
  try {
    const news = await News.findById(req.params.id).populate('tournament').populate('category');
    if (!news) {
      return res.status(404).json({ message: "News not found" });
    }
    res.json(news);
  } catch (err) {
    console.error("Error fetching single news:", err);
    res.status(500).json({ error: "News not found or invalid ID" });
  }
});

/**
 * ✅ PUT /api/news/:id
 */
router.put('/:id', async (req, res) => {
  try {
    const { title, description, tournamentId, categoryId, thumbnail } = req.body;

    const existingNews = await News.findById(req.params.id);
    if (!existingNews) {
      return res.status(404).json({ error: 'News not found' });
    }

    if (!title || !description || !thumbnail) {
      return res.status(400).json({ message: 'Title, description, and thumbnail are required.' });
    }

    existingNews.title = title;
    existingNews.description = description;
    existingNews.tournament = tournamentId || null;
    existingNews.category = categoryId || null;

    if (typeof thumbnail === 'string' && thumbnail.trim() !== '') {
      existingNews.thumbnail = thumbnail.trim();
    }

    await existingNews.save();
    res.status(200).json({ message: 'News updated successfully', news: existingNews });
  } catch (error) {
    console.error("Failed to update news:", error);
    res.status(500).json({ error: 'Failed to update news', details: error.message });
  }
});

/**
 * ✅ DELETE /api/news/:id
 */
router.delete('/:id', async (req, res) => {
  try {
    const news = await News.findByIdAndDelete(req.params.id);
    if (!news) {
      return res.status(404).json({ message: 'News not found' });
    }
    res.status(200).json({ message: 'News deleted successfully' });
  } catch (error) {
    console.error("Error deleting news:", error);
    res.status(500).json({ error: 'Failed to delete news', details: error.message });
  }
});

export default router;