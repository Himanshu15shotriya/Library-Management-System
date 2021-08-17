const express = require('express');
const mongoose = require('mongoose');
const passport = require('passport');
const dotenv = require('dotenv');
dotenv.config({path : "./config/dev.env"})

const app = express();

mongoose.connect(process.env.URL, {useUnifiedTopology: true, useNewUrlParser: true,useFindAndModify : false});

app.use(express.json());
app.use(
  express.urlencoded({
    extended: true,
  })
);

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header(
    'Access-Control-Allow-Methods',
    'GET,HEAD,OPTIONS,POST,PUT,PATCH,DELETE'
  );
  res.header(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept, Authorization'
  );
  next();
});

//static folder
// app.use('/public',express.static("./public/"));

//bring all routes
const Admin = require('./routes/adminRouter');
const User = require('./routes/userRouter');



//actual routes
app.use("/admin", Admin);
app.use("/user", User);
app.get("/",(req,res) => {
  res.send("Welcome")
})

//passport middleware
app.use(passport.initialize());



 
//config for jwt starategy
require("./strategy/jsonwtStrategy")(passport)

const port = process.env.PORT;

app.listen(port, () => {console.log(`app is running at port ${port}`)});