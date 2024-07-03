const express = require('express');
const { getCompanyData, addCompany, updateById, getById, deleteById, getByUserId } = require('../controllers/company-controller');



const comRouter = express.Router();

comRouter.get("/", getCompanyData);
comRouter.post("/addCompany", addCompany);
comRouter.put("/update/:id", updateById)
comRouter.get("/:id", getById);
comRouter.get("/user/:id", getByUserId);
comRouter.delete("/delete/:id", deleteById)


module.exports = {comRouter}