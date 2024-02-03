const mongoose = require("mongoose");

const schema = mongoose.Schema;

const bugReportSchema = new schema({
    Status: String,
    Severity: String,
    OWASP_Category: String,
    CVSS_Score: String,
    Affected_Hosts : String,
    Summary : String,
    Proof_of_concept: String,
    Reference: String,
});

module.exports = mongoose.model("BugReport", bugReportSchema);