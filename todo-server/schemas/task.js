const mongoose = require('mongoose')
let Schema = mongoose.Schema

let taskSchema = new Schema({

    user_id: {
        type:String,
        required: true
    },
    task_name: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum:["In Complete", "Completed"],
        default: "In Complete",
    },
    date: {
        type: Date,
        require: true,
        default: new Date()
    }

})

module.exports = mongoose.model('Task', taskSchema);