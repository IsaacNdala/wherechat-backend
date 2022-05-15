const express = require('express')
const { body } = require('express-validator')

const messageController = require('../controllers/message')
const isAuthMiddleware = require('../middleware/is-auth')

const router = express.Router()

router.post('/send-message', 
    body('to')
    .not().isEmpty()
    .withMessage(`To can't be empty`),
    body('content')
    .not().isEmpty()
    .withMessage(`Message can't be empty`),
    isAuthMiddleware,
    messageController.sendMessage
)

router.get('/view-messages/:to', isAuthMiddleware, messageController.viewMessages)

router.get('/get-all-messages', isAuthMiddleware, messageController.getAllMessages)

module.exports = router