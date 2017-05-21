function QBOJournalCOGS(object) {
  var QBOJournalCOGSObject = object;

  QBOJournalCOGSObject.Line = [
    {
      "Id": "0",
      //"Description": "Craig TV Console",
      "Amount": object["TotalAmt"],
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
        //"TaxAmount": 0.0
      }
    },
    {
      "Id": "1",
      //"Description": "Craig TV Console",
      "Amount": object["TotalAmt"],
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
        //"TaxAmount": 0.0
      }
    }
  ];

  QBOJournalCOGSObject.TxnTaxDetail =  {
          "TaxLine": [
            {
              //"Amount": 0,
              "DetailType": "TaxLineDetail",
              "TaxLineDetail": {
                "TaxRateRef": {
                  "value": "15"
                },
                "PercentBased": true,
                "TaxPercent": 0
                //,
                //"NetAmountTaxable": 0
              }
            }
          ];

  
  return QBOJournalCOGSObject;

}

module.exports = QBOJournalCOGS;
