function calculateStripeCommissionAmount(transactionDetails) {

    const stripeChargesAMEX = 0.032;
    const stripeChargesMasterOrVisa = 0.027;

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
