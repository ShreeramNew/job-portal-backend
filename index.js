const ConnectToMongo = require("./database");
const cors = require("cors");
const cookieParser = require("cookie-parser");
require("dotenv").config();
ConnectToMongo();

const express = require("express");
const app = express();
const port = process.env.PORT;

//---------Middlewares------------------------
app.use(cookieParser());
app.use(cors({ origin: "http://localhost:3001", credentials: true }));
app.use(express.json());

//-------------All APIs------------------------
app.use("/api/login", require("./routes/Login"));
app.use("/api/signup", require("./routes/SignUp"));
app.use("/api/onboarding/employer",require("./routes/onboarding/employer"));
app.use("/api/postJob",require("./routes/jobs/PostJob"));
app.use("/api/getJobs/employer",require("./routes/jobs/PostJob"));



app.listen(port, () => {
   console.log("Ready to listen!");
});
