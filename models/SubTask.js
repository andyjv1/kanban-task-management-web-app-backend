const mongoose = require('mongoose')

const subtasksSchema = new mongoose.Schema({
        title: {
            type: String,
            required: true
        },
        isCompleted:
        {
            type: Boolean,
            default: false
    },
})

module.exports = mongoose.model('Subtasks', subtasksSchema)