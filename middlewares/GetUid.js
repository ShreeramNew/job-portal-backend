const jwt = require("jsonwebtoken");
require("dotenv").config();
const getUid = async (req, res, next) => {
   let cookie = req.cookies;
   if (cookie?.authToken) {
      try {
         let payload = jwt.verify(cookie.authToken, process.env.JWT_PRIVATE_SIGN);
         if (payload.uid) {
            req.uid = payload.uid;
            next();
         } else {
            res.status(401).json({ msg: "Unauthorized access!" });
         }
      } catch (error) {
         res.status(401).json({ msg: "Unauthorized access!" });
      }
   } else {
      res.status(401).json({ msg: "Unauthorized access!" });
   }
};

module.exports = getUid;
