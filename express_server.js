//
//Setup
//
const express = require('express');
const bodyParser = require("body-parser");
const cookieSession = require('cookie-session');
const bcrypt = require('bcryptjs');
const { generateRandomString, getUserByEmail, urlsForUser, shortURLBelongUser, emailAlreadyExist } = require('./helpers');
const app = express();
const PORT = 8080;

//
//Middleware
//
app.use(bodyParser.urlencoded({extended: true}));
app.set('view engine', 'ejs');
app.use(cookieSession({
  name: 'session',
  keys: ['1ws3rf']
}));

//
//Storage - name and value pairs of short and long URL
//
const urlDatabase = {
  'b2xVn2' : { longURL: 'http://www.lighthouselabs.ca', userID: "aJ481W"},
  '9sm5xK' : { longURL: 'http//www.google.com', userID: 'aJ1122'}
};

const users = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk"
  }
};

//
//POST
//

//Add
app.post("/urls", (req, res) => {
  
  const random = generateRandomString();
  urlDatabase[random] = { longURL: req.body.longURL, userID: req.session.user_id };
  
  res.redirect('http://localhost:8080/urls/' + random);
});

//Edit
app.post('/urls/:shortURL', (req, res) => {
  let newDatabase = urlsForUser(req.session.user_id, urlDatabase);
  if (!newDatabase[req.params.shortURL]) {
    res.send('You can only edit your own URL. Error: 400');
  }
  
  const shortURLID = req.params.shortURL;
  const updatedLongURL = req.body.longURL;
  urlDatabase[shortURLID].longURL = updatedLongURL;

  res.redirect('/urls');
});

//Delete
app.post('/urls/:shortURL/delete', (req, res) => {
  let newDatabase = urlsForUser(req.session.user_id, urlDatabase);
  if (!newDatabase[req.params.shortURL]) {
    res.send('You can only delete your own URL. Error: 400');
  }
  const deleteShortURLID = req.params.shortURL;
  delete urlDatabase[deleteShortURLID];

  res.redirect('/urls');
});

//Login
app.post('/login', (req, res) => {
  const userEmail = req.body.email;
  const userPassword = req.body.password;
  const id = getUserByEmail(userEmail, users);
  
  if (!emailAlreadyExist(userEmail, users)) {
    res.send('Username is not found, please register first. Error:403');
  }
  if (emailAlreadyExist(userEmail, users) && bcrypt.compareSync(userPassword, users[id].password)) {
    req.session.user_id = id;
    res.redirect('/urls');
  } else {
    res.send('User Password is incorrect. Error: 403');
  }
});

//Logout
app.post('/logout', (req, res) => {
  req.session.user_id = null;
  res.redirect('/urls');
});

//Register
app.post('/register', (req, res) => {
  const id = generateRandomString();
  const userEmail = req.body.email;
  const userPassword = req.body.password;
  
  if (!userEmail) {
    res.send("Empty email: Error 400");
  }
  if (!userPassword) {
    res.send("Empty password: Error 400");
  }
  
  //find if email exist in users storage
  if (emailAlreadyExist(userEmail, users) === true) {
    res.send('Email already taken: Error 400');
  }
  
  const hashedPassword = bcrypt.hashSync(userPassword, 10);
  users[id] = {};
  users[id]['id'] = id;
  users[id]['email'] = userEmail;
  users[id]['password'] = hashedPassword;
  req.session.user_id = id;
  res.redirect('/urls');
});
 
//
//GET
//

//Test
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
  if (!users[req.session.user_id]) {
    const tempateVars = { id: null, error: 'Please log in first. Error: 400'};
    res.render('urls_login', tempateVars);
  }
  const userID = req.session.user_id;
  let newDatabase = urlsForUser(req.session.user_id, urlDatabase);
  const templateVars = { urls: newDatabase, id: users[userID].email };
  res.render('urls_index', templateVars);
});

//Add
app.get('/urls/new', (req,res) => {
  if (!users[req.session.user_id]) {
    const tempateVars = { id: null, error: 'Please log in first. Error: 400'};
    res.render('urls_login', tempateVars);
  }
  const userID = req.session['user_id'];
  if (users[userID]) {
    const tempateVars = { id: users[userID].email};
    res.render('urls_new', tempateVars);
  } else {
    const tempateVars = { id: null};
    res.render('urls_new', tempateVars);
  }
  
});

//Visit LongURL
app.get("/u/:shortURL", (req, res) => {
  if (!urlDatabase[req.params.shortURL]) {
    res.send('The short URL ID does not exist. Error: 400');
  }
  
  const longURL = urlDatabase[req.params.shortURL].longURL;
  res.redirect(longURL);
});

//Register
app.get("/register", (req, res) => {
  const userID = req.session['user_id'];
  if (users[userID]) {
    const tempateVars = { id: users[userID].email};
    res.render('urls_register', tempateVars);
  } else {
    const tempateVars = { id: null};
    res.render('urls_register', tempateVars);
  }
});

//Login
app.get("/login", (req, res) => {
  const userID = req.session['user_id'];
  if (users[userID]) {
    const tempateVars = { id: users[userID].email, error: null};
    res.render('urls_login', tempateVars);
  } else {
    const tempateVars = { id: null, error: null};
    res.render('urls_login', tempateVars);
  }
});

//Show
app.get("/urls/:shortURL", (req, res) => {
  if (!users[req.session.user_id]) {
    const tempateVars = { id: null, error: 'Please log in first. Error: 400'};
    res.render('urls_login', tempateVars);
  }
  
  if (!urlDatabase[req.params.shortURL]) {
    res.send('The short URL does not exist, please add a new one. Erorr: 400');
  }

  if (!shortURLBelongUser(req.params.shortURL, req.session.user_id, urlDatabase)) {
    res.send('This short URL is not yours. Error: 400');
  }
  const userID = req.session['user_id'];
  if (users[userID]) {
    const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL].longURL, id: users[userID].email };
    res.render("urls_show", templateVars);
  } else {
    const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL].longURL, id: null };
    res.render("urls_show", templateVars);
  }
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

