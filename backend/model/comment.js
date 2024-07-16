const mongoose = require("mongoose");

const commentSchema = new mongoose.Schema({
    bug: {
        type: mongoose.Schema.Types.ObjectId,
        ref : "BugReport"
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref : "User"
    },
    comment: String,
    date: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Comment", commentSchema);