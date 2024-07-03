const express = require('express');
const { signup, login, getAllUsers } = require('../controllers/user-controller');




const user = express.Router();


user.post("/signup", signup);
user.post("/login", login)
user.get("/", getAllUsers)


module.exports = {user}