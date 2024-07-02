const mongoose = require('mongoose');
const Company = require("./company.js")
const UserSchema = new mongoose.Schema({
    name:{
        type: String,
        required: true,
    },
    email:{
        type: String,
        required: true,
        unique: true,
    },
    password:{
        type: String,
        required: true,
        minlength: 6,
    },
    companys: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Company"
    }]
   });

module.exports = mongoose.model('User', UserSchema);