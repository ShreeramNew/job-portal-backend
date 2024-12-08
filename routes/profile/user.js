const express = require("express");
const router = express.Router();
const ProfileModel = require("../../models/UserProfile");
const UserModel = require("../../models/UserModel");
const Getuid = require("../../middlewares/GetUid");

const GetUid = require("../../middlewares/GetUid");
require("dotenv").config();

router.get("/", GetUid, async (req, res) => {
   let uid = req.uid;

   try {
      let user = await ProfileModel.findOne({ uid });
      res.status(200).json({ msg: "Success!", user });
   } catch (error) {
      res.status(500).json({ msg: "Internal Server Error!" });
   }
});

router.get("/perticularUser", async (req, res) => {
   let uid = req.query.uid;
   try {
      let user = await ProfileModel.findOne({ uid });
      res.status(200).json({ msg: "Success!", user });
   } catch (error) {
      res.status(500).json({ msg: "Internal Server Error!" });
   }
});

router.get("/checkLogedIn", GetUid, async (req, res) => {
   let uid = req.uid;
   let cookie = req.cookies;

   try {
      let user = await ProfileModel.findOne({ uid });
      let result = {
         token: cookie.authToken,
         profilePic: user.profile,
         uid,
      };
      res.status(200).json({ msg: "Success!", result });
   } catch (error) {
      res.status(500).json({ msg: "Internal Server Error!" });
   }
});

router.post("/", GetUid, async (req, res) => {
   let user = await ProfileModel.findOne({ uid: req.uid });
   let result = await UserModel.findById(req.uid);
   if (user) {
      let payload = {
         ...req.body,
         email: result.email,
      };
      try {
         let response = await ProfileModel.findOneAndUpdate({ uid: req.uid }, payload, {
            new: true,
            runValidators: true,
         });
         res.status(200).json({ msg: "Saved profile details!", profileDetails: response });
      } catch (error) {
         console.log(error);
         res.status(500).json({ msg: "Internal Server Error!" });
      }
   } else {
      res.status(401).json({ msg: "Unauthorized access!" });
   }
});

module.exports = router;
