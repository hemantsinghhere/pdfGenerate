const mongoose = require("mongoose");
const BugReport =  require("./index.js")
const User = require("./User.js")


const schema = mongoose.Schema;

const companySchema = new schema({
    Name: String,
    Application_url: String,
    Asset: String,
    bugs: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "BugReport"
    }],
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },
    createdAt: {
      type: Date,
      default: Date.now
    },
    updatedAt: {
      type: Date,
      default: Date.now 
    }
  });
  
  // Middleware to update the updatedAt field before saving
  companySchema.pre('save', function (next) {
    this.updatedAt = Date.now();
    next();
  });
  
  module.exports = mongoose.model("Company", companySchema);
  