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


router.post('/charge-succeeded', function (req, res) {

    if(req.query.token !== process.env.STRIPE_SIMPLE_TOKEN) return res.status(403).send();

    // save the data
    return DB.Transaction.create({
        transaction: req.body,
        status: 'pending',
        eventType: 'charge-succeeded'
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

        res.status(500).send();
    });

});

router.post('/refunded', function (req, res) {

    if(req.query.token !== process.env.STRIPE_SIMPLE_TOKEN) return res.status(403).send();

    // save the data
    return DB.Transaction.create({
        transaction: req.body,
        status: 'pending',
        eventType: 'refunded'
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

        res.status(500).send();
    });

});

router.get('/test', function(req, res) {
    QBO.findAccountsAsync(function(_, accounts) {
      accounts.QueryResponse.Account.forEach(function(account) {
        console.log(account.Name)
      })
    })
})

router.post('/create-sales-receipt', function(req, res) {

    var salesReceipt = require('../apps/QBOSalesReceipt');

    var _TRANSACTION;
    DB.Transaction.findById(req.body.transactionID).then(function(transaction) {

        _TRANSACTION = transaction;

        return QBO.findCustomers([{
            field: 'PrimaryEmailAddr', value: transaction.customerEmail
        }]);

    }).then(function(qboCustomer) {

        return console.log(qboCustomer);

        // if valid, `customer` is an array 
        var customer = D.get(qboCustomer, 'QueryResponse.Customer');

        // if there is an existing customer, update the details
        if (customer) {
            customer = customer[0];

            // get and increment the sync token
            var syncToken = D.get(customer, 'SyncToken');
            syncToken = parseInt(syncToken) + 1;

            // set all the updates
            var sparseUpdates = {
                Id: customer.Id,
                SyncToken: syncToken,
                sparse: true
            };


            if (_TRANSACTION.address) D.set(sparseUpdates, 'BillAddr.Line1');
            if (_TRANSACTION.addressZip) D.set(sparseUpdates, 'BillAddr.PostalCode');
            if (_TRANSACTION.addressCountry) D.set(sparseUpdates, 'BillAddr.Country');
        
            // do the update
            //QBO.updateCustomer(sparseUpdates)

        }

        // if there is no existing customer, create a new one.

        salesReceipt.TxnDate = transaction.transactionDateQBOFormat;

        // to upgrade this portion when magento can send meta data
        salesReceipt.Line = [
          {
            //"Id": "1",
            "LineNum": 1,
            "Description": transaction.generalDescription,
            "Amount": transaction.totalAmount,
            "DetailType": "SalesItemLineDetail",
            "SalesItemLineDetail": {
              // "ItemRef": {
              //   "value": "4",
              //   "name": "Design"
              // },
              "UnitPrice": transaction.totalAmount,
              "Qty": 1,
              "TaxCodeRef": {
                "value": "NON"
              }
            }
          },
          {
            "Amount": transaction.totalAmount,
            "DetailType": "SubTotalLineDetail",
            "SubTotalLineDetail": {}
          }
        ];


    })
    .catch(function (err) {
        // log the error
        console.log('CRITICAL: ' + err);

        res.status(500).send();

    });

    

    // QBO.createSalesReceipt({}, function(e, ff) {

    // });
});


module.exports = router;
