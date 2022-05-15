const User = require('../models/user')
const UserLocation = require('../models/user-location')
const { validationResult } = require('express-validator')
const fileHelper = require('../util/file')
const bcrypt = require('bcryptjs')
const Message = require('../models/message')

exports.getUser = (req, res, next) => {
    const userId = req.params.userId
    User.findById(userId)
        .then(user => {
            res.status(200).json({
                user: user
            })
        }).catch(err => {
            if(!err.statusCode) {
                err.statusCode = 500   
            }
            next(err)
        })
}

exports.getUsersLocation = (req, res, next) => {
    UserLocation.find({ 'geolocation.latitude': { $ne: null } })
        .then(locations => {
            res.status(200).json({
                locations: locations
            })
        }).catch(err => {
            if(!err.statusCode) {
                err.statusCode = 500
            }
            next(err)
        })
}

exports.editProfile = (req, res, next) => {
    const userId = req.userId
    const firstName = req.body.firstName
    const lastName = req.body.lastName
    const email = req.body.email
    const image = req.file
    const imageChanged = req.body.imageChanged
    const errors = validationResult(req)

    if(imageChanged === 'true' && !image) {
        const error = new Error('Must provide image in .jpg, .png, .jpeg')
        error.statusCode = 422
        throw error
    }

    if(!errors.isEmpty()) {
        const error = new Error(errors.array()[0].msg)
        error.statusCode = 422
        throw error
    }

    User.find({ email: email })
        .then(users => {
            if(users.length > 0 && users[0]._id.toString() !== userId) {
                const error = new Error('The email is already in use!')
                error.statusCode = 422
                throw error 
            }
        return User.findById(userId)
        }).then(user => {
            if(
                user.firstName === firstName && 
                user.lastName === lastName && 
                user.email === email &&
                imageChanged === 'false'
            ) {
                const error = new Error(`User didn't change!`)
                error.statusCode = 422
                throw error
            }

            user.firstName = firstName
            user.lastName = lastName
            user.email = email

            if(image) {
                fileHelper.deleteFile(user.imageUrl)
                user.imageUrl = image.path
            }

            return user.save()
        }).then(user => {
            res.status(201).json({
                msg: 'Edited succefully!',
                user: user
            })
        }).catch(err => {
            if(!err.statusCode) {
                err.statusCode = 500
            }
            next(err)
        })
}

exports.editPassword = (req, res, next) => {
    const password = req.body.password
    const newPassword = req.body.newPassword
    const userId = req.userId
    const errors = validationResult(req)
    let loadedUser

    if(!errors.isEmpty()) {
        const error = new Error(errors.array()[0].msg)
        error.statusCode = 422
        throw error
    }
    
    User.findById(userId)
        .then(user => {
            loadedUser = user
            return bcrypt.compare(password, loadedUser.password)
        }).then(isEqual => {
            if(!isEqual) {
                const error = new Error('Corrent password is wrong!')
                error.statusCode = 422
                throw error
            }
            return bcrypt.hash(newPassword, 12)
        }).then(hashPassword => {
            loadedUser.password = hashPassword
            loadedUser.save()
        }).then(user => {
            res.status(201).json({
                msg: 'Password changed!',
                user: user
            })
        }).catch(err => {
            if(!err.statusCode) {
                err.statusCode = 500
            }
            next(err)
        })
}

exports.deleteAccount = (req, res, next) => {
    const userId = req.userId
    const imageUrl = req.body.imageUrl

    Message.deleteMany({ $or:[{ 'from': userId }, { 'to': userId }]})
        .then(result => {
            return UserLocation.deleteOne({ userId: userId })
        }).then(result => {
            fileHelper.deleteFile(imageUrl)
            return User.findByIdAndDelete(userId)
        }).then(result => {
            res.status(201).json({
                msg: 'So sad to see you go!',
            })
        }).catch(err => {
            if(!err.statusCode) {
                err.statusCode = 500
            }
            next(err)
        })
}

exports.searchForUsers = (req, res, next) => {
    const search = req.body.search
    const userId = req.userId
    const errors = validationResult(req)

    if(!errors.isEmpty()) {
        const error = new Error(errors.array()[0].msg)
        error.statusCode = 422
        throw error
    }

    const regex = new RegExp(search, 'i')

    User.find({ $or:[{ 'firstName': regex }, { 'lastName': regex }], _id: { $ne: userId }})
        .then(users => {
            res.status(201).json({
                users: users,
            })
        }).catch(err => {
            if(!err.statusCode) {
                err.statusCode = 500
            }
            next(err)
        })
}