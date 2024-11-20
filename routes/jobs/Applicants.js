const express = require("express");
const router = express.Router();
const GetUid = require("../../middlewares/GetUid");
const ApplyModel = require("../../models/ApplyModel");
const UserProfile = require("../../models/UserProfile");

router.get("/", GetUid, async (req, res) => {
   let jobId = req.query.jobId;
   try {
      let response = await ApplyModel.findOne({ jobId });
      const ApplicantsDetails = await Promise.all(
         response.applicants.map(async (userId) => {
            let result = await UserProfile.findOne({ uid: userId });
            console.log(userId);

            console.log(result);

            return result;
         })
      );

      res.status(200).json({ msg: "Success!", ApplicantsDetails });
   } catch (error) {
      console.log(error);
      res.status(500).json({ msg: "Internal Server Error" });
   }
});

router.patch("/", GetUid, async (req, res) => {
   let { jobId, applicantId } = req.body;

   try {
      let newResponse = await ApplyModel.findOneAndUpdate(
         { jobId },
         { $addToSet: { savedApplicants: applicantId } }
      );
      res.status(200).json({ msg: "Success!", newResponse });
   } catch (error) {
      console.log(error);
      res.status(500).json({ msg: "Internal Server Error" });
   }
});

module.exports = router;
