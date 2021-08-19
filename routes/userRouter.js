const express = require('express');
const router = express.Router();
const passport = require('passport');
const middleware = require('../middlewares/middleware');
const validation = require('../middlewares/validation');

var ctruser = require("../src/controllers/userController");

router.post("/signup",validation, ctruser.userSignup);

router.post("/signin", ctruser.userSignin);

router.get("/profile",passport.authenticate("jwt-2", {session:false}),middleware, ctruser.userProfile);

router.post("/delete-user",passport.authenticate("jwt-2", {session:false}),middleware, ctruser.userDelete);

router.get("/signout",passport.authenticate("jwt-2", {session:false}),middleware, ctruser.userSignout);

router.get("/all-books",passport.authenticate("jwt-2", {session:false}),middleware, ctruser.allBooks);

router.get("/book-issue/:id",passport.authenticate("jwt-2", {session:false}),middleware, ctruser.bookIssue);

router.get("/book-submit/:id",passport.authenticate("jwt-2", {session:false}),middleware, ctruser.bookSubmit);

module.exports = router;
