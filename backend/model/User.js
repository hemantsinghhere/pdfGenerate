const mongoose = require('mongoose');
const Company = require("./company.js")
const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
        minlength: 6,
    },
    companys: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Company"
    }],
   
});

// Middleware to remove user ID from company's user field before deleting the user
UserSchema.pre('findOneAndDelete', async function (next) {
    try {
        const user = await this.model.findOne(this.getFilter());
        if (user.companys && user.companys.length > 0) {
            await mongoose.model("Company").updateMany(
                { _id: { $in: user.companys } },
                { $unset: { user: "" } }
            );
        }
        next();
    } catch (err) {
        next(err);
    }
});

module.exports = mongoose.model('User', UserSchema);