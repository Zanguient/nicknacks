const debug = require('debug')('nn:apps:QBO:deleteAllEntriesIfSomeErrorsOccur')

function deleteAllEntriesIfSomeErrorsOccur(salesReceipt, expense, journalCOGS) {
    return PROMISE.resolve().then(function() {

        var deleteSalesReceipt, deleteExpense, deleteJournalCOGS;

        console.error('INFO: Some errors occured, looking for created documents to delete.')

        // Finding the "Fault branch" to be sure that the QBO documents were created

        // the documents can be undefined (if the error was thrown higher up before creation)
        // of can be false (if the error was thrown later)

        if ([undefined, false].indexOf(salesReceipt) === -1 && !D.get(salesReceipt, "Fault") && salesReceipt.Id) {
            console.error('INFO: Sales receipt found. Deleting...')
            var deleteSalesReceipt = QBO.deleteSalesReceiptAsync({
                "Id": salesReceipt.Id,
                "SyncToken": salesReceipt.SyncToken
            });
        }

        if ([undefined, false].indexOf(expense) === -1 && !D.get(expense, "Fault") && expense.Id) {
            console.error('INFO: Expense document found. Deleting...')
            var deleteExpense = QBO.deletePurchaseAsync({
                "Id": expense.Id,
                "SyncToken": expense.SyncToken
            });
        }

        if ([undefined, false].indexOf(journalCOGS) === -1 && !D.get(journalCOGS, "Fault") && journalCOGS.Id) {
            console.error('INFO: Journal found. Deleting...')
            var deleteJournalCOGS = QBO.deleteJournalEntryAsync({
                "Id": journalCOGS.Id,
                "SyncToken": journalCOGS.SyncToken
            });
        }

        return [
            deleteSalesReceipt,
            deleteExpense,
            deleteJournalCOGS
        ];

    }).catch(function(err) {
        console.error('CRITCAL: Errors occured when reversing entries.')
        console.error(err)
    });
}
module.exports = deleteAllEntriesIfSomeErrorsOccur
