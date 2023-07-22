const express = require('express')
const router = express.Router()
const boardsController = require('../controllers/boardsController')

router.route('/')
    .get(boardsController.getAllBoards) //done
    .post(boardsController.createNewBoard)
    .patch(boardsController.updateBoard)
    .delete(boardsController.deleteBoard)



module.exports = router

