const Company = require("../model/company.js");



const getCompanyData = async(req, res, next) =>{
    try {
        // Retrieve all BugReport documents from the database
        const companys = await Company.find({});

        res.json(companys);


    } catch (err) {
        console.log("Error: ", err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}
const addCompany = async(req, res, next) => {
    const companyData = req.body;
    try{
        const companyProfile = new Company(companyData);
        console.log("company data:", companyProfile)
        await companyProfile.save();
        res.json({ message: 'Company data submitted successfully.' });
    }catch(error){
        console.error("error:", error)
        res.status(500).json({ error: 'Internal Server Error' });
    }
}

const getById = async(req, res, next) => {
    const companyId = req.params.id;
    try {
        const company = await Company.findById(id);
        res.json({ company });
    } catch (err) {
        console.log("Error:", err);
        res.status(500).json({ err: "Internal Servre Error" });
    }
}

const updateById = async(req, res, next) =>{
    const updateValues = req.body;
    const companyId = req.params.id;
    try{
        const company = await Company.findByIdAndUpdate(companyId, updateValues, { new: true });

        if (!company) {
            return res.status(404).json({ error: 'Bug report not found' });
        }

        res.json({ message: 'Bug report updated successfully', bug });
    }catch(error){
        console.log("error", error);
        res.status(500).json({ error: "Internal Server Error"})
    }
}

const deleteById = async(req, res, next) =>{
    const id = req.params.id;
    try {
        const company = await Company.findByIdAndDelete(id);
        res.json({ message: 'Bug Report Delete Successfully', company })

    } catch (err) {
        console.log("Error :", err);
        res.status(500).json({ err: "Internal Server Error" })
    }
}

module.exports = {getCompanyData, addCompany, getById, updateById, deleteById}