const express = require('express');
const multer = require('multer');
const verifyToken = require('../controllers/Token')

const { bugReport, generatePdf, updateBug, getBugById, deleteById, submitBug, getBugByCompnayId } = require("../controllers/report-controller");
const { usersubmitBug, usergeneratePdf, userupdateBug, usergetBugById, usergetBugByCompnayId, userdeleteById, userupdateBugStatus,getCommentsByBugId, addComment} = require('../user-controller/user-report');

// set multer storage
const storage = multer.memoryStorage();
const upload = multer({storage: storage})

const router = express.Router();


router.get("/", bugReport );

// for admin
router.post("/submitReport", upload.array("images"), submitBug);
router.get("/generatedPdf/:id", generatePdf)
router.put("/update/:id",upload.array("images"), updateBug);
router.get("/:id", getBugById);
router.get("/company/:id", getBugByCompnayId)
router.delete("/delete/:id", deleteById)


// for user

router.post("/usubmitReport",verifyToken, upload.array("images"), usersubmitBug);
router.get("/ugeneratedPdf/:id",verifyToken, usergeneratePdf)
router.put("/update/u/:id",verifyToken,upload.array("images"), userupdateBug);
router.put("/updateStatus/u/:id",verifyToken, userupdateBugStatus);
router.get("/u/:id", verifyToken, usergetBugById);
router.get("/company/u/:id", verifyToken, usergetBugByCompnayId)
router.delete("/delete/u/:id", verifyToken, userdeleteById)

router.get("/comments/:id",verifyToken, getCommentsByBugId)
router.post("/addComment/:id", verifyToken, addComment)

module.exports = {router}