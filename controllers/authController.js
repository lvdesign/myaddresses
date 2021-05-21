const passport = require('passport');
const crypto = require('crypto');
const mongoose = require('mongoose');
mongoose.set('useFindAndModify', false);
const User = mongoose.model('User');
const promisify = require('es6-promisify');

//const postmark = require("postmark");
// send Mail action
const mail= require('../handlers/mail');

// Log IN
exports.login = passport.authenticate('local', {
  failureRedirect: '/login',
  failureFlash: 'Probleme de Login!',
  successRedirect: '/',
  successFlash: 'Vous êtes connecté maintenant!'
});

// Log OUT
exports.logout = (req, res) => {
  req.logout();
  req.flash('success', 'Vous êtes déconneté !');
  res.redirect('/');
};

// Middelware pour controle connection
exports.isLoggedIn = (req,res,next) => {
  if(req.isAuthenticated()){
    next();
    return;
  }
  req.flash('error', 'Oops, vous devez être connecté pour cette action !');
  res.redirect('/login');
};

/** 
 *  Reset PSW 
 * */ 
// 1 forgot create Token/DateExpire
exports.forgot = async(req,res) => {
  // If user exist
  const user = await User.findOne({ email:req.body.email});
  if(!user){
    req.flash('error', 'Cette adresse ne correspond pas!');
    return res.redirect('/login');
  }
  // 2--set reset tokens & expires for user
  user.resetPasswordToken = crypto.randomBytes(20).toString('hex');
  user.resetPasswordExpires = Date.now() + 360000;
  await user.save();
  // send email with token
  const resetURL = `http://${req.headers.host}/account/reset/${user.resetPasswordToken}`;

  // Mail SEND
  await mail.send({
    user: user,
    subject: 'Password Reset',
    resetURL: resetURL,
    filename: 'password-reset'
  });

  req.flash('success', `Email will be send.`);
  // 3 -redirect to login
  res.redirect('/login');
};

// 2 reset 
exports.reset = async (req,res) =>{
  const user = await User.findOne({
    resetPasswordToken: req.params.token,
    resetPasswordExpires: { $gt: Date.now() }
  });
  if(!user){
    req.flash('error', 'Password reset Invalid!');
    return res.redirect('/login');
  }
  // if user show new form from reset pug
  res.render('reset', { title: 'Reset your psw!'});
};

// 3 conf
exports.confirmedPassword = (req,res,next) =>{
  if(req.body.password === req.body['password-confirm']){
    next();
    return;
  }
  req.flash('error', 'Oops, Password do not match!');
  res.redirect('back');
}

// 4 change to BD
exports.update = async (req,res) =>{
  const user = await User.findOne({
    resetPasswordToken: req.params.token,
    resetPasswordExpires: { $gt: Date.now() }
  });
  if(!user){
    req.flash('error', 'Password reset Invalid!');
    return res.redirect('/login');
  }

  const setPassword = promisify(user.setPassword, user);
  await setPassword(req.body.password);
  user.resetPasswordToken= undefined;
  user.resetPasswordExpires = undefined;

  const updatedUser = await user.save(); // automatique log in
  await req.login(updatedUser);
  req.flash('success', 'Ok nice, your psw is reset!');
  res.redirect('/');
}
