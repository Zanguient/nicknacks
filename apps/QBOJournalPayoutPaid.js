function QBOJournalPayoutPaid(object) {
  var QBOJournalObject = object;

  QBOJournalObject.Line = [
    {
      "Id": "0",
      //"Description": "",
      "Amount": object["Amount"],
      "DetailType": "JournalEntryLineDetail",
      "JournalEntryLineDetail": {
        "PostingType": "Credit",
        "AccountRef": {
          "value": "46",
          "name": "Stripe Transit"
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
      //"Description": "",
      "Amount": object["Amount"],
      "DetailType": "JournalEntryLineDetail",
      "JournalEntryLineDetail": {
        "PostingType": "Debit",
        "AccountRef": {
          "value": "31",
          "name": "Current"
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

  QBOJournalObject.PrivateNote = "Stripe Payout";
  QBOJournalObject.TxnDate = MOMENT.unix(D.get(QBOJournalObject, 'arrival_date')).format('YYYY-MM-DD')

  //QBOJournalCOGSObject.TxnTaxDetail =  {};

  
  return QBOJournalObject;

}

module.exports = QBOJournalPayoutPaid;
