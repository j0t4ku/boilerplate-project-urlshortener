require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
let shortId = require('shortid');
let validURL = require('valid-url');

//Confugure Mongoose
let mongoose = require('mongoose');
mongoose.connect(process.env.MONGOOSE_URL, { useNewUrlParser: true, useUnifiedTopology: true });
//Confugure Schema and Models
const urlSchema = new mongoose.Schema({
  original_url: String,
  short_url: String
});
const URL = mongoose.model("URL", urlSchema);

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function (req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.get('/api/hello', function (req, res) {
  res.json({ greeting: 'hello API' });
});

//Challenge here
const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({
  extended: false
}));

// /api/post 
app.post('/api/shorturl', async (req, res) => {
  const url = req.body.url;
  const urlID = shortId.generate();
  if (!validURL.isWebUri(url)) {
    res.status(401).json({ error: 'invalid url' })
  } else {
    let isExist = await URL.findOne({
      original_url: url
    });
    if (isExist) {
      res.json({
        original_url: isExist.original_url,
        short_url: isExist.short_url
      });
    } else {
       isExist = new URL({
        original_url: url,
        short_url: urlID
      });
      isExist.save()
      res.json({
            original_url: url,
            short_url: urlID
          });
    }
  }

});




// api/shorturl/:shortUrl? 

app.get('/api/shorturl/:short_url', async (req, res) => {
  let url = await URL.findOne({
    short_url: req.params.short_url
  });
  console.log(url.original_url);
  if (url.short_url) {
    return res.redirect(url.original_url);
  } else {
    return res.status(401).json('No URL found')
  }
})

//end challenge



//app listener 
app.listen(port, function () {
  console.log(`Listening on port ${port}`);
});
