function singleInventoryProcessor( inventory, soldInventories ) {

    // merge inventories with soldInventories
    inventory = JSON.parse(JSON.stringify(inventory))
    soldInventories = JSON.parse(JSON.stringify(soldInventories))

    inventory.soldInventories = soldInventories

    // for each of the soldInventories record
    inventory.soldInventories.forEach(element => {

        // calculating for quantities sold
        let quantitySold = 0;

        // for each of the transactions within this soldInventory
        // NOTE: a single line of soldInventory is a pair between Transaction and
        //       a particular physical inventory stored at a place (Inventory_Storage)
        element.Transactions.forEach( element => {
            quantitySold += parseInt(element.SoldInventory.quantity)
        });

        let soldStockObject = inventory.stock.find( item => {
            if (item.name === "Sold") return item;
            return false;
        })

        if (soldStockObject) {
            soldStockObject.quantity += quantitySold;
        } else {
            if (!inventory.stock) {
                inventory.stock = {name: "Sold", quantity: quantitySold }
            } else {
                inventory.stock.push({name: "Sold", quantity: quantitySold })
            }
        }

    })

    // Loop through the transit inventories to generate the Transit object.

    let transitStock = { name: 'Transit', quantity: 0 };

    inventory.TransitInventories.forEach(transit => {
        transitStock.quantity += parseInt(transit.quantity)
    });

    if (!inventory.stock) {
        inventory.stock = [transitStock]
    } else {
        inventory.stock.push(transitStock)
    }

    return inventory
}
module.exports = singleInventoryProcessor
