const ConnectToMongo = require("./database");
const cors = require("cors");
const cookieParser = require("cookie-parser");
require("dotenv").config();
ConnectToMongo();

const express = require("express");
const app = express();
const port = process.env.PORT;

//-----------------------------------Middlewares----------------------------------------
app.use(cookieParser());
app.use(cors({ origin: "http://localhost:3001", credentials: true }));
app.use(express.json());

app.listen(port, () => {
   console.log("Ready to listen!");
});

//=====================================All endpoints=====================================

//-----------------------------------Post Requests---------------------------------------
app.use("/api/login", require("./routes/Login"));
app.use("/api/signup", require("./routes/SignUp"));
app.use("/api/postJob", require("./routes/jobs/PostJob"));
app.use("/api/getJobs/employer", require("./routes/jobs/PostJob"));
app.use("/api/onboarding/employer", require("./routes/profile/employer"));
app.use("/api/onboarding/user", require("./routes/profile/user"));
app.use("/api/upload", require("./routes/upload/Upload"));

//-----------------------------------Patch Requests---------------------------------------
app.use("/api/editProfile/employer", require("./routes/profile/employer"));
app.use("/api/EditJobDetails", require("./routes/jobs/PerticularJob"));

//-----------------------------------Get Requests-----------------------------------------
app.use("/api/getProfile/employer", require("./routes/profile/employer"));
app.use("/api/getJobDetails", require("./routes/jobs/PerticularJob"));
app.use("/api/getProfile/user", require("./routes/profile/user"));
app.use("/api/getJobs", require("./routes/jobs/FetchJobs"));

//-----------------------------------Delete Requests---------------------------------------
app.use("/api/deleteJob", require("./routes/jobs/PerticularJob"));
