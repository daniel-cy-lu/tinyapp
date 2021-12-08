//Project Setup using express, bodyParser
const express = require('express');
const bodyParser = require("body-parser");
const app = express();
const PORT = 8080;
//setup body-parser for POST request

app.use(bodyParser.urlencoded({extended: true}));
app.set('view engine', 'ejs');

//setup id object - keys are short URL and values are long URL
const urlDatabase = {
  'b2xVn2' : 'http://www.lighthouselabs.ca',
  '9sm5xK' : 'http//www.google.com'
};

//Helper Function
const generateRandomString = function() {
  let random = (Math.random() + 1).toString(36).substring(2,8);
  return random;
};

//Add
app.post("/urls", (req, res) => {
  
  const random = generateRandomString();
  urlDatabase[random] = req.body.longURL;
  
  res.redirect('http://localhost:8080/urls/' + random);
});

// Edit
app.post('/urls/:shortURL', (req, res) => {
  const editShortURLID = req.params.shortURL;
  const updatedLongURL = req.body.longURL;
  urlDatabase.editShortURLID = updatedLongURL;

  res.redirect('/urls');
})

//Delete
app.post('/urls/:shortURL/delete', (req, res) => {
  
  const deleteShortURLID = req.params.shortURL;
  delete urlDatabase[deleteShortURLID];

  res.redirect('/urls');
})

//Login
app.post('/login', (req, res) => {
  console.log(req.body);
  const cookie = req.body.username;

  res.redirect('/urls');
})

//Ruotes using app.get:
app.get('/', (req, res) => {
  res.send('Hello!');
});
app.get('/urls.json', (req, res) => {
  res.json(urlDatabase);
});
app.get('/hello', (req, res) => {
  res.send('<html><body>Hello <b>World</b><body></html>\n');
});

//Display urlDatabase in webpage, rendered
app.get('/urls', (req,res) => {
  const templateVars = { urls: urlDatabase };
  res.render('urls_index', templateVars);
});

//Add
app.get('/urls/new', (req,res) => {
  res.render('urls_new');
});

// a short/u/ brings user to long url via clicking on short url
app.get("/u/:shortURL", (req, res) => {
  console.log('urlDatabase',urlDatabase)
  console.log('req.paramas',req.params)
  const longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});

//display long url and short url pair
app.get("/urls/:shortURL", (req, res) => {
  const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL] };
  res.render("urls_show", templateVars);
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});   