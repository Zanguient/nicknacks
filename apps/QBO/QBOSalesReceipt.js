var QBOSalesReceiptModel = (transaction, customer) => {

    let defaults = {
        "domain": "QBO",
        "sparse": false,
        //"Id": "11", //required for updates
        //"SyncToken": "0", //required for updates
        // "MetaData": {
        //   "CreateTime": "2014-09-16T14:59:48-07:00",
        //   "LastUpdatedTime": "2014-09-16T14:59:48-07:00"
        // }, // optional
        // "CustomField": [
        //   {
        //     "DefinitionId": "1",
        //     "Name": "Crew #",
        //     "Type": "StringType"
        //   }
        // ],
        //"DocNumber": "1003",
        //"TxnDate": "2014-09-14",
        // "Line": [
        //   {
        //     "Id": "1",
        //     "LineNum": 1,
        //     "Description": "Custom Design",
        //     "Amount": 337.5,
        //     "DetailType": "SalesItemLineDetail",
        //     "SalesItemLineDetail": {
        //       "ItemRef": {
        //         "value": "4",
        //         "name": "Design"
        //       },
        //       "UnitPrice": 75,
        //       "Qty": 4.5,
        //       "TaxCodeRef": {
        //         "value": "NON"
        //       }
        //     }
        //   },
        //   {
        //     "Amount": 337.5,
        //     "DetailType": "SubTotalLineDetail",
        //     "SubTotalLineDetail": {}
        //   }
        // ],
        "TxnTaxDetail": {
          "TotalTax": 0
        },
        // "CustomerRef": {
        //   "value": "6",
        //   "name": "Dylan Sollfrank"
        // },
        // "CustomerMemo": {
        //   "value": "Thank you for your business and have a great day!"
        // },
        // "BillAddr": {
        //   "Id": "49",
        //   "Line1": "Dylan Sollfrank",
        //   "Lat": "INVALID",
        //   "Long": "INVALID"
        // },
        //"TotalAmt": 337.5,
        "ApplyTaxAfterDiscount": false,
        // "PrintStatus": "NotSet",
        // "EmailStatus": "NotSet",
        "Balance": 0,
        "PaymentMethodRef": {
          "value": "3",
          "name": "Credit Card"
        },
        //"PaymentRefNum": "10264",

        // default to stripe transit account
        "DepositToAccountRef": {
          "value": "46",
          "name": "Stripe Transit"
        }
    }

    // customer
    defaults.CustomerRef = {
        value: customer.Id,
        name: customer.DisplayName
    }

    //dates and references
    defaults.TxnDate = transaction.details.transactionDateQBOFormat
    defaults.DocNumber = 'SO' + transaction.details.salesOrderNumber

    // total amount
    defaults.TotalAmt = transaction.details.totalAmount

    if (transaction.paymentMethod.toLowerCase() === 'stripe') {

        // now that stripe object is separately stored, cannot retrieve.
        //defaults.PaymentRefNum = transaction.transactionReferenceCode

        return defaults
    }

    if (transaction.paymentMethod.toLowerCase() === 'bank transfer') {

        defaults.PaymentMethodRef.value = 4
        defaults.PaymentMethodRef.name = "Bank Transfer"

        defaults.DepositToAccountRef.value = "64"
        defaults.DepositToAccountRef.name = "DBS Current"

        return defaults
    }

    throw new Error('`paymentMethod` invalid.')
}
module.exports = QBOSalesReceiptModel;
