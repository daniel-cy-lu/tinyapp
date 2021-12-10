//Helper Function
const generateRandomString = function() {
  let random = (Math.random() + 1).toString(36).substring(2,8);
  return random;
};

const emailAlreadyExist = function(email, database) {
  for (user in database) {
    if (database[user].email === email) {
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
  return undefined;
};

const urlsForUser = function(id, database) {
  let newURLDatabase = {};
  for (let key in database) {
    if (database[key].userID === id) {
      newURLDatabase[key] = database[key];
    }
  }
  return newURLDatabase;
};

const shortURLBelongUser = function (url, user, database) {
  if (database[url].userID === user) {
    return true;
  } else {
    return false;
  }
};

module.exports = { generateRandomString, emailAlreadyExist, getUserByEmail, urlsForUser, shortURLBelongUser, }