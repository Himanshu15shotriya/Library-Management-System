const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const BookissueSchema = new Schema({
    admin : {
        type : Schema.Types.ObjectId,
        ref : "myAdmin"
    },
    user : {
        type : Schema.Types.ObjectId,
        ref : "myUser"
    },
    bookid : {
        type : String,
    },
    bookname : {
        type : String,
    },
    issuedate : {
        type : Date,
        default : Date.now
    }

})
    

module.exports = Bookissue = mongoose.model('myBookissue', BookissueSchema);
