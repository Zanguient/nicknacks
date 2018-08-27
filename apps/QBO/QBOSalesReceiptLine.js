const QBOSalesReceiptLine = (transactionDetails) => {

    let defaults = [
        {
            //"Id": "1",
            "LineNum": 1,
            "Description": transactionDetails.generalDescription,
            "Amount": transactionDetails.totalAmount,
            "DetailType": "SalesItemLineDetail",
            "SalesItemLineDetail": {

                // currently just peg everything as custom
                "ItemRef": {
                    "value": "42",
                    "name": "Custom item"
                },
                "UnitPrice": transactionDetails.totalAmount,
                "Qty": 1,
                "TaxCodeRef": {
                    "value": "15"
                }
            }
        },{
            "Amount": transactionDetails.totalAmount,
            "DetailType": "SubTotalLineDetail",
            "SubTotalLineDetail": {}
        }
    ]

    return defaults
}
module.exports = QBOSalesReceiptLine;
