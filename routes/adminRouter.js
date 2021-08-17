const express = require('express');
const router = express.Router();
const passport = require('passport');
const middleware = require('../middlewares/middleware');
const validation = require('../middlewares/validation')

var ctradmin = require("../src/controllers/adminController")


router.get("/signup",validation, ctradmin.adminSignup);

router.post("/signin", ctradmin.adminSignin);

router.get("/profile",passport.authenticate("jwt", {session:false}),middleware, ctradmin.adminProfile);

router.get("/books",passport.authenticate("jwt", {session:false}),middleware, ctradmin.books);

router.post("/add-book",passport.authenticate("jwt", {session:false}),middleware, ctradmin.addBook);

router.post("/update-book/:id",passport.authenticate("jwt", {session:false}),middleware, ctradmin.updateBook);

router.get("/delete-book/:id",passport.authenticate("jwt", {session:false}),middleware, ctradmin.deleteBook);

router.post("/profile-delete",passport.authenticate("jwt", {session:false}),middleware, ctradmin.profileDelete);

router.get("/signout",passport.authenticate("jwt", {session:false}),middleware, ctradmin.adminSignout);

router.get("/user-details/:id",passport.authenticate("jwt", {session:false}),middleware, ctradmin.userDetails);

router.post("/user-card-update/:id",passport.authenticate("jwt", {session:false}),middleware, ctradmin.userCardUpdate);

router.get("/all-user",passport.authenticate("jwt", {session:false}),middleware, ctradmin.allUsers);

router.get("/book-issued/:id",passport.authenticate("jwt", {session:false}),middleware, ctradmin.bookIssued);

router.get("/all-book-issued",passport.authenticate("jwt", {session:false}),middleware, ctradmin.allBookIssued);

module.exports = router;