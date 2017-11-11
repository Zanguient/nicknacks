//load environment variables
require('dotenv').load();

//load models the last because it has dependencies on the previous globals.
global.Promise = global.PROMISE = require('bluebird');
global.DB = require('./models/index.js');
global.MOMENT = require('moment');
global.D = require('dottie');

global.serverStatus = [];

const WunderlistSDK = require('wunderlist');
global.WL = new WunderlistSDK({
  'accessToken': process.env.WL_ACCESS_TOKEN,
  'clientID': process.env.WL_CLIENT_ID
});


WL.http.lists.all().done(function (lists) {
    // all is good
    return;
}).fail(function () {
    console.error('CRITICAL: Wunderlist connection failed.');
    global.serverStatus.push('Wunderlist connection failed.');
});

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

var retry = require('retry');

//var QuickBooks = require('node-quickbooks');
var QBO, QBO_TOKEN, QBO_SECRET;

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'publicindex.js', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({resave: false, saveUninitialized: false, secret: 'smith'}));

app.use('/', require('./routes/index'));
app.use('/qbo', require('./routes/qbo'));
app.use('/inventory', require('./routes/inventory'));

const notifier = require('mail-notifier');
const wunderlistBot = require('./apps/wunderlistBot')

const imap = {
    user: 'root@greyandsanders.com',
    password: process.env.ZOHO_EMAIL_PASSWORD,
    host: 'imappro.zoho.com',
    port: 993,
    tls: true,
    tlsOptions: { rejectUnauthorized: false }
};


function connectToMailBox() {

    var operation = retry.operation();

    operation.attempt(function(currentAttempt) {

        var n;

        try {

            n = notifier(imap);  
            
            n.on('mail', function(mail) {
                console.log('received new mail!');
                wunderlistBot(mail)
            });
            n.on('end', function() {
                console.log('notifier ended, restarting');
                n.start();  
            });
            n.start();

        } catch (e) {

            serverStatus.push(e);
            operation.retry(e);

        }

    });  
}

connectToMailBox();

// attempt refresh on server start
retrieveTokenAndRefresh();

// attempt refresh every 1 week
setInterval(retrieveTokenAndRefresh, 6.048e+8);

function retrieveTokenAndRefresh() {
    // get the token
    DB.Token.findById(1).then(function (token) {

        // check validity of token data.
        if (!token || !token.data || !token.data.oauth_token || !token.data.oauth_token_secret) {
            throw { message: 'CRITICAL: Obtaining token from database failed.' };
        }

        // save token to global variables
        global.QBO_ACCESS_TOKEN = token.data.oauth_token;
        global.QBO_ACCESS_TOKEN_SECRET = token.data.oauth_token_secret;




        // send request to attempt to refresh token

        // NOTE: Oauth Access tokens expire 180 days from the date they were created.
        //       Oauth token Reconnect API can be called between 151 days and 179 days 
        //       (after 5 months and before expiry).

        var ageOfToken = MOMENT() - MOMENT(token.updatedAt);

        // ageOfToken > 160 days. (using 160 days to be safe.)
        if (ageOfToken > 1.382e+10) {
            return refreshQBOToken();
        } else {
            return false;
        } 

    }).then(function() {

        // initialise quickbooks
        global.QBO = new QuickBooks(
            process.env.qbo_consumerKey,
            process.env.qbo_consumerSecret,
            global.QBO_ACCESS_TOKEN,
            global.QBO_ACCESS_TOKEN_SECRET,
            process.env.qbo_realmID,
            false, // use the Sandbox
            true // turn debugging on
        );
        global.QBO = PROMISE.promisifyAll(global.QBO);

    }).catch(function (err) {
        // log the error
        console.log(err);
        global.serverStatus = err;

    });



    // connect to quickbooks to refresh token. returns a promise
    function refreshQBOToken() {

        if (!global.QBO_ACCESS_TOKEN || !global.QBO_ACCESS_TOKEN_SECRET) throw new Error('CRITICAL: Failed to initalise tokens to the global namespace.');

        // send the request to quickbooks
        // this promise is returned to #retrieveTokenAndRefresh 
        return rp({

            method: 'GET',
            uri: QuickBooks.APP_CENTER_BASE + '/api/v1/connection/reconnect',
            oauth: {
                consumer_key: process.env.qbo_consumerKey,
                consumer_secret: process.env.qbo_consumerSecret,
                token_secret: global.QBO_ACCESS_TOKEN_SECRET,
                token: global.QBO_ACCESS_TOKEN
            },
            json: true

        }).then(function (response) {

            // set the responseParsed store
            var responseParsed = {};

            // check if the response is not an Object
            if (typeof response === 'string') {
                parseString(response, function (err, result) {
                    if (err) {
                        throw new Error('Unable to parse valid XML response.')
                    }
                    // assign the parsedResponse
                    responseParsed = result.ReconnectResponse ? result.ReconnectResponse : result.PlatformResponse;
                });
            }

            // check if there is an error
            var errorCode = parseInt(responseParsed.ErrorCode[0]);

            if (errorCode === 212) {

                // token is not refreshed, return nothing, life goes on...
                console.log('CRITICAL: Token refresh is attempted and failed due to current token still valid. Token invalidated, please re-auth to get new token.');
                
                // SEND EMAIL!!!!
                return false;

            } else if (errorCode === 0) {

                // token is refreshed. need update the globals and save to DB

                var token = {
                    "oauth_token_secret": responseParsed.OAuthTokenSecret[0],
                    "oauth_token": responseParsed.OAuthToken[0]
                };

                // set globals to the newly retrieved tokens
                global.QBO_ACCESS_TOKEN = responseParsed.OAuthToken[0];
                global.QBO_ACCESS_TOKEN_SECRET = responseParsed.OAuthTokenSecret[0];

                // refreshed token is updated to DB
                return DB.Token.update({
                    data: token
                }, { 
                    where: {
                        TokenID: 1
                    }
                });

            } else {

                // SEND EMAIL!!!!
                
                // any other errorCode, print out the error.
                throw { message: 'Error code: ' + responseParsed.ErrorCode[0] + ' Message: ' + responseParsed.ErrorMessage[0] };
            
            }
        });
    }
}


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

    res.json({
        success: false,
        error: {
            message: 'Server error: ' + error.message +'. Please check console log.',
            hideMessage: false,
            debug: error
        }
    });
    
    //res.render('error');
});

module.exports = app;
