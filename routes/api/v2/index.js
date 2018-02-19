var express = require('express');
var router = express.Router();
var qs = require('querystring');
var QuickBooks = require('node-quickbooks');
var request = require('request');
var rp = require('request-promise');

/* GET home page. */
router.get('/', function (req, res, next) {
    res.send({
        sucess: true,
        data: {}
    });
});

router.get('/inventory/all', function(req, res, next) {


    PROMISE.resolve().then(function() {

        return [

            DB.Inventory.findAll({
                order: [ ['sku', 'ASC'], ['name', 'ASC'] ],
                include: [{
                    model: DB.StorageLocation,
                    through: {
                        model: DB.Inventory_Storage,
                        attributes: [
                            'Inventory_StorageID',
                            'StorageLocation_storageLocationID',
                            'Inventory_inventoryID',
                            'quantity'
                        ]
                    }
                }]
            }),

            DB.Inventory_Storage.findAll({
                include: [{
                    model: DB.Transaction,
                    where: { status: { $not: 'delivered' } },
                    through: {
                        model: DB.SoldInventory,
                        attributes: [
                            'SoldInventoryID',
                            'quantity',
                            'Inventory_Storage_inventory_StorageID',
                            'Transaction_transactionID'
                        ]
                    },
                    required: true
                }]
            })

        ];

    }).spread(function (inventories, soldInventories) {

        // merge inventories with soldInventories
        inventories = JSON.parse(JSON.stringify(inventories));
        soldInventories = JSON.parse(JSON.stringify(soldInventories));

        // for each of the soldInventories record
        soldInventories.forEach(function(element) {

            // find the matching inventory from the inventory list
            let matchedInventory = inventories.find(function(item) {
                if (item.InventoryID === element.Inventory_inventoryID) return item;
            });

            // calculating for quantities sold
            let quantitySold = 0;

            // for each of the transactions within this soldInventory
            // NOTE: a single line of soldInventory is a pair between Transaction and
            //       a particular physical inventory stored at a place (Inventory_Storage)
            element.Transactions.forEach(function(element) {
                quantitySold += parseInt(element.SoldInventory.quantity)
            });

            let soldStockObject = matchedInventory.stock.find(function(item) {
                if (item.name === "Sold") return item;
                return false;
            })

            if (!soldStockObject) {
                matchedInventory.stock.push({
                    name: "Sold",
                    quantity: quantitySold,
                    soldInventories: [ element.Transactions[0].SoldInventory ]
                })
            } else {
                soldStockObject.quantity += quantitySold;
                soldStockObject.soldInventories.push(element.Transactions[0].SoldInventory)
            }

        });

        // delete away useless stuff
        inventories.forEach(function(element) {
            delete element.StorageLocations;
        });

        res.send({
            success: true,
            data: inventories
        });

    }).catch(function(err) {
        console.log(err)
        res.status(500).send({
            success: false,
            error: {
                message: 'An error has occurred, please try again',
                hideMessage: false,
                debug: {
                    message: 'Catch handler',
                    errorObject: err
                }
            }
        });
    });

});

router.get('/storage-location/all', function(req, res, next) {
    DB.StorageLocation.findAll({
        order: [ ['name', 'ASC'] ]
    }).then(function(storageLocations) {
        res.send({
            success: true,
            storageLocations: storageLocations
        });
    }).catch(function(err) {
        console.log(err)
        res.status(500).send({
            success: false,
            error: {
                message: 'An error has occurred, please try again.',
                hideMessage: false,
                debug: {
                    message: 'Catch handler',
                    errorObject: err
                }
            }
        });
    });
})

module.exports = router;
