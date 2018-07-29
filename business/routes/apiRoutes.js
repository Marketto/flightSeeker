const express = require('express');
const router = express.Router();
const userRouter = require('./user/userRouter');
const aviationRouter = require('./aviation/aviationRouter');


router.use('/user', userRouter);
router.use('/aviation', aviationRouter);

module.exports = router;