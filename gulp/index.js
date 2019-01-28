'use strict'

// H/T to Ray Patterson (raypatterson) for this beautiful build system
const requireDirectory = require('require-directory')
const gulp = require('gulp')
const immu = require('immu')
const _ = require('lodash')

const config = require('./config')

/**
 * Initialize tasks
 */

// Get task modules
const modules = requireDirectory(module, './tasks', {
    recurse: false
})

// Create task list
const createTaskList = (output, val, key) => {
    output[key] = key
    return output
}

const tasks = immu(_(modules).reduce(createTaskList, {}))

// Configure shared task params
const sharedParams = {
    gulp: gulp,
    config: config,
    tasks: tasks
}

// Task initializer
const initTask = (params, init, name) => {
    init(name, params.gulp, params.config, params.tasks)
}

// Partially apply
const initTaskPartial = _.partial(initTask, sharedParams)

// Initialize
_(modules).forEach(initTaskPartial)
