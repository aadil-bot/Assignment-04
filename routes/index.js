var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Home' });
});

/* GET home page. */
router.get('/home', function(req, res, next) {
  res.render('index', { title: 'Home' });
});

/* GET About page. */
router.get('/about', function(req, res, next) {
  res.render('index', { title: 'About us' });
});

/* GET products page. */
router.get('/assignments', function(req, res, next) {
  res.render('index', { title: 'Products' });
});

/* GET Services page. */
router.get('/services', function(req, res, next) {
  res.render('index', { title: 'Services' });
});

/* GET home page. */
router.get('/contact', function(req, res, next) {
  res.render('index', { title: 'Contact us' });
});

app.post('/register', (req, res) => {
    console.log('=== POST /register hit ===');
    console.log('Body:', req.body);
    // ...existing code...
});

app.post('/login', (req, res) => {
    console.log('=== POST /login hit ===');
    console.log('Body:', req.body);
    // ...existing code...
});

module.exports = router;