const express = require("express");
const multer = require("multer");
const firebaseAdmin = require("firebase-admin");
const router = express.Router();
const ProfileModel = require("../../models/UserProfile");
const GetUid = require("../../middlewares/GetUid");
require("dotenv").config();

firebaseAdmin.initializeApp({
   credential: firebaseAdmin.credential.cert(
      require("../../jobnow-95279-firebase-adminsdk-t7sv8-9a9d469b9c.json")
   ),
   storageBucket: process.env.storageBucket,
});

const bucket = firebaseAdmin.storage().bucket();

// Configure Multer to store file in memory temporarily
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

//--------------------Function to save the file in Firebase bucket------
const uploadFilesToFireBase = async (file, destination) => {
   const blob = bucket.file(destination); // create a file in bucket,(initially it would be empty )

   //Set up the writable stream (It acts as a pipe throw which we can pass the data to fill the blob(or file))
   const blobStream = blob.createWriteStream({
      metadata: {
         contentType: file.mimetype,
      },
   });

   //throw error if something wrong happens in further process
   blobStream.on("error", () => {
      throw new Error("Upload failed!");
   });

   blobStream.end(file.buffer); // Writes the data into the blob, using blobStream

   //---Make sure that data is completely filled, and it is ready for access---
   await new Promise((resolve, reject) => {
      blobStream.on("finish", async () => {
         await blob.makePublic();
         resolve();
      });
   });

   // Finally return the URL of that file
   return `https://storage.googleapis.com/${bucket.name}/${destination}`;
};

//--------------------------To upload profile pic-------------------------
router.post("/profilePic", GetUid, upload.single("profilePic"), async (req, res) => {
   try {
      const file = req.file;
      if (!file) {
         return res.status(400).json({ msg: "File not set properly" });
      }

      //Check if the user has already saved some data
      const user = await ProfileModel.findOne({ uid: req.uid });

      if (user) {
         if (user.profile) {
            let oldProfilePic = user.profile.split(`${bucket.name}/`)[1];
            //Delete the older profile pic
            await bucket.file(oldProfilePic).delete();
         }
         //upload the new profile pic
         const profilePicURL = file
            ? await uploadFilesToFireBase(file, `profilePics/${Date.now()}_${file.originalname}`)
            : null;

         //Save the new profile pic link
         let response = await ProfileModel.findOneAndUpdate(
            { uid: req.uid },
            { profile: profilePicURL },
            { new: true }
         );
         res.status(200).json({ msg: "Profile picture updated!", profileDetails: response });
      } else {
         //Upload profile pic
         const profilePicURL = file
            ? await uploadFilesToFireBase(file, `profilePics/${Date.now()}_${file.originalname}`)
            : null;

         //Save profile pic link
         const response = await ProfileModel.create([{ uid: req.uid, profile: profilePicURL }]);
         res.status(200).json({ msg: "Profile picture saved", profileDetails: response });
      }
   } catch (error) {
      console.log(error);
      res.status(500).json({ msg: "Internal Server Error" });
   }
});

//-----------------------------To upload Resume------------------------
router.post("/resume", GetUid, upload.single("resume"), async (req, res) => {
   try {
      const file = req.file;
      if (!file) {
         return res.status(400).json({ msg: "File not set properly" });
      }

      //Check if the user has already saved some data
      const user = await ProfileModel.findOne({ uid: req.uid });

      if (user) {
         if (user.resume) {
            let oldResumeLink = user.resume.split(`${bucket.name}/`)[1];
            await bucket.file(oldResumeLink).delete();
         }
         const resumeURL = file
            ? await uploadFilesToFireBase(file, `resumes/${Date.now()}_${file.originalname}`)
            : null;

         //Save the new profile pic link
         let response = await ProfileModel.findOneAndUpdate(
            { uid: req.uid },
            { resume: resumeURL },
            { new: true }
         );
         res.status(200).json({ msg: "Resume updated!", profileDetails: response });
      } else {
         const resumeURL = file
            ? await uploadFilesToFireBase(file, `resumes/${Date.now()}_${file.originalname}`)
            : null;

         //Save profile pic link
         const response = await ProfileModel.create([{ uid: req.uid, resume: resumeURL }]);
         res.status(200).json({ msg: "Resume saved", profileDetails: response });
      }
   } catch (error) {
      console.log(error);
      res.status(500).json({ msg: "Internal Server Error", error });
   }
});

module.exports = router;
