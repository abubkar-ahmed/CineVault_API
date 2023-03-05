const mongoose = require('mongoose');
const Schema = mongoose.Schema ;

const userSchema = new Schema({
    email : {
        type : String,
        required : true,
    },
    password : {
        type : String,
        required : true
    },
    img: {
        type: Buffer,
    },
    imgType: {
        type: String,
    },
    resetPwd : {
        type : String
    },
    refreshToken : String,
});

userSchema.virtual('userImgPath').get(function (){
    if(this.img != null && this.imgType != null){
        return `data:${this.imgType};charset=utf-8;base64,${this.img.toString('base64')}`;
    }
})

module.exports = mongoose.model('User' , userSchema);