'use strict'

const _ = require('lodash')

function inventoryTimeLineFilter(inventory) {

    // count the stock, without the display.
    let inventoryStockTotalWithoutDisplay = _.sumBy(inventory.StorageLocations, s => {
        if (s.name.toLowerCase().indexOf('display') === -1) return parseInt(s.Inventory_Storage.quantity)
    })

    let timeline = [{
        date: 0,
        isConfirmed: true,
        type: 'stock',
        change: inventoryStockTotalWithoutDisplay,
        stockAvailableAtCurrentDate: inventoryStockTotalWithoutDisplay
    }]

    if (inventory.soldInventories && inventory.soldInventories.length > 0) {

        // each sold inventories is grouped by storageLocation
        inventory.soldInventories.forEach(storageLocation => {
            storageLocation.Transactions.forEach(txn => {

                // no date, set to 9999999999999 so that it will appear last
                let date = txn.deliveryDate
                if(!txn.deliveryDate)  {
                    date = 9999999999999
                }

                timeline.push({
                    date: date,
                    isConfirmed: txn.deliveryConfirmed,
                    type: 'sales',
                    change: -parseInt(txn.SoldInventory.quantity),
                    info: {
                        display: txn.details.salesOrderNumber + ' - ' + txn.details.customerName
                    }
                })
            })
        })
    }

    if (inventory.TransitInventories && inventory.TransitInventories.length > 0) {

        inventory.TransitInventories.forEach(transit => {

            let shipment = transit.Shipment

            let shipmentTimeline = {
                type: 'transit',
                change: parseInt(transit.quantity),
                info: {
                    display: shipment.name
                }
            }

            //if already shipped out
            if (shipment.actualShipOut) {
                shipmentTimeline.isConfirmed = true
                shipmentTimeline.date = shipment.expectedArrival
            } else {
                shipmentTimeline.isConfirmed = false
                shipmentTimeline.date = shipment.expectedArrival
            }


            timeline.push(shipmentTimeline)
        })
    }

    // sort by date to have the earliest first.
    // then if date clash, sort to have the transit be first. since t > s => 'desc'
    let ordered = _.orderBy(timeline, ['date', 'type'], ['asc', 'desc'])

    let hasShortFall =  false

    ordered.forEach((timeline, i) => {
        if (i === 0) {
            if (timeline.stockAvailableAtCurrentDate < 0) hasShortFall = true
            return
        }
        let stockAvailableAtPreviousDate = ordered[i-1].stockAvailableAtCurrentDate
        timeline.stockAvailableAtCurrentDate = stockAvailableAtPreviousDate + timeline.change
        if (timeline.stockAvailableAtCurrentDate < 0) hasShortFall = true
    })

    return {
        list: ordered,
        hasShortFall
    }

}
module.exports = inventoryTimeLineFilter
