require('dotenv').config();
const express = require('express');
const mongoose = require("mongoose");
const { router } = require('./routes/bug-routes');
const cors = require("cors");


const app = express();
app.use(cors());
app.use(express.json());
mongoose.connect("mongodb+srv://admin:9zNBhxNG56ua13sg@cluster0.oj7avns.mongodb.net/pdfGenerate?retryWrites=true&w=majority")
    .then(() => app.listen(5000))
    .then(() => console.log("Connected to database"))
    .catch((err) => console.log(err));
    
app.use("/api/getReport", router);
app.use("/api", (req, res, next) => {
    res.send("Hello world");
});

console.log("Hello");
