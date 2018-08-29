const express = require('express');
const router = express.Router();
const path = require('path');

/* GET home page. */
router.get('/', (req, res) => {

    DB.Transaction.findAll({
        where: {
            eventType: 'charge-succeeded'
        }
    }).then(txns => {
        let promises = []
        for(let i=0; i<txns.length; i++) {
            let txn = txns[i]

            console.log(txn.data.data.object.description)

            // get sales order number
            var salesOrderNumber = D.get(txn, 'data.data.object.description');

            if(!salesOrderNumber) {
                let error = new Error('unable to parse sales order number.')
                error.status = 400
                throw error
            } else {
                salesOrderNumber = salesOrderNumber.split(',')[0].trim();
                salesOrderNumber = salesOrderNumber.replace('#', '');
            }

            let s = DB.StripeEvent.create({
                data: txn.data,
                eventType: 'charge-succeeded',
                salesOrderNumber: salesOrderNumber,
                eventId: txn.data.id
            })
            promises.push(s)

        }
        PROMISE.all(promises)
    }).then(() => {
        res.send()
    }).catch(err => {
        API_ERROR_HANDLER(err, req, res,)
    })

    //res.status(404).send()
});

/* GET home page. */
router.get('/admin_' + process.env.ADMIN_URL_SUFFIX + '*', (req, res) => {
    res.render('admin')
})

module.exports = router;
