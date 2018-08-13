//User must be authorized
const authRouter = require('./authUserRouter');
const flightListRouter = require('./flightList/flightListRouter');
const accountRouter = require('./account/accountRouter');


function resUser(req, res) {
    console.log("[resDbUser]");
    res.send(req.user);
}

/*authRouter.get('/:userId', checkJwt, getDbUser, (req, res) => {
    //TODO
    res.send(req.user)
});*/
authRouter.use('/flight-list', flightListRouter);
authRouter.use('/account', accountRouter);
authRouter.get('/', resUser);

module.exports = authRouter;