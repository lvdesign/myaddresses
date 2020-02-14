const mongoose = require('mongoose');
const User = mongoose.model('User');

const Store = mongoose.model('Store');

const promisify = require('es6-promisify');

// Login FORM
exports.loginForm = (req,res) => {
    res.render('login', { title: 'Login'});
};


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
exports.register = async (req,res, next) => {
    const user = new User({ email: req.body.email, name:req.body.name})
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
exports.account = (req,res) => {

res.render('account', { title: 'Edit Your Account'})

}
// Account User Updated -> BD
exports.updateAccount = async (req,res) => {
    const updates ={
        name: req.body.name,
        email: req.body.email
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