const express = require('express');
const router = express.Router();
const apiRoutes = require('./apiRoutes');
const staticRoutes = require('./staticRoutes');


router.use('/api', apiRoutes);
/* GET home page. */
router.use('/', staticRoutes);

module.exports = router;