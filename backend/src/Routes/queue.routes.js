const express = require('express');
const { getAvailableQueuesController, joinQueueController, getMyQueueEntryController } = require('../Controllers/user.queue.controller');
const { createQueueController, getMyQueueController, getQueueEntriesController, callNextController, CompleteQueueEntryController, updatedQueueStatusController } = require('../Controllers/queue.controller');
const { authMiddleware } = require('../Middleware/auth.middleware');
const { adminMiddleware } = require('../Middleware/admin.middleware');

const router = express.Router();

router.post('/create',authMiddleware, adminMiddleware, createQueueController )
router.get('/my', authMiddleware, adminMiddleware, getMyQueueController)
router.get('/:queueId/entries', authMiddleware, adminMiddleware, getQueueEntriesController )
router.post('/:queueId/next', authMiddleware, adminMiddleware, callNextController)
router.post('/:queueId/complete', authMiddleware, adminMiddleware, CompleteQueueEntryController)
router.patch('/:queueId/status', authMiddleware, adminMiddleware, updatedQueueStatusController)


router.get('/available', authMiddleware, getAvailableQueuesController )
router.post('/join', authMiddleware, joinQueueController)
router.get('/:queueId/my-entry', authMiddleware, getMyQueueEntryController )

module.exports = router;
