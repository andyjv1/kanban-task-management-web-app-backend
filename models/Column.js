const mongoose = require('mongoose')

const columnSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    color: {
        type: String,
        required: true
    },
    tasks: [{
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Task'
    }],
})

module.exports = mongoose.model('Column', columnSchema)