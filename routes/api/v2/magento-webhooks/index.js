var express = require('express');
var router = express.Router();

router.post('/checkout', function (req, res) {

    if(D.get(req, 'body.livemode') === false) {
        console.log(req.body);
        return res.send({ success: true });
    }

    //if(req.query.token !== process.env.STRIPE_SIMPLE_TOKEN) return res.status(403).send();

    // get sales order number
    var salesOrderNumber = D.get(req, 'body.increment_id');
    salesOrderNumber = parseInt(salesOrderNumber);
    if (isNaN(salesOrderNumber)) {
        return res.status(400).send({
            success: false,
            error: { message: 'unable to parse sales order number.'}
        });
    }
    if (D.get(req, 'body.type') !== 'order') {
        return res.status(400).send({
            success: false,
            error: { message: 'Expecting request `type` to `order`. Please check that you are accessing the correct endpoint.'}
        });
    }

    // save the data
    return DB.Transaction.create({
        data: req.body,
        status: 'pending',
        eventType: 'checkout',
        salesOrderNumber: salesOrderNumber,
        paymentMethod: D.get(req, 'body.data.payment_method')
    })
    .then(function (transaction) {
        // send success
        return res.send({
            success: true
        });
    })
    .catch(function (err) {
        // log the error
        console.log("CRITICAL: Failed to capture checkout with error: " + err);
        res.status(500).send({
            success: false,
            error: {
                message: '500 error',
                error: err
            }
        });
    });

});



module.exports = router;
