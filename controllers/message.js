const Message = require('../models/message')
const { validationResult, Result } = require('express-validator')
const io = require('../socket')
const User = require('../models/user')

exports.sendMessage = (req, res, next) => {
    const from = req.userId
    const to = req.body.to
    const content = req.body.content
    const errors = validationResult(req)
    
    if (!errors.isEmpty()) {
        const error = new Error(errors.array()[0].msg)
        error.statusCode = 422
        throw error
    }

    const message = new Message({
        from: from,
        to: to,
        content: content
    })

    message.save()
        .then(message => {
            return Message.populate(message, ['from', 'to'])
        }).then(message => {
            io.getIO().emit('messages', { action: 'sent', message: message})
            res.status(201).json({
                message: 'Message sent successlly!'
            })
        }).catch(err => {
            if (!err.satusCode) {
                err.satusCode = 500
            }
            console.log(err)
            next(err)
        })
}

exports.viewMessages = (req, res, next) => {
    const from = req.userId
    const to = req.params.to

    Message.find({ $or:
        [
            { $and: [{ 'from': from }, { 'to': to }] },
            { $and: [{ 'to': from }, { 'from': to }] }
        ] 
    }).populate(['from', 'to']).then(messages => {
        res.status(200).json({
            messages: messages
        })
    }).catch(err => {
        if(!err.statusCode) {
            err.statusCode = 500
        }
        next(err)
    })
}

exports.getAllMessages = (req, res, next) => {
    const userId = req.userId
    Message.find({ $or: [{ 'from': userId }, { 'to': userId }] })
        .sort('-createdAt')
        .populate(['from', 'to'])
        .then(messages => {
            res.status(200).json({
                messages: messages
            })
        }).catch(err => {
            if(!err.statusCode) {
                err.statusCode = 500
            }
            next(err)
        })
}