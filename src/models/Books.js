const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const BookSchema = new Schema({
    admin : {
        type : Schema.Types.ObjectId,
        ref : "myAdmin"
    },
    bookname : {
        type : String,
    },
    bookquantity : {
        type : Number,
    }
})
    

module.exports = Book = mongoose.model('myBook', BookSchema);
