const User = require('../models/user');
const Task = require('../models/task');
const Status = require('../models/status');
const TaskUser = require('../models/taskUser');

exports.getTasks = async (req, res, next) => {
    try {
        const tasks = await Task.findAll({
            include: [
                {
                    model: Status,
                    attributes: ['name'],
                    as: 'status'
                },
            ],
        });

        const taskUsers = await TaskUser.findAll();

        res.status(200).send({
            data: tasks.map(el => {
                return {
                    id: el.id,
                    status: el.status.name,
                    statusId: el.statusId,
                    text: el.text,
                    users: taskUsers.filter(user => user.taskId === el.id).map(user => {
                        return {
                            id: user.userId,
                        }
                    })
                }
            })
        });
    } catch (err) {
        res.status(400).send({ message: JSON.stringify({ common: err.toString() }) });
    }
}

exports.createTask = async (req, res, next) => {
    try {
        const { text } = req.body;

        errors = null;

        if (!text) {
            if (errors) {
                errors.text = 'Text is empty';
            } else {
                errors = { text: 'Text is empty' };
            }
        }

        if (errors) {
            return res.status(404).send({ message: JSON.stringify(errors) });
        }

        const task = await Task.create({
            text,
            statusId: 1,
        });

        res.status(200).send({
            id: task.id,
            text: task.text,
            statusId: task.statusId
        });
    } catch (err) {
        res.status(400).send({ message: err.toString() });
    }
}

exports.changeTaskStatus = async (req, res, next) => {
    try {
        const { statusId } = req.body;
        const { taskId } = req.params;

        errors = null;

        let task = null;

        if (!statusId) {
            if (errors) {
                errors.status = 'Status is empty';
            } else {
                errors = { status: 'Status is empty' };
            }
        } else {
            const status = await Status.findByPk(statusId);
            if (!status) {
                if (errors) {
                    errors.status = 'Wrong status';
                } else {
                    errors = { status: 'Wrong status' };
                }
            } else if (status.admin && !req.user.admin) {
                if (errors) {
                    errors.status = 'Status admin only';
                } else {
                    errors = { status: 'Status admin only' };
                }
            }
            task = await Task.findByPk(taskId);
            if (!task) {
                if (errors) {
                    errors.common = 'Task not found';
                } else {
                    errors = { common: 'Task not found' };
                }
            }
        }

        if (errors) {
            return res.status(404).send({ message: JSON.stringify(errors) });
        }

        await task.update({statusId});

        res.status(200).send({
            id: task.id,
            text: task.text,
            statusId: task.statusId,
        });
    } catch (err) {
        res.status(400).send({ message: err.toString() });
    }
}

exports.assignUser = async (req, res, next) => {
    try {
        const { userId } = req.query;
        const { taskId } = req.params;

        errors = null;

        if (!userId) {
            errors = { userId: 'No user to assign' };
        } else {
            const user = await User.findByPk(userId);
            if (!user) {
                if (errors) {
                    errors.common = 'User not found';
                } else {
                    errors = { common: 'User not found' };
                }
            }
            const task = await Task.findByPk(taskId);
            if (!task) {
                if (errors) {
                    errors.common = 'Task not found';
                } else {
                    errors = { common: 'Task not found' };
                }
            }
            if (user && task) {
                const taskUser = await TaskUser.findAll({ where: { taskId, userId } });
                if (taskUser.length > 0) {
                    if (errors) {
                        errors.common = 'User is already assigned';
                    } else {
                        errors = { common: 'User is already assigned' };
                    }
                }
            }
        }

        if (errors) {
            return res.status(404).send({ message: JSON.stringify(errors) });
        }

        const taskUserAssigned = await TaskUser.create({ taskId, userId });

        res.status(200).send({
            status: true,
            id: taskUserAssigned.id
        });
    } catch (err) {
        res.status(400).send({ message: err.toString() });
    }
}
