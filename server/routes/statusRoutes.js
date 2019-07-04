const express = require('express');
const StatusController = require('../controllers/statusController');

const router = express.Router();

router.get('/statuses', StatusController.getStatuses);

module.exports = router;