const Board = require('../models/Board')
const Task = require('../models/Task')
const Column = require('../models/Column')
const Subtask = require('../models/SubTask')
const asyncHandler = require('express-async-handler')

// @desc Get all boards 
// @route GET /
// @access public
const getAllBoards = asyncHandler(async (req, res) => {
    const board = await Board.find().lean()
    if (!board) {
        return res.status(400).json({ message: 'No boards found' })
    }
    else {
        return res.json(board);
    }
})
// @desc Create new board
// @route POST /
// @access public
const createNewBoard = asyncHandler(async (req, res) => {
    const { name } = req.body

    if (!name) {
        return res.status(400).json({ message: 'All fields are required' })
    }

    // Check for duplicate name
    const duplicate = await Board.findOne({ name }).collation({ locale: 'en', strength: 2 }).lean().exec()

    if (duplicate) {
        return res.status(409).json({ message: 'Duplicate name' })
    }

    // Create and store the new board 
    const board = await Board.create({ name })

    if (board) { // Created 
        return res.status(201).json({ message: 'New board created', board:board })
    } else {
        return res.status(400).json({ message: 'Invalid board data received' })
    }
})
// @desc Update a board
// @route PATCH /
// @access public
const updateBoard = asyncHandler(async (req, res) => {
    const { name, id } = req.body

    // Confirm data 
    if (!name || !id) {
        return res.status(400).json({ message: 'All fields are required' })
    }

    // Does the board exist to update?
    const board = await Board.findById(id).exec()

    if (!board) {
        return res.status(400).json({ message: 'Board not found' })
    }

    // Check for duplicate name
    const duplicate = await Board.findOne({ name }).collation({ locale: 'en', strength: 2 }).lean().exec()

    // Allow renaming of the original board 
    if (duplicate && duplicate?._id.toString() !== id) {
        return res.status(409).json({ message: 'Duplicate board name' })
    }

    board.name = name


    const updatedBoard = await board.save()

    res.json(`'${updatedBoard.name}' updated`)
})
// @desc Delete a board
// @route DELETE /
// @access public
const deleteBoard = asyncHandler(async (req, res) => {
    const { id } = req.body

    // Confirm data
    if (!id) {
        return res.status(400).json({ message: 'Board ID Required' })
    }

    // Confirm board exists to delete 
    const board = await Board.findById(id).exec()

    if (!board) {
        return res.status(400).json({ message: 'Board not found' })
    }
    
    if (board.columns) {
        board.columns.map(async (columnId) => {
            column = await Column.findById(columnId).exec()
            if (column.tasks) {
                column.tasks.map(async (taskId) => {
                    task = await Task.findById(taskId).exec()
                    if (task.subtasks) {
                        task.subtasks.map(async (subtasksId) => {
                            subtask = await Subtask.findById(subtasksId).exec()
                            await subtask.deleteOne()
                        })
                    }
                    await task.deleteOne()
                })
            }
            await column.deleteOne()
        })
    }


    const result = await board.deleteOne()

    const reply = `Board '${result.name}' with ID ${result._id} deleted`

    res.json(reply)


    //         columns = board.columns
    //     columns.map(async (column) => {
    //         columnId = column._id.toString()
    //         const duplicate = await Column.findById(columnId).findOne({ name }).lean().exec();
    //         if (duplicate) {
    //             return res.status(409).json({ message: 'Duplicate name' })
    //         }
    //     })

    //     // Create and store the new column 
    //     const column = await Column.create({ name })

    //     board.columns.push(column);

    //     await board.save();

    //     if (column) { // Created 
    //         return res.status(201).json({ message: 'New column created' })
    //     } else {
    //         return res.status(400).json({ message: 'Invalid column data received' })
    //     }
    // } else {
    //     return res.status(400).json({ message: 'Enter valide Board' })

    // }
})

module.exports = {
    getAllBoards,
    createNewBoard,
    updateBoard,
    deleteBoard
}