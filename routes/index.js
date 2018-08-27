const express = require('express');
const router = express.Router();
const path = require('path');


/* GET home page. */
router.get('/admin_' + process.env.ADMIN_URL_SUFFIX + '*', function (req, res) {
// console.log(path.resolve(__dirname, '../dist/index.html'))
//
//     res.sendFile(path.resolve(__dirname, 'index.html'));
    res.render('admin')
});
// NICKNACK POST ROUTES
router.post('/create-sales-receipt', function(req, res) {

    const stripeChargesAMEX = 0.032;
    const stripeChargesMasterOrVisa = 0.027;

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
        if (!transaction.details.customerEmail) {
            // SEND EMAIL !!!
            throw 'CRITICAL: There is no email given in the stripe transaction.';
        }

        return QBO.findCustomersAsync([{
            field: 'PrimaryEmailAddr', value: transaction.details.customerEmail
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

            if (_TRANSACTION.details.address) D.set(sparseUpdates, 'BillAddr.Line1', _TRANSACTION.details.address);
            if (_TRANSACTION.details.addressZip) D.set(sparseUpdates, 'BillAddr.PostalCode', _TRANSACTION.details.addressZip);
            if (_TRANSACTION.details.addressCountry) D.set(sparseUpdates, 'BillAddr.Country', _TRANSACTION.details.addressCountry);

            // do the update
            return QBO.updateCustomerAsync(sparseUpdates);

        } else {

            // if there is no existing customer, create a new one.
            var newCustomer = {};

            // the minimum
            D.set(newCustomer, 'PrimaryEmailAddr.Address', _TRANSACTION.details.customerEmail);
            D.set(newCustomer, 'DisplayName', _TRANSACTION.details.customerName);

            // other information

            // address
            if (_TRANSACTION.details.address) D.set(newCustomer, 'BillAddr.Line1', _TRANSACTION.details.address);
            if (_TRANSACTION.details.addressZip) D.set(newCustomer, 'BillAddr.PostalCode', _TRANSACTION.details.addressZip);
            if (_TRANSACTION.details.addressCountry) D.set(newCustomer, 'BillAddr.Country', _TRANSACTION.details.addressCountry);

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

        } else {

            _CUSTOMER = {
                Id: customer.Id,
                DisplayName: customer.DisplayName
            };
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
        TxnDate = salesReceipt.TxnDate = _TRANSACTION.details.transactionDateQBOFormat;
        salesReceipt.PaymentRefNum = _TRANSACTION.details.transactionReferenceCode;
        //salesReceipt.TxnSource = 'stripe'; //invalid enumeration

        // reference number
        DocNumber = salesReceipt.DocNumber = salesReceipt.PrivateNote = _TRANSACTION.details.salesOrderNumber;

        // create single product line
        // to upgrade this portion when magento can send meta data
        salesReceipt.Line = [
          {
            //"Id": "1",
            "LineNum": 1,
            "Description": _TRANSACTION.details.generalDescription,
            "Amount": _TRANSACTION.details.totalAmount,
            "DetailType": "SalesItemLineDetail",
            "SalesItemLineDetail": {

              // currently just peg everything as custom
              "ItemRef": {
                "value": "42",
                "name": "Custom item"
              },
              "UnitPrice": _TRANSACTION.details.totalAmount,
              "Qty": 1,
              "TaxCodeRef": {
                "value": "15"
              }
            }
          },
          {
            "Amount": _TRANSACTION.details.totalAmount,
            "DetailType": "SubTotalLineDetail",
            "SubTotalLineDetail": {}
          }
        ];

        salesReceipt.TotalAmt = _TRANSACTION.details.totalAmount;
        if (req.body.privateNote) salesReceipt.PrivateNote = req.body.privateNote;

        var createSalesReceipt = QBO.createSalesReceiptAsync(salesReceipt);
        promises.push(createSalesReceipt);

        // create expense - expense is called `purchase` by QuickBooks
        var expense = require('../apps/QBOPurchase');

        expense.DocNumber = DocNumber;
        expense.TxnDate = TxnDate;


        // check the country of credit card origin to apply the commission correctly.
        var stripeCommission;

        if (_TRANSACTION.details.creditCardIsAMEXorIsNotSG) {
            stripeCommission = Math.round(_TRANSACTION.details.totalAmount * 100 * stripeChargesAMEX)/100;
        } else {
            stripeCommission = Math.round(_TRANSACTION.details.totalAmount * 100 * stripeChargesMasterOrVisa)/100;
        }

        // add the 50 cent
        stripeCommission += 0.50;

        expense.Line = [
          {
            // convert totalAmount to 100s and take 3.4%, round off, then convert back to 2 decimals, add 50 cents
            "Amount": stripeCommission,
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

        if (_COGS === 0) {

            promises.push(false);

        } else {
            // create journal entry
            var Entry = require('../apps/QBOJournalCOGS');
            var entry = Entry({
                "DocNumber": DocNumber,
                "TxnDate": TxnDate,
                "PrivateNote": "COGS: " + _TRANSACTION.details.generalDescription + "($" + _COGS + ")",
                "TotalAmt": _COGS
            });

            var createJournalCOGS = QBO.createJournalEntryAsync(entry);
            promises.push(createJournalCOGS);
        }
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
        if (_CREATED_SALES_RECEIPT && D.get(_CREATED_SALES_RECEIPT, "Id")) _TRANSACTION.qboSalesReceiptId = D.get(_CREATED_SALES_RECEIPT, "Id");
        if (_CREATED_EXPENSE && D.get(_CREATED_EXPENSE, "Id")) _TRANSACTION.qboStripeExpenseId = D.get(_CREATED_EXPENSE, "Id");
        if (_CREATED_EXPENSE && D.get(_CREATED_JOURNAL, "Id")) _TRANSACTION.qboCOGSJournalId = D.get(_CREATED_JOURNAL, "Id");

        return _TRANSACTION.save().catch(function(err) {
            console.log('CRITICAL: Transaction for sales order ' + _TRANSACTION.details.salesOrderNumber + ' cannot be saved as completed. Reversing all entries.');

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

// STRIPE WEBHOOK ROUTES
router.post('/charge-succeeded', function (req, res) {

    if(D.get(req, 'body.livemode') === false) {
        console.log(req.body);
        return res.send({ success: true });
    }

    if(req.query.token !== process.env.STRIPE_SIMPLE_TOKEN) return res.status(403).send();

    // get sales order number
    var salesOrderNumber = D.get(req, 'body.data.object.description');

    if(!salesOrderNumber) {
        return res.status(400).send({ success: false, error: { message: 'unable to parse sales order number.'} });
    } else {
        salesOrderNumber = salesOrderNumber.split(',')[0].trim();
    }


    // save the data
    return DB.Transaction.create({
        data: req.body,
        status: 'pending',
        paymentMethod: 'stripe',
        eventType: 'charge-succeeded',
        salesOrderNumber: salesOrderNumber,
        eventId: req.body.id
    })
    .then(function (transaction) {
        // send success
        return res.send({
            success: true
        });
    })
    .catch(function (err) {
        // log the error
        console.log("CRITICAL: Failed to capture stripe charge with error: " + err);
        res.status(500).send();
    });

});

router.post('/refunded', function (req, res) {

    if(req.query.token !== process.env.STRIPE_SIMPLE_TOKEN) return res.status(403).send();

    if(D.get(req, 'body.livemode') === false) {
        console.log(req.body);
        return res.send({ success: true });
    }

    // get sales order number
    var salesOrderNumber = D.get(req, 'body.data.object.description');

    if(!salesOrderNumber) {
        return res.status(400).send({ success: false, error: { message: 'unable to parse sales order number.'} });
    } else {
        salesOrderNumber = salesOrderNumber.split(',')[0].trim();
    }

    var _TRANSACTION;

    // save the data
    return DB.Transaction.create({
        data: req.body,
        status: 'pending',
        eventType: 'refunded',
        salesOrderNumber: salesOrderNumber,
        eventId: req.body.id,
        paymentMethod: 'stripe'
    })
    .then(function (transaction) {

        _TRANSACTION = transaction;

        var calculateStripeCommissionAmountOnRefund = require('../apps/calculateStripeCommissionAmountOnRefund');
        var stripeCommissionReturned = calculateStripeCommissionAmountOnRefund(transaction.data);

        // create a journal entry to reduce stripe commission
        return QBO.createJournalEntryAsync({
            "DocNumber": transaction.salesOrderNumber + '-R',
            "TxnDate": transaction.details.transactionDateQBOFormat,
            "PrivateNote": "Refund for " + transaction.details.salesOrderNumber,
            "Line": [{
                // credit stripe transit cash for refund
                "Id": "0",
                "Amount": D.get(transaction.data, 'data.object.amount_refunded')/100,
                "DetailType": "JournalEntryLineDetail",
                "JournalEntryLineDetail": {
                    // take out from stripe transit account
                    "PostingType": "Credit",
                    "AccountRef": {
                        "value": "46",
                        "name": "Stripe Transit"
                    }
                }
            }, {
                // debit sales refund
                "Amount": D.get(transaction.data, 'data.object.amount_refunded')/100,
                "DetailType": "JournalEntryLineDetail",
                "JournalEntryLineDetail": {
                    "PostingType": "Debit",
                    "AccountRef": {
                        "value": "30",
                        "name": "Sales Refund"
                    }
                }
            }, {
                // debit stripe transit because stripe will return some money in refund.
                "Id": "1",
                "Amount": stripeCommissionReturned,
                "DetailType": "JournalEntryLineDetail",
                "JournalEntryLineDetail": {
                    "PostingType": "Debit",
                    "AccountRef": {
                        "value": "46",
                        "name": "Stripe Transit"
                    }
                }
            }, {
                // credit expenses to lower expenses from recovered stripe commission
                "Amount": stripeCommissionReturned,
                "DetailType": "JournalEntryLineDetail",
                "JournalEntryLineDetail": {
                    "PostingType": "Credit",
                    "AccountRef": {
                        "value": "33",
                        "name": "Stripe Charges"
                    }
                }
            }]
        });

    })
    .then(function(journalEntry) {

        if (!journalEntry || D.get(journalEntry, 'Fault')) throw journalEntry;

        _TRANSACTION.qboRefundJournalId = D.get(journalEntry, "Id");
        _TRANSACTION.status = "completed";

        return _TRANSACTION.save();

    })
    .then(function(transaction) {
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

router.post('/payout-paid', function (req, res) {

    if(D.get(req, 'body.livemode') === false) {
        console.log(req.body);
        return res.send({ success: true });
    }

    if(req.query.token !== process.env.STRIPE_SIMPLE_TOKEN) return res.status(403).send();


    // save the data
    var _PAYOUTPAID;
    return DB.PayoutPaid.create({
        data: req.body,
        status: 'pending',
        eventId: req.body.id
    })
    .then(function (payoutPaid) {

       _PAYOUTPAID = payoutPaid;

        var Entry = require('../apps/QBOJournalPayoutPaid');
        var entry = Entry(payoutPaid.data);

        return QBO.createJournalEntryAsync(entry);

    })
    .then(function(response) {

        if (D.get(response, 'Fault')) throw response;

        _PAYOUTPAID.status = 'completed';
        return _PAYOUTPAID.save();
    })
    .then(function() {
        // send success
        return res.send({
            success: true
        });
    })
    .catch(function (err) {
        // log the error
        console.log("CRITICAL: Failed to capture stripe payoutpaid with error: " + err);
        if (_PAYOUTPAID) {
            _PAYOUTPAID.status = 'failed';
            _PAYOUTPAID.save().catch(function(err) { console.log("CRITICAL: Failed to set payout to `failed`"); });
        }
        res.status(500).send();
    });

});

module.exports = router;
