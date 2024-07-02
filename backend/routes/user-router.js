const express = require('express');
const { signup } = require('../controllers/user-controller');




const user = express.Router();


user.post("/adduser", signup);



module.exports = {user}