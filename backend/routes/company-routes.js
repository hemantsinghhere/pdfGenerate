const express = require('express');
const { getCompanyData, addCompany, updateById, getById, deleteById } = require('../controllers/company-controller');



const comRouter = express.Router();

comRouter.get("/", getCompanyData);
comRouter.post("/addCompany", addCompany);
comRouter.put("/update/:id", updateById)
comRouter.get("/:id", getById);
comRouter.delete("/delete/:id", deleteById)


module.exports = {comRouter}