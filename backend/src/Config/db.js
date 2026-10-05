const mongoose = require('mongoose');

async function connectDB() {
    try {
        
        await mongoose.connect(process.env.MONGO_URI)
        console.log("Connected to database");

    } catch (err) {
        console.log("Having issue in connecting to database");
        process.exit(1)
    }
}

module.exports = connectDB