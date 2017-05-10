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


module.exports = router;
