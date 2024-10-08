const ConnectToMongo = require("./database");
require("dotenv").config();
ConnectToMongo();
const cors = require("cors");

const express = require("express");
const app = express();
const port = process.env.PORT;

app.use(cors({ origin: "http://localhost:3001", credentials: true }));
app.use(express.json());
app.use("/api/login", require("./routes/Login"));
app.use("/api/signup", require("./routes/SignUp"));

app.listen(port, () => {
   console.log("Ready to listen!");
});
