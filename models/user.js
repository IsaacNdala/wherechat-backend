const path = require('path')

const mongoose  = require('mongoose')
const Schema = mongoose.Schema

const imagePath = 'images/user.png'

const userSchema = new Schema({
    firstName: {
        type: String,
        required: true,
    },
    lastName: {
        type: String,
        require: true
    },
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    imageUrl: { 
        type: String,
        default: imagePath
    }
}, { timestamps: true })

module.exports = mongoose.model('User', userSchema)