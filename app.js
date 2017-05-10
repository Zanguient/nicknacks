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
var parseString = require('xml2js').parseString;

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


// attempt refresh on server start
retrieveTokenAndRefresh();

// attempt refresh every 1 week
setInterval(retrieveTokenAndRefresh, 6.048e+8);


function retrieveTokenAndRefresh() {
    // get the token
    DB.Token.findById(1)
        .then(function (token) {
            // check validity of token data.
            if (!token || !token.data || !token.data.oauth_token || !token.data.oauth_token_secret) {
                throw new Error('CRITICAL: Obtaining token from database failed.');
            }

            // save token to global variables
            global.QBO_ACCESS_TOKEN = token.data.oauth_token;
            global.QBO_ACCESS_TOKEN_SECRET = token.data.oauth_token_secret;

            // send request to refresh token
            return refreshQBOToken();

        })
        .then(function (accessToken) {
            // save the token
            return DB.Token.findOrCreate({
                where: {
                    TokenID: 1
                },
                defaults: {
                    data: accessToken
                }
            });
        })
        .catch(function (err) {
            // log the error
            console.log(err);
        })

}

// connect to quickbooks to refresh token
function refreshQBOToken() {
    // return a promise
    return new Promise(function (resolve, reject) {
        if (!global.QBO_ACCESS_TOKEN || !global.QBO_ACCESS_TOKEN_SECRET) throw new Error('CRITICAL: Failed to initalise tokens to the global namespace.');

        rp({
            method: 'GET',
            uri: QuickBooks.APP_CENTER_BASE + '/api/v1/connection/reconnect',
            oauth: {
                consumer_key: process.env.qbo_consumerKey,
                consumer_secret: process.env.qbo_consumerSecret,
                token_secret: global.QBO_ACCESS_TOKEN_SECRET,
                token: global.QBO_ACCESS_TOKEN
            },
            json: true
        })
            .then(function (response) {

                // set the responseParsed store
                var responseParsed = {};

                // check if the response is not an Object
                if (typeof response === 'string') {
                    parseString(response, function (err, result) {
                        if (err) {
                            throw new Error('Unable to receive valid XML response.')
                        }
                        // assign the parsedResponse
                        responseParsed = result.ReconnectResponse ? result.ReconnectResponse : result.PlatformResponse;
                    });
                }

                // check if there is an error
                if (parseInt(responseParsed.ErrorCode[0]) !== 0) {
                    // throw error with the message
                    throw new Error(responseParsed.ErrorMessage);
                }

                // check for tokens
                if (!responseParsed.oauth_token[0] || !responseParsed.oauth_token_secret[0]) {
                    throw new Error('Unable to get 2nd leg token from QBO API.');
                }

                // attach session with secret
                req.session.oauth_token_secret = requestToken.oauth_token_secret;

                var token = {
                    oauth_token: responseParsed.OAuthToken[0],
                    oauth_token_secret: responseParsed.OAuthTokenSecret[0]
                };

                // resolve the promise
                resolve(token);

            })
            .catch(function (err) {
                // reject the promise
                reject(err);
            });
    });
}


// refresh the QBO token
//refreshQBOToken();


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
