const QBOPurchase = (transactionDetails, stripeCommission) => {
    let defaults = {
        "AccountRef": {
            "value": "46",
            "name": "Stripe Transit"
        },
        "PaymentMethodRef": {
            "value": "1"
        },
        "PaymentType": "Cash",
        "EntityRef": {
            "value": "28",
            "name": "Stripe Commission",
            "type": "Vendor"
        },
        "GlobalTaxCalculation": "TaxExcluded"
        // "Line": [
        //   {
        //     "Amount": 10.00,
        //     "DetailType": "AccountBasedExpenseLineDetail",
        //     "AccountBasedExpenseLineDetail": {
        //      "AccountRef": {
        //         "name": "Meals and Entertainment",
        //         "value": "13"
        //       }
        //     }
        //   }
        // ]

    }

    defaults.TxnDate = transactionDetails.transactionDateQBOFormat
    defaults.DocNumber = transactionDetails.salesOrderNumber

    //description
    let description = 'SO: ' + transactionDetails.salesOrderNumber
    description += ', Name:' + transactionDetails.customerName
    description += ', Email: ' + transactionDetails.customerEmail

    defaults.Line = [
      {
        // convert totalAmount to 100s and take 3.4%, round off, then convert back to 2 decimals, add 50 cents
        "Amount": stripeCommission,
        "DetailType": "AccountBasedExpenseLineDetail",
        "Description": description,
        "AccountBasedExpenseLineDetail": {
          "AccountRef": {
            "value": "33",
            "name": "Stripe Charges"
          },
          "BillableStatus": "NotBillable",
          "TaxCodeRef": {
            "value": "9"
          }
        }
      }
    ]

    return defaults

}
module.exports = QBOPurchase;
