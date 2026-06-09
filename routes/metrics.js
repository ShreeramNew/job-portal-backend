const express = require("express");
const pidusage = require("pidusage");
const { createClient } = require("redis");

const router = express.Router();

// 🔌 1. Initialize and connect the Redis client connection
const redisClient = createClient();
redisClient.on("error", (err) => console.error("❌ Redis Client Error:", err));
redisClient.connect().then(() => console.log("💾 PulseOps Memory Core: Connected to Redis Successfully"));

// 🚀 MIDDLEWARE: Captures traffic and increments cloud-resilient values
const apmMiddleware = async (req, res, next) => {
  try {
    // 🛡️ SAFETEY SHIELD: If the request is looking for metrics, logs, or analytics,
    // bail out immediately so we don't count our own scraper infrastructure!
    if (
      req.originalUrl.includes("/api/metrics") || 
      req.originalUrl.includes("/api/logs") ||
      req.originalUrl.includes("/api/analytics")
    ) {
      return next(); 
    }

    const start = process.hrtime.bigint();
    await redisClient.incr("pulseops:totalRequests");

    res.on("finish", async () => {
      const end = process.hrtime.bigint();
      const elapsedNs = end - start;
      await redisClient.incrBy("pulseops:totalResponseTimeNs", Number(elapsedNs));

      if (res.statusCode >= 400) {
        await redisClient.incr("pulseops:totalErrors");
      }
    });
  } catch (err) {
    console.error("Redis tracking failure:", err);
  }
  next();
};

// 📥 GET /api/metrics - Reads values dynamically from Redis cache
router.get("/", async (req, res) => {
  try {
    const stats = await pidusage(process.pid);

    // 2. Pull all counters from Redis in parallel
    const [rawRequests, rawErrors, rawTimeNs] = await Promise.all([
      redisClient.get("pulseops:totalRequests"),
      redisClient.get("pulseops:totalErrors"),
      redisClient.get("pulseops:totalResponseTimeNs")
    ]);

    // Parse values into numbers (Redis stores everything as strings or numbers)
    const totalRequests = Number(rawRequests) || 0;
    const totalErrors = Number(rawErrors) || 0;
    const totalResponseTimeNs = BigInt(rawTimeNs || 0);

    // Calculate metrics averages
    const avgLatencyMs = totalRequests > 0 
      ? Number(totalResponseTimeNs / BigInt(totalRequests)) / 1000000 
      : 0;

    const errorRatePercentage = totalRequests > 0 
      ? parseFloat(((totalErrors / totalRequests) * 100).toFixed(2)) 
      : 0;

    return res.status(200).json({
      success: true,
      timestamp: new Date().toISOString(),
      metrics: {
        cpuUsagePercentage: parseFloat(stats.cpu.toFixed(2)),
        memoryUsageMB: parseFloat((stats.memory / (1024 * 1024)).toFixed(2)),
        uptimeSeconds: Math.floor(process.uptime()),
        totalRequests,
        avgLatencyMs: parseFloat(avgLatencyMs.toFixed(2)),
        errorRatePercentage
      }
    });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = {
  router,
  apmMiddleware
};