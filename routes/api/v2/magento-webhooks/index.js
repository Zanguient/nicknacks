const express = require('express')
const router = express.Router()

router.post('/checkout', function (req, res) {

    if(D.get(req, 'body.livemode') === false) {
        console.log(req.body)
        return res.send({ success: true })
    }

    if(D.get(req, 'body.type') && !D.get(req, 'body.type').toLowerCase() === 'order') {
        return res.status(400).send({
            success: false,
            message: 'This endpoint accepts `order` type calls only.',
            hideMessage: false,
            debug: {
                message: 'This endpoint accepts `order` type calls only.',
                error: null
            }
        })
    }

    if(req.query.token !== process.env.STRIPE_SIMPLE_TOKEN) return res.status(403).send()

    // get sales order number
    var salesOrderNumber = D.get(req, 'body.increment_id')

    if(!salesOrderNumber) {
        return res.status(400).send({
            success: false,
            message: 'Missing `increment_id` parameter as salesOrderNumber.',
            hideMessage: false,
            debug: {
                message: 'Missing `increment_id` parameter as salesOrderNumber.',
                error: null
            }
        })
    }

    // get paymentMethod
    var paymentMethod = D.get(req, 'body.data.payment_method')

    if(!paymentMethod) {
        return res.status(400).send({
            success: false,
            message: 'Missing `payment_method` parameter.',
            hideMessage: false,
            debug: {
                message: 'Missing `payment_method` parameter.',
                error: null
            }
        })
    }

    // save the data
    return DB.Transaction.create({

        data: req.body,
        status: 'pending',
        eventType: 'checkout',
        salesOrderNumber: salesOrderNumber,
        paymentMethod: paymentMethod

    }).then(function (transaction) {
        // send success
        return res.send({
            success: true
        })

    }).catch(function (err) {
        // log the error
        console.log("CRITICAL: Failed to capture checkout with error: " + err)
        res.status(500).send({
            success: false,
            message: 'Server error in creating `Transaction` DB record.',
            hideMessage: false,
            debug: {
                message: 'Server error in creating `Transaction` DB record.',
                error: JSON.stringify(err)
            }
        })
    })

})



module.exports = router;
