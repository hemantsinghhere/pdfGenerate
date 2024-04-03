const mongoose = require("mongoose");

const schema = mongoose.Schema;

const imageSchema = new schema({
    data: Buffer,
    contentType: String
});

const bugReportSchema = new schema({
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
    Affected_Hosts : String,
    Summary : String,
    Steps_of_Reproduce: [String],
    Proof_of_concept: [imageSchema],
    Impact: [String],
    Remediation : [String],
    Links: [String],
    Remediation_effort: String,
});


module.exports = mongoose.model("BugReport", bugReportSchema);