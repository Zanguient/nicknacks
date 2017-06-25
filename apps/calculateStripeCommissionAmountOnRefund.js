function calculateStripeCommissionAmountOnRefund(stripeObject) {

    var total = parseInt(D.get(stripeObject, 'data.object.amount'));
    var amountRefunded = parseInt(D.get(stripeObject, 'data.object.amount_refunded'));

    if (isNaN(total) || isNaN(amountRefunded)) throw new Error("CRITICAL: calculateStripeCommissionAmountOnRefund: total or amountRefunded is NaN.");

    // if it is full refund
    // 3.4% of the amount refunded plus 50 cents stripe fixed charges.
    if (total === amountRefunded) return Math.round(total * 0.034)/100 + 0.50;

    // calculate the new stripe commission.
    return Math.round(amountRefunded * 0.034)/100;

}

module.exports = calculateStripeCommissionAmountOnRefund;
