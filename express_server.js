const express = require('express');
const app = express();
const PORT = 8080;

//setup body-parser for POST request
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));
//setup ejs to render HTML 
app.set('view engine', 'ejs');

//setup id object - keys are short URL and values are long URL
const urlDatabase = {
  'b2xVn2' : 'http://www.lighthouselabs.ca',
  '9sm5xK' : 'http//www.google.com'
};

//Generate six rando strings
function generateRandomString() {
  let random = (Math.random() + 1).toString(36).substring(1,7);
  return random;
}

//POST request - executed after user enter url in /urls/new
//It generate a random variable and saves it in urlDatabase then redirect user to /urls/(newly created link)
app.post("/urls", (req, res) => {
  console.log(req.body);  // Log the POST request body to the console
        
  const random = generateRandomString();
  urlDatabase[random] = req.body.longURL;
  
  res.redirect('http://localhost:8080/urls/' + random);   
});  


app.get('/', (req, res) => {
  res.send('Hello!');
});

// Display the urlDatabase in string
app.get('/urls.json', (req, res) => {
  res.json(urlDatabase);
})

app.get('/hello', (req, res) => {
  res.send('<html><body>Hello <b>World</b><body></html>\n')
})

//Display urlDatabase in webpage, rendered
app.get('/urls', (req,res) => {
  const templateVars = { urls: urlDatabase };
  res.render('urls_index', templateVars)
})

//Webpage where user can enter a new long url
app.get('/urls/new', (req,res) => {
  res.render('urls_new');
})

// a short/u/ brings user to long url via clicking on short url
app.get("/u/:shortURL", (req, res) => {
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
})