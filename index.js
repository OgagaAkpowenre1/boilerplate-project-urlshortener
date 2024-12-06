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
  res.sendFile(process.cwd() + "/public/index.html");
});

const shortURLs = [];

function createShortURL(url) {
  const shorturl = Math.floor(Math.random() * 1000);
  shortURLs.push({ original_url: url, shortURL: shorturl });
  return shorturl;
}

function findOriginalURL(urlArray, shorturl) {
  for (let i = 0; i < urlArray.length; i++) {
    if (urlArray[i].shortURL === shorturl) {
      return urlArray[i];
    }
  }
  return { error: "invalid url" };
}

// Logging middleware
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  console.log(shortURLs);
  next(); // Pass control to the next middleware or route handler
});

app.get("/api/shorturl/:urlNo", (req, res) => {
  let urlNo = req.params.urlNo;
  urlNo = Number(urlNo);
  const urlEntry = findOriginalURL(shortURLs, urlNo);
  if (urlEntry.error) {
    return res.status(404).json(urlEntry);
  }

  res.redirect(urlEntry.original_url);
});

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

  //check if url actually exists
  const urlObj = new URL(url);
  const hostname = urlObj.hostname;

  dns.lookup(hostname, (err, addresses, family) => {
    // if (err) {
    //   return res.status(400).json({ error: "invalid url" });
    // }
  });

  //Check if url already exists in url array
  const existingEntry = shortURLs.find((entry) => entry.original_url == url);
  if (existingEntry) {
    //debug
    console.log(shortURLs);
    return res.json({
      "original_url": existingEntry.original_url,
      "short_url": existingEntry.shortURL,
    });
  }

  //If no existing entry, generate new shorturl
  res.json({ "original_url": url, "short_url": createShortURL(url) });

  //debug
  console.log(shortURLs);
});

app.listen(port, function () {
  console.log(`Listening on port ${port}`);
});
