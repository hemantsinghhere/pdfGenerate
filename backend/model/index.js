const mongoose = require("mongoose");

const schema = mongoose.Schema;

const imageSchema = new schema({
    data: Buffer,
    contentType: String
});

const bugReportSchema = new schema({
    Status: String,
    Severity: String,
    OWASP_Category: String,
    CVSS_Score: Number,
    Affected_Hosts : String,
    Summary : String,
    Proof_of_concept: String,
    Remediation : String,
    Reference: String,
});


module.exports = mongoose.model("BugReport", bugReportSchema);