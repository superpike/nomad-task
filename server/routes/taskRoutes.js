const express = require('express');
const TaskController = require('../controllers/taskController');

const router = express.Router();

router.get('/tasks', TaskController.getTasks);
router.post('/tasks', TaskController.createTask);
router.put('/tasks/:taskId', TaskController.changeTaskStatus);
router.link('/tasks/:taskId', TaskController.assignUser);
// router.delete('/tasks/:taskId', TaskController.archiveTask);

module.exports = router;