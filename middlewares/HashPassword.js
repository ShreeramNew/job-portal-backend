const bcrypt=require("bcrypt");
const passwordHasher=(req,res,next)=>{
    const {email,password}=req.body;
    if(email&&password){
        //Hash the password and replace the original password with hashed password
        bcrypt.hash(password,10,(err,hashed)=>{
            if(err){
                res.status(500).json({msg:"Internal Server Error"});
            }else{
                req.body.password=hashed;
                next();
            }
        })
    }else{
        res.status(400).json({msg:"Email and Password must be provided"});
    }
}

module.exports=passwordHasher;