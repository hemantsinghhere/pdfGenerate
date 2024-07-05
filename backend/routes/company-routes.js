const express = require('express');
const { getCompanyData, addCompany, updateById, getById, deleteById, getByUserId } = require('../controllers/company-controller');
const { UgetCompanyData, UaddCompany, UupdateById, UgetById, UgetByUserId, UdeleteById } = require('../user-controller/user-company');
const verifyToken = require('../controllers/Token');



const comRouter = express.Router();


// FOR ADMIN
comRouter.get("/", getCompanyData);
comRouter.post("/addCompany", addCompany);
comRouter.put("/update/:id", updateById)
comRouter.get("/:id", getById);
comRouter.get("/user/:id", getByUserId);
comRouter.delete("/delete/:id", deleteById)

// FOR USER

comRouter.get("/U",verifyToken, UgetCompanyData);
comRouter.post("/addCompany/U", verifyToken, UaddCompany);
comRouter.put("/update/U/:id", verifyToken, UupdateById)
comRouter.get("/U/:id", verifyToken, UgetById);
comRouter.get("/user/U/:id", verifyToken, UgetByUserId);
comRouter.delete("/delete/U/:id", verifyToken, UdeleteById)


module.exports = {comRouter}