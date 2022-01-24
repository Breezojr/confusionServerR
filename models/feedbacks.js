const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const feedbackSchema = new Schema({
    firstname: {
        type: String,
        required: true,
        unique: true
    },
    lastname: {
        type: String,
        required: true,
        unique: true
    },
    telnum: {
        type: Number,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    agree: {
        type: Boolean,
        required: false
    },
    contactType: {
        type: String,
        required: true
    },
    message: {
        type: String,
        required: true
    }
},  {
    timestamps: true
});    

var Feedbacks = mongoose.model('Feedback', feedbackSchema);

module.exports = Feedbacks;