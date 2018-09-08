'use strict'

const _ = require('lodash')

function compareStock(requestorStock, dbStock) {
    var requestorStock = _.filter(requestorStock, o => {
        // has valid InventoryID, quantity can be parse into Int, and quantity is not zero.
        // we don't want to compare zeros, be will compare negatives which are significant
        return ( ([undefined, null, false].indexOf(o.StorageLocationID) === -1) && !isNaN( parseInt(o.quantity) ) && parseInt(o.quantity) !== 0)
    })
    requestorStock = _.orderBy( requestorStock, ['quantity'], ['desc'] )

    // flatten dbStock and take away quantity of 0
    var dbStock = _.filter(

        _.map(dbStock, o => {
            return {
                StorageLocationID: o.StorageLocationID,
                quantity: parseInt(o.Inventory_Storage.quantity),
                name: o.name
            }
        }

    ), o => {
        return ( !isNaN(o.quantity) && o.quantity !== 0 )
    })
    dbStock = _.orderBy(dbStock, ['quantity'], ['desc'])

    let requestQtySum = _.sumBy(requestorStock, o => { return parseInt(o.quantity) })
    let dbQtySum = _.sumBy(dbStock, o => { return parseInt(o.quantity) })

    // check that quantities are the same
    if (requestQtySum !== dbQtySum) {
        let error = new Error('You may be updating on outdated information. Please refresh and try again.')
        Object.assign(error, {
            level: "low",
            noLogging: true,
            status: 400,
            data: { requestorStock, dbStock }
        })
        throw error
    }

    // these 2 arrays should be identical, if not indicating that the requestor is not updating on the latest data.
    if (requestorStock.length !== dbStock.length) {
        let error = new Error('You may be updating on outdated information. Please refresh and try again.')
        Object.assign(error, {
            level: "low",
            noLogging: true,
            status: 400,
            data: { requestorStock, dbStock }
        })
        throw error
    }

    // the quantity placement must be equal.
    requestorStock.forEach((requestorStock, index) => {
        if ( parseInt(requestorStock.quantity) !== dbStock[index].quantity ) {
            let error = new Error('You may be updating on outdated information. Please refresh and try again.')
            Object.assign(error, {
                level: "low",
                noLogging: true,
                status: 400,
                data: { requestorStock, dbStock }
            })
            throw error
        }
    })



    return true
}

module.exports = compareStock
