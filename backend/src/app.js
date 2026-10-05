const express = require('express');
const cookieParser = require('cookie-parser');
const cors = require('cors');

const app = express();

app.use(cors({
    origin: process.env.FRONTEND_URL,
    credentials: true
}))

app.use(express.json())
app.use(cookieParser())

/**
 * Routes required
 */

const authRouter = require('./Routes/auth.routes');
const queueRouter = require('./Routes/queue.routes');


/**
 * Routes use
 */

app.use('/api/auth',authRouter)
app.use('/api/queue', queueRouter )

module.exports = app