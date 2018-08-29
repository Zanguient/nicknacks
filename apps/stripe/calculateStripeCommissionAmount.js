'use strict'

const debug = require('debug')('nn:stripe:calculateStripeCommissionAmount')

function calculateStripeCommissionAmount(transactionDetails) {

    debug('calculateStripeCommissionAmount:')
    debug(transactionDetails)

    let amount = parseFloat(transactionDetails.totalAmount)
    if (isNaN(amount)) throw new Error('`totalAmount` is NaN')

    // declare the credit card charges.
    const stripeChargesAMEX = process.env.STRIPE_CHARGES_AMEX;
    const stripeChargesMasterOrVisa = process.env.STRIPE_CHARGES_AMEX_MASTER_VISA;

    var stripeCommission

    if (transactionDetails.creditCardIsAMEXorIsNotSG) {
        stripeCommission = Math.round(amount * 100 * stripeChargesAMEX)/100;
    } else {
        stripeCommission = Math.round(amount * 100 * stripeChargesMasterOrVisa)/100;
    }

    // add the 50 cent
    stripeCommission += 0.50;

    // calculate the new stripe commission.
    return stripeCommission

}

module.exports = calculateStripeCommissionAmount;
