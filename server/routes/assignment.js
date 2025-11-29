let express = require('express');
let router = express.Router();
let mongoose = require('mongoose');

// Connect to our Assignment model
let Assignment = require('../model/assignment');


function requireAuth(req, res, next) {
  console.log('requireAuth - req.user:', !!req.user, 'isAuthenticated():', req.isAuthenticated());
  
  if (!req.isAuthenticated()) {
    console.log('NOT authenticated, redirecting to /login');
    return res.redirect('/login');
  }
  
  console.log('Authenticated, proceeding to next');
  next();
}

// GET route for displaying the Assignment List
router.get('/', async (req, res, next) => {
    try {
        const AssignmentList = await Assignment.find();

        res.render('Assignments/list', {
            title: 'Assignments', 
            AssignmentList: AssignmentList,
            currentUser: req.user
        });
    } catch (err) {
        console.log(err);
        res.render('Assignments/list', {
            title: 'Error',
            error: 'Error on the Server',
            AssignmentList: [],
            currentUser: req.user
        });
    }
});

// GET route for displaying the Add Page
router.get('/add', requireAuth, async (req, res, next) => {
    try {
        res.render('Assignments/add', {
            title: 'Add Assignment',
            currentUser: req.user
        });
    } catch (err) {
        console.log(err);
        res.render('Assignments/list', {
            title: 'Error',
            error: 'Error on the Server',
            AssignmentList: [],
            currentUser: req.user
        });
    }
});

// POST route for processing the Add Page
router.post('/add', requireAuth, async (req, res, next) => {
    try {
        let newAssignment = Assignment({
            "name": req.body.name, 
            "course": req.body.course, 
            "dueDate": req.body.dueDate, 
            "description": req.body.description
        });

        await Assignment.create(newAssignment);
        res.redirect('/assignments'); 
    } catch (err) {
        console.log(err);
        res.render('Assignments/list', {
            title: 'Error',
            error: 'Error on the Server',
            AssignmentList: [],
            currentUser: req.user
        });
    }
});

// GET route for displaying the Edit Page
router.get('/edit/:id', requireAuth, async (req, res, next) => {
    try {
        const id = req.params.id;
        const assignmentToEdit = await Assignment.findById(id);

        res.render("Assignments/edit", {
            title: 'Edit Assignment',
            Assignment: assignmentToEdit,
            currentUser: req.user
        });
    } catch (err) {
        console.log(err);
        next(err);
    }
});

// POST route for Edit
router.post('/edit/:id', requireAuth, async (req, res, next) => {
    try {
        let id = req.params.id;

        let updateAssignment = Assignment({
            "_id": id,
            "name": req.body.name,
            "course": req.body.course,
            "dueDate": req.body.dueDate,
            "description": req.body.description,
            "isCompleted": req.body.isCompleted ? true : false 
        });

        await Assignment.findByIdAndUpdate(id, updateAssignment);
        res.redirect("/assignments"); 
    } catch (err) {
        console.log(err);
        next(err);
    }
});

// GET route Delete
router.get('/delete/:id', requireAuth, async (req, res, next) => {
    try {
        let id = req.params.id;
        await Assignment.deleteOne({ _id: id });
        res.redirect("/assignments"); 
    } catch (err) {
        console.log(err);
        next(err);
    }
});

module.exports = router;