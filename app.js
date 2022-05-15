const path = require('path')

const express = require('express')
const mongoose = require('mongoose')
const bodyParser = require('body-parser')

// Importing routes
const authRoutes = require('./routes/auth')
const userRoutes = require('./routes/user')
const messageRoutes = require('./routes/message')

const MONGODB_URI = 
    'mongodb://localhost:27017/wherechat'

const app = express()
app.use(bodyParser.json())
app.use('/images', express.static(path.join(__dirname, 'images')))

// Middleware to allow Origin (CORS), Methods and Headers
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*')
    res.setHeader('Access-Control-Allow-Methods', '*')
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
    next()
})

// Using Routes
app.use('/auth', authRoutes)
app.use('/user', userRoutes)
app.use('/message', messageRoutes)

//Error Handling Middleware
app.use((error, req, res, next) => {
    const status = error.statusCode || 500
    const msg = error.message
    res.status(status).json({ msg: msg })
})

mongoose.connect(MONGODB_URI)
    .then(result => {
        const server = app.listen(3000);
        const io = require('./socket').init(server)
    }).catch(err => {
        console.log(err);
    })