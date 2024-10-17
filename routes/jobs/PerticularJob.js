const JobsModel = require("../../models/JobsModel");
const router = require("express").Router();
const jwt = require("jsonwebtoken");
require("dotenv").config();

//----------------Fetch job detail using jobId----------
router.get("/", async (req, res) => {
   let jobId = req.body.jobId;
   try {
      let response = await JobsModel.findById(jobId);
      res.status(200).json({ msg: "Suceess!", response });
   } catch (error) {
      res.status(500).json({ msg: "Internal Server Error!", error });
   }
});

module.exports = router;
