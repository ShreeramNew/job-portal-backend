const mongoose = require("mongoose");

const CompanyDeatilSchema = new mongoose.Schema({
   employerId: {
      type: String,
      required: true,
      unique: true,
   },
   companyName: { type: String, required: true },
   bio: { type: String, required: true },
   location: { type: String, required: true },
   phone: { type: String, required: true },
   website: { type: String, required: true },
   linkedin: { type: String, required: true },
   whyWorkWithUS: { type: String, required: true },
   aboutTeam: { type: String, required: true },
   aboutEnvoirnment: { type: String, required: true },
});

module.exports = mongoose.model("companyDetails", CompanyDeatilSchema);
