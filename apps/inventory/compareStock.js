'use strict'

const _ = require('lodash')

function compareStock(requestorStock, dbStock) {
    var requestorStock = _.filter(requestorStock, o => {
        // has valid InventoryID, quantity can be parse into Int, and quantity is not zero.
        // we don't want to compare zeros, be will compare negatives which are significant
        return (o.StorageLocationID && !isNaN( parseInt(o.quantity) ) && parseInt(o.quantity) !== 0)
    })
    requestorStock = _.orderBy( requestorStock, ['quantity'], ['desc'] )

    var dbStock = _.filter(dbStock, o => {
        return o.quantity !== 0
    })
    dbStock = _.orderBy(dbStock, ['quantity'], ['desc'])

    // these 2 arrays should be identical, if not indicating that the requestor is not updating on the latest data.
    if (requestorStock.length !== dbStock.length) {
        let error = new Error('You may be updating on outdated information. Please refresh and try again.')
        error.level = "low"; error.noLogging = true; error.status = 400
        throw error
    }

    requestorStock.forEach(requestor, index => {
        if ( parseInt(requestor.quantity) !== dbStock[index].quantity ) {
            let error = new Error('You may be updating on outdated information. Please refresh and try again.')
            error.level = "low"; error.noLogging = true; error.status = 400
            error.data = {
                requestorStock: reqestorStorage,
                dbStock: dbStock
            }
            throw error
        }
    })

    return
}

module.exports = compareStock
