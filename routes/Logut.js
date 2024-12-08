const express = require("express");
const router = express.Router();

router.post("/", (req, res) => {
   res.cookie("authToken", "", {
      httpOnly: true,
      sameSite: "None",
      secure: true,
      path: "/",
      expires: new Date(0), // Set expiration date to the past
   });
   res.status(200).json({ message: "Logged out successfully" });
});

module.exports = router;
