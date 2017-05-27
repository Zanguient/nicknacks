function calculateStripeCommissionAmountOnRefund(stripeObject) {

    var total = parseInt(D.get(stripeObject, 'data.object.amount'));
    var amountRefunded = parseInt(D.get(stripeObject, 'data.object.amount_refunded'));

    if (isNaN(total) || isNaN(amountRefunded)) throw new Error("CRITICAL: calculateStripeCommissionAmountOnRefund: total or amountRefunded is NaN.");

    // if it is full refund
    if (total === amountRefunded) return total/100;

    // calculate the new stripe commission.
    return Math.round(amountRefunded * 0.034)/100;

}

module.exports = calculateStripeCommissionAmountOnRefund;
