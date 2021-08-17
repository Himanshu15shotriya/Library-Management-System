const JwtStrategy = require("passport-jwt").Strategy;
const ExtractJwt = require("passport-jwt").ExtractJwt;
const mongoose = require('mongoose');
const Admin = mongoose.model("myAdmin");
const User = mongoose.model("myUser")


var opts = {}
opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
opts.secretOrKey = process.env.secret;


module.exports = passport =>{
    passport.use(new JwtStrategy(opts,(jwt_payload,done)=>{
        Admin.findById(jwt_payload.id)
        .then(admin =>{
            if(admin){
                return done(null,admin);
            }
            return done(null,false)
        })
        .catch(err => console.log(err));
    }));
    passport.use("jwt-2",new JwtStrategy(opts,(jwt_payload,done)=>{
        User.findById(jwt_payload.id)
        .then(user =>{
            if(user){
                return done(null,user);
            }
            return done(null,false)
        })
        .catch(err => console.log(err));
    }));
}

