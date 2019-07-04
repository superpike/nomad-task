const express = require('express');
const CommentController = require('../controllers/commentController');

const router = express.Router();

router.get('/comments', CommentController.getComments);
router.post('/comments', CommentController.createComment);
router.delete('/comments/:commentId', CommentController.deleteComment);

module.exports = router;