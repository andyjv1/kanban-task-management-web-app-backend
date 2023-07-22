const mongoose = require('mongoose')

const taskSchema = new mongoose.Schema({

    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
    },
    status: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Column'
    },
    subtasks: [{
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'SubTask'
    }],

})

module.exports = mongoose.model('Task', taskSchema)