const ObjectId = require("mongodb").ObjectId;
const express = require("express");
const validate = require('express-jsonschema').validate;

const task = express.Router();

const Task = require("../schemas/task");
const { validateDate } = require("../utils/helpers");
const ValidationSchemas = require("../validation/login");



task.get("/", validate({query:ValidationSchemas.getTaskSchema}), async (req, res) => {

    if (!req.query.user_id) {
        return res.status(406).send({
            status: false,
            message: "User Id is required. / It cannot be empty",
        });
    }

    let tasks = await Task.find({ user_id: req.query.user_id }, { __v: 0 });

    res.send({ status: true, tasks: tasks });
});

task.post("/create", validate({body:ValidationSchemas.taskSchema}), async (req, res) => {
    const { task_name, date } = req.body;

    if (!task_name || !date) {
        return res.status(406).send({
            status: false,
            message: !task_name
                ? "Task name is required. / It cannot be empty"
                : "Date is required / It cannot be empty",
        });
    }

    if (!validateDate(date)) {
        return res.status(406).send({
            status: false,
            message: "Enter valid date.",
        });
    }

    [year, month, day] = date.split("-");

    let task = new Task({
        user_id: req.session.user_id,
        task_name: task_name,
        date: new Date(year, month, day),
    });

    task = await task.save();

    res.send({
        status: true,
        data: [task],
        message: "Task saved successfully.",
    });
});

task.patch("/", validate({body:ValidationSchemas.updateTaskSchema}), async (req, res) => {
    const { task_id, task_name, date, status } = req.body;

    if (!task_id) {
        return res.status(406).send({
            status: false,
            message: "Task Id is required / It cannot be empty.",
        });
    }

    if (!task_name && !date && !status) {
        return res.status(406).send({
            status: false,
            message: "Please specify (task_name or date or status) fields to update.",
        });
    }

    if (status && status !== "Completed" && status !== "In Complete") {
        return res.status(406).send({
            status: false,
            message: "Invalid status.",
        });
    }

    if (date && !validateDate(date)) {
        return res.status(406).send({
            status: false,
            message: "Enter valid date.",
        });
    }

    let updateObj = {};

    if (task_name) updateObj.task_name = task_name;
    if (date) updateObj.date = date;
    if (status) updateObj.status = status;

    try {
        let response = await Task.findByIdAndUpdate(task_id, updateObj, {
            new: true,
        });
        res.send({
            status: true,
            message: "Successfully updated.",
        });
    } catch (error) {
        console.log(error);
        res.send({ status: false, message: "Unable to update." });
    }
});

task.delete("/", validate({body:ValidationSchemas.deleteTaskSchema}), async (req, res) => {
    try {
        if (!req.body.task_id) {
            return res.status(406).send({
                status: false,
                message: "Task Id is required / It cannot be empty. ",
            });
        }
        let response = await Task.deleteOne({
            _id: ObjectId(req.body.task_id),
        });
        res.send({ status: true, message: "Successfully Deleted." });
    } catch (error) {
        console.log(error);
        res.send({ status: false, message: "Unable to delete the task." });
    }
});

module.exports = task;
