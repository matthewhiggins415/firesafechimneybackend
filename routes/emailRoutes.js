const express = require('express');
const passport = require('passport');
const dotenv = require("dotenv");
dotenv.config();
const requireToken = passport.authenticate('bearer', { session: false })
const axios = require('axios');

const router = express.Router();

// get all emails
router.get('/emails', requireToken, async (req, res, next) => {
  try {
    const response = await axios.get(`https://api.us.nylas.com/v3/grants/${process.env.NYLAS_TEST_GRANT_ID}/messages?limit=15`, {
      headers: {
        'Accept': 'application/json',
        'Authorization': `Bearer ${process.env.NYLAS_TEST_API_KEY}`,
        'Content-Type': 'application/json'
      }
    })

    res.json({ emails: response.data.data })

  } catch(error) {
    console.log(error)
  }
})

// get a single email

// receive an email

// receive all emails

// receive threads 

// search inbox for emails

// search inbox for threads

// send email message 

// update email unread status 

// update email with file attachment 

// delete draft, files, folders

module.exports = router;