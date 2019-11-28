const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const useragent = require('express-useragent');
const basicAuth = require('express-basic-auth');
const session = require('express-session');
const chalk = require('chalk');
const cli = require('./bin/cli');
const utils = require('./bin/utils');

cli.welcome();
/** event dispatcher */
const EventEmitter = require('events');
const Config = require('./config');

class Dispatcher extends EventEmitter {
}

const eventDispatcher = new Dispatcher();

let app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'twig');
app.use(useragent.express());
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.set('trust proxy', 1) // trust first proxy
app.use(session({
    secret: Config.secret,
    resave: false,
    saveUninitialized: true,
    cookie: {
        secure: Config.useHttps,
        maxAge: 30000
    }
}));

let indexRouter = require('./routes/index.js')(eventDispatcher);
let mapeditorRouter = require('./routes/editor.js')(eventDispatcher);
app.use('/', indexRouter);
app.use('/editor', mapeditorRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
    next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.render('error');
});

module.exports = app;
