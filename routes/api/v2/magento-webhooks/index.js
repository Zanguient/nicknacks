const express = require('express')
const router = express.Router()
const debug = require('debug')('api:magento-webhooks')
const wunderlistBot = require(__appsDir + '/wunderlistBot_v2/createWunderlistTask')

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

            // if transaction doesn't exist, create it.
            if(!txn) {
                let createTransaction = DB.Transaction.create({
                    data: req.body,
                    status: 'pending',
                    eventType: 'checkout',
                    salesOrderNumber: salesOrderNumber,
                    paymentMethod: paymentMethod.toLowerCase()

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

        return wunderlistBot(req.body)

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

        return wunderlistBot(req.body)

    }).then(() => {
        // send success
        return res.send({
            success: true
        })

    }).catch(error => { API_ERROR_HANDLER(error, req, res, next) })

})



module.exports = router;
