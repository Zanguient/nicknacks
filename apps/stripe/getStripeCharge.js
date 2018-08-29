'use strict'

const debug = require('debug')('nn:apps:stripe:getStripeCharge')


function getStripeCharge(salesOrderNumber) {

    return DB.StripeEvent.findOne({
        where: {
            salesOrderNumber: salesOrderNumber,
            eventType: 'charge-succeeded'
        }
    }).then(charge => {
        if (!charge) throw new Error('stripe charge object not found.')

        return charge
    })

}

module.exports = getStripeCharge
