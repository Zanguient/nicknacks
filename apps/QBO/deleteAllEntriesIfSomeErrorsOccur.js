function deleteAllEntriesIfSomeErrorsOccur(salesReceipt, expense, journalCOGS) {
    return PROMISE.resolve().then(function() {

        var deleteSalesReceipt, deleteExpense, deleteJournalCOGS;

        console.log('INFO: Some errors occured, looking for created documents to delete.')

        // Finding the "Fault branch" to be sure that the QBO documents were created

        // the documents can be undefined (if the error was thrown higher up before creation)
        // of can be false (if the error was thrown later)

        if ([undefined, false].indexOf(salesReceipt) === -1 && !D.get(salesReceipt, "Fault")) {
            console.log('INFO: Sales receipt found. Deleting...')
            var deleteSalesReceipt = QBO.deleteSalesReceiptAsync({
                "Id": salesReceipt.Id,
                "SyncToken": salesReceipt.SyncToken
            });
        }

        if ([undefined, false].indexOf(expense) === -1 && !D.get(expense, "Fault")) {
            console.log('INFO: Expense document found. Deleting...')
            var deleteExpense = QBO.deletePurchaseAsync({
                "Id": expense.Id,
                "SyncToken": expense.SyncToken
            });
        }

        if ([undefined, false].indexOf(journalCOGS) === -1 && !D.get(journalCOGS, "Fault")) {
            console.log('INFO: Journal found. Deleting...')
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
        console.log('CRITCAL: Errors occured when reversing entries.')
        console.log(err)
    });
}
module.exports = deleteAllEntriesIfSomeErrorsOccur
