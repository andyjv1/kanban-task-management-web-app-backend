const Task = require('../models/Task')
const Board = require('../models/Board')
const Column = require('../models/Column')
const Subtask = require('../models/SubTask')
const asyncHandler = require('express-async-handler')

// @desc Get all tasks 
// @route GET /
// @access public
const getAllTasks = asyncHandler(async (req, res) => {
    const task = await Task.find().lean()
    if (!task) {
        return res.status(400).json({ message: 'No tasks found' })
    } else {
        return res.json(task);
    }
})
// @desc Create new task
// @route POST /
// @access public
const createNewTask = asyncHandler(async (req, res) => {
    const { columnId, title, description } = req.body

    if (!columnId) {
        return res.status(400).json({ message: 'Need Column Id' })
    }
    const column = await Column.findById(columnId);
    if (column) {

        // Confirm data
        if (!title) {
            return res.status(400).json({ message: 'All fields are required' })
        }

    
        tasks = column.tasks
        tasks.map(async (task) => {
            taskId = task._id.toString()
            const duplicate = await Task.findById(taskId).findOne({ title }).collation({ locale: 'en', strength: 2 }).lean().exec()
            if (duplicate) {
                return res.status(409).json({ message: 'Duplicate title' })
            }
        })


        // Create and store the new column 
        const task = await Task.create({ title, description, "status": column })

        column.tasks.push(task);

        await column.save();

        if (task) { // Created 
            return res.status(201).json({ message: 'New task created' ,task:task})
        } else {
            return res.status(400).json({ message: 'Invalid task data received' })
        }
    } else {
        return res.status(400).json({ message: 'Enter valide Column' })

    }
})
// @desc Update a task
// @route PATCH /
// @access public
const updateTask = asyncHandler(async (req, res) => {
    const { columnId, id, title, description } = req.body

    if (!columnId) {
        return res.status(400).json({ message: 'Need Column Id' })
    }

    const column = await Column.findById(columnId);
    if (column) {

        // Confirm data
        if (!id, !title) {
            return res.status(400).json({ message: 'All fields are required' })
        }

        const task = await Task.findById(id).exec()

        if (!task) {
            return res.status(400).json({ message: 'Task not found' })
        }

        tasks = column.tasks

        tasks.map(async (task) => {
            taskId = task._id.toString()
            const duplicate = await Task.findById(taskId).findOne({ title }).collation({ locale: 'en', strength: 2 }).lean().exec()
            if (duplicate && duplicate?._id.toString() !== id) {
                return res.status(409).json({ message: 'Duplicate task title' })
            }
        })
        task.title = title
        task.description = description

        if (columnId != task.status) {
            const oldColumn = await Column.findById(task.status);
            task.status=columnId
            const updatedTask = await task.save()
            oldColumn.tasks.pull(updatedTask);
            column.tasks.push(updatedTask);
            await column.save();
            await oldColumn.save();
        res.json(`'${updatedTask.title}' updated`)

        } else {
            const updatedTask = await task.save()
        res.json(`'${updatedTask.title}' updated`)

        }
        


    } else {
        return res.status(400).json({ message: 'Enter valide Column' })

    }
})
// @desc Delete a task
// @route DELETE /
// @access public
const deleteTask = asyncHandler(async (req, res) => {

    const { columnId, id } = req.body

    if (!columnId) {
        return res.status(400).json({ message: 'Need Column Id' })
    }

    // Confirm data
    if (!id) {
        return res.status(400).json({ message: 'Task ID Required' })
    }

    // Confirm task exists to delete 
    const task = await Task.findById(id).exec()

    if (!task) {
        return res.status(400).json({ message: 'Task not found' })
    }

    if (task.subtasks) {
        task.subtasks.map(async (subtasksId) => {
            subtask = await Subtask.findById(subtasksId).exec()
            await subtask.deleteOne()
        })
    }

    const result = await task.deleteOne()

    await Column.findByIdAndUpdate(columnId, { $pull: { tasks: id } });

    const reply = `Task '${result.title}' with ID ${result._id} deleted`

    res.json(reply)
    
})

module.exports = {
    getAllTasks,
    createNewTask,
    updateTask,
    deleteTask
}
