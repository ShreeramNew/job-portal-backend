const expresss = require("express");
const router = expresss.Router();
const jwt = require("jsonwebtoken");
const companyDetails = require("../../models/CompanyDetails");
require("dotenv").config();

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
module.exports = router;
