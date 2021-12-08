//Project Setup using express, bodyParser, cookie-parser
const express = require('express');
const bodyParser = require("body-parser");
const cookieParser = require('cookie-parser');
const app = express();
const PORT = 8080;

//Middleware
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());
app.set('view engine', 'ejs');

//Storage - name and value pairs of short and long URL
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

//Edit
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
  res.cookie('username', req.body.username);
  res.redirect('/urls');
})

//Logout
app.post('/logout', (req, res) => {
  res.clearCookie('username');
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

//Index
app.get('/urls', (req,res) => {
  const templateVars = { urls: urlDatabase, username: req.cookies['username'] };
  res.render('urls_index', templateVars);
});

//Add
app.get('/urls/new', (req,res) => {
  const tempateVars = { username: req.cookies['username']};
  res.render('urls_new', tempateVars);
});

//Visit LongURL
app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});

//Show
app.get("/urls/:shortURL", (req, res) => {
  const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL], username: req.cookies['username'] };
  res.render("urls_show", templateVars);
});

//Register
app.get("/register", (req, res) => {
  res.render('urls_register')
})

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});   