const Subtask = require('../models/SubTask')
const Task = require('../models/Task')
const Board = require('../models/Board')
const Column = require('../models/Column')
const asyncHandler = require('express-async-handler')

// @desc Get all subtasks 
// @route GET /
// @access public
const getAllSubtasks = asyncHandler(async (req, res) => {
    const subtasks = await Subtask.find().lean()
    if (!subtasks) {
        return res.status(400).json({ message: 'No subtasks found' })
    } else {
        return res.json(subtasks);
    }

})


// @desc Create new subtask
// @route POST /
// @access public
const createNewSubtask = asyncHandler(async (req, res) => {
    const { taskId, title, isCompleted } = req.body

    if (!taskId) {
        return res.status(400).json({ message: 'Need Task Id' })
    }
    const task = await Task.findById(taskId);
    if (task) {

        // Confirm data
        if (!title) {
            return res.status(400).json({ message: 'All fields are required' })
        }

        subtasks = task.subtasks
        subtasks.map(async (subtask) => {
            subtaskId = subtask._id.toString()
            const duplicate = await Subtask.findById(subtaskId).findOne({ title }).collation({ locale: 'en', strength: 2 }).lean().exec()
            if (duplicate) {
                return res.status(409).json({ message: 'Duplicate subtask' })
            }
        })


        // Create and store the new column 
        const subtask = await Subtask.create({ title, isCompleted })

        task.subtasks.push(subtask);

        await task.save();

        if (subtask) { // Created 
            return res.status(201).json({ message: 'New subtask created' })
        } else {
            return res.status(400).json({ message: 'Invalid subtask data received' })
        }
    } else {
        return res.status(400).json({ message: 'Enter valide task' })

    }
})

// @desc Update a subtask
// @route PATCH /
// @access public
const updateSubtask = asyncHandler(async (req, res) => {
    const { taskId, title, id, isCompleted } = req.body

    if (!taskId) {
        return res.status(400).json({ message: 'Need Task Id' })
    }
    const task = await Task.findById(taskId);
    if (task) {

        // Confirm data
        if (!id, !title) {
            return res.status(400).json({ message: 'All fields are required' })
        }

        const subtask = await Subtask.findById(id).exec()

        if (!subtask) {
            return res.status(400).json({ message: 'Task not found' })
        }

        subtasks = task.subtasks
        subtasks.map(async (subtask) => {
            subtaskId = subtask._id.toString()
            const duplicate = await Subtask.findById(subtaskId).findOne({ title }).collation({ locale: 'en', strength: 2 }).lean().exec()
            if (duplicate && duplicate?._id.toString() !== id) {
                return res.status(409).json({ message: 'Duplicate subtask' })
            }
        })
        subtask.title = title
        subtask.isCompleted = isCompleted

        const updatedSubtask = await subtask.save()

        res.json(`'${updatedSubtask.title}' updated`)

    } else {
        return res.status(400).json({ message: 'Enter valide Column' })

    }
})
// @desc Delete a subtask
// @route DELETE /
// @access public
const deleteSubtask = asyncHandler(async (req, res) => {

    const { taskId, id } = req.body

    // Confirm data
    if (!taskId) {
        return res.status(400).json({ message: 'Task ID Required' })
    }

    if (!id) {
        return res.status(400).json({ message: 'Subtask ID Required' })
    }

    // Confirm board exists to delete 
    const subtask = await Subtask.findById(id).exec()

    if (!subtask) {
        return res.status(400).json({ message: 'Subtask not found' })
    }
    
    const result = await subtask.deleteOne()

    await Task.findByIdAndUpdate(taskId, { $pull: { subtasks: id } });

    const reply = `Subtask '${result.title}' with ID ${result._id} deleted`

    res.json(reply)

})

module.exports = {
    getAllSubtasks,
    createNewSubtask,
    updateSubtask,
    deleteSubtask
}