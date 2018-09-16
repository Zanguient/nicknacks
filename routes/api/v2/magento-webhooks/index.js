const express = require('express')
const router = express.Router()
const debug = require('debug')('nn:api:magento-webhooks')
const wunderlistBot = require(__appsDir + '/wunderlistBot_v2/index')

router.post('*', (req, res, next) => {
    if(req.query.token !== process.env.STRIPE_SIMPLE_TOKEN) return res.status(403).send()
    next()
})

router.post('/sales-order', (req, res, next) => {

    debug(req.body)

    if(D.get(req, 'query.livemode') === 'false') {
        console.log(req.body)
        return res.send({ success: false })
    }

    if(D.get(req, 'body.type') && !(D.get(req, 'body.type').toLowerCase() === 'order')) {
        let error = new Error('This endpoint accepts `order` type calls only.')
        error.status = 400
        throw error
    }

    // get sales order number
    var salesOrderNumber = D.get(req, 'body.increment_id')

    if(!salesOrderNumber) {
        let error = new Error('Missing `increment_id` parameter as salesOrderNumber.')
        error.status = 400
        throw error
    }

    // get paymentMethod
    var paymentMethod = D.get(req, 'body.data.payment_method')

    if(!paymentMethod) {
        let error = new Error('Missing `payment_method` parameter as salesOrderNumber.')
        error.status = 400
        throw error
    }

    // find if transaction already exist
    DB.Transaction.findOne({
        where: {
            salesOrderNumber: req.body.increment_id
        }
    }).then(txn => {

        return DB.sequelize.transaction(t => {

            let promises = []

            var date = D.get(req, 'body.data.delivery_date')
            date = (date) ? convertToUnixMS(date) : null

            // if transaction doesn't exist, create it.
            if(!txn) {
                let createTransaction = DB.Transaction.create({
                    data: req.body,
                    status: 'pending',
                    eventType: 'checkout',
                    salesOrderNumber: salesOrderNumber,
                    paymentMethod: paymentMethod.toLowerCase(),
                    deliveryDate: date

                }, {transaction: t})
                promises.push(createTransaction)
            }

            // whether transaction exist or not, create the wunderlist.
            // wunderlist will not be duplicated if it already exist
            let wunderlist = wunderlistBot(req.body, {transaction: t})
            promises.push(wunderlist)

            return PROMISE.all(promises)

        })


    }).then(() => {
        // send success
        return res.send({
            success: true
        })

    }).catch(error => { API_ERROR_HANDLER(error, req, res, next) })

})

router.post('/sales-order/comment', (req, res, next) => {

    debug(req.body)

    if(D.get(req, 'query.livemode') === 'false') {
        console.log(req.body)
        return res.send({ success: false })
    }

    if(D.get(req, 'body.type') && !(D.get(req, 'body.type').toLowerCase() === 'ordercomment')) {
        let error = new Error('This endpoint accepts `ordercomment` type calls only.')
        error.status = 400
        throw error
    }

    // get sales order number
    var salesOrderNumber = D.get(req, 'body.increment_id')

    if(!salesOrderNumber) {
        let error = new Error('Missing `increment_id` parameter as salesOrderNumber.')
        error.status = 400
        throw error
    }

    // peculiar to orderComment, the increment_id contains the sales order id and underscored its own ID.
    salesOrderNumber = salesOrderNumber.split('_')
    salesOrderNumber = salesOrderNumber[0]

    // just create order_id for downstream use
    req.body.order_id = salesOrderNumber

    // find if transaction already exist
    var _TXN
    DB.Transaction.findOne({
        where: {
            salesOrderNumber: salesOrderNumber
        }
    }).then(txn => {

        if(!txn) {
            let error = new Error('Sales order is not found. Please ensure that the "order" created and the webhook is working.')
            error.status = 400
            throw error
        }
        _TXN = txn

        return wunderlistBot(req.body)

    }).then(() => {

        var date = D.get(req, 'body.data.delivery_date')
        if (date) date = convertToUnixMS(date)

        // sequelize knows if there is a change and will not hit the DB if there isn't
        _TXN.deliveryDate = date
        _TXN.deliveryConfirmed = false
        return _TXN.save()

    }).then(() => {

        // send success
        return res.send({
            success: true
        })

    }).catch(error => { API_ERROR_HANDLER(error, req, res, next) })

})

router.post('/others', (req, res, next) => {

    debug(req.body)

    if(D.get(req, 'query.livemode') === 'false') {
        console.log(req.body)
        return res.send({ success: false })
    }

    // get sales order number
    var salesOrderNumber = D.get(req, 'body.order_id')

    if(!salesOrderNumber) {
        let error = new Error('Missing `order_id` parameter as salesOrderNumber.')
        error.status = 400
        throw error
    }

    var _TXN

    // find if transaction already exist
    DB.Transaction.findOne({
        where: {
            salesOrderNumber: salesOrderNumber
        }
    }).then(txn => {

        if(!txn) {
            let error = new Error('Sales order is not found. Please ensure that the "order" created and the webhook is working.')
            error.status = 400
            throw error
        }

        _TXN = txn

        return wunderlistBot(req.body)

    }).then(() => {

        if (['shipment', 'shipmentcomment'].indexOf(req.body.type.toLowerCase()) !== -1) {
            var date = D.get(req, 'body.data.delivery_date')
            if (date) date = convertToUnixMS(date)

            // sequelize knows if there is a change and will not hit the DB if there isn't
            _TXN.deliveryDate = date

            // it will be weird if a delivery order is sent out without a date....
            if(date) _TXN.deliveryConfirmed = true

            return _TXN.save()

        } else { return false }

    }).then(() => {

        // send success
        return res.send({
            success: true
        })

    }).catch(error => { API_ERROR_HANDLER(error, req, res, next) })

})

function convertToUnixMS(date) {
    if (!date) return date
    if (typeof date === 'number') date = date.toString()
    if (date.length < 10.1) date += '000'

    if (date.length !== 13) {
        throw new Error('Date format is invalid.')
    }
    return date
}

module.exports = router;
