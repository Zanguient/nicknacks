function calculateStripeCommissionAmount(transactionDetails) {

    // declare the credit card charges.
    const stripeChargesAMEX = process.env.STRIPE_CHARGES_AMEX;
    const stripeChargesMasterOrVisa = process.env.STRIPE_CHARGES_AMEX_MASTER_VISA;

    var stripeCommissionAmount;

    if (transactionDetails.creditCardIsAMEXorIsNotSG) {
        stripeCommission = Math.round(transactionDetails.totalAmount * 100 * stripeChargesAMEX)/100;
    } else {
        stripeCommission = Math.round(transactionDetails.totalAmount * 100 * stripeChargesMasterOrVisa)/100;
    }

    // add the 50 cent
    stripeCommission += 0.50;

    // calculate the new stripe commission.
    return stripeCommissionAmount

}

module.exports = calculateStripeCommissionAmount;
