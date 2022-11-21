const mongoose = require('mongoose');
const Schema =  mongoose.Schema;

const userSchema = new Schema({
    user_id: {
        type: String,
        required: true,
        unique: true,
    },
    user_name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    cd: {
        type: Date,
        require: true
    }
})

module.exports = mongoose.model('User', userSchema)


