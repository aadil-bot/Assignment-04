const express = require('express');
const router = express.Router();
const passport = require('passport');
let DB = require('../config/db');
let userModel = require('../model/user');
let User = userModel.User;

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Home', displayName: req.user ? req.user.displayName : "" });
});

router.get('/home', function(req, res, next) {
  res.render('index', { title: 'Home', displayName: req.user ? req.user.displayName : "" });
});

router.get('/about', function(req, res, next) {
  res.render('about', { title: 'About us', displayName: req.user ? req.user.displayName : "" });
});

router.get('/contact', function(req, res, next) {
  res.render('contact', { title: 'Contact us', displayName: req.user ? req.user.displayName : "" });
});

// --- LOCAL LOGIN ROUTES ---
router.get('/login', function(req, res, next){
  if(!req.user) {
    res.render('auth/login', {
      title:'Login',
      messages: req.flash('loginMessage'), // Fixed variable name to match view
      displayName: ""
    });
  } else {
    return res.redirect("/");
  }
});

router.post('/login', (req, res, next) => {
  passport.authenticate('local', (err, user, info) => {
    if (err) return next(err);
    if (!user) {
      req.flash('loginMessage', info.message || 'Login failed');
      return res.redirect('/login');
    }
    req.login(user, (err) => {
      if (err) return next(err);
      res.redirect('/home');
    });
  })(req, res, next);
});

// --- REGISTER ROUTES ---
router.get('/register', function(req,res,next){
  if(!req.user) {
    res.render('auth/register', {
      title:'Register',
      messages: req.flash('registerMessage'),
      displayName: ""
    });
  } else {
    return res.redirect("/");
  }
});

router.post('/register', async function(req, res, next){
  try {
    let newUser = new User({
      username: req.body.username,
      displayName: req.body.displayName,
      email: req.body.email,
      password: req.body.password,
      provider: 'local' // Explicitly set provider
    });
    
    const user = await User.create(newUser);
    req.login(user, (err) => {
      if(err) return next(err);
      res.redirect('/home');
    });
  } catch(err) {
    req.flash('registerMessage', 'Registration Error: ' + err.message);
    return res.render('auth/register', {
      title: 'Register',
      messages: req.flash('registerMessage'),
      displayName: ""
    });
  }
});

// --- GOOGLE AUTH ROUTES ---
router.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

router.get('/auth/google/callback', 
  passport.authenticate('google', { failureRedirect: '/login' }),
  function(req, res) {
    res.redirect('/assignments');
  });

// --- GITHUB AUTH ROUTES ---
router.get('/auth/github', passport.authenticate('github', { scope: [ 'user:email' ] }));

router.get('/auth/github/callback', 
  passport.authenticate('github', { failureRedirect: '/login' }),
  function(req, res) {
    res.redirect('/assignments');
  });

// --- LOGOUT ---
router.get('/logout', function(req, res, next) {
  req.logout(function(err) {
    if (err) { return next(err); }
    res.redirect('/');
  });
});

module.exports = router;