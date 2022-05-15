const path = require('path')
const fs = require('fs')

const express = require('express')
const mongoose = require('mongoose')
const bodyParser = require('body-parser')
const compression = require('compression')
const morgan = require('morgan')

const MONGODB_URI = 
    `mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASSWORD}@cluster0.2jj3p.mongodb.net/${process.env.MONGO_DATABASE}?retryWrites=true&w=majority`

// Importing Routes
const authRoutes = require('./routes/auth')
const userRoutes = require('./routes/user')
const messageRoutes = require('./routes/message')

const app = express()

const accessLogStream = fs.createWriteStream(
    path.join(__dirname, 'access.log'),
    {flags: 'a'}
)

app.use(compression())
app.use(morgan('combined', { stream: accessLogStream }))
app.use(bodyParser.json())
app.use('/images', express.static(path.join(__dirname, 'images')))

// Middleware to allow Origin (CORS), Methods and Headers
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*')
    res.setHeader('Access-Control-Allow-Methods', '*')
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
    next()
})

app.use('/', (req, res, next) => {
    res.send('<h1>Hello</h1>')
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
        const server = app.listen(process.env.PORT || 3000);
        const io = require('./socket').init(server)
    }).catch(err => {
        console.log(err);
    })