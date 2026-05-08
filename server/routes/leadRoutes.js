import express from 'express';
import Lead from '../models/Lead.js';

const router = express.Router();

// ✅ POST /api/leads
// Public route to submit a contact form
router.post('/', async (req, res) => {
  try {
    const { name, email, message } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({ message: 'All fields are required.' });
    }

    const newLead = new Lead({ name, email, message });
    await newLead.save();

    res.status(201).json({ message: 'Message sent successfully!', lead: newLead });
  } catch (error) {
    console.error('Error creating lead:', error);
    res.status(500).json({ message: 'Failed to send message. Please try again later.' });
  }
});

// ✅ GET /api/leads
// Admin route to fetch all leads (should be protected in production)
router.get('/', async (req, res) => {
  try {
    const leads = await Lead.find().sort({ createdAt: -1 });
    res.status(200).json(leads);
  } catch (error) {
    console.error('Error fetching leads:', error);
    res.status(500).json({ message: 'Failed to fetch leads.' });
  }
});

// ✅ PATCH /api/leads/:id/status
// Admin route to update lead status
router.patch('/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    const lead = await Lead.findByIdAndUpdate(req.params.id, { status }, { new: true });
    
    if (!lead) {
      return res.status(404).json({ message: 'Lead not found.' });
    }

    res.status(200).json({ message: 'Status updated', lead });
  } catch (error) {
    console.error('Error updating lead status:', error);
    res.status(500).json({ message: 'Failed to update status.' });
  }
});

// ✅ DELETE /api/leads/:id
// Admin route to delete a lead
router.delete('/:id', async (req, res) => {
  try {
    const lead = await Lead.findByIdAndDelete(req.params.id);
    if (!lead) {
      return res.status(404).json({ message: 'Lead not found.' });
    }
    res.status(200).json({ message: 'Lead deleted successfully.' });
  } catch (error) {
    console.error('Error deleting lead:', error);
    res.status(500).json({ message: 'Failed to delete lead.' });
  }
});

export default router;
