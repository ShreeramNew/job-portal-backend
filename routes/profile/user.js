const express = require("express");
const multer = require("multer");
const firebaseAdmin = require("firebase-admin");
const router = express.Router();
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

//--------------------------To upload profile pic------------------------
router.post("/profilePic", upload.single("profilePic"), async (req, res) => {
   try {
      const files = req.files;
      if (!files) {
         return;
      }
      const profilePic = files["profilePic"] ? files["profilePic"][0] : null;

      const profilePicURL = profilePic
         ? await uploadFilesToFireBase(
              profilePic,
              `profilePics/${Date.now()}_${profilePic.originalname}`
           )
         : null;
      res.status(200).json({ msg: "Saved to Firebase", profilePicURL, resumeURL });
   } catch (error) {
      res.status(500).json({ msg: "Internal Server Error" });
   }
});

//-----------------------------To upload Resume------------------------
router.post("/resume", upload.single("resume"), async (req, res) => {
   try {
      const files = req.files;
      if (!files) {
         return;
      }
      const resume = files["resume"] ? files["resume"][0] : null;

      const resumeURL = resume
         ? await uploadFilesToFireBase(resume, `resumes/${Date.now()}_${resume.originalname}`)
         : null;
      res.status(200).json({ msg: "Saved to Firebase", profilePicURL, resumeURL });
   } catch (error) {
      res.status(500).json({ msg: "Internal Server Error" });
   }
});

module.exports = router;
