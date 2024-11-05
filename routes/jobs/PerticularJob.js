const JobsModel = require("../../models/JobsModel");
const router = require("express").Router();
const getUid = require("../../middlewares/GetUid");
require("dotenv").config();

//----------------Fetch job detail using jobId----------
router.get("/", async (req, res) => {
   let jobId = req.query.jobId;
   try {
      let response = await JobsModel.findById(jobId);
      let postedTimeStamp = new Date(response._doc._id.getTimestamp());

      let result = {
         ...response._doc,
         postedOn: postedTimeStamp,
         applicants: 30,
      };
      res.status(200).json({ msg: "Suceess!", jobDetails: result });
   } catch (error) {
      console.log(error);
      res.status(500).json({ msg: "Internal Server Error!", error });
   }
});

//---------------Edit the Job----------------------------
router.patch("/", getUid, async (req, res) => {
   let jobId = req.body.jobId;
   try {
      let response = await JobsModel.findByIdAndUpdate(jobId, req.body, {
         new: true,
         runValidators: true,
      });
      res.status(200).json({ msg: "Saved Successfully!", response });
   } catch (error) {
      res.status(500).json({ msg: "Internal Server Error", error });
   }
});

//-----------------------Delete Job-------------------------------------
router.delete("/", getUid, async (req, res) => {
   let jobId = req.query.jobId;
   try {
      let response = await JobsModel.findByIdAndDelete(jobId);
      res.status(200).json({ msg: "Deleted Successfully!", response });
   } catch (error) {
      res.status(500).json({ msg: "Internal Server Error", error });
   }
});

module.exports = router;
