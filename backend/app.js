require('dotenv').config();
const express = require('express');
const mongoose = require("mongoose");
const { router } = require('./routes/bug-routes');
const { comRouter} = require("./routes/company-routes")
const cors = require("cors");
const fs = require("fs");
const { spawn } = require('child_process');
const { spawnSync } = require('child_process');
const { execSync } = require('child_process');
const axios = require('axios');
const { user } = require('./routes/user-router');



 
const app = express();
app.use(cors());
app.use(express.json());
mongoose.connect("mongodb+srv://admin:9zNBhxNG56ua13sg@cluster0.oj7avns.mongodb.net/pdfGenerate?retryWrites=true&w=majority")
    .then(() => app.listen(5000))
    .then(() => console.log("Connected to database"))
    .catch((err) => console.log(err));




app.use("/api/getReport", router);
app.use("/company",comRouter)
app.use("/user", user)
app.use("/api", (req, res, next) => {
    res.send("Hello world");
});



console.log("Hello");
