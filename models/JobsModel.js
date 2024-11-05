const mongoose = require("mongoose");

const JobsSchema = new mongoose.Schema({
   employerId: {
      type: String,
      required: true,
   },
   company: {
      type: String,
      required: true,
   },
   jobTitle: { type: String, required: true },
   jobType: { type: String, required: true },
   location: { type: String, required: true },
   minSalary: { type: Number, required: true },
   maxSalary: { type: Number, required: true },
   responsibilities: { type: String, required: true },
   requirements: { type: String, required: true },
   skills: { type: String, required: true },
   minExp: { type: Number, required: true },
   maxExp: { type: Number, required: true },
   openings: { type: Number, required: true },
});

JobsSchema.index({ skills: "text", jobTitle: "text" });
module.exports = mongoose.model("jobs", JobsSchema);
