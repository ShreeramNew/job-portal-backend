const mongoose = require("mongoose");

const ProfileSchema = new mongoose.Schema({
   email: { type: String, required: true },
   profile: { type: String, required: true },
   resume: { type: String, required: true },
   username: { type: String, required: true },
   bio: { type: String },
   education: { type: String, required: true },
   experience: { type: String, required: true },
   company: { type: String },
   time: { type: number },
   yearsOrMonth: { type: String },
   phone: { type: number, required: true },
   linkedin: { type: String, required: true },
   gitHub: { type: String, required: true },
});

module.exports = mongoose.model("userProfile", ProfileSchema);
