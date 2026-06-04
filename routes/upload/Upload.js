const express = require("express");
const multer = require("multer");
const firebaseAdmin = require("firebase-admin");
const router = express.Router();
const ProfileModel = require("../../models/UserProfile");
const GetUid = require("../../middlewares/GetUid");
require("dotenv").config();

// Initialize Firebase Admin only if not already initialized
if (!firebaseAdmin.apps.length) {
  firebaseAdmin.initializeApp({
    credential: firebaseAdmin.credential.cert({
      type: process.env.FIREBASE_TYPE,
      project_id: process.env.FIREBASE_PROJECT_ID,
      private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
      private_key: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n"),
      client_email: process.env.FIREBASE_CLIENT_EMAIL,
      client_id: process.env.FIREBASE_CLIENT_ID,
      auth_uri: process.env.FIREBASE_AUTH_URI,
      token_uri: process.env.FIREBASE_TOKEN_URI,
      auth_provider_x509_cert_url:
        process.env.FIREBASE_AUTH_PROVIDER_X509_CERT_URL,
      client_x509_cert_url: process.env.FIREBASE_CLIENT_X509_CERT_URL,
    }),
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  });
}

const bucket = firebaseAdmin.storage().bucket();

// Configure Multer to store file in memory
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
});

//--------------------Helper Function: Upload to Firebase-------------------------
const uploadFilesToFireBase = (file, destination) => {
  return new Promise((resolve, reject) => {
    const blob = bucket.file(destination);
    const blobStream = blob.createWriteStream({
      metadata: {
        contentType: file.mimetype,
      },
    });

    // Use reject() instead of throw to prevent server crash
    blobStream.on("error", (error) => {
      console.error("Firebase upload error:", error);
      reject(error);
    });

    blobStream.on("finish", async () => {
      try {
        // Make the file public so it's accessible via URL
        await blob.makePublic();
        const publicUrl = `https://storage.googleapis.com/${bucket.name}/${destination}`;
        resolve(publicUrl);
      } catch (err) {
        reject(err);
      }
    });

    blobStream.end(file.buffer);
  });
};

//--------------------------Route: Upload Profile Pic-------------------------
router.post(
  "/profilePic",
  GetUid,
  upload.single("profilePic"),
  async (req, res) => {
    try {
      const file = req.file;
      if (!file) {
        return res.status(400).json({ msg: "No image file provided" });
      }

      const user = await ProfileModel.findOne({ uid: req.uid });

      // If user already has a profile pic, delete the old one from Firebase
      if (user && user.profile) {
        try {
          const oldFileName = user.profile.split(`${bucket.name}/`)[1];
          if (oldFileName) await bucket.file(oldFileName).delete();
        } catch (err) {
          console.log("Old file delete failed (may not exist), continuing...");
        }
      }

      const destination = `profilePics/${Date.now()}_${file.originalname}`;
      const profilePicURL = await uploadFilesToFireBase(file, destination);

      const response = await ProfileModel.findOneAndUpdate(
        { uid: req.uid },
        { profile: profilePicURL },
        { new: true, upsert: true }, // upsert: true creates it if it doesn't exist
      );

      res
        .status(200)
        .json({ msg: "Profile picture updated!", profileDetails: response });
    } catch (error) {
      console.error(error);
      res
        .status(500)
        .json({ msg: "Internal Server Error during image upload" });
    }
  },
);

//-----------------------------Route: Upload Resume------------------------
router.post("/resume", GetUid, upload.single("resume"), async (req, res) => {
  try {
    const file = req.file;
    if (!file) {
      return res.status(400).json({ msg: "No resume file provided" });
    }

    const user = await ProfileModel.findOne({ uid: req.uid });

    // Delete old resume if it exists
    if (user && user.resume) {
      try {
        const oldResumeName = user.resume.split(`${bucket.name}/`)[1];
        if (oldResumeName) await bucket.file(oldResumeName).delete();
      } catch (err) {
        console.log("Old resume delete failed, continuing...");
      }
    }

    const destination = `resumes/${Date.now()}_${file.originalname}`;
    const resumeURL = await uploadFilesToFireBase(file, destination);

    const response = await ProfileModel.findOneAndUpdate(
      { uid: req.uid },
      { resume: resumeURL },
      { new: true, upsert: true },
    );

    res.status(200).json({ msg: "Resume updated!", profileDetails: response });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Internal Server Error during resume upload" });
  }
});

module.exports = router;
