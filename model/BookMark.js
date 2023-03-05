const mongoose = require('mongoose');
const Schema = mongoose.Schema;


const bookMarksSchema = new Schema({
    userId: {
        type: String,
        required: true
    },
    media: [
        {
            mediaId: {
                type: String,
                required: true
            },
            mediaType : {
                type : String,
                required:true
            }
        }
    ]
});

module.exports = mongoose.model('BookMark', bookMarksSchema);