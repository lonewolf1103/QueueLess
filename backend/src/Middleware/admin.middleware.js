const userModel = require('../Models/user.model');

const adminMiddleware = async (req,res,next) => {
    
    const isAdmin = req.user.role;

    if(isAdmin !== "admin"){
        return res.status(403).json({
            message:"Unauthorized access, only admin can access"
        })
    }

    return next()
};

module.exports = {adminMiddleware};