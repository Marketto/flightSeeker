const express = require('express');
const router = express.Router();
const userRouter = require('./user/userRouter');
const aviationRouter = require('./aviation/aviationRouter');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.use('/api/user', userRouter);
router.use('/api/aviation', aviationRouter);

module.exports = router;
