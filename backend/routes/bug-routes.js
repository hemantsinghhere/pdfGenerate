const express = require('express');
const { bugReport, generatePdf, updateBug, getBugById } = require("../controllers/report-controller");
const { submitBug } = require("../controllers/report-controller");
 

const router = express.Router();


router.get("/", bugReport );
router.post("/submitReport", submitBug);
router.get("/generatedPdf", generatePdf)
router.put("/update/:id", updateBug);
router.get("/:id", getBugById);


module.exports = {router}