const Company = require("../model/company.js");
const User = require("../model/User.js")
const { default: mongoose } = require("mongoose");



const UgetCompanyData = async(req, res, next) =>{
    try {
        // Retrieve all BugReport documents from the database
        const company = await Company.find({ user: req.user._id });

        res.json(company);

    } catch (err) {
        console.log("Error: ", err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}
const UaddCompany = async(req, res, next) => {
    const companyData = { ...req.body, user: req.user._id };

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

const UgetById = async(req, res, next) => {
    const companyId = req.params.id;
    try {
        const company = await Company.findOne({ _id: companyId, user: req.user._id });
        const totalbugs = company.bugs.length;
        let Low = 0, Medium = 0, High = 0, Critical = 0, Info = 0;

        for (let i = 0; i < totalbugs; i++) {
            const bugId = company.bugs[i].toString();
            const bug = await BugReport.findById(bugId);
            if (bug) {
                const severity = bug.Severity;
                console.log('Severity:', severity);
                switch (severity) {
                    case 'Low':
                        Low++;
                        break;
                    case 'Medium':
                        Medium++;
                        break;
                    case 'High':
                        High++;
                        break;
                    case 'Critical':
                        Critical++;
                        break;
                    case 'Info':
                        Info++;
                        break;
                    default:
                        break;
                }
            }
        }

        res.json({ company, totalbugs, Low, Medium, High, Critical, Info });
    } catch (err) {
        console.log("Error:", err);
        res.status(500).json({ err: "Internal Servre Error" });
    }
}

const UgetByUserId = async(req, res, next) => {
    const userId = req.params.id;
    if (req.user._id.toString() !== userId) {
        return res.status(403).json({ error: 'Access denied' });
    }
    try {
        const company = await Company.find({ user : userId}).select('Name Asset');
        res.json({ company });
    } catch (err) {
        console.log("Error:", err);
        res.status(500).json({ err: "Internal Servre Error" });
    }
}

const UupdateById = async(req, res, next) =>{
    const updateValues = req.body;
    const companyId = req.params.id;
    try{
        const company = await Company.findOneAndUpdate({ _id: companyId, user: req.user._id }, updateValues, { new: true });
        if (!company) {
            return res.status(404).json({ error: 'Bug report not found' });
        }

        res.json({ message: 'Company details updated successfully', company });
    }catch(error){
        console.log("error", error);
        res.status(500).json({ error: "Internal Server Error"})
    }
}

const UdeleteById = async(req, res, next) =>{
    const id = req.params.id;
    try {
        const company = await Company.findOneAndDelete({ _id: id, user: req.user._id });
        res.json({ message: 'Company Details Delete Successfully', company })

    } catch (err) {
        console.log("Error :", err);
        res.status(500).json({ err: "Internal Server Error" })
    }
}

module.exports = {UgetCompanyData, UaddCompany, UgetById, UupdateById, UdeleteById, UgetByUserId}