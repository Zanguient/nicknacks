//load environment variables
require('dotenv').load();

//load models the last because it has dependencies on the previous globals.
global.DB = require('./models/index.js');

var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session');
var request = require('request');
var rp = require('request-promise');
var QuickBooks = require('node-quickbooks');
var qs = require('querystring');

//var QuickBooks = require('node-quickbooks');
var QBO, QBO_TOKEN, QBO_SECRET;

var index = require('./routes/index');
var users = require('./routes/users');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'publicindex.js', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({resave: false, saveUninitialized: false, secret: 'smith'}));

app.use('/', index);
app.use('/users', users);


// connect to quickbooks
function refreshQBOToken() {

    rp({
        method: 'POST',
        uri: 'https://appcenter.intuit.com/api/v1/connection/reconnect',
        body: {},
        oauth: {
            consumer_key: process.env.qbo_consumerKey,
            consumer_secret: process.env.qbo_consumerSecret
        },
        json: true
    })
        .then(function (response) {

            if (response.ErrorCode !== 0) throw new Error(response);


            var requestToken = qs.parse(response);

            if (!requestToken.oauth_token || !requestToken.oauth_token_secret) return res.status(400).send('Unable to get 2nd leg token from QBO API.');

            // attach session with secret
            req.session.oauth_token_secret = requestToken.oauth_token_secret;

            // redirect to QBO authorisation
            res.redirect(QuickBooks.APP_CENTER_URL + requestToken.oauth_token);

        })
        .catch(function (err) {

            // send out an email to notify failure
            console.log(JSON.stringify(err));

        });
}

// refresh the QBO token
refreshQBOToken();


// catch 404 and forward to error handler
app.use(function (req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
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
