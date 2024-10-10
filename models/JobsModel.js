const mongoose = require("mongoose");

const JobsSchema = new mongoose.Schema({
   employerId: {
      type: String,
      required: true,
   },
   jobTitle: { type: String, required: true },
   jobType: { type: String, required: true },
   location: { type: String, required: true },
   minSalary: { type: Number, required: true },
   maxSalary: { type: Number, required: true },
   responsibilities: { type: String, required: true },
   requiremnets: { type: String, required: true },
   minExp: { type: Number, required: true },
   maxExp: { type: Number, required: true },
   openings: { type: Number, required: true },
});

module.exports = mongoose.model("jobs", JobsSchema);
