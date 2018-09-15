//load environment variables
require('dotenv').load();

//load models the last because it has dependencies on the previous globals.
global.Promise = global.PROMISE = require('bluebird')
global.DB = require('./models/index.js')
global.MOMENT = require('moment')
global.D = require('dottie')
global.API_ERROR_HANDLER = require('./apps/apiErrorHandler')

global.serverStatus = [];

// path related globals
global.__appsDir = __dirname + '/apps'

const WunderlistSDK = require('wunderlist');
global.WL = new WunderlistSDK({
  'accessToken': process.env.WL_ACCESS_TOKEN,
  'clientID': process.env.WL_CLIENT_ID
});

let WLOptions = {
    retryLimit: 10,
    testInterval: 10,
    retryInterval: 1 //in minutes
}
const WLConnectionTest = require(__appsDir + '/wunderlistBot_v2/connectionTest.js')
WLConnectionTest(WLOptions);

var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session');
var request = require('request');
var rp = require('request-promise');
var qs = require('querystring');
var parseString = require('xml2js').parseString;

var retry = require('retry');
var cors = require('cors');

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
//app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'dist')));
app.use(session({resave: false, saveUninitialized: false, secret: 'smith'}));

// enable cors
app.use(cors());

app.use('/', require('./routes/index'));
app.use('/qbo', require('./routes/qbo'));
app.use('/panel', require('./routes/panel'));
app.use('/panel/inventory', require('./routes/panel/inventory'));
app.use('/panel/shipment', require('./routes/panel/shipment'));
app.use('/panel/inventory', require('./routes/panel/inventory'));

// api V1
app.use('/api/v1', require('./routes/api/v1'));

// api V2
app.use('/api/v2', require('./routes/api/v2'));
app.use('/api/v2/shipment', require('./routes/api/v2/shipment'));
app.use('/api/v2/magento-webhooks', require('./routes/api/v2/magento-webhooks'));
app.use('/api/v2/sales-receipt', require('./routes/api/v2/sales-receipt'));
app.use('/api/v2/inventory', require('./routes/api/v2/inventory'));
    app.use('/api/v2/inventory/movement-record', require('./routes/api/v2/inventory/movement-record'));
app.use('/api/v2/shipment', require('./routes/api/v2/shipment'));
app.use('/api/v2/stripe-webhooks', require('./routes/api/v2/stripe-webhooks'));
app.use('/api/v2/storage-location', require('./routes/api/v2/storage-location'));


/* SAFARI/IOS Bug */
app.all('*', function (req, res, next) {
  agent = req.headers['user-agent'];
  if (agent && agent.indexOf('Safari') > -1 && agent.indexOf('Chrome') === -1 && agent.indexOf('OPR') === -1) {
    res.header('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.header('Pragma', 'no-cache');
    res.header('Expires', 0);
  }
  next();
});

// attempt refresh on server start
const QBOToken = require('./apps/QBO/QBOToken')
QBOToken()

// catch 404 and forward to error handler
app.use(function (req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handler
app.use( (err, req, res, next) => {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {}

    API_ERROR_HANDLER(err, req, res, next)

});

module.exports = app;
