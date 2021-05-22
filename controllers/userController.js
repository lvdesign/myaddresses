const mongoose = require('mongoose');
mongoose.set('useFindAndModify', false);

const User = mongoose.model('User');

const Store = mongoose.model('Store');
const promisify = require('es6-promisify');
const multer = require('multer');
const jimp = require('jimp');
const uuid = require('uuid');

// import environmental variables from our variables.env file
require('dotenv').config({ path: 'variables.env' });

console.log("*------cloud_name User-------*");
console.log(process.env.CLOUDINARY_cloud_name);

const cloudinary = require('cloudinary').v2;


const multerOptions={
    storage: multer.memoryStorage(),
    fileFilter(req,file,next){
        const isPhoto = file.mimetype.startsWith('image/');
        if(isPhoto){
            next(null,true);
        }else{
            next({message: 'Type d\'image impossible' }, false);
        }
    }
};
exports.upload = multer(multerOptions).single('gravatars');



// middleware
exports.resize = async (req,res,next) => {
    if(!req.file) { 
        next(); // to next middleware
        return; 
    }
    //console.log(req.file);
    console.log('---------rezise User --------') ;
    //const extension = req.file.mimetype.split('/')[1];
    //req.body.gravatars = `${uuid.v4()}.${extension}`;
    req.body.gravatars = `${uuid.v4()}`;
    const gravatars = await jimp.read(req.file.buffer);
    await gravatars.resize(400, jimp.AUTO);
    await gravatars.write(`./public/uploads/gravatar/${req.body.gravatars}.jpeg`);
    my_public_gravatar = req.body.gravatars;
    await cloudinary.uploader.upload(`./public/uploads/gravatar/${req.body.gravatars}.jpeg`, 
            {folder:"myaddresses/gravatar", public_id: `${my_public_gravatar}`, format: 'jpeg' },
            function(error, result) { console.log(result, error) });
    
    next(); 
}



// https://res.cloudinary.com/lvcloud/image/upload/v1603011860/myaddresses/gravatar/avatar_ampxzt.svg

// Login FORM
exports.loginForm = (req,res) => {
    res.render('login', { title: 'Login'});
};


/*///////////////////////////////////////////////////////////////////*/


// Register 
// FORM
exports.registerForm = (req,res) => {
    res.render('register', { title: 'Register'});
};
// Middleware Validation
exports.validateRegister = (req, res, next) => {
    req.sanitizeBody('name');
    req.checkBody('name', 'You must supply a name !').notEmpty();
    req.checkBody('email', 'Email not valid!').isEmail();
    req.sanitizeBody('email').normalizeEmail({
        gmail_remove_dots: false,
        remove_extension: false,
        gmail_remove_subaddress: false
    });
    req.checkBody('password', 'You must supply a password !').notEmpty();
    req.checkBody('password-confirm', 'You must supply a password !').notEmpty();
    req.checkBody('password-confirm', 'Oops! you must supply the same password !').equals(req.body.password);

    const errors = req.validationErrors();
    if(errors){
        req.flash('error', errors.map(err => err.msg));
        res.render('register', { title: 'Register', body: req.body, flashes: req.flash() });
        returns; // stop!!!
    }
    next(); // no errors
};

// Register -> enregistrement ds BD
exports.register = async (req, res, next) => {
    const user = new User({ email: req.body.email, name:req.body.name, gravatars: req.body.gravatars || null  })
    // hash psw
    const register = promisify(User.register, User);
    await register(user,req.body.password );
    // TEST res.send('Ok register!')
    next();
};

// Middleware pour controler le createur d'une adresse
const confirmOwner = (store, user) => {
    if(!store.author.equals(user._id)){
        throw Error('Oops, vous ne pouvez éditer que vos adresses!');
    }
};

// Account User
exports.account = (req, res) => {
    res.render('account', { title: 'Edit Your Account'});
}
// Account User Updated -> BD
exports.updateAccount = async (req,res) => {
    const updates ={
        name: req.body.name,
        email: req.body.email,
        gravatars: req.body.gravatars
    };
    const user = await User.findOneAndUpdate(
        { _id: req.user._id},
        { $set: updates},
        { new: true, runValidators: true, context: 'query'}
    );
    //res.json(user);
    req.flash('success','Updated the profile!')
    res.redirect('back');
}