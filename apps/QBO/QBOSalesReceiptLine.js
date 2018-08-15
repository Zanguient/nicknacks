const QBOSalesReceiptLine = (transaction) => {

    let defaults = [
        {
            //"Id": "1",
            "LineNum": 1,
            "Description": transaction.details.generalDescription,
            "Amount": transaction.details.totalAmount,
            "DetailType": "SalesItemLineDetail",
            "SalesItemLineDetail": {

                // currently just peg everything as custom
                "ItemRef": {
                    "value": "42",
                    "name": "Custom item"
                },
                "UnitPrice": transaction.details.totalAmount,
                "Qty": 1,
                "TaxCodeRef": {
                    "value": "15"
                }
            }
          },{
            "Amount": transaction.details.totalAmount,
            "DetailType": "SubTotalLineDetail",
            "SubTotalLineDetail": {}
          }
    ]

    return defaults
}
module.exports = QBOSalesReceiptLine;
