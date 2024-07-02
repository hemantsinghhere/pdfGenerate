const Company = require("../model/company.js");
const User = require("../model/User.js")
const { default: mongoose } = require("mongoose");



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

    const session = await mongoose.startSession();
    session.startTransaction();

    try{
        const companyProfile = new Company(companyData);
        await companyProfile.save({session});

        const user = await User.findById(companyProfile.user).session(session);
        if (!user) {
            throw new Error('User not found');
        }

        user.companys.push(companyProfile._id);
        await user.save({ session });

        await session.commitTransaction();
        session.endSession();


        res.json({ message: 'Company data submitted successfully.' });
    }catch(error){
        await session.abortTransaction();
        session.endSession();

        console.error("error:", error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}

const getById = async(req, res, next) => {
    const companyId = req.params.id;
    try {
        const company = await Company.findById(companyId);
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

        res.json({ message: 'Company details updated successfully', company });
    }catch(error){
        console.log("error", error);
        res.status(500).json({ error: "Internal Server Error"})
    }
}

const deleteById = async(req, res, next) =>{
    const id = req.params.id;
    try {
        const company = await Company.findByIdAndDelete(id);
        res.json({ message: 'Company Details Delete Successfully', company })

    } catch (err) {
        console.log("Error :", err);
        res.status(500).json({ err: "Internal Server Error" })
    }
}

module.exports = {getCompanyData, addCompany, getById, updateById, deleteById}