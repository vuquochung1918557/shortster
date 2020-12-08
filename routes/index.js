const express = require('express');
const router = express.Router();
const validUrl = require('valid-url');
const shortid = require('shortid');
const config = require('config');

const Url = require('../models/Url');

// @route     GET /:shortcode
// @desc      Redirect to url
router.get('/:shortcode', async (req, res) => {
  try {
    const url = await Url.findOne({ shortcode: req.params.shortcode });

    if (url) {
      return res.redirect(url.longUrl);
    } else {
      return res.status(404).json('No url found');
    }
  } catch (err) {
    console.error(err);
    res.status(500).json('Server error');
  }
});

// @route     GET /:shortcode/stats
// @desc      stats
router.get('/:shortcode/stats', async (req, res) => {
  try {
      var result =  await Url.findOne({ shortcode: req.params.shortcode }).lean();
    if(result) {
      return res.end(JSON.stringify(result));
    } else {
      return res.status(404).json('No url found');
    }
  } catch (err) {
    console.error(err);
    res.status(500).json('Server error');
  }
});

// @route     POST 
// @desc      Create short URL
router.post('/', async (req, res) => {
  const { longUrl } = req.body;
  let shortcode  = req.body.shortcode;
  const baseUrl = config.get('baseUrl');
  if(shortcode === undefined) {
    shortcode = shortid.generate().substring(0,6);
  } else if(shortcode.length < 4) {
    return res.status(401).json('User submitted shortcodes must be at least 4 characters long');
  }

  if (!validUrl.isUri(baseUrl)) {
    return res.status(401).json('Invalid base url');
  }


  if (validUrl.isUri(longUrl)) {
    try {
      let url = await Url.findOne({ longUrl });

      if (url) {
        res.json(url);
      } else {
        const shortUrl = baseUrl + '/' + shortcode;
        url = new Url({
          longUrl,
          shortUrl,
          shortcode,
          date: new Date()
        });

        await url.save();

        res.json(url);
      }
    } catch (err) {
      console.error(err);
      res.status(500).json('Server error');
    }
  } else {
    res.status(401).json('Invalid long url');
  }
});

module.exports = router;
