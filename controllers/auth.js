const User = require('../models/user')
const { validationResult } = require('express-validator')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const secret = 'verysecretandimportanttokeepinprivate'
const UserLocation = require('../models/user-location')

exports.signUp = (req, res, next) => {
    const firstName = req.body.firstName
    const lastName = req.body.lastName
    const email = req.body.email
    const password = req.body.password
    const latitude = req.body.latitude
    const longitude = req.body.longitude
    const errors = validationResult(req)
    let loadedUser

    if (!errors.isEmpty()) {
        const error = new Error(errors.array()[0].msg)
        error.statusCode = 422
        throw error
    }
    
    User.findOne({ email: email })
        .then(user => {
            if(user) {
                const error = new Error('The email is already in use')
                error.statusCode = 422
                throw error 
            }
            return bcrypt.hash(password, 12)
        }).then(hashPassword => {
            const newUser = new User({
                firstName: firstName,
                lastName: lastName,
                email: email,
                password: hashPassword
            })
            return newUser.save()
        }).then(user => {
            loadedUser = user
            const newUserLocation = new UserLocation({
                geolocation: {
                    latitude: latitude,
                    longitude: longitude
                },
                userId: loadedUser._id
            })
            return newUserLocation.save()
        }).then(result => {
            req.userId = loadedUser._id.toString()
            const token = jwt.sign(
                {email: loadedUser.email, userId: loadedUser._id.toString()},  
                secret,
                { expiresIn: '7d' }
            )
            res.status(201).json({
                msg: "Account created successfully!",
                token: token,
                user: loadedUser,
                userId: loadedUser._id.toString()
            })
                
        }).catch(err => {
            if(!err.satusCode) {
                err.satusCode = 500
            }
            next(err)
        })
}

exports.signIn = (req, res, next) => {
    const email = req.body.email
    const password = req.body.password
    const latitude = req.body.latitude
    const longitude = req.body.longitude
    const errors = validationResult(req)
    let loadedUser;

    if (!errors.isEmpty()) {
        const error = new Error(errors.array()[0].msg)
        error.statusCode = 422
        throw error
    }

    User.findOne({ email: email })
        .then(user => {
            if(!user) {
                const error = new Error('No user with this email!')
                error.statusCode = 401
                throw error
            }
            loadedUser = user
            return bcrypt.compare(password, loadedUser.password)
        }).then(isEqual => {
            if(!isEqual) {
                const error = new Error('Wrong password!')
                error.statusCode = 401
                throw error
            }
            return UserLocation.findOne({ userId: loadedUser._id })
        }).then(userLocation => {
            userLocation.geolocation.latitude = latitude
            userLocation.geolocation.longitude = longitude

            return userLocation.save()
        }).then(result => {
            req.userId = loadedUser._id.toString()
            const token = jwt.sign(
                {email: loadedUser.email, userId: loadedUser._id.toString()}, 
                secret,
                { expiresIn: '7d' }
            )
            res.status(200).json({ 
                msg: `Welcome back ${loadedUser.firstName}`, 
                token: token, 
                user: loadedUser,
                userId: loadedUser._id.toString()
            })
        }).catch(err => {
            if(!err.statusCode) {
                err.statusCode = 500
            }
            next(err)
        })
}