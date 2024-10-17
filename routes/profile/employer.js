const router = require("express").Router();
const CompanyDetailsModel = require("../../models/CompanyDetails");
const jwt = require("jsonwebtoken");
require("dotenv").config();

//--------------------Used in onboarding of employer-----------------------
router.post("/", async (req, res) => {
   let cookie = req.cookies;

   if (cookie.authToken) {
      let payload = jwt.verify(cookie.authToken, process.env.JWT_PRIVATE_SIGN);
      const DataToSave = {
         ...req.body,
         employerId: payload.uid,
      };
      try {
         await companyDetails.create(DataToSave);
         res.status(200).json({ msg: "Success!" });
      } catch (error) {
         console.log(error);
         res.status(500).json({ msg: "Something went wrong" });
      }
   } else {
      res.status(500).json({ msg: "Unauthorized access!" });
   }
});

//---------------------Used to edit the company profile-----------------------
router.patch("/", async (req, res) => {
   let cookie = req.cookies;
   if (cookie.authToken) {
      let payload = jwt.verify(cookie.authToken, process.env.JWT_PRIVATE_SIGN);
      try {
         let response = await CompanyDetailsModel.findOneAndUpdate(
            { employerId: payload.uid },
            req.body,
            { new: true, runValidators: true }
         );
         res.status(200).json({ msg: "Saved!", response });
      } catch (error) {
         console.log(error);
         res.status(500).json({ msg: "Something went wrong" });
      }
   } else {
      res.status(500).json({ msg: "Unauthorized access!" });
   }
});

//--------------------------Used to get the current profile details------------------
router.get("/", async (req, res) => {
   let cookie = req.cookies;
   if (cookie.authToken) {
      let payload = jwt.verify(cookie.authToken, process.env.JWT_PRIVATE_SIGN);
      try {
         let response = await CompanyDetailsModel.find({ employerId: payload.uid });
         res.status(200).json({ msg: "Success!", profile:response[0] });
      } catch (error) {
         console.log(error);
         res.status(500).json({ msg: "Something went wrong" });
      }
   } else {
      res.status(500).json({ msg: "Unauthorized access!" });
   }
});

module.exports = router;
