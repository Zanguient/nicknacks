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

    return console.log(req.body);

    if(req.query.token !== process.env.STRIPE_SIMPLE_TOKEN) return res.status(403).send();

    // get sales order number
    // var salesOrderNumber = req.body.data.object.description.split(','))[0].trim();
    //salesOrderNumber = salesOrderNumber.replace('#', '');

    // save the data
    return DB.Transaction.create({
        transaction: req.body,
        status: 'pending',
        eventType: 'charge-succeeded',
        salesOrderNumber: salesOrderNumber
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

router.post('/create-sales-receipt', function(req, res) {

    // request checking
    if ([undefined, null, false].indexOf(req.body.transactionID) > -1 || isNaN(parseInt(req.body.transactionID))) {
        return res.status(400).send({ success: false, error: { message: '`transactionID is missing or invalid.'}});
    } 

    var decimalPlaces = require('../apps/decimalPlaces');
    var _COGS = parseFloat(req.body.COGS);
    if ([undefined, null, false].indexOf(_COGS) > -1 || isNaN(_COGS)) {
        return res.status(400).send({ success: false, error: { message: '`COGS is missing or invalid.'}});
    } 
    if (decimalPlaces(_COGS) > 2) return res.status(400).send({ success: false, error: { message: '`COGS has more than 2 decimal places.'}});



    var _TRANSACTION, _CUSTOMER, _SALESRECEIPT;
    var _CREATED_SALES_RECEIPT, _CREATED_EXPENSE, _CREATED_JOURNAL;

    DB.Transaction.findById(req.body.transactionID).then(function(transaction) {

        if (!transaction) {
            return res.status(400).send({
                success: false,
                error: {
                    message: 'Unable to find transaction using `transactionID` provided',
                    hideMessage: false,
                    debug: {}
                }
            });
        }
        

        _TRANSACTION = transaction;

        // if somehow there is not customerEmail, which is our minimum requirement,
        // we will fail the server
        if (!transaction.customerEmail) {
            // SEND EMAIL !!!
            throw 'CRITICAL: There is no email given in the stripe transaction.';
        }

        return QBO.findCustomersAsync([{
            field: 'PrimaryEmailAddr', value: transaction.customerEmail
        }]);

    }).then(function(qboCustomer) {

        // if valid, `customer` is an array 
        var customer = D.get(qboCustomer, 'QueryResponse.Customer');
        
        if (customer) {

            // if there is an existing customer, update the details

            customer = customer[0];

            // we save customer id and name into private global
            // because QuickBooks may error the updating of customer
            // which is not critical to creation of sales receipt
            // so we need the id and name to continue
            _CUSTOMER = {
                Id: customer.Id,
                DisplayName: customer.DisplayName
            };

            // get and increment the sync token
            var syncToken = D.get(customer, 'SyncToken');
            syncToken = parseInt(syncToken) + 1;

            // set all the updates
            var sparseUpdates = {
                Id: customer.Id,
                SyncToken: syncToken,
                Active: true,
                sparse: true
            };

            if (_TRANSACTION.address) D.set(sparseUpdates, 'BillAddr.Line1', _TRANSACTION.address);
            if (_TRANSACTION.addressZip) D.set(sparseUpdates, 'BillAddr.PostalCode', _TRANSACTION.addressZip);
            if (_TRANSACTION.addressCountry) D.set(sparseUpdates, 'BillAddr.Country', _TRANSACTION.addressCountry);
        
            // do the update
            return QBO.updateCustomerAsync(sparseUpdates);

        } else {

            // if there is no existing customer, create a new one.
            var newCustomer = {};

            // the minimum
            D.set(newCustomer, 'PrimaryEmailAddr.Address', _TRANSACTION.customerEmail);
            D.set(newCustomer, 'DisplayName', _TRANSACTION.customerName);

            // other information

            // address
            if (_TRANSACTION.address) D.set(newCustomer, 'BillAddr.Line1', _TRANSACTION.address);
            if (_TRANSACTION.addressZip) D.set(newCustomer, 'BillAddr.PostalCode', _TRANSACTION.addressZip);
            if (_TRANSACTION.addressCountry) D.set(newCustomer, 'BillAddr.Country', _TRANSACTION.addressCountry);

            // create the customer
            return QBO.createCustomerAsync(newCustomer);
        }

    }).then(function(customer) {

        // sometimes updating customer causes error
        if (D.get(customer, 'Fault')) {

            // if there are more than one error, throw
            var errors = customer.Fault.Error;
            if (errors.length > 1) throw customer;

            // if there are less than 1 error, check if it is
            // stale object 5010

            if (errors[0].code === "5010") {
                console.log('Note: ' + errors[0].Message + ' for updating customer ' + _CUSTOMER.Id + ' ' + _CUSTOMER.DisplayName);
            } else {
                throw customer;
            }

        }

        var promises = [];

        // common info for QBO
        var DocNumber, TxnDate;

        // once customer is created/updated, create the sales receipt
        var salesReceipt = require('../apps/QBOSalesReceipt');


        // customer
        D.set(salesReceipt, 'CustomerRef', {
            // use _CUSTOMER which is updated further upstream
            // to prevent quickbooks from screwing things up.
            value: _CUSTOMER.Id,
            name: _CUSTOMER.DisplayName
        });

        // transaction date
        TxnDate = salesReceipt.TxnDate = _TRANSACTION.transactionDateQBOFormat;
        salesReceipt.PaymentRefNum = _TRANSACTION.transactionReferenceCode;
        //salesReceipt.TxnSource = 'stripe'; //invalid enumeration

        // reference number
        DocNumber = salesReceipt.DocNumber = salesReceipt.PrivateNote = _TRANSACTION.salesOrderNumber.replace('#', '');

        // create single product line
        // to upgrade this portion when magento can send meta data
        salesReceipt.Line = [
          {
            //"Id": "1",
            "LineNum": 1,
            "Description": _TRANSACTION.generalDescription,
            "Amount": _TRANSACTION.totalAmount,
            "DetailType": "SalesItemLineDetail",
            "SalesItemLineDetail": {

              // currently just peg everything as custom
              "ItemRef": {
                "value": "42",
                "name": "Custom item"
              },
              "UnitPrice": _TRANSACTION.totalAmount,
              "Qty": 1,
              "TaxCodeRef": {
                "value": "15"
              }
            }
          },
          {
            "Amount": _TRANSACTION.totalAmount,
            "DetailType": "SubTotalLineDetail",
            "SubTotalLineDetail": {}
          }
        ];

        salesReceipt.TotalAmt = _TRANSACTION.totalAmount;

        var createSalesReceipt = QBO.createSalesReceiptAsync(salesReceipt);
        promises.push(createSalesReceipt);

        // create expense - expense is called `purchase` by QuickBooks
        var expense = require('../apps/QBOPurchase');

        expense.DocNumber = DocNumber;
        expense.TxnDate = TxnDate;

        expense.Line = [
          {
            // convert totalAmount to 100s and take 3.4%, round off, then convert back to 2 decimals, add 50 cents
            "Amount": Math.round(_TRANSACTION.totalAmount * 100 * 0.034)/100 + 0.50,
            "DetailType": "AccountBasedExpenseLineDetail",
            "Description": "SO: " + _TRANSACTION.salesOrderNumber + ", Name: " + _TRANSACTION.customerName + ", Email: " + _TRANSACTION.customerEmail,
            "AccountBasedExpenseLineDetail": {
              "AccountRef": {
                "value": "33",
                "name": "Stripe Charges"
              },
              "BillableStatus": "NotBillable",
              "TaxCodeRef": {
                "value": "9"
              }
            }
          }
        ];
        var createExpense = QBO.createPurchaseAsync(expense);
        promises.push(createExpense);

        // create journal entry
        var Entry = require('../apps/QBOJournalCOGS');
        var entry = Entry({
            "DocNumber": DocNumber,
            "TxnDate": TxnDate,
            "PrivateNote": _TRANSACTION.generalDescription,
            "TotalAmt": _COGS
        });

        console.log('%%%%%%%');
        console.log(entry);
        var createJournalCOGS = QBO.createJournalEntryAsync(entry);
        promises.push(createJournalCOGS);

        return promises;

    }).spread(function(salesReceipt, expense, journalEntry) {

        _CREATED_SALES_RECEIPT = salesReceipt;
        _CREATED_EXPENSE = expense;
        _CREATED_JOURNAL = journalEntry;

        var errors = []
        

        // pushing errors
        var elements = [ salesReceipt, expense, journalEntry];
        for (var i = 0; i < elements.length; i++) {
            var element = elements[i];
            if (D.get(element, 'Fault')) errors.push(element);
        }

        if (errors.length > 0) {
            throw errors;
        }

        //then finally update the entry as completed.
        _TRANSACTION.status = 'completed';
        return _TRANSACTION.save().catch(function(err) {
            console.log('CRITICAL: Transaction for sales order ' + _TRANSACTION.salesOrderNumber + ' cannot be saved as completed. Reversing all entries.');
            
            return deleteAllEntriesIfSomeErrorsOccur(salesReceipt, expense, journalEntry);
        });

    })
    .then(function(transaction) {
        res.send({ success: true });
    })
    .catch(function (err) {
        // log the error

        console.log('CRITICAL: ' + err);

        if (typeof err === "object") console.log(JSON.stringify(err));
        if (D.get(err, 'stack')) console.log(err.stack);

        console.log('INFO: Reversing entries...');

        return deleteAllEntriesIfSomeErrorsOccur(_CREATED_SALES_RECEIPT, _CREATED_EXPENSE, _CREATED_JOURNAL, res);

    });

    

    function deleteAllEntriesIfSomeErrorsOccur(salesReceipt, expense, journalCOGS, res) {
        return PROMISE.resolve().then(function() {

            var deleteSalesReceipt, deleteExpense, deleteJournalCOGS;

            if (!D.get(salesReceipt, "Fault")) {
                var deleteSalesReceipt = QBO.deleteSalesReceiptAsync({ 
                    "Id": salesReceipt.Id,
                    "SyncToken": salesReceipt.SyncToken
                });
            }

            if (!D.get(expense, "Fault")) {
                var deleteExpense = QBO.deletePurchaseAsync({
                    "Id": expense.Id,
                    "SyncToken": expense.SyncToken
                });
            }

            if (!D.get(journalCOGS, "Fault")) {
                var deleteJournalCOGS = QBO.deleteJournalEntryAsync({
                    "Id": journalCOGS.Id,
                    "SyncToken": journalCOGS.SyncToken
                });
            }

            return [ 
                deleteSalesReceipt, 
                deleteExpense, 
                deleteJournalCOGS 
            ];

        }).catch(function(err) {
            console.log('CRITCAL: Errors occured when reversing entries.');
            res.status(500).send(JSON.stringify(err));
        });
    }
});


module.exports = router;
