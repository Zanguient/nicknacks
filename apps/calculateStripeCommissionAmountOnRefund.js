function calculateStripeCommissionAmountOnRefund(stripeObject) {

    var total = parseInt(D.get(stripeObject, 'data.object.amount'));
    var amountRefunded = parseInt(D.get(stripeObject, 'data.object.amount_refunded'));

    if (isNaN(total) || isNaN(amountRefunded)) throw new Error("CRITICAL: calculateStripeCommissionAmountOnRefund: total or amountRefunded is NaN.");

    var stripeCommissionAmount;

    // if it is full refund
    // check whether is SG or overseas transaction
    var countryOfOrigin = D.get(stripeObject, 'data.object.source.country');
    if (!countryOfOrigin) throw new Error("CRITICAL: calculateStripeCommissionAmountOnRefund: countryOfOrigin is invalid.");


    // calucate the commission which strip will refund us
    if (countryOfOrigin === 'SG') {
        // 2.9% of the amount refunded
        stripeCommissionAmount = Math.round(amountRefunded * 0.029)/100;
    } else {
        // international charges, so 3.4% of the amount refunded
        stripeCommissionAmount = Math.round(amountRefunded * 0.034)/100;
    }


    // if it is a total refund, additional 0.50 refund of stripe fixed charges
    if (total === amountRefunded) stripeCommissionAmount + 0.50;

    // calculate the new stripe commission.
    return stripeCommissionAmount

}

module.exports = calculateStripeCommissionAmountOnRefund;
