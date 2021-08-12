const bcrypt = require('bcryptjs');
const jsonwt = require('jsonwebtoken');
const key = require('../../setup/myurl');
const _ = require('lodash');

//models
// const Admin = require('../models/Admins');
// const Book = require('../models/Books')
const User = require('../models/Users')
const Bookissue = require('../models/Bookissue')


// @type     POST
// @route    /admin/signup
// @desc     route for signup of admins.
// @access   PUBLIC
module.exports.userSignup = async(req,res) => {
    try{
        const user = await User.findOne({email : req.body.email})
        if(user){
                res.status(400).json({
                    success:false,
                    message : `${req.body.email} is already registered`
                });
        }else{
            newUser = new User({
                name : req.body.name,
                email : req.body.email,
                password : req.body.password,
                mobile : req.body.mobile,
                admin : req.params.id
            })
            if(req.body.password === req.body.confirmpassword){
                bcrypt.genSalt(10, (err, salt) => {
                    bcrypt.hash(newUser.password, salt, (err, hash) => {
                        if (err) throw err;
                        newUser.password = hash;
                        const newuser = newUser.save()
                        if(newuser){
                            res.status(200).json({
                                success: true,
                                message : `SignUp successfull with ${req.body.email}`,
                                newUser
                            })
                        }else{
                            res.status(400).json({
                                success: false,
                                message : "Account creation error"
                            })
                        }
                    })
                })
            }else{
                res.status(400).json({success:false,message : "Password and Confirm Passoword are not Matched"})
            }
        }
    }
    catch(err){
        return res.status(500).send({message:err.message,status:500,success:true})
    }
}


// @type     POST
// @route    /admin/signin
// @desc     route for signin of admins.
// @access   PUBLIC
module.exports.userSignin = async(req,res) => {
    try{
        const user = await User.findOne({email : req.body.email})
        if(!user){
            res.status(400).json({
                success: false,
                message:"User not found Please sign up first"
            })
        }
        else{
            const comparePassword = await bcrypt.compare(req.body.password,user.password)
            if(comparePassword){
                const payload = {
                    id : user.id,
                    email : user.email
                }
                jsonwt.sign(
                    payload,
                    key.secret,
                    {expiresIn : 3600},
                    (err,token) =>{
                        if(err){
                            res.status(400).json({
                                success:false,
                                message : "Token Creation Error"
                            })
                        }
                        else{
                            User.findOneAndUpdate(
                                {_id : user.id},
                                {token : "Bearer " + token},
                                {new : true}
                            )
                            .then(user => {
                                if(user){
                                    res.status(200).json({
                                        success : true,
                                        message : `Sign in successfully with ${req.body.email}`,
                                        token : "Bearer " + token
                                    })
                                }
                                else{
                                    res.status(400).json({success : false, message: err.message})
                                }
                            })
                            .catch(err => res.status(400).json({success : false, message : err.message}))
                        }
                    }
                )
            }
            else{
                res.status(400).json({
                    success : false,
                    message : "Please Enter Correct Password"
                })
            }
        }
    }
    catch(err){
        return res.status(500).send({message:err.message,status:500,success:true})
    }
}


// @type     GET
// @route    /user/profile
// @desc     route for getting of user profile.
// @access   PRIVATE
module.exports.userProfile = async (req,res) => {
    try{
        const user = await User.findOne({_id : req.user.id})
        if(user){
            const books = await Bookissue.find({user:req.user.id})
            if(books){
                res.status(200).json([{
                    success : true,
                },{
                    admin : req.user.admin,
                    user : req.user.id,
                    name : req.user.name,
                    email : req.user.email,
                    mobile : req.user.mobile,
                    cards : req.user.card,
                },{
                    issuedbooks : books
                }])
            }else{
                res.status(400).json({
                    success:false,
                    message : "User profile not found"
                })
            }
        }
        else{
            res.status(400).json({success : false, message : "User Not Found"})
        }
    }
    catch(err){
        return res.status(500).send({message:err.message,status:500,success:true})
    }
}


// @type     GET
// @route    /user/delete-user
// @desc     route for deleting user account.
// @access   PRIVATE
module.exports.userDelete = async (req, res) => {
    try{
        let Password = req.body.password;
    let confpassword = req.user.password;

    const isMatch = await bcrypt.compare(Password, confpassword) 
    if(isMatch){
        const user = await User.findOneAndRemove({_id: req.user.id})
        if(user){
            res.status(200).json({
                success: true,
                message: `Your Account Registered With ${req.user.email} Has Been Deleted Successfully`
            })
        }else{
            res.status(404).json({
                success: false,
                message: `No Account Found Registered With ${req.user.email}`
            })
        }
    }else{
        res.status(400).json({
            success: false,
            message: "You Have Entered An Incorrect Password"
        })
    }
    }
    catch(err){
        return res.status(500).send({message:err.message,status:500,success:true})
    }
}



// @type     GET
// @route    /user/signout
// @desc     route for signout from profile of user.
// @access   PRIVATE
module.exports.userSignout = async (req,res) => {
    try{
        var user = await User.findOne({_id : req.user.id})
        if(!user){
            res.status(400).json({success: false, message : "User not found"})
        }
        else{            
            const tokenReset = {
                token :  ""
            }
            user = _.extend(user,tokenReset)
            user.save((err,user)=> {
                if(err){
                    res.status(400).json({success: false, message : "Error in reseting token"})
                }
                else{
                    res.status(200).json({success: true, message: "SignOut Successfully"})
                }
            })
        }
    }
    catch(err){
        return res.status(500).send({message:err.message,status:500,success:true})
    }
}


// @type     GET
// @route    /user/all-books
// @desc     route for fetching all books.
// @access   PRIVATE
module.exports.allBooks = async(req, res) => {
    const book = await Book.find({admin:req.params.id})
    if(book){
        res.json(book)
    }else{
        res.json("some error occured")
    }
}


// @type     GET
// @route    /user/book-issue
// @desc     route for issue books.
// @access   PRIVATE
module.exports.bookIssue = async (req, res) => {
    try{
        var book = await Book.findOne({_id:req.params.id})
        if(!book){
            res.status(400).json({
                success: false,
                message: "Book Not found."
            })
        }else{
            var user = await User.findOne({_id:req.user.id})
            if(!user){
                res.status(400).json({
                    success: false,
                    message: "User Not found."
                })
            }else{
                if((user.admin).toString() === (book.admin).toString()){
                    if(book.bookquantity>0){
                        if(req.user.card>0){
                            let bookquantity = book.bookquantity
                            const bookUpdate = {
                                bookquantity: bookquantity-1
                            }
                            book=_.extend(book, bookUpdate)
                            book.save((err, book) => {
                                if(err){
                                    res.status(400).json({
                                        success: false,
                                        message: err.message
                                    })
                                }else{
                                    let card = req.user.card
                                    const cardUpdate = {
                                        card: card-1
                                    }
                                    user=_.extend(user,cardUpdate)
                                    user.save((err, user) => {
                                        if(err){
                                            res.status(400).json({
                                                success: false,
                                                message: err.message
                                            })
                                        }else{
                                            const newBookissue = new Bookissue({
                                                bookname: book.bookname,
                                                user: user.id,
                                                bookid:book.id,
                                                admin : user.admin,
                                            })
                                            const issuedBook = newBookissue.save()
                                            if(issuedBook){
                                                res.status(200).json({
                                                    success:true,
                                                    message : `Book ${book.bookname} issued successfully`,
                                                    newBookissue,
                                                })
                                            }else{
                                                res.status(400).json({
                                                    success : false,
                                                    message : "Error In Issue Book"
                                                })
                                            }
                                        }
                                    })                                
                                }
                            })
                        }else{
                            res.status(400).json({
                                success : false,
                                message  : "You Dont Have any card to issue this book please submit a book first !"
                            })
                        }                
                    }else{
                        res.status(400).json({
                            success : false,
                            message  : "This Book is not available in library !!"
                        })
                    }
                }else{
                    res.status(400).json({
                        success : false,
                        message  : "This Book is not available in library !!"
                    })
                }                             
            }                                                
        }
    }
    catch(err){
        return res.status(500).send({message:err.message,status:500,success:true})
    }
}


// @type     GET
// @route    /user/book-submit
// @desc     route for submit books.
// @access   PRIVATE
module.exports.bookSubmit = async(req, res) => {
    try{
        const userInBookIssue = await Bookissue.find({user:req.user.id})
        if(userInBookIssue){
            var book = await Book.findOne({_id:req.params.id})
            if(!book){
                res.status(400).json({
                    success: false,
                    message: "Book Not found."
                })
            }else{
                var user = await User.findOne({_id:req.user.id})
                if(!user){
                    res.status(400).json({
                        success: false,
                        message: "User Not found."
                    })
                }else{    
                    if(req.user.card<3){
                        let bookquantity = book.bookquantity
                        const bookUpdate = {
                        bookquantity: bookquantity+1
                        }
                        book=_.extend(book, bookUpdate)
                        book.save((err, book) => {
                            if(err){
                                res.status(400).json({
                                    success: false,
                                    message: err.message
                                })
                            }else{
                                let card = req.user.card
                                const cardUpdate = {
                                    card: card+1
                                }
                                user=_.extend(user,cardUpdate)
                                user.save((err, user) => {
                                    if(err){
                                        res.status(400).json({
                                            success: false,
                                            message: err.message
                                        })
                                    }else{
                                        Bookissue.findOneAndRemove({user:req.user.id,bookid:req.params.id})
                                        .then(book => {
                                            if(book){
                                                res.status(200).json({
                                                    success : true,
                                                    message:`Book ${book.bookname} submitted successfully`,
                                                })    
                                            }else{
                                                res.status(400).json({
                                                    success : false,
                                                    message : err.message
                                                })
                                            }
                                        })
                                        .catch(err=>
                                            res.status(500).send({message:err.message,status:500,success:true})
                                        )    
                                    }
                                })
                            }
                        })
                    }
                    else{
                        res.status(400).json({
                            success : false,
                            message : "You havent issued this book yet please issue first"
                        })
                    }                                         
                }                                                            
            }
        }else{
            res.status(400).json({
                success : false,
                message : "You havent issued this book yet please issue first"
            })
        }
    }
    catch(err){
        return res.status(500).send({message:err.message,status:500,success:true})
    }
}