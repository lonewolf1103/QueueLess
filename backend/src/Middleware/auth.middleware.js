const jwt = require('jsonwebtoken');
const userModel = require('../Models/user.model');
const mongoose = require('mongoose')

const authMiddleware = async (req,res,next) => {
    const token = req.cookies.token || req.headers.authorization?.split(" ")[1];

    if(!token){
         return res.status(401).json({
            message: "Unauthorized access, token is invalid"
        })
    }

    try {

        const decoded = jwt.verify(token, process.env.JWT_SECRET);


        const user = await userModel.findById(
            new mongoose.Types.ObjectId(decoded.id)
        )


        if(!user){
            return res.status(401).json({
                message: "User no longer exists"
            })
        }

        req.user = user

        return next()
        
    } catch (err) {

        return res.status(401).json({
            message: "Unauthorized access, token is invalid"
        })
    }

};


module.exports = {authMiddleware}
