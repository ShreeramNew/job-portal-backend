// 1. Initial Configurations & Database Core Setup
require("dotenv").config();
const ConnectToMongo = require("./database");
ConnectToMongo();

const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const { apmMiddleware } = require("./routes/metrics");

const app = express();
// Ensure there is always a fallback port if your .env misbehaves on EC2
const port = process.env.PORT || 3000;

// 2. Global Safety Middlewares (MUST be declared first)
app.use(cookieParser());
app.use(express.json());
app.use(
  cors({
    origin: [
      "http://localhost:3001",
      "http://192.168.1.5:3001",
      "https://jobnow24.vercel.app",
    ],
    credentials: true,
  }),
);

app.use(apmMiddleware());

// 3. Base/Health Test Route
app.get("/", (req, res) => {
  return res.json({
    message: "Server is properly running with CORS enabled!",
  });
});

// 4. Mount All Feature Router Endpoints
// --- Post Requests ---
app.use("/api/login", require("./routes/Login"));
app.use("/api/signup", require("./routes/SignUp"));
app.use("/api/postJob", require("./routes/jobs/PostJob"));
app.use("/api/getJobs/employer", require("./routes/jobs/PostJob"));
app.use("/api/onboarding/employer", require("./routes/profile/employer"));
app.use("/api/onboarding/user", require("./routes/profile/user"));
app.use("/api/upload", require("./routes/upload/Upload"));
app.use("/api/logout", require("./routes/Logut"));

// --- Patch Requests ---
app.use("/api/editProfile/employer", require("./routes/profile/employer"));
app.use("/api/EditJobDetails", require("./routes/jobs/PerticularJob"));
app.use("/api/applyForJob", require("./routes/jobs/ApplyForJob"));
app.use("/api/saveApplicants", require("./routes/jobs/Applicants"));

// --- Get Requests ---
app.use("/api/metrics", require("./routes/metrics")); // Metrics exporter injection
app.use("/api/logs", require("./routes/logs")); // Logs exporter
app.use("/api/getProfile/employer", require("./routes/profile/employer"));
app.use("/api/getJobDetails", require("./routes/jobs/PerticularJob"));
app.use("/api/getProfile/user", require("./routes/profile/user"));
app.use("/api/getJobs", require("./routes/jobs/FetchJobs"));
app.use("/api/getApplicants", require("./routes/jobs/Applicants"));

// --- Delete Requests ---
app.use("/api/deleteJob", require("./routes/jobs/PerticularJob"));

// 5. Open Network Ingestion Gates (Always keep this at the very bottom)
app.listen(port, () => {
  console.log(`🚀 Production Server is cleanly running on port ${port}`);
});
