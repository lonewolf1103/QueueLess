const express = require('express');
const {registerController,loginController, logoutController} = require('../Controllers/auth.controller');
const {authMiddleware} = require('../Middleware/auth.middleware');

const router = express.Router();

router.post('/register', registerController)
router.post('/login', loginController)

router.get('/me', authMiddleware, (req,res)=>{
    res.json({
        message:"Authenticated user",
        user: req.user
    })
})

router.post('/logout', logoutController)

module.exports = router