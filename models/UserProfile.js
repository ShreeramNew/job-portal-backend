const mongoose = require("mongoose");

const ProfileSchema = new mongoose.Schema({
   uid: { type: String, require: true },
   email: { type: String },
   profile: { type: String },
   resume: { type: String },
   username: { type: String },
   bio: { type: String },
   education: { type: String },
   experience: { type: String },
   company: { type: String },
   time: { type:Number },
   yearsOrMonth: { type: String },
   phone: { type: Number },
   linkedin: { type: String },
   gitHub: { type: String },
});

module.exports = mongoose.model("userProfile", ProfileSchema);
