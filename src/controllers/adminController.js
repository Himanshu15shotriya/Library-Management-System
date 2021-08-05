const bcrypt = require('bcryptjs');
const jsonwt = require('jsonwebtoken');
const key = require('../../setup/myurl');
const _ = require('lodash');

//models
const Admin = require('../models/Admins');
const Book = require('../models/Books')
const User = require('../models/Users');


// @type     POST
// @route    /admin/signup
// @desc     route for signup of admins.
// @access   PUBLIC
module.exports.adminSignup = (req, res) => {
    Admin.findOne({
            email: req.body.email
        })
        .then(profile => {
            if (profile) {
                res.status(400).json({
                    success: false,
                    message: `${req.body.email} is already Registerd`
                })
            } else {
                newAdmin = new Admin({
                    libraryname: req.body.libraryname,
                    email: req.body.email,
                    password: req.body.password,
                    confirmpassword: req.body.confirmpassword,

                })
                if (req.body.password === req.body.confirmpassword) {
                    bcrypt.genSalt(10, (err, salt) => {
                        bcrypt.hash(newAdmin.password, salt, (err, hash) => {
                            if (err) throw err;
                            newAdmin.password = hash;
                            newAdmin
                                .save()
                                .then(profile => {
                                    if (profile) {
                                        res.status(200).json({
                                            success: true,
                                            message: `SignUp successfull with ${req.body.email}`,
                                            profile
                                        })
                                    }
                                })
                                .catch(err => res.status(400).json({
                                    success: false,
                                    message: err.message
                                }))
                        })
                    })
                } else {
                    res.status(400).json({
                        success: false,
                        message: "Password and confirm password are not matched"
                    })
                }
            }
        })
        .catch(err => res.status(400).json({
            success: false,
            message: err.message
        }))
}


// @type     POST
// @route    /admin/signin
// @desc     route for sign of admins.
// @access   PUBLIC 
module.exports.adminSignin = (req, res) => {
    var password = req.body.password
    Admin.findOne({
            email: req.body.email
        })
        .then(admin => {
            if (!admin) {
                res.status(400).json({
                    success: false,
                    message: `Admin does not exist with ${req.body.email}`
                })
            } else {
                bcrypt.compare(password, admin.password)
                    .then(isCorrect => {
                        if (!isCorrect) {
                            res.status(400).json({
                                success: false,
                                message: "Please Enter Correct Password"
                            })
                        } else {
                            const payload = {
                                id: admin.id,
                                email: admin.email
                            }
                            jsonwt.sign(
                                payload,
                                key.secret, {
                                    expiresIn: 3600
                                }, (err, token) => {
                                    if (err) {
                                        res.status(400).json({
                                            success: false,
                                            message: "Token error"
                                        })
                                    } else {
                                        Admin.findOneAndUpdate({
                                                email: req.body.email
                                            }, {
                                                token: "Bearer " + token
                                            })
                                            .then(admin => {
                                                if (admin) {
                                                    res.status(200).json({
                                                        success: true,
                                                        message: `Login successfull with ${req.body.email}`,
                                                        token: "Bearer " + token
                                                    })
                                                }
                                            })
                                            .catch(err => res.status(400).json({
                                                success: false
                                            }, err.message))
                                    }
                                }
                            )
                        }
                    })
                    .catch(err => res.status(400).json({
                        success: false
                    }, err.message))
            }
        })
        .catch(err => res.status(400).json({
            success: false,
            message: err.message
        }))
}


// @type     GET
// @route    /admin/profile
// @desc     route for profile of admin.
// @access   PRIVATE
module.exports.adminProfile = (req, res) => {
    Admin.findOne({
            _id: req.user.id
        })
        .then(profile => {
            if (profile) {
                res.json({
                    id: req.user.id,
                    libraryname: req.user.libraryname,
                    email: req.user.email
                })
            } else {
                res.status(400).json({
                    success: false,
                    message: "No profile found"
                })
            }
        })
        .catch(err => res.status(400).json({
            success: false
        }, err.message))
}


// @type     GET
// @route    /admin/books
// @desc     route for getting books details of admin.
// @access   PRIVATE
module.exports.books = (req, res) => {
    Book.find({
            admin: req.user.id
        })
        .then(books => {
            if (books) {
                res.status(200).json({
                    success: true,
                    books
                })
            } else {
                res.status(400).json({
                    success: false,
                    message: "No Books Found"
                })
            }
        })
        .catch(err => res.status(400).json({
            success: false
        }, err.message))
}


// @type     POST
// @route    /admin/add-book
// @desc     route for adding books.
// @access   PRIVATE
module.exports.addBook = (req, res) => {
    Book.findOne({
            admin : req.user.id,
            bookname: req.body.bookname
        })
        .then(book => {
            if (book) {
                res.status(400).json({
                    success: false,
                    message: "This book is already added to the list Please update the Quantity!"
                })
            } else {
                const bookDetails = {}
                bookDetails.admin = req.user.id;
                if (req.body.bookname) bookDetails.bookname = req.body.bookname;
                if (req.body.bookquantity) bookDetails.bookquantity = req.body.bookquantity;

                Book.findOne({
                        _id: req.user.id
                    })
                    .then(profile => {
                        new Book(bookDetails).save()
                            .then(books => {
                                if (books) {
                                    res.status(200).json({
                                        success: true,
                                        message: "Book added to the list successfully"
                                    })
                                } else {
                                    res.status(400).json({
                                        success: false,
                                        message: "error in adding book"
                                    })
                                }
                            })
                            .catch(err => res.status(400).json({
                                success: false
                            }, err.message))
                    })
                    .catch(err => res.status(400).json({
                        success: false
                    }, err.message))
            }
        })
        .catch(err => res.status(400).json({
            success: false
        }, err.message))
}


// @type     POST
// @route    /admin/update-book
// @desc     route for updating book details.
// @access   PRIVATE
module.exports.updateBook = (req, res) => {
    const bookDetailsUpdate = {}
    if (req.body.bookquantity) bookDetailsUpdate.bookquantity = req.body.bookquantity;

    Book.findOneAndUpdate({
            _id: req.params.id
        }, {
            $set: bookDetailsUpdate
        })
        .then(book => {
            if (book) {
                res.status(200).json({
                    success: true,
                    message: "Book Quantity Updated Successfully"
                })
            } else {
                res.status(400).json({
                    success: false,
                    message: "Error in updatation"
                })
            }
        })
        .catch(err => res.status(400).json({
            success: false
        }, err.message))
}


// @type     GET
// @route    /admin/delete-book
// @desc     route for deleting book details.
// @access   PRIVATE
module.exports.deleteBook = (req, res) => {
    Book.findOneAndRemove({
            _id: req.params.id
        })
        .then(book => {
            if (book) {
                res.status(200).json({
                    success: true,
                    message: "Books Deleted Successfully"
                })
            } else {
                res.status(400).json({
                    success: false,
                    message: "Error in deleting book"
                })
            }
        })
        .catch(err => res.status(400).json({
            success: false
        }, err.message))
}


// @type     GET
// @route    /admin/profile-delete
// @desc     route for delete profile of admin.
// @access   PRIVATE
module.exports.profileDelete = (req, res) => {
    Admin.findOne({
            _id: req.user.id
        })
        .then(profile => {
            var password = req.body.password;
            if (profile) {
                bcrypt.compare(password, profile.password)
                    .then(isCorrect => {
                        if (isCorrect) {
                            Admin.findOneAndRemove({
                                    _id: req.user.id
                                })
                                .then(profile => {
                                    if (profile) {
                                        res.json({
                                            success: true,
                                            Message: `Account Registered With ${req.user.email} has been deleted successfully`,
                                        })
                                    } else {
                                        res.status(400).json({
                                            success: false,
                                            Message: "Some Error In Deleting Account",
                                        })
                                    }
                                })
                                .catch(err => res.status(400).json({
                                    success: false,
                                    Message: err.message,
                                }))
                        } else {
                            res.status(400).json({
                                success: false,
                                Message: "Please Enter correct Password.",
                            })
                        }
                    })
                    .catch(err => res.status(400).json({
                        success: false,
                        Message: err.message,
                    }))
            }
        })
        .catch(err => res.json({
            success: false,
            Message: err.message,
        }));

}


// @type     GET
// @route    /admin/signout
// @desc     route for signout from profile of admin.
// @access   PRIVATE
module.exports.adminSignout = (req, res) => {
    Admin.findOne({
            _id: req.user.id
        })
        .then(profile => {
            if (!profile) {
                res.json({
                    success: false,
                    message: "Profile Not found."
                })
            } else {
                Admin.findOneAndUpdate({
                    _id: req.user.id
                })
                const tokenreset = {
                    token: ''
                }
                profile = _.extend(profile, tokenreset)
                profile.save((err, profile) => {
                    if (err) {
                        res.json({
                            success: false,
                            message: "Error In Sign Out"
                        })
                    } else {
                        res.json({
                            success: true,
                            message: `You have logged out successfully from ${req.user.email}`
                        })
                    }
                })
            }
        })
        .catch(err => res.json("err1"))
}


// @type     GET
// @route    /admin/all-user
// @desc     route for getting all user list
// @access   PRIVATE
module.exports.allUsers = (req, res) => {
    User.find({
            admin: req.user.id
        })
        .then(user => {
            if (user) {
                res.status(400).json({
                    success: true,
                    user
                })
            } else {
                res.status(400).json({
                    success: false,
                    message: "No users found"
                })
            }
        })
        .catch(err => res.status(400).json({
            success: false,
            message: err.message
        }))
}


// @type     GET
// @route    /admin/book-issued
// @desc     route for getting particular book details
// @access   PRIVATE
module.exports.bookIssued = (req, res) => {
    Bookissue.find({
            bookid: req.params.id
        })
        .then(books => {
            if (books) {
                res.status(200).json({
                    success: true,
                    books
                })
            } else {
                res.status(400).json({
                    success: false,
                    message: "No books found"
                })
            }
        })
        .catch(err => res.status(400).json({
            success: false,
            message: err.message
        }))
}


// @type     GET
// @route    /admin/all-book-issued
// @desc     route for getting all issued book details
// @access   PRIVATE
module.exports.allBookIssued = (req, res) => {
    Bookissue.find({
            admin: req.user.id
        })
        .then(admin => {
            if (admin) {
                res.status(200).json({
                    success: true,
                    issuedbooks: admin
                })
            } else {
                res.status(404).json({
                    success: false,
                    message: err.message
                })
            }
        })
        .catch(err => res.status(400).json({
            success: false,
            message: err.message
        }))
}


// @type     GET
// @route    /admin/user-details/:id
// @desc     route for getting details of particular user
// @access   PRIVATE
module.exports.userDetails = (req, res) => {
    User.findOne({
            _id: req.params.id
        })
        .then(user => {
            if (user) {
                Bookissue.find({
                        user: req.params.id
                    })
                    .then(books => {
                        if (books) {
                            res.status(200).json({
                                success: true,
                                user: {
                                    admin: user.admin,
                                    user: user.id,
                                    name: user.name,
                                    email: user.email,
                                    mobile: user.mobile,
                                    cards: user.card
                                },
                                issuedbooks: books
                            })
                        } else {
                            res.status(400).json({
                                success: false,
                                message: "No books found"
                            })
                        }
                    })
                    .catch(err => res.status(400).json({
                        success: false,
                        message: err.message
                    }))
            } else {
                res.status(400).json({
                    success: false,
                    message: "User not found"
                })
            }
        })
        .catch(err => res.status(400).json({
            success: false,
            message: err.message
        }))
}


// @type     POST
// @route    /admin/user-card-book
// @desc     route for updating user card details.
// @access   PRIVATE
module.exports.userCardUpdate = (req,res) => {
    const cardUpdate = {}
    if(req.body.card) cardUpdate.card = req.body.card
    User.findOneAndUpdate(
        {_id :req.params.id},
        {$set : cardUpdate},
        {new : true},
        )
        .then((user) => {
            if(!user){
                response.status(400).json({
                    success : false ,
                    message :"Error in updating card"
                })
            }
            else{
                res.status(200).json({
                    success : true,
                    message : "Card update successfully"
                })
            }
        })
        .catch(err => res.status(400).json({
            success: false,
            message: err.message
        }))
}