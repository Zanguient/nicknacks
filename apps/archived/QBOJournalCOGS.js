function QBOJournalCOGS(object) {
  var QBOJournalCOGSObject = object;

  QBOJournalCOGSObject.Line = [
    {
      "Id": "0",
      "Description": object.PrivateNote,
      "Amount": object["TotalAmt"],
      "DetailType": "JournalEntryLineDetail",
      "JournalEntryLineDetail": {
        "PostingType": "Credit",
        "AccountRef": {
          "value": "29",
          "name": "Inventory Asset"
        }
        // ,
        // "TaxCodeRef": {
        //   "value": "17"
        // },
        // "TaxApplicableOn": "Purchase",
        // "TaxAmount": 0.0
      }
    },
    {
      "Id": "1",
      "Description": object.PrivateNote,
      "Amount": object["TotalAmt"],
      "DetailType": "JournalEntryLineDetail",
      "JournalEntryLineDetail": {
        "PostingType": "Debit",
        "AccountRef": {
          "value": "28",
          "name": "Cost of Sales"
        }
        // ,
        // "TaxCodeRef": {
        //   "value": "17"
        // },
        // "TaxApplicableOn": "Purchase",
        // //"TaxAmount": 0.0
      }
    }
  ];

  //QBOJournalCOGSObject.TxnTaxDetail =  {};

  
  return QBOJournalCOGSObject;

}

module.exports = QBOJournalCOGS;
