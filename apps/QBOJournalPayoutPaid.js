function QBOJournalPayoutPaid(object) {

  
  var QBOJournalObject = {
      "DocNumber": object.id,
      "TxnDate": MOMENT.unix(D.get(object, 'data.object.arrival_date')).format('YYYY-MM-DD'),
      "PrivateNote": "Stripe Payout (" + parseInt(object.data.object.amount)/100) + ")"
  };


  QBOJournalObject.Line = [
    {
      "Id": "0",
      "Description": "Stripe Payout (" + parseInt(object.data.object.amount)/100) + ")",
      "Amount": parseInt(object.data.object.amount)/100,
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
      "Description": "Stripe Payout (" + parseInt(object.data.object.amount)/100) + ")",
      "Amount": parseInt(object.data.object.amount)/100,
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

  //QBOJournalCOGSObject.TxnTaxDetail =  {};

  
  return QBOJournalObject;

}

module.exports = QBOJournalPayoutPaid;
