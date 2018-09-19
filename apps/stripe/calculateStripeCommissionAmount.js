'use strict'

const debug = require('debug')('nn:stripe:calculateStripeCommissionAmount')
debug.log = console.log.bind(console)

function calculateStripeCommissionAmount(charge) {

    debug('calculateStripeCommissionAmount:')
    debug(charge)

    let object = {}

    object.creditCardOriginCountry = D.get(charge, 'data.data.object.source.country')
    object.creditCardOriginCountryIsSG = (D.get(charge, 'data.data.object.source.country') === 'SG')
    object.creditCardIsAMEXorIsNotSG = (D.get(charge, 'data.data.object.source.country') !== 'SG' || D.get(charge, 'data.data.object.source.brand') === 'American Express')

    object.totalAmount = (function(charge) {
        if (typeof charge.data.data.object.amount === "undefined") {
            let error = new Error('CRITICAL: Stripe charge missing `amount`.')
            throw error
        }

        // stripe amount is in cents. need to divide by 100;
        return parseInt(charge.data.data.object.amount)/100;
    })(charge)

    let amount = parseFloat(object.totalAmount)

    if (isNaN(amount)) throw new Error('`totalAmount` is NaN')

    // declare the credit card charges.
    let stripeChargesAMEX = parseFloat(process.env.STRIPE_CHARGES_AMEX)
    if (isNaN(stripeChargesAMEX)) throw new Error('Environment variables `STRIPE_CHARGES_AMEX` not defined.')

    let stripeChargesMasterOrVisa = parseFloat(process.env.STRIPE_CHARGES_AMEX_MASTER_VISA)
    if (isNaN(stripeChargesMasterOrVisa)) throw new Error('Environment variables `STRIPE_CHARGES_AMEX_MASTER_VISA` not defined.')

    var stripeCommission

    if (object.creditCardIsAMEXorIsNotSG) {
        stripeCommission = Math.round(amount * 100 * parseFloat(stripeChargesAMEX))/100;
    } else {
        stripeCommission = Math.round(amount * 100 * parseFloat(stripeChargesMasterOrVisa))/100;
    }

    // add the 50 cent
    stripeCommission += 0.50;

    // calculate the new stripe commission.
    return stripeCommission

}

module.exports = calculateStripeCommissionAmount;
