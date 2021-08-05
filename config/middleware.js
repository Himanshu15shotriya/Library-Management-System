module.exports = (req,res,next)=>{
    if(req.user.token === req.headers.authorization){
        return next();
    }else{
        res.json("Please Login First")
    }
}