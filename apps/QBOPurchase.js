var QBOPurchase = {
  "AccountRef": {
    "value": "31",
    "name": "Current"
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
module.exports = QBOPurchase