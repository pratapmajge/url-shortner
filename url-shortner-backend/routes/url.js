import express from 'express';
import Url from '../models/url.js';
import { customAlphabet } from 'nanoid';

const router = express.Router();
const nanoid = customAlphabet('0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ', 6);

// POST /api/shorten - Create short URL
router.post('/api/shorten', async (req, res) => {
  const { longUrl } = req.body;

  if (!longUrl) {
    return res.status(400).json({ error: 'longUrl is required' });
  }

  try {
    // Validate URL format
    new URL(longUrl);
  } catch {
    return res.status(400).json({ error: 'Invalid URL format' });
  }

  try {
    // Check if already exists
    let existing = await Url.findOne({ originalUrl: longUrl });
    if (existing) {
      return res.json({ shortUrl: `${process.env.BASE_URL}/${existing.shortCode}` });
    }

    // Generate unique short code
    let code = nanoid();
    while (await Url.findOne({ shortCode: code })) {
      code = nanoid();
    }

    const url = await Url.create({ originalUrl: longUrl, shortCode: code });
    res.json({ shortUrl: `${process.env.BASE_URL}/${url.shortCode}` });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /:shortcode - Redirect
router.get('/:shortcode', async (req, res) => {
  try {
    const url = await Url.findOne({ shortCode: req.params.shortcode });

    if (!url) return res.status(404).send('Not found');

    url.visits += 1;
    await url.save();

    res.redirect(url.originalUrl);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

export default router;
