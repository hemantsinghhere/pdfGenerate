const mongoose = require("mongoose");
const BugReport = require("./index.js")

const schema = mongoose.Schema;


const projectSchema = new schema({
    name: String,
    description: String,
    startDate: Date,
    endDate: Date,
    bugReports: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "BugReport" 
    }],
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
  projectSchema.pre('save', function (next) {
    this.updatedAt = Date.now();
    next();
  });
  
  module.exports = mongoose.model("Project", projectSchema);
  