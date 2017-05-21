function QBOJournalCOGS(object) {
  var QBOJournalCOGSObject = object;

  QBOJournalCOGSObject.Line = [
    {
      "Id": "0",
      //"Description": "Craig TV Console",
      "Amount": object.Amount,
      "DetailType": "JournalEntryLineDetail",
      "JournalEntryLineDetail": {
        "PostingType": "Credit",
        "AccountRef": {
          "value": "8",
          "name": "Inventory"
        },
        "TaxCodeRef": {
          "value": "17"
        },
        "TaxApplicableOn": "Purchase",
        "TaxAmount": 0.0
      }
    },
    {
      "Id": "1",
      //"Description": "Craig TV Console",
      "Amount": object.Amount,
      "DetailType": "JournalEntryLineDetail",
      "JournalEntryLineDetail": {
        "PostingType": "Debit",
        "AccountRef": {
          "value": "25",
          "name": "Cost of Sales"
        },
        "TaxCodeRef": {
          "value": "17"
        },
        "TaxApplicableOn": "Purchase",
        "TaxAmount": 0.0
      }
    }
  ];
  
  return QBOJournalCOGSObject;

}

module.exports = QBOJournalCOGSObject;
