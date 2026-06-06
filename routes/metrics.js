const express = require("express");
const router = express.Router();
const pidusage = require("pidusage");

// GET /api/metrics
router.get("/", async (req, res) => {
  try {
    // Collect immediate CPU and Memory stats for the active Node process
    const stats = await pidusage(process.pid);

    return res.status(200).json({
      success: true,
      timestamp: new Date().toISOString(),
      metrics: {
        // stats.cpu is a percentage (e.g., 2.5 means 2.5% CPU utilization)
        cpuUsagePercentage: parseFloat(stats.cpu.toFixed(2)),
        // stats.memory is in bytes, converting it to Megabytes (MB) for clean display
        memoryUsageMB: parseFloat((stats.memory / (1024 * 1024)).toFixed(2)),
        uptimeSeconds: Math.floor(process.uptime()),
      }
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: "Failed to collect process metrics",
      details: error.message
    });
  }
});

module.exports = router;