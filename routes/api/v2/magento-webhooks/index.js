var express = require('express');
var router = express.Router();

router.post('/checkout', function (req, res) {

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
        eventType: 'checkout',
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
        console.log("CRITICAL: Failed to capture checkout with error: " + err);
        res.status(500).send();
    });

});



module.exports = router;
