const mongoose = require('mongoose')

const boardSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
        columns:[{
        type: mongoose.Schema.Types.ObjectId,
        required: false,
        ref: 'Column'
    }],
})

module.exports = mongoose.model('Board', boardSchema)