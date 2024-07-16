const mongoose = require("mongoose");
const Company  = require("./company.js")


const schema = mongoose.Schema;

const bugReportSchema = new schema({
  BugName: String,
  Title: String,
  Status: String,
  Severity: String,
  OWASP_Category: String,
  CVSS_Score: {
    type: mongoose.Decimal128,
    validate: {
      validator: (score) => score >= 0 && score <= 10,
      message: "CVSS_Score must be between 0 and 10"
    }
  },
  Affected_Hosts: [String],
  Summary: String,
  Steps_of_Reproduce: [String],
  Proof_of_concept: [String],
  Impact: [String],
  Remediation: [String],
  Links: [String],
  Remediation_effort: String,
  CVSS_URL: String,
  createdAt: {
    type: Date,
    default: Date.now // Automatically set the date when the bug report is created
  },
  updatedAt: {
    type: Date,
    default: Date.now // Automatically set the date when the bug report is created or updated
  },


  company: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Company" 
  },

  comments : [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "Comment"
  }]

});



// Middleware to update the updatedAt field before saving
bugReportSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

// Middleware to remove bug ID from company's bugs array before deleting the bug
bugReportSchema.pre('findOneAndDelete', async function (next) {
  try {
      const bugReport = await this.model.findOne(this.getFilter());
      if (bugReport.company) {
          await mongoose.model("Company").updateOne(
              { _id: bugReport.company },
              { $pull: { bugs: bugReport._id } }
          );
      }
      next();
  } catch (err) {
      next(err);
  }
});


module.exports = mongoose.model("BugReport", bugReportSchema);