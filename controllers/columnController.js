const Column = require('../models/Column')
const Board = require('../models/Board')
const Task = require('../models/Task')
const Subtask = require('../models/SubTask')
const asyncHandler = require('express-async-handler')

// @desc Get all columns 
// @route GET /
// @access public

const getAllColumns = asyncHandler(async (req, res) => {
    const column = await Column.find().lean()
    if (!column) {
        return res.status(400).json({ message: 'No columns found' })
    } else {
        return res.json(column);
    }
})
// @desc Create new column
// @route POST /
// @access public
const createNewColumn = asyncHandler(async (req, res) => {
    const { boardId, name } = req.body

    if (!boardId) {
        return res.status(400).json({ message: 'Need Board Id' })
    }

    const board = await Board.findById(boardId);

    if (board) {

        if (!name) {
            return res.status(400).json({ message: 'All fields are required' })
        }

        columns = board.columns
        columns.map(async (column) => {
            columnId = column._id.toString()
            const duplicate = await Column.findById(columnId).findOne({ name }).collation({ locale: 'en', strength: 2 }).lean().exec()
            if (duplicate) {
                return res.status(409).json({ message: 'Duplicate name' })
            }
        })

        // Get a random color
        const color = Math.floor(Math.random() * 16777215).toString(16);

        // Create and store the new column 
        const column = await Column.create({ name, color })

        board.columns.push(column);

        await board.save();

        if (column) { // Created 
            return res.status(201).json({ message: 'New column created' })
        } else {
            return res.status(400).json({ message: 'Invalid column data received' })
        }
    } else {
        return res.status(400).json({ message: 'Enter valide Board' })

    }
})
// @desc Update a column
// @route PATCH /
// @access public
const updateColumn = asyncHandler(async (req, res) => {

    const { boardId, id, name } = req.body

    if (!boardId) {
        return res.status(400).json({ message: 'Need Board Id' })
    }

    const board = await Board.findById(boardId);

    // Confirm data 
    if (!id || !name) {
        return res.status(400).json({ message: 'All fields are required' })
    }

    // Does the column exist to update?
    const column = await Column.findById(id).exec()

    if (!column) {
        return res.status(400).json({ message: 'Column not found' })
    }

    columns = board.columns
    columns.map(async (column) => {
        columnId = column._id.toString()
        const duplicate = await Column.findById(columnId).findOne({ name }).collation({ locale: 'en', strength: 2 }).lean().exec()
        if (duplicate && duplicate?._id.toString() !== id) {
            return res.status(409).json({ message: 'Duplicate column name' })
        }
    })


    column.board = board
    column.name = name


    const updatedColumn = await column.save()

    res.json(`'${updatedColumn.name}' updated`)
})
// @desc Delete a column
// @route DELETE /
// @access public
const deleteColumn = asyncHandler(async (req, res) => {

    const { boardId, id } = req.body

    if (!boardId) {
        return res.status(400).json({ message: 'Need Board Id' })
    }

    // Confirm data
    if (!id) {
        return res.status(400).json({ message: 'Column ID Required' })
    }

    // Confirm column exists to delete 
    const column = await Column.findById(id).exec()

    if (!column) {
        return res.status(400).json({ message: 'Column not found' })
    }
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

    await Board.findByIdAndUpdate(boardId, { $pull: { columns: id } });

    const result = await column.deleteOne()

    const reply = `Column '${result.name}' with ID ${result._id} deleted`

    res.json(reply)
})

module.exports = {
    getAllColumns,
    createNewColumn,
    updateColumn,
    deleteColumn
}