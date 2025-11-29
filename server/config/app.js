// 1. LOAD ENV VARIABLES
require('dotenv').config();

var createError = require('http-errors');
const express = require('express');
const path = require('path');
const logger = require('morgan');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const flash = require('connect-flash');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;

// 2. IMPORT NEW STRATEGIES
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const GitHubStrategy = require('passport-github2').Strategy;

const app = express();

// =========================================================
// DATABASE SETUP
// =========================================================
let mongoose = require('mongoose');
let DB = require('./db'); // Corrected path: db.js is in the same folder

// point mongoose to the DB URI
mongoose.connect(DB.URI);
let mongoDB = mongoose.connection;
mongoDB.on('error', console.error.bind('console','Connection Error'));
mongoDB.once('open',()=>{
  console.log('Connected to the MongoDB');
});

// LOAD USER MODEL (Go up one level to 'model')
const { User } = require('../model/user'); 

// VIEW ENGINE SETUP (Go up one level to 'views')
app.set('views', path.join(__dirname, '../views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

// STATIC FILES (Go up two levels to root, then public/node_modules)
app.use(express.static(path.join(__dirname, '../../public')));
app.use(express.static(path.join(__dirname, '../../node_modules')));

// =========================================================
// SESSION & PASSPORT SETUP
// =========================================================
app.use(session({
  secret: process.env.SESSION_SECRET || 'dev-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: { 
    secure: false,
    maxAge: 1000 * 60 * 60 * 24 
  }
}));

app.use(flash());

app.use(passport.initialize());
app.use(passport.session());

// Expose user to all views
app.use((req, res, next) => {
  res.locals.currentUser = req.user || null;
  res.locals.messages = req.flash();
  next();
});

// =========================================================
// STRATEGIES
// =========================================================

// A. LOCAL
passport.use(new LocalStrategy({ usernameField: 'username' }, async (username, password, done) => {
  try {
    const user = await User.findOne({ username: username });
    if (!user) return done(null, false, { message: 'Incorrect username or password' });
    
    // In production, use bcrypt.compare here
    if (password !== user.password) {
      return done(null, false, { message: 'Incorrect username or password' });
    }
    return done(null, user);
  } catch (err) {
    return done(err);
  }
}));

// B. GOOGLE
passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.GOOGLE_CALLBACK_URL
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
        let user = await User.findOne({ providerId: profile.id });
        if (user) {
            return done(null, user);
        } else {
            let newUser = new User({
                username: profile.displayName,
                displayName: profile.displayName,
                email: profile.emails ? profile.emails[0].value : "",
                provider: 'google',
                providerId: profile.id
            });
            await newUser.save();
            return done(null, newUser);
        }
    } catch (err) {
        return done(err, null);
    }
  }
));

// C. GITHUB
passport.use(new GitHubStrategy({
    clientID: process.env.GITHUB_CLIENT_ID,
    clientSecret: process.env.GITHUB_CLIENT_SECRET,
    callbackURL: process.env.GITHUB_CALLBACK_URL
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
        let user = await User.findOne({ providerId: profile.id });
        if (user) {
            return done(null, user);
        } else {
            let newUser = new User({
                username: profile.username, 
                displayName: profile.displayName || profile.username,
                email: profile.emails ? profile.emails[0].value : "",
                provider: 'github',
                providerId: profile.id
            });
            await newUser.save();
            return done(null, newUser);
        }
    } catch (err) {
        return done(err, null);
    }
  }
));

passport.serializeUser((user, done) => done(null, user.id));
passport.deserializeUser(async (id, done) => {
  try {
    const u = await User.findById(id);
    done(null, u);
  } catch (err) {
    done(err);
  }
});

// =========================================================
// ROUTING
// =========================================================
// Go up one level to 'routes'
var indexRouter = require('../routes/index');
let assignmentsRouter = require('../routes/assignment'); 

app.use('/', indexRouter);
app.use('/assignments', assignmentsRouter); 

// ERROR HANDLERS
app.use(function(req, res, next) {
  next(createError(404));
});

app.use(function(err, req, res, next) {
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};
  res.status(err.status || 500);
  res.render('error', {title:'Error'});
});

module.exports = app;

