const mongoose = require('mongoose');
const Schema = mongoose.Schema;
mongoose.Promise = global.Promise;


const md5 = require('md5');
const validator = require('validator');
const mongodbErrorHandler = require('mongoose-mongodb-errors');
const passportLocalMongoose = require('passport-local-mongoose');


const userSchema = new mongoose.Schema({
    email:{
        type: String,
        unique: true,
        lowercase:true,
        trim: true,
        validate: [validator.isEmail, 'Adresse email invalide!'],
        required: 'SVP, une adresse email !'
    },
    name:{
        type: String,
        required: 'SVP, un nom !',
        trim: true
    },
    gravatars:{
        type: String,
        default: 'avatar.svg'
    },
    cloudinary_id: {
        type: String,
    },
      
    resetPasswordToken: String,
    resetPasswordExpires: Date ,
    hearts: [
        { type: mongoose.Schema.ObjectId, 
          ref:'Store'
        }
            ]  
});
//
userSchema.virtual('gravatar').get(function(){
    const hash = md5(this.email);
    return `https://gravatar.com/avatar/${hash}?s=200`;
})

// authentication
userSchema.plugin(passportLocalMongoose, {usernameField: 'email'});
userSchema.plugin(mongodbErrorHandler);



module.exports = mongoose.model('User', userSchema);