require('dotenv').config();
const mongoose=require('mongoose');
const ConnectToMongo=async ()=>{
    await mongoose.connect(process.env.DB_CONNECTION_URI);
    console.log("Connected!");
}

module.exports=ConnectToMongo;