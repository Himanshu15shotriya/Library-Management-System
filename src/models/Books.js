const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const BookSchema = new Schema({
    admin : {
        type : Schema.Types.ObjectId,
        ref : "myAdmin"
    },
    bookname : {
        type : String,
        required : true
    },
    bookquantity : {
        type : Number,
        required : true
    }
})
    

module.exports = Book = mongoose.model('myBook', BookSchema);
