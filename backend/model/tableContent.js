const mongoose = require("mongoose");

const schema = mongoose.Schema;

const tableSection = new schema({
    title: String,
    content: String
});

module.exports = mongoose.model("TableContent", tableSection);