const bcrypt = require('bcryptjs');
const jsonwt = require('jsonwebtoken');
const _ = require('lodash');

//models
const Admin = require('../models/Admins');
const Book = require('../models/Books')
const User = require('../models/Users');


// @type     POST
// @route    /admin/signup
// @desc     route for signup of admins.
// @access   PUBLIC
module.exports.adminSignup = async(req, res) => {
    try{
        const admin = await Admin.findOne({email: req.body.email})
            if (admin) {
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
                            const profile = newAdmin.save()
                            if (profile) {
                                res.status(200).json({
                                    success: true,
                                    message: `SignUp successfull with ${req.body.email}`,
                                    profile : newAdmin
                                })
                            }else{
                                res.status(400).json({
                                    success: true,
                                    message: "Admin account creation error",
                                })
                            }
                        })
                    })
                } else {
                    res.status(400).json({
                        success: false,
                        message: "Password and confirm password are not matched"
                    })
                }
            }
        
    }
    catch(err){
        return res.status(500).send({message:err.message,status:500,success:true})
    }
}


// @type     POST
// @route    /admin/signin
// @desc     route for sign of admins.
// @access   PUBLIC 
module.exports.adminSignin = async(req, res) => {
    try{
        var password = req.body.password
    const admin = await Admin.findOne({email: req.body.email})
    if (!admin) {
        res.status(400).json({
            success: false,
            message: `Admin does not exist with ${req.body.email}`
        })
    } else {
        const comparePassword = await bcrypt.compare(password, admin.password)
        if (!comparePassword) {
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
                process.env.SECRET,
                {expiresIn: 3600},
                (err, token) => {
                    if (err) {
                        res.status(400).json({
                            success: false,
                            message: "Token error"
                        })
                    } else {
                        Admin.findOneAndUpdate(
                            {email: req.body.email},
                            {token: "Bearer " + token}
                            )
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
    }        
    }
    catch(err){
        return res.status(500).send({message:err.message,status:500,success:true})
    }
}


// @type     GET
// @route    /admin/profile
// @desc     route for profile of admin.
// @access   PRIVATE
module.exports.adminProfile = async(req, res) => {
    try{
        const admin = await Admin.findOne({_id: req.user.id})
        if (admin) {
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
    }
    catch(err){
        return res.status(500).send({message:err.message,status:500,success:true})
    }
}


// @type     GET
// @route    /admin/books
// @desc     route for getting books details of admin.
// @access   PRIVATE
module.exports.books = async(req, res) => {
    try{
        const books = await Book.find({admin: req.user.id})
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
    }
    catch(err){
        return res.status(500).send({message:err.message,status:500,success:true})
    }
}


// @type     POST
// @route    /admin/add-book
// @desc     route for adding books.
// @access   PRIVATE
module.exports.addBook = async (req, res) => {
    try{
        const book = await Book.findOne({admin : req.user.id,bookname: req.body.bookname})
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

            const newBook = Book.findOne({_id: req.user.id})
            new Book(bookDetails).save()
            if (newBook) {
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
        }        
    }
    catch(err){
        return res.status(500).send({message:err.message,status:500,success:true})
    }
}


// @type     POST
// @route    /admin/update-book
// @desc     route for updating book details.
// @access   PRIVATE
module.exports.updateBook = async(req, res) => {
    try{
        const bookDetailsUpdate = {}
        if (req.body.bookquantity) bookDetailsUpdate.bookquantity = req.body.bookquantity;

        const book = await Book.findOneAndUpdate(
            {_id: req.params.id},
            {$set: bookDetailsUpdate}
        )
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
        
    }
    catch(err){
        return res.status(500).send({message:err.message,status:500,success:true})
    }
}


// @type     GET
// @route    /admin/delete-book
// @desc     route for deleting book details.
// @access   PRIVATE
module.exports.deleteBook = async(req, res) => {
    try{
        const book = await Book.findOneAndRemove({_id: req.params.id})
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
    }
    catch(err){
        return res.status(500).send({message:err.message,status:500,success:true})
    }
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
module.exports.allUsers = async(req, res) => {
    try{
        const user = await User.find({admin: req.user.id})
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
    }
    catch(err){
        return res.status(500).send({message:err.message,status:500,success:true})
    }
}


// @type     GET
// @route    /admin/book-issued
// @desc     route for getting particular book details
// @access   PRIVATE
module.exports.bookIssued = async(req, res) => {
    try{
        const books = await Bookissue.find({bookid: req.params.id})
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
    }
    catch(err){
        return res.status(500).send({message:err.message,status:500,success:true})
    }
}


// @type     GET
// @route    /admin/all-book-issued
// @desc     route for getting all issued book details
// @access   PRIVATE
module.exports.allBookIssued = async(req, res) => {
    try{
        const admin = await Bookissue.find({admin: req.user.id})
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
    }
    catch(err){
        return res.status(500).send({message:err.message,status:500,success:true})
    }

}


// @type     GET
// @route    /admin/user-details/:id
// @desc     route for getting details of particular user
// @access   PRIVATE
module.exports.userDetails = async(req, res) => {
    const user = await User.findOne({_id: req.params.id})
    if (user) {
        const books = await Bookissue.find({user: req.params.id})
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
    } else {
        res.status(400).json({
            success: false,
            message: "User not found"
        })
    }
        
}


// @type     POST
// @route    /admin/user-card-book
// @desc     route for updating user card details.
// @access   PRIVATE
module.exports.userCardUpdate = async(req,res) => {
    try{
        const cardUpdate = {}
        if(req.body.card) cardUpdate.card = req.body.card
        const user = await User.findOneAndUpdate(
            {_id :req.params.id},
            {$set : cardUpdate},
            {new : true},
        )
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
    }
    catch(err){
        return res.status(500).send({message:err.message,status:500,success:true})
    }
}