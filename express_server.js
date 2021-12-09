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
}

//Helper Function
const generateRandomString = function() {
  let random = (Math.random() + 1).toString(36).substring(2,8);
  return random;
};

// true if email is in users storage
const emailAlreadyExist = function(email) {
  for (user in users) {
    if (users[user].email === email) {
      return true;
    } 
  }
  return false;
}

const findIDFromEmail = function(email) {
  for (user in users) {
    if (users[user].email === email) {
      return user;
    }
  }
  return false;
}

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
  urlDatabase[editShortURLID] = updatedLongURL;

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
  const userEmail = req.body.email;
  const userPassword = req.body.password;
  const id = findIDFromEmail(userEmail);
  
  if (!emailAlreadyExist(userEmail)) {
    res.send('Username is not found, please register first. Error:403')
  }
  if (emailAlreadyExist(userEmail) && users[id].password !== userPassword) {
    res.send('User Password is incorrect. Error: 403')
  }
  if (emailAlreadyExist(userEmail) && users[id].password === userPassword) {
    res.cookie('user_id', id);
    res.redirect('/urls');
  }
})

//Logout
app.post('/logout', (req, res) => {
  res.clearCookie('user_id');
  res.redirect('/urls');
})

//Register
app.post('/register', (req, res) => {
  const id = generateRandomString();
  const userEmail = req.body.email;
  const userPassword = req.body.password;
  const cookieID = req.cookies.user_id;
  
  //Error: if email or password is empty
  if (!userEmail) {
    res.send("Empty email: Error 400");
  }
  if (!userPassword) {
    res.send("Empty password: Error 400");
  }
  
  //find if email exist in users storage
  if (emailAlreadyExist(userEmail) === true) {
    res.send('Email already taken: Error 400');
  }
  
  users[id] = {};
  users[id]['id'] = id;
  users[id]['email'] = userEmail;
  users[id]['password'] = userPassword;
  
  res.cookie('user_id', id);
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
  const userID = req.cookies['user_id'];
  if (users[userID]){
    const templateVars = { urls: urlDatabase, id: users[userID].email };
  res.render('urls_index', templateVars);
  } else {
    const templateVars = { urls: urlDatabase, id: null };
    res.render('urls_index', templateVars);
  }
});

//Add
app.get('/urls/new', (req,res) => {
  const userID = req.cookies['user_id'];
  if (users[userID]){
    const tempateVars = { id: users[userID].email};
    res.render('urls_new', tempateVars);
  } else {
    const tempateVars = { id: null};
    res.render('urls_new', tempateVars);
  }
  
});

//Visit LongURL
app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});

//Register
app.get("/register", (req, res) => {
  const userID = req.cookies['user_id'];
  if (users[userID]){
    const tempateVars = { id: users[userID].email};
    res.render('urls_register', tempateVars);
  } else {
    const tempateVars = { id: null};
    res.render('urls_register', tempateVars);
  }
})

//Login
app.get("/login", (req, res) => {
  const userID = req.cookies['user_id'];
  if (users[userID]){
    const tempateVars = { id: users[userID].email};
    res.render('urls_login', tempateVars);
  } else {
    const tempateVars = { id: null};
    res.render('urls_login', tempateVars);
  }
})

//Show
app.get("/urls/:shortURL", (req, res) => {
  const userID = req.cookies['user_id'];
  if (users[userID]) {
    const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL], id: users[cookieID].email };
    res.render("urls_show", templateVars);
  } else {
    const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL], id: null };
    res.render("urls_show", templateVars);
  }
});



app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});   