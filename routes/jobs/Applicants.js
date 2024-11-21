const express = require("express");
const router = express.Router();
const GetUid = require("../../middlewares/GetUid");
const ApplyModel = require("../../models/ApplyModel");
const UserProfile = require("../../models/UserProfile");

router.get("/applicants", GetUid, async (req, res) => {
   let jobId = req.query.jobId;
   try {
      let response = await ApplyModel.findOne({ jobId });
      const ApplicantsDetails = await Promise.all(
         response.applicants.map(async (userId) => {
            let userProfile = await UserProfile.findOne({ uid: userId });
            let isSaved = response.savedApplicants.includes(userId);
            return {
               ...userProfile._doc,
               isSaved,
            };
         })
      );

      res.status(200).json({ msg: "Success!", ApplicantsDetails });
   } catch (error) {
      console.log(error);
      res.status(500).json({ msg: "Internal Server Error" });
   }
});

router.get("/savedApplicants", GetUid, async (req, res) => {
   let jobId = req.query.jobId;
   try {
      let response = await ApplyModel.findOne({ jobId });
      const ApplicantsDetails = await Promise.all(
         response.savedApplicants.map(async (userId) => {
            let result = await UserProfile.findOne({ uid: userId });
            return result;
         })
      );
      res.status(200).json({ msg: "Success!", ApplicantsDetails });
   } catch (error) {
      console.log(error);
      res.status(500).json({ msg: "Internal Server Error" });
   }
});

router.patch("/save", GetUid, async (req, res) => {
   let { jobId, applicantId } = req.body;

   try {
      let newResponse = await ApplyModel.findOneAndUpdate(
         { jobId },
         { $addToSet: { savedApplicants: applicantId } },
         { new: true }
      );
      res.status(200).json({ msg: "Success!", newResponse });
   } catch (error) {
      console.log(error);
      res.status(500).json({ msg: "Internal Server Error" });
   }
});

router.patch("/unsave", GetUid, async (req, res) => {
   let { jobId, applicantId } = req.body;
   try {
      let newResponse = await ApplyModel.findOneAndUpdate(
         { jobId },
         { $pull: { savedApplicants: applicantId } },
         { new: true }
      );
      res.status(200).json({ msg: "Success!", newResponse });
   } catch (error) {
      console.log(error);
      res.status(500).json({ msg: "Internal Server Error" });
   }
});

module.exports = router;
