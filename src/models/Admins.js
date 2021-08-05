const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const AdminSchema = new Schema({
    libraryname : {
        type: String,
        required: true,
    },
    email : {
        type : String,
        required: true,
    },
    password : {
        type : String,
        required: true,
    },
    token : {
        type : String
    }
})
    

module.exports = Admin = mongoose.model('myAdmin', AdminSchema);
