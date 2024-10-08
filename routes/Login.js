const express=require("express");
const router=express.Router();

router.get("/",(req,res)=>{
    res.json({name:"shreeram"})
})

module.exports=router;