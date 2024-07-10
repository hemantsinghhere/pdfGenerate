const mongoose = require("mongoose");
const BugReport =  require("./index.js")
const User = require("./User.js")


const schema = mongoose.Schema;

const companySchema = new schema({
    Name: String,
    Application_url: String,
    Asset: String,
    bugs: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "BugReport"
    }],
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },
    createdAt: {
      type: Date,
      default: Date.now
    },
    updatedAt: {
      type: Date,
      default: Date.now 
    }
  });
  
  // Middleware to update the updatedAt field before saving
  companySchema.pre('save', function (next) {
    this.updatedAt = Date.now();
    next();
  });


// Middleware to remove company ID from user's companys array before deleting the company
companySchema.pre('findOneAndDelete', async function (next) {
  try {
      const company = await this.model.findOne(this.getFilter());
      if (company.user) {
          await mongoose.model("User").updateOne(
              { _id: company.user },
              { $pull: { companys: company._id } }
          );
      }
      next();
  } catch (err) {
      next(err);
  }
});

// Middleware to remove user ID from company's user field before deleting the company
companySchema.pre('findOneAndDelete', async function (next) {
  try {
      const company = await this.model.findOne(this.getFilter());
      if (company.bugs && company.bugs.length > 0) {
          await mongoose.model("BugReport").updateMany(
              { _id: { $in: company.bugs } },
              { $unset: { company: "" } }
          );
      }
      next();
  } catch (err) {
      next(err);
  }
});
  
  module.exports = mongoose.model("Company", companySchema);
  