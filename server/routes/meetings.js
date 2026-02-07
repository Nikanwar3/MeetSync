const express = require('express');
const { v4: uuidv4 } = require('uuid');
const Meeting = require('../models/Meeting');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// Create a new meeting
router.post('/create', authMiddleware, async (req, res) => {
  try {
    const { title, description, passcode, scheduledFor } = req.body;
    
    const meetingId = uuidv4().slice(0, 10);
    
    const meeting = new Meeting({
      meetingId,
      hostId: req.userId,
      title: title || 'Quick Meeting',
      description: description || '',
      passcode: passcode || null,
      scheduledFor: scheduledFor || null
    });

    await meeting.save();

    res.status(201).json({
      meetingId: meeting.meetingId,
      title: meeting.title,
      description: meeting.description,
      hasPasscode: !!meeting.passcode
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create meeting' });
  }
});

// Get meeting details
router.get('/:meetingId', async (req, res) => {
  try {
    const meeting = await Meeting.findOne({ 
      meetingId: req.params.meetingId 
    }).populate('hostId', 'username email');

    if (!meeting) {
      return res.status(404).json({ error: 'Meeting not found' });
    }

    res.json({
      meetingId: meeting.meetingId,
      title: meeting.title,
      description: meeting.description,
      hasPasscode: !!meeting.passcode,
      host: meeting.hostId ? {
        username: meeting.hostId.username
      } : null,
      isActive: meeting.isActive,
      scheduledFor: meeting.scheduledFor
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch meeting details' });
  }
});

// Validate meeting passcode
router.post('/:meetingId/validate', async (req, res) => {
  try {
    const { passcode } = req.body;
    const meeting = await Meeting.findOne({ meetingId: req.params.meetingId });

    if (!meeting) {
      return res.status(404).json({ error: 'Meeting not found' });
    }

    if (meeting.passcode && meeting.passcode !== passcode) {
      return res.status(401).json({ error: 'Invalid passcode' });
    }

    res.json({ valid: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to validate passcode' });
  }
});

// Get user's meetings
router.get('/user/meetings', authMiddleware, async (req, res) => {
  try {
    const meetings = await Meeting.find({ hostId: req.userId })
      .sort({ createdAt: -1 })
      .limit(20);

    res.json(meetings);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch meetings' });
  }
});

module.exports = router;
