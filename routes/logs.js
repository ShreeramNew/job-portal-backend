const express = require("express");
const router = express.Router();
const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

// GET /api/logs
router.get("/", (req, res) => {
  const logFilePath = "/home/ubuntu/.pm2/logs/job-portal-api-error.log";

  // Safety check: if the file doesn't exist yet, return clean
  if (!fs.existsSync(logFilePath)) {
    return res.status(200).json({
      success: true,
      logs: ["No error logs found. System running cleanly."]
    });
  }

  try {
    // MAANG Optimization: Use native Linux 'tail' to read the last 500 lines instantly
    // This streams data straight from the kernel instead of loading a massive file into Node memory
    const rawLogs = execSync(`tail -n 500 ${logFilePath}`, { encoding: "utf-8" });
    
    // Split lines and filter out any trailing empty spaces
    const logLines = rawLogs.trim().split("\n");

    return res.status(200).json({
      success: true,
      linesCount: logLines.length,
      logs: logLines
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: "Failed to stream system log trail",
      details: error.message
    });
  }
});

module.exports = router;