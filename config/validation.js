module.exports = (req,res,next) => {
    if((req.body.email.includes("@")) && req.body.email.includes(".")){
        if((req.body.password).length>6){
            return next()
        }else{
            res.status(400).json({
                success : false,
                message : "Password must be at least 6 characters"
            })
        }
    }else{
        res.status(400).json({
            success: false,
            message : "Email must includes '@' and '.'" 
        })
    }
}