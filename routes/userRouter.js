const express = require('express');
const router = express.Router();
const passport = require('passport');
const middleware = require('../config/middleware');
const validation = require('../config/validation');

var ctruser = require("../src/controllers/userController");

router.post("/signup/:id",validation, ctruser.userSignup);

router.post("/signin", ctruser.userSignin);

router.get("/profile",passport.authenticate("jwt-2", {session:false}),middleware, ctruser.userProfile);

router.post("/delete-user",passport.authenticate("jwt-2", {session:false}),middleware, ctruser.userDelete);

router.get("/signout",passport.authenticate("jwt-2", {session:false}),middleware, ctruser.userSignout);

router.get("/all-books/:id",passport.authenticate("jwt-2", {session:false}),middleware, ctruser.allBooks);

router.get("/book-issue/:id",passport.authenticate("jwt-2", {session:false}),middleware, ctruser.bookIssue);

router.get("/book-submit/:id",passport.authenticate("jwt-2", {session:false}),middleware, ctruser.bookSubmit);

module.exports = router;