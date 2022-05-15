const mongoose = require('mongoose')
const Schema = mongoose.Schema

const userLocationSchema = new Schema({
    geolocation: {
        latitude: {
            type: Number,
            default: null
        },
        longitude: {
            type: Number,
            default: null
        }
    },
    userId:{
        type: Schema.Types.ObjectId,
        ref: 'User'
    }, 
}, {timestamps: true})

module.exports = mongoose.model('UserLocation', userLocationSchema)