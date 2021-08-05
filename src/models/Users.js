const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const UserSchema = new Schema({
    admin : {
        type : Schema.Types.ObjectId,
        ref : "myAdmin"
    },
    name : {
        type : String,
        required : true
    },
    email : {
        type : String,
        required : true
    },
    password : {
        type : String,
        required : true
    },
    mobile : {
        type : Number,
        required : true
    },
    card : {
        type : Number,
        default : 3
    },
    token : {
        type : String,
        default : ""
    }

})
    

module.exports = User = mongoose.model('myUser', UserSchema);
