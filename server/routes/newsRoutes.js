// routes/news.js
import express from 'express';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';
import News from '../models/News.js';
import Tournament from '../models/Tournament.js';
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

// ✅ Cloudinary Storage setup for THUMBNAIL images (NEW)
const thumbnailStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'news_thumbnails', // Specific folder for thumbnails
    allowed_formats: ['jpg', 'jpeg', 'png'], // Common formats for thumbnails
    transformation: [{ width: 600, height: 400, crop: 'fill' }] // Example transformation for thumbnails
  },
});
const uploadThumbnail = multer({ storage: thumbnailStorage });


/**
 * ✅ POST /api/news/upload-thumbnail
 * New endpoint to upload a single thumbnail image to Cloudinary
 * Expects a file field named 'file' from the frontend
 */
router.post('/upload-thumbnail', uploadThumbnail.single('file'), async (req, res) => {
  try {
    if (!req.file || !req.file.path) {
      return res.status(400).json({ message: "No thumbnail file provided for upload." });
    }
    // `req.file.path` contains the Cloudinary URL of the uploaded image
    res.status(200).json({ imageUrl: req.file.path });
  } catch (error) {
    console.error("Error uploading thumbnail image:", error);
    res.status(500).json({ message: 'Failed to upload thumbnail', details: error.message });
  }
});


/**
 * ✅ POST /api/news
 * Create new news item from form with thumbnail URL from Cloudinary
 * Expects thumbnail to be a URL in the request body
 */
router.post('/', async (req, res) => {
  try {
    const { title, description, tournamentId, thumbnail } = req.body;

    // ✅ Validate required fields
    if (!title || !description || !tournamentId || !thumbnail) {
      return res.status(400).json({ message: 'All fields (title, description, tournamentId, thumbnail URL) are required.' });
    }

    // ✅ Validate tournamentId format
    if (!mongoose.Types.ObjectId.isValid(tournamentId)) {
      return res.status(400).json({ message: 'Invalid tournament ID format.' });
    }

    const news = new News({
      title,
      description,
      tournament: tournamentId,
      thumbnail // This MUST be the Cloudinary URL obtained from /upload-thumbnail
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
 * Upload single editor image to Cloudinary (uses contentStorage)
 * Expects a file field named 'image' from the frontend
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
 * Load all tournament options
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
 * ✅ GET /api/news
 * Get all news
 */
router.get('/', async (req, res) => {
  try {
    const news = await News.find().populate('tournament').sort({ createdAt: -1 });
    res.json(news);
  } catch (error) {
    console.error("Failed to load news:", error);
    res.status(500).json({ error: "Failed to load news" });
  }
});

/**
 * ✅ GET /api/news/:id
 * Get single news by ID
 */
router.get('/:id', async (req, res) => {
  try {
    const news = await News.findById(req.params.id).populate('tournament');
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
 * Update news item
 * Expects thumbnail to be a URL in the request body (if updating thumbnail)
 */
router.put('/:id', async (req, res) => {
  try {
    const { title, description, tournamentId, thumbnail } = req.body;

    const existingNews = await News.findById(req.params.id);
    if (!existingNews) {
      return res.status(404).json({ error: 'News not found' });
    }

    // Basic validation for required fields on update
    if (!title || !description || !tournamentId || !thumbnail) {
      return res.status(400).json({ message: 'All fields (title, description, tournamentId, thumbnail URL) are required for update.' });
    }

    existingNews.title = title;
    existingNews.description = description;
    existingNews.tournament = tournamentId;

    // Only update thumbnail if a valid string (URL) is provided
    if (typeof thumbnail === 'string' && thumbnail.trim() !== '') {
      existingNews.thumbnail = thumbnail.trim();
    } else {
        return res.status(400).json({ message: 'Thumbnail URL is required and must be a valid string.' });
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
 * Delete news item
 */
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`Attempting to delete news with ID: ${id}`);

    const news = await News.findByIdAndDelete(id);

    if (!news) {
      return res.status(404).json({ message: 'News not found' });
    }

    console.log(`News with ID ${id} deleted.`);
    res.status(200).json({ message: 'News deleted successfully' });

  } catch (error) {
    console.error("Error deleting news:", error);
    res.status(500).json({ error: 'Failed to delete news', details: error.message });
  }
});

export default router;