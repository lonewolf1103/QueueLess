const mongoose = require('mongoose');

const queueEntrySchema = new mongoose.Schema({
    queue:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'queue',
        required: true
    },
    user:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        required: true
    },
    tokenNumber:{
        type: Number,
        required: true
    },
    status:{
        type: String,
        enum:["WAITING","SERVING","COMPLETED"],
        default: "WAITING"
    }
},{
    timestamps: true
});


const queueEntryModel = mongoose.model('queueEntry', queueEntrySchema);

module.exports = queueEntryModel;