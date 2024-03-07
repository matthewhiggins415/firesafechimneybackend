const express = require('express');
const axios = require('axios');
const mongoose = require('mongoose');
const color = require('colors');
const dotenv = require("dotenv");
const cors = require('cors');
const bodyParser = require('body-parser');

const auth = require('./lib/auth.js');

// Routes
const userRoutes = require('./routes/userRoutes');
const contactRoutes = require('./routes/contactRoutes.js');
const blogRoutes = require('./routes/blogRoutes.js');
const serviceRoutes = require('./routes/serviceRoutes.js');
const emailRoutes = require('./routes/emailRoutes.js');

dotenv.config();

const app = express();

// connect to db
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(`${process.env.MONGO_URI}`);
    
    console.log(`MongoDB Connected: ${conn.connection.host}`.cyan.underline);
  } catch(error) {
    console.error(`Error: ${error.message}`.red.underline.bold);
    process.exit(1);
  }
}
  
connectDB();

app.use(cors({
  origin: true
}))
  
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// app.get('/', (request, response) => {
//   const ip = request.socket.remoteAddress;

//   const today = new Date().toISOString().slice(0, 10);
//   console.log(today)

//   return response.json({
//     ip
//   });
// })
  
// Ontraport Route  
app.post('/contactFormSubmit', async (req, res, next) => {
  const ontraportUrl = `${process.env.ONTRAPORT_URL}`;

  const headers = {
    'Content-Type': 'application/x-www-form-urlencoded',
    'Api-Key': `${process.env.ONTRAPORT_API_KEY}`,
    'Api-Appid': `${process.env.ONTRAPORT_API_ID}`
  };

  const urlSearchParams = new URLSearchParams(req.body);
  const formDataString = urlSearchParams.toString();
  const payload = formDataString

  try {
      const apiResponse = await axios.post(ontraportUrl, payload, {headers: headers})

      if (apiResponse.status === 200) {
        console.log(apiResponse)
        res.json({ status: 200 })
      }
  } catch (error) {
      res.json({ errMsg: "something went wrong" })
  }
})

// Routes
app.use(auth);
app.use(userRoutes);
app.use(contactRoutes);
app.use(blogRoutes);
app.use(serviceRoutes);
app.use(emailRoutes);

const port = process.env.PORT || 5000

app.listen(port, console.log(`server running in ${process.env.NODE_ENV} mode on port ${port}`.blue.bold))