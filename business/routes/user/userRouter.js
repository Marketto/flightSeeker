const express = require('express');
const router = require('./authUserRouter');
const flightListRouter = require('./flightListRouter');
const flightListFlightRouter = require('./flightListFlightRouter');
const {
    SLUG_MATCHER
} = require('../routingConst');




function resUser(req, res) {
    console.log("[resDbUser]");
    res.send(req.user)
}

/*router.get('/:userId', checkJwt, getDbUser, (req, res) => {
    //TODO
    res.send(req.user)
});*/
const flightListPath = '/flight-list';
router.use(`${flightListPath}/:flightListSlug(${SLUG_MATCHER})`, flightListFlightRouter);
router.use(`${flightListPath}`, flightListRouter);
router.get('/', resUser);

module.exports = router;