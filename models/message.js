const mongoose = require('mongoose')
const Schema = mongoose.Schema

const messageSchema = new Schema({
    content: {
        type: String,
        required: true
    },
    from: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    to: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    viewed: {
        type: Boolean,
        required: true,
        default: false
    }
}, { timestamps: true })

module.exports = mongoose.model('Message', messageSchema)