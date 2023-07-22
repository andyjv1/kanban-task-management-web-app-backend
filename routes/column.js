const express = require('express')
const router = express.Router()
const columnController = require('../controllers/columnController')


router.route('/')
    .get(columnController.getAllColumns)
    .post(columnController.createNewColumn)
    .patch(columnController.updateColumn)
    .delete(columnController.deleteColumn)

module.exports = router