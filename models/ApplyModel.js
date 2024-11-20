const mongoose = require("mongoose");

const ApplySchema = new mongoose.Schema({
   jobId: {
      type: String,
      required: true,
   },
   applicants: {
      type: [String],
      default: [],
   },
   savedApplicants: {
      type: [String],
      default: [],
   },
});

module.exports = mongoose.model("applicants", ApplySchema);
