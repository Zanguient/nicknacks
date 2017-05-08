var express = require('express');
var router = express.Router();
var qs = require('querystring');
var QuickBooks = require('node-quickbooks');
var request = require('request');
var rp = require('request-promise');

/* GET home page. */
router.get('/', function (req, res, next) {
    res.render('index', {title: 'Express'});
});

/* POST data */
router.post('/', function (req, res) {
    // validate data

    // save the data
    return DB.Transaction.create({
        transaction: req.body,
        status: 'pending'
    })
    .then(function (transaction) {
        // send success
        return res.send({
            success: true
        });
    })
    .catch(function (err) {
        // log the error
        console.log(err);

        res.send();
    });

});

router.post('/charge-succeeded', function (req, res) {
console.log(1111);
console.log(process.env.STRIPE_SIMPLE_TOKEN);    
    if(req.query.token !== process.env.STRIPE_SIMPLE_TOKEN) return res.status(403).send();

    // save the data
    return DB.Transaction.create({
        transaction: req.body,
        status: 'pending'
    })
    .then(function (transaction) {
        // send success
        return res.send({
            success: true
        });
    })
    .catch(function (err) {
        // log the error
        console.log(err);
    });

});


router.get('/requestToken', function(req, res) {

    if(process.env.QBO_ALLOW_GET_FRESH_TOKEN !== 'true') return res.status(400).send();

    rp({
        method: 'POST',
        uri: QuickBooks.REQUEST_TOKEN_URL,
        body: {},
        oauth: {
            callback: process.env.DOMAIN + '/callback',
            consumer_key: process.env.qbo_consumerKey,
            consumer_secret: process.env.qbo_consumerSecret
        },
        json: true
    }).then(function (response) {
        
        console.log(response);

        var requestToken = qs.parse(response);

        console.log(requestToken)

    }).catch(function (err) {
        
        if (err.statusCode) {
            res.status(err.statusCode)
        } else {
            res.status(500);
        }
        
        res.send(err);

    });



    // request.post(postBody, function (e, r, data) {
    //     var requestToken = qs.parse(data)
    //     req.session.oauth_token_secret = requestToken.oauth_token_secret
    //     res.redirect(QuickBooks.APP_CENTER_URL + requestToken.oauth_token);
    // });
})

router.get('/callback', function(req, res) {
    console.log(req.query);

    var postBody = {
        url: QuickBooks.ACCESS_TOKEN_URL,
        oauth: {
            consumer_key:    process.env.qbo_consumerKey,
            consumer_secret: process.env.qbo_consumerSecret,
            token:           req.query.oauth_token,
            token_secret:    req.session.oauth_token_secret,
            verifier:        req.query.oauth_verifier,
            realmId:         req.query.realmId
        }
    }

  request.post(postBody, function (e, r, data) {
    var accessToken = qs.parse(data);
    console.log(accessToken)
    console.log(postBody.oauth.realmId)

    if (e) {

    }

    global.QBO_ACCESS_TOKEN = accessToken.oauth_token;
    global.QBO_ACCESS_TOKEN_SECRET = accessToken.oauth_token_secret;

    // save the access token somewhere on behalf of the logged in user
    global.QBO = new QuickBooks(process.env.qbo_consumerKey,
                         process.env.qbo_consumerSecret,
                         accessToken.oauth_token,
                         accessToken.oauth_token_secret,
                         postBody.oauth.realmId,
                         false, // use the Sandbox
                         true); // turn debugging on

    // test out account access
    QBO.findAccounts(function(_, accounts) {
      accounts.QueryResponse.Account.forEach(function(account) {
        console.log(account.Name)
      })
    })
  });
  res.send('<!DOCTYPE html><html lang="en"><head></head><body><script>window.opener.location.reload(); window.close();</script></body></html>')
})

router.get('/accounts', function(req, res, next) {
    if (QBO) console.log(QBO);

    QBO.findAccounts(function(_, accounts) {
      accounts.QueryResponse.Account.forEach(function(account) {
        console.log(account.Name)
      })
    })
});


module.exports = router;
