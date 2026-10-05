const mongoose = require('mongoose');

const queueSchema = new mongoose.Schema({
    name:{
        type: String,
        required: true,
        trim: true
    },
    admin:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        required: true
    },
    lastToken:{
        type: Number,
        default: 0
    },
    currentToken: {
        type: Number,
        default: 0
    },
    isActive: {
        type: Boolean,
        default: true
    }
},{
    timestamps: true
});


const queueModel = mongoose.model('queue', queueSchema);

module.exports = queueModel