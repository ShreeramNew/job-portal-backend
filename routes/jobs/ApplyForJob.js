const express = require("express");
const router = express.Router();
const GetUid = require("../../middlewares/GetUid");
const ApplyModel = require("../../models/ApplyModel");
const UserModel = require("../../models/UserModel");

router.patch("/", GetUid, async (req, res) => {
   let jobId = req.body.jobId;
   try {
      let user = await UserModel.findById(req.uid);
      if (!user) {
         return res.status(401).json({ msg: "Unauthorized accesss!" });
      }
      let response = await ApplyModel.find({ jobId });
      let newResponse;
      if (response.length > 0) {
         newResponse = await ApplyModel.findOneAndUpdate(
            { jobId },
            { $addToSet: { applicants: req.uid } }
         );
      } else {
         newResponse = await ApplyModel.create([{ jobId, applicants: [req.uid] }]);
      }
      res.status(200).json({ msg: "Success", newResponse });
   } catch (error) {
      res.status(500).json({ msg: "Internal Server Error!" });
   }
});

module.exports = router;
