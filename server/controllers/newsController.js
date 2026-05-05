// controllers/news.controller.js
import News from "../models/News.js";

export const getAllNews = async (req, res) => {
  try {
    const news = await News.find()
      .populate("tournament", "name") // populate only name field
      .sort({ createdAt: -1 });

    res.json(news);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

export const getNewsById = async (req, res) => {
  try {
    const news = await News.findById(req.params.id)
      .populate("tournament", "name");

    if (!news) return res.status(404).json({ message: "Not found" });
    res.json(news);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

// PUT /api/news/:id
export const updateNews = async (req, res) => {
  try {
    const { title, description, tournamentId } = req.body;

    // Build update object
    const updateData = {
      title,
      description,
      tournament: tournamentId,
    };

    // If a new file is uploaded, update thumbnail
    if (req.file) {
      updateData.thumbnail = "/uploads/" + req.file.filename; // or adjust your path
    }

    // Find and update
    const updated = await News.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );

    if (!updated) return res.status(404).json({ message: "News not found" });

    res.json({ message: "News updated successfully", data: updated });
  } catch (err) {
    console.error("Update error:", err);
    res.status(500).json({ message: "Failed to update news" });
  }
};


