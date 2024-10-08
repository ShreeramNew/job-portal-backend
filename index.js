const ConnectToMongo = require("./database");
require("dotenv").config();
ConnectToMongo();
const cors = require("cors");

const express = require("express");
const app = express();
const port = process.env.PORT;

app.use(cors({ origin: "*", credentials: true }));
app.use(express.json());
app.use("/login", require("./routes/Login"));
app.use("/signup", require("./routes/SignUp"));

app.listen(port, () => {
   console.log("Ready to listen!");
});
