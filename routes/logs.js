const express = require("express");
const router = express.Router();
const fs = require("fs");
const path = require("path");

// GET /api/logs
router.get("/", (req, res) => {
  // Path where PM2 stores the real-time standard error logs on your EC2 instance
  const logFilePath = path.join("/home/ubuntu/.pm2/logs/job-portal-api-error.log");

  // Safety check: if PM2 hasn't caught any errors yet, the file won't exist
  if (!fs.existsSync(logFilePath)) {
    return res.status(200).json({
      success: true,
      logs: ["No error logs found. System running cleanly."]
    });
  }

  try {
    // Read the file synchronously and split it by lines
    const fileContent = fs.readFileSync(logFilePath, "utf-8");
    const lines = fileContent.trim().split("\n");
    
    // Get only the last 50 lines so we don't send a massive file across the network
    const last50Lines = lines.slice(-50);

    return res.status(200).json({
      success: true,
      linesCount: last50Lines.length,
      logs: last50Lines
    });
  } catch (error) {
    console.error(error)
    return res.status(500).json({
      success: false,
      error: "Failed to read system log stream",
      details: error.message
    });
  }
});

module.exports = router;