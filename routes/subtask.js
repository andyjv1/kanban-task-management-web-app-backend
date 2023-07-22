const express = require('express')
const router = express.Router()
const subtasksController = require('../controllers/subtasksController')
    
router.route('/')
    .get(subtasksController.getAllSubtasks)
    .post(subtasksController.createNewSubtask)
    .patch(subtasksController.updateSubtask)
    .delete(subtasksController.deleteSubtask)

module.exports = router