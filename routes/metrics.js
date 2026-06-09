const express = require("express");
const pidusage = require("pidusage");
const { createClient } = require("redis");

const router = express.Router();

const redisClient = createClient({ RESP: 2 });
redisClient.on("error", (err) => console.error("❌ Redis Client Error:", err));
redisClient.connect().then(() => console.log("💾 PulseOps Memory Core: Connected to Redis Successfully"));

const apmMiddleware = async (req, res, next) => {
  try {
    const originalUrl = req.originalUrl || req.url;

    // 🛡️ SAFETY SHIELD: Do not log telemetry endpoints to avoid infinite recursion loops!
    if (
      originalUrl.includes("/api/metrics") || 
      originalUrl.includes("/api/logs") ||
      originalUrl.includes("/api/analytics")
    ) {
      return next();
    }

    const start = process.hrtime.bigint();
    
    // Clean and normalize path formatting (e.g., /api/getJobs)
    const routeKey = `${req.method}:${req.baseUrl}${req.path}`.replace(/\/$/, "");

    // 1. Increment Global Ticker
    await redisClient.incr("pulseops:totalRequests");

    res.on("finish", async () => {
      const end = process.hrtime.bigint();
      const elapsedNs = end - start;
      const elapsedMs = Number(elapsedNs) / 1000000; // Convert nanoseconds to clean milliseconds

      // 2. Global Aggregations
      await redisClient.incrBy("pulseops:totalResponseTimeNs", Number(elapsedNs));
      if (res.statusCode >= 400) {
        await redisClient.incr("pulseops:totalErrors");
      }

      // 3. 🔥 REAL PATH-SPECIFIC METRICS (Redis Hash Operations)
      // Store total hits and raw latency summation dynamically per endpoint
      await redisClient.hIncrBy("pulseops:routeHits", routeKey, 1);
      await redisClient.hIncrBy("pulseops:routeTime", routeKey, Math.round(elapsedMs));
    });
  } catch (err) {
    console.error("Redis tracking failure:", err);
  }
  next();
};

// 📥 GET /api/metrics - Upgraded data output pipeline
router.get("/", async (req, res) => {
  try {
    const stats = await pidusage(process.pid);

    // Pull down global aggregations alongside raw route distribution hashes in parallel
    const [rawRequests, rawErrors, rawTimeNs, allHits, allTimes] = await Promise.all([
      redisClient.get("pulseops:totalRequests"),
      redisClient.get("pulseops:totalErrors"),
      redisClient.get("pulseops:totalResponseTimeNs"),
      redisClient.hGetAll("pulseops:routeHits"),   // Returns object: { "GET:/api/getJobs": "12" }
      redisClient.hGetAll("pulseops:routeTime")    // Returns object: { "GET:/api/getJobs": "504" }
    ]);

    const totalRequests = Number(rawRequests) || 0;
    const totalErrors = Number(rawErrors) || 0;
    const totalResponseTimeNs = BigInt(rawTimeNs || 0);

    const avgLatencyMs = totalRequests > 0 
      ? Number(totalResponseTimeNs / BigInt(totalRequests)) / 1000000 
      : 0;

    const errorRatePercentage = totalRequests > 0 
      ? parseFloat(((totalErrors / totalRequests) * 100).toFixed(2)) 
      : 0;

    // 🔥 Compile Real-Time Route Profiles from Redis Hashes
    const routeBreakdown = Object.keys(allHits).map((key) => {
      const [method, path] = key.split(":");
      const hits = Number(allHits[key]) || 0;
      const totalTime = Number(allTimes[key]) || 0;
      return {
        method,
        path,
        hits,
        latencyMs: hits > 0 ? parseFloat((totalTime / hits).toFixed(1)) : 0
      };
    });

    return res.status(200).json({
      success: true,
      timestamp: new Date().toISOString(),
      metrics: {
        cpuUsagePercentage: parseFloat(stats.cpu.toFixed(2)),
        memoryUsageMB: parseFloat((stats.memory / (1024 * 1024)).toFixed(2)),
        uptimeSeconds: Math.floor(process.uptime()),
        totalRequests,
        avgLatencyMs: parseFloat(avgLatencyMs.toFixed(2)),
        errorRatePercentage,
        routes: routeBreakdown // ◄ Dynamic payload array sent to Scraper
      }
    });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

// Admin Flush Endpoint to clear route structures on request
router.post("/reset", async (req, res) => {
  try {
    await redisClient.del([
      "pulseops:totalRequests",
      "pulseops:totalErrors",
      "pulseops:totalResponseTimeNs",
      "pulseops:routeHits",
      "pulseops:routeTime"
    ]);
    return res.status(200).json({ success: true, message: "Telemetry profiles wiped cleanly." });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = {
  router,
  apmMiddleware
};