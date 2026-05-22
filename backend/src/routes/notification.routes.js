const express = require('express');
const controller = require('../controllers/notification.controller');
const router = express.Router();

// GET /notifications — list notifications (optional ?unread=true&limit=50)
router.get('/', controller.list);

// GET /notifications/unread-count — badge count
router.get('/unread-count', controller.countUnread);

// POST /notifications/check — generate automatic notifications
router.post('/check', controller.checkAndGenerate);

// PATCH /notifications/read-all — mark all as read
router.patch('/read-all', controller.markAllRead);

// PATCH /notifications/:id/read — mark single as read
router.patch('/:id/read', controller.markRead);

module.exports = router;
