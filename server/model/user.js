let mongoose = require('mongoose');

let User = mongoose.Schema({
    username: {
        type: String,
        default: "",
        trim: true,
        // Removed 'required' because OAuth users might not have one initially
    },
    password: {
        type: String,
        default: "",
        trim: true,
        // Password is now optional for Social Login users
    },
    email: {
        type: String,
        default: "",
        trim: true,
        // Optional to prevent errors if provider doesn't share email
    },
    displayName: {
        type: String,
        default: "",
        trim: true,
        required: 'displayName is required'
    },
    // NEW FIELDS FOR OAUTH
    provider: {
        type: String, // 'local', 'google', or 'github'
        default: 'local'
    },
    providerId: {
        type: String,
        default: ""
    },
    created: {
        type: Date,
        default: Date.now
    },
    updated: {
        type: Date,
        default: Date.now
    }
},
{
    collection: "user"
});

module.exports.User = mongoose.model('User', User);