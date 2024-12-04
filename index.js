require("dotenv").config();
const express = require("express");
const dns = require("dns");
const cors = require("cors");
const app = express();

// Basic Configuration
const port = process.env.PORT || 3000;
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(cors());

app.use("/public", express.static(`${process.cwd()}/public`));

app.get("/", function (req, res) {
  res.sendFile(process.cwd() + "/views/index.html");
});

const shortURLs = [];

function createShortURL(url) {
  const shorturl = Math.floor(Math.random() * 1000);
  shortURLs.push({ original_url: url, shortURL: shorturl });
  return shorturl;
}

app.post("/api/shorturl", function (req, res) {
  //Regex for determining URL validity
  const urlRegex =
    /^(https?:\/\/)([\w\-\.]+)(\.[a-z]{2,})(:[0-9]{1,5})?(\/.*)?$/;

  //Given url from user
  const url = req.body.url;

  //Throw error if url is invalid
  if (!urlRegex.test(url)) {
    return res.json({ error: "invalid url" });
  } 

  try {
    //check if url actually exists
    const urlObj = new URL(url);
    const hostname = urlObj.hostname;

    dns.lookup(hostname, (err, addresses, family) => {
      if (err) {
        return res.status(400).json({ error: "invalid url" });
      }
    });

    //Check if url already exists in url array
    const existingEntry = shortURLs.find((entry) => entry.original_url == url);
    if (existingEntry) {
      //debug
      console.log(shortURLs);
      return res.json({
        original_url: existingEntry.original_url,
        shorturl: existingEntry.shortURL,
      });
    }

    //debug
    console.log(shortURLs);

    //If no existing entry, generate new shorturl
    res.json({ url: url, shorturl: createShortURL(url) });
  } catch (error) {
    return res.status(400).json({ error: 'invalid url' });
  }
});

app.listen(port, function () {
  console.log(`Listening on port ${port}`);
});
