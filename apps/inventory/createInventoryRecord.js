function createInventoryRecord(t, source, sourceData, user) {

    let involvedProductIDs = []

    if (source === 'delivery') {
        sourceData.soldInventories.forEach(sold => {
            involvedProductIDs.push(parseInt(sold.InventoryID))
        })
    } else if (source === 'inventoryDeleted' || source === 'inventoryDeactivated') {

        involvedProductIDs = [ sourceData.InventoryID ]

    } else if (source === 'shipment') {

        sourceData.TransitInventories.forEach(shipment => {
            involvedProductIDs.push(parseInt(shipment.Inventory_inventoryID))
        })

    } else if (source === 'inventoryTransfer') {

        involvedProductIDs = [ sourceData.inventory.InventoryID ]

    } else if (source === 'discrepancy') {

        involvedProductIDs = [ sourceData.adjustments[0].InventoryID ]

    }

    return DB.InventoryMovement.create({
        source: source,
        sourceData: sourceData,
        user: D.get(user, 'name') || 'Anonymous', // to remove anonymous once login system is up
        involvedProductIDs: involvedProductIDs
    }, {
        transaction: t // same for DB calls "required" from outside, it will be outside of this CLS scoping, need to manually pass `t`
    })
}
module.exports = createInventoryRecord
