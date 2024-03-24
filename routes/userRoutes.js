const express = require('express')
// jsonwebtoken docs: https://github.com/auth0/node-jsonwebtoken
const crypto = require('crypto')
// Passport docs: http://www.passportjs.org/docs/
const passport = require('passport')
// bcrypt docs: https://github.com/kelektiv/node.bcrypt.js
const bcrypt = require('bcrypt')
const mongoose = require('mongoose');
const dotenv = require("dotenv");
dotenv.config();
// see above for explanation of "salting", 10 rounds is recommended
const bcryptSaltRounds = 10
const nodemailer = require('nodemailer');


// pull in error types and the logic to handle them and set status codes
// const errors = require('../lib/custom_errors')

// const BadParamsError = errors.BadParamsError
// const BadCredentialsError = errors.BadCredentialsError

const User = require('../models/userModel')

// passing this as a second argument to `router.<verb>` will make it
// so that a token MUST be passed for that route to be available
// it will also set `res.user`
const requireToken = passport.authenticate('bearer', { session: false })

const router = express.Router()
// SIGN UP
router.post('/register', async (req, res, next) => {
    const { credentials } = req.body
    const { email, password, password_confirmation } = credentials
  
    try {
      if (!email || !password || password !== password_confirmation) {
        res.json({msg: "registration failed"})
      }
  
      const hash = await bcrypt.hash(password, bcryptSaltRounds)

      const userObj = {
        email: email,
        hashedPassword: hash
      }
  
      let user = await User.create(userObj)
    
      const token = crypto.randomBytes(16).toString('hex')
      user.token = token 
      await user.save()
  
      // send email 
      // let transporter = nodemailer.createTransport({
      //   service: 'Gmail',
      //   auth: {
      //     user: process.env.EMAIL_ADDRESS, // your Gmail address
      //     pass: process.env.EMAIL_PASS,    // your Gmail password
      //   },
      // });
      
      // let mailOptions = {
      //   from: process.env.EMAIL_ADDRESS,
      //   to: email,
      //   subject: 'Welcome to PIX Marketplace',
      //   text: `Hey there, your account has been created`
      // };
  
      // transporter.sendMail(mailOptions, function (error, info) {
      //   if (error) {
      //     console.log(error);
      //   } else {
      //     console.log('Email sent: ' + info.response);
      //   }
      // });
  
      res.json({ user: user })
    } catch (err) {
      console.log(err)
    }
  });
    
  
  // SIGN IN
  router.post('/login', async (req, res, next) => {
    try {
      const pw = req.body.credentials.password  
      // find a user based on the email that was passed
      let user = await User.findOne({ email: req.body.credentials.email })
  
      if (!user) {
        res.status(200).json({ msg: 'email not found' })
      } else {
        let correctPassword = await bcrypt.compare(pw, user.hashedPassword)
        if (!correctPassword) {
          res.status(200).json({ msg: 'incorrect password' })
        } else {
          const token = crypto.randomBytes(16).toString('hex')
          user.token = token
          await user.save()
          res.status(201).json({ user: user })
        }
      }
    } catch(error) {
      console.log(error)
      res.status(500).json({ msg: 'something went wrong' })
    }
  })


// LOGOUT 
router.delete('/logout', requireToken, (req, res, next) => {
  // create a new random token for the user, invalidating the current one
  req.user.token = null
  // save the token and respond with 204
  req.user.save()
    .then(() => res.sendStatus(204))
    .catch(next)
})

module.exports = router