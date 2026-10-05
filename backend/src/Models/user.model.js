const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    username:{
        type: String,
        required: [true,"Username is must to create an account"],
        unique: true,
    },
    email:{
        type: String,
        trim: true,
        required: [true,"Email is must to create an account"],
        unique: true,
         match: [/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
            "Invalid email address"
        ],

    },
    password:{
        type: String,
        required: [true, "Password is required to create an account"],
        minLength: [6,"Password should contain atleast 6 characters"],
        select: false
    },
    role:{
        type: String,
        enum: ["user","admin"],
        default: "user"
    }
}, {
    timestamps: true
}
)


const userModel = mongoose.model("user",userSchema);


module.exports = userModel