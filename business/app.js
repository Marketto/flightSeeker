const createError = require('http-errors');
const express = require('express');
const cookieParser = require('cookie-parser');
const logger = require('morgan');

const rootRouter = require('./routes/rootRouter');
const compression = require('compression');

const app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(compression({
    level: 9
}));

app.use('/', rootRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    next(createError(404));
});

// error handler
// eslint-disable-next-line no-unused-vars
app.use(function(err, req, res, next) {
    console.error(err);
    // render the error page
    res.status(err.status || 500);
    res.send(req.app.get('env') === 'development' ? err : {});
});

module.exports = app;