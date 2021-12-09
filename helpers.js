const {urlDatabase, users} = require('./storage');

//Helper Function
const generateRandomString = function() {
  let random = (Math.random() + 1).toString(36).substring(2,8);
  return random;
};

const emailAlreadyExist = function(email) {
  for (user in users) {
    if (users[user].email === email) {
      return true;
    } 
  }
  return false;
}

const getUserByEmail = function(email, database) {
  for (user in database) {
    if (database[user].email === email) {
      return user;
    }
  }
  return false;
};

const urlsForUser = function(id) {
  let newURLDatabase = {};
  for (let key in urlDatabase) {
    if (urlDatabase[key].userID === id) {
      newURLDatabase[key] = urlDatabase[key];
    }
  }
  return newURLDatabase;
};

const shortURLBelongUser = function (url, user) {
  if (urlDatabase[url].userID === user) {
    return true;
  } else {
    return false;
  }
};

module.exports = { generateRandomString, emailAlreadyExist, getUserByEmail, urlsForUser, shortURLBelongUser, }