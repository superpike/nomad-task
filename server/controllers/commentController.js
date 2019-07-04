const User = require('../models/user');
const Comment = require('../models/comment');
const TaskUser = require('../models/taskUser');
const Task = require('../models/task');
const settings = require('../common/settings');
const nodemailer = require("nodemailer");

exports.getComments = async (req, res, next) => {
    try {
        const comments = await Comment.findAll({ where: { deleted: false } });

        res.status(200).send({
            data: comments.map(el => {
                return {
                    id: el.id,
                    taskId: el.taskId,
                    userId: el.userId,
                    text: el.text,
                }
            })
        });
    } catch (err) {
        res.status(400).send({ message: JSON.stringify({ common: err.toString() }) });
    }
}

exports.createComment = async (req, res, next) => {
    try {
        const { text, taskId } = req.body;
        let taskUsers = [];

        errors = null;

        if (!text) {
            if (errors) {
                errors.text = 'Text is empty';
            } else {
                errors = { text: 'Text is empty' };
            }
        }

        const task = await Task.findByPk(taskId);
        if (!task) {
            if (errors) {
                errors.common = 'Task not found';
            } else {
                errors = { common: 'Task not found' };
            }
        } else {
            taskUsers = await TaskUser.findAll({
                where: { taskId },
                include: [
                    {
                        model: User,
                        attributes: ['email']
                    },
                ],
            });
            if (!req.user.admin) {
                if (taskUsers.length === 0 || taskUsers.findIndex(el => el.userId === req.user.id) === -1) {
                    if (errors) {
                        errors.common = 'User is not assigned to the task';
                    } else {
                        errors = { common: 'User is not assigned to the task' };
                    }
                }
            }
        }

        if (errors) {
            return res.status(404).send({ message: JSON.stringify(errors) });
        }

        const comment = await Comment.create({
            text,
            taskId,
            userId: req.user.id,
            deleted: false,
        });

        let testAccount = settings.EMAIL_USER;
        if (!testAccount) {
            testAccount = await nodemailer.createTestAccount();
        }

        if (taskUsers.length > 0) {
            const subject = 'New comment for task ' + task.id;
            const mailText = 'New comment appeared for task ' + task.id + ': ' + task.text + '\n' + comment.text;
            const transporter = nodemailer.createTransport({
                host: settings.EMAIL_HOST,
                port: settings.EMAIL_PORT,
                secure: settings.EMAIL_SECURE === 'true', // true for 465, false for other ports
                auth: {
                    user: settings.EMAIL_USER ? settings.EMAIL_USER : testAccount.user, // generated ethereal user
                    pass: settings.EMAIL_USER ? settings.EMAIL_PASSWORD : testAccount.pass // generated ethereal password
                }
            });

            taskUsers.forEach(user => {
                if (user.userId !== req.user.id) {
                    // send mail with defined transport object
                    const info = transporter.sendMail({
                        from: settings.EMAIL, //req.user.email, // sender address
                        to: user.user.email, //settings.EMAIL, // list of receivers
                        subject, // Subject line
                        text: mailText, // plain text body
                        // html: "<b>Hello world?</b>" // html body
                    });
                }
            });
        }

        res.status(200).send({
            id: comment.id,
            taskId: comment.taskId,
            userId: comment.userId,
            text: comment.text
        });
    } catch (err) {
        res.status(400).send({ message: err.toString() });
    }
}

exports.deleteComment = async (req, res, next) => {
    try {
        errors = null;

        if (!req.user.admin) {
            errors = { common: 'Access denied' };
        }

        if (errors) {
            return res.status(404).send({ message: JSON.stringify(errors) });
        }

        const comment = await Comment.findByPk(req.params.commentId);

        if (!comment) {
            if (errors) {
                errors.comment = 'Comment is not valid';
            } else {
                errors = { comment: 'Comment is not valid' };
            }
        }

        if (errors) {
            return res.status(404).send({ message: JSON.stringify(errors) });
        }

        await comment.update({ deleted: true });

        res.status(200).send({
            id: comment.id,
            status: true,
        });
    } catch (err) {
        res.status(400).send({ message: err.toString() });
    }
}
