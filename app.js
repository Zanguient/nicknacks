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
var request = require('request');

var QuickBooks = require('node-quickbooks');
var QBO, QBO_SECRET;

// connect to quickbooks
function connectToQBO () {
    request.post({
        url: QuickBooks.REQUEST_TOKEN_URL,
        oauth: {
            callback: process.env.DOMAIN + '/callback',
            consumer_key: process.env.qbo_consumerKey,
            consumer_secret: process.env.qbo_consumerSecret,
        }
    }, function(e, r, data) {
        var requestToken = qs.parse(data)
        QBO_SECRET = requestToken.oauth_token_secret;
        console.log(requestToken);
            QBO = new QuickBooks(
                process.env.qbo_consumerKey,
                process.env.qbo_consumerSecret,
                process.env.qbo_oauthToken,
                process.env.qbo_oauthTokenSecret,
                realmId,
                false,
                true
            )
    });
}

connectToQBO();




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
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', index);
app.use('/users', users);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
