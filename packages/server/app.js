require('dotenv').config()

var createError = require('http-errors');
var express = require('express');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var notifyAgentRouter = require('./routes/notifyAgent');
var notifyAgentBuildRouter = require('./routes/notifyAgentBuild');

var app = express();

// view engine setup

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.use('/notify-agent', notifyAgentRouter);
app.use('/notify-agent-build', notifyAgentBuildRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
	next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
	console.log('hm...', err.message)

	// set locals, only providing error in development
	res.locals.message = err.message;
	res.locals.error = req.app.get('env') === 'development' ? err : {};

	// render the error page
	res.status(err.status || 500);
	res.end('error');
});

module.exports = app;
