const mongoose = require('mongoose');
const Schema = mongoose.Schema;

let otpSchema = new Schema({

    email: {
        type: String,
        required: true,
        index: true
    },
    otp: {
        type: Number,
        required: true
    },
    cd: {
        type: Date,
        default: new Date()
    }
});

module.exports = mongoose.model('Otp', otpSchema);