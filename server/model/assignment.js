let mongoose = require('mongoose');

// create a model class
let assignmentSchema = mongoose.Schema({

    name: {
        type: String,
        required: true 
    },  
    course: String, 
    dueDate: Date,
    description: String,
    isCompleted: {
        type: Boolean,
        default: false
    }
},
{
    collection: "assignments" 
});

module.exports = mongoose.model('Assignment', assignmentSchema);