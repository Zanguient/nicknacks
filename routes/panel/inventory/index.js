var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {


    PROMISE.resolve().then(function() {

        return [

            DB.StorageLocation.findAll(),

            DB.Inventory.findAll({
                where: {
                        notActive: { $not: true}
                },
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
                }, {
                    model: DB.TransitInventory,
                    where: { isInventorised: false },
                    required: false,
                    attributes: [
                        'TransitInventoryID',
                        'Inventory_inventoryID',
                        'quantity'
                    ]
                }]
            }),

            DB.Inventory_Storage.findAll({
                include: [{
                    model: DB.Transaction,
                    where: { status: { $not: 'delivered' }  },
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

    }).spread(function(storageLocations, inventories, soldInventories) {

        // merge inventories with soldInventories
        inventories = JSON.parse(JSON.stringify(inventories));
        soldInventories = JSON.parse(JSON.stringify(soldInventories));

        // for each of the soldInventories record
        soldInventories.forEach(function(element) {

            // find the matching inventory from the inventory list
            var matchedInventory = inventories.find(function(item) {
                if (item.InventoryID === element.Inventory_inventoryID) return item;
            });

            // joining this particular soldInventory line item to the inventory line item
            if (Array.isArray(matchedInventory.soldInventories)) matchedInventory.soldInventories.push(element);
            matchedInventory.soldInventories = [ element ];

            // calculating for quantities sold
            var quantitySold = 0;

            // for each of the transactions within this soldInventory
            // NOTE: a single line of soldInventory is a pair between Transaction and
            //       a particular physical inventory stored at a place (Inventory_Storage)
            element.Transactions.forEach(function(element) {
                quantitySold += parseInt(element.SoldInventory.quantity)
            });

            var soldStockObject = matchedInventory.stock.find(function(item) {
                if (item.name === "Sold") return item;
                return false;
            })

            if (soldStockObject) {
                soldStockObject.quantity += quantitySold;
            } else {
                matchedInventory.stock.push({name: "Sold", quantity: quantitySold })
            }

        });

        // Loop through the transit inventories to generate the Transit object.
        inventories.forEach(inventory => {

            let transitStock = { name: 'Transit', quantity: 0 };

            inventory.TransitInventories.forEach(transit => {
                transitStock.quantity += parseInt(transit.quantity)
            });

            inventory.stock.push(transitStock);

            delete inventory.TransitInventories;
        })

        res.render('inventory', {
            data: {
                storageLocations: storageLocations,
                inventories: inventories
            }
        });

    }).catch(function(err) {
        console.log(err)
        res.render('inventory', err);
    });

});

router.put('/add', function (req, res, next) {

    DB.Inventory.create(req.body).then(function(inventory) {

        var promises = [ inventory ]; //push inventory back to the next bubble.

        req.body.storageAndQuantities.forEach(function(el) {
            promises.push(  DB.Inventory_Storage.create({
                Inventory_inventoryID: inventory.InventoryID,
                StorageLocation_storageLocationID: el.StorageLocationID,
                quantity: el.quantity
            })  )
        });

        return promises;

    }).spread(function(inventory) {

        return DB.Inventory.findById(inventory.InventoryID, {
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
        });

    }).then(function(inventory) {

        return res.send({
            success: true,
            inventory: inventory
        });

    }).catch(function(error) {

        console.log(error);

        return res.status(400).json({
            success: false,
            error: {
                message: 'Server error: ' + error.message +'. Please check console log.',
                hideMessage: false,
                debug: error
            }
        });
        return res.status(500).json({
            success: false,
            error: {
                message: 'Server error: ' + error.message +'. Please check console log.',
                hideMessage: false,
                debug: error
            }
        });

    })


});

router.post('/update', function (req, res, next) {

    var where = { InventoryID: req.body.InventoryID };

    PROMISE.resolve().then(function() {

        var promises = [];

        promises.push(DB.Inventory.update(req.body, {
            where: where
        }));

        req.body.storageAndQuantities.forEach(function(el) {
            var quantityUpdate = DB.Inventory_Storage.update({
                quantity: el.quantity
            }, {

                where: {
                    StorageLocation_storageLocationID: el.StorageLocation_storageLocationID,
                    Inventory_inventoryID: req.body.InventoryID
                },
                limit: 1
            });
            promises.push(quantityUpdate);
        });

        return promises;

    }).spread(function(inventory) {

        return DB.Inventory.findById(inventory.InventoryID, {
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
        })

    }).then(function(inventory) {

        return res.send({
            success: true,
            inventory: inventory
        });

    }).catch(function(error) {

        console.log(error);

        return res.status(500).send({
            success: false,
            error: {
                message: 'Server error: ' + error.message +'. Please check console log.',
                hideMessage: false,
                debug: error
            }
        });

    })


});

router.delete('/delete', function (req, res, next) {

    var where = { InventoryID: req.body.InventoryID };

    DB.Inventory.destroy({
        where: where,
        limit: 1
    }).then(function() {

        return res.send({
            success: true
        });

    }).catch(function(error) {

        console.log(error);

        return res.status(500).send({
            success: false,
            error: {
                message: 'Server error: ' + error.message +'. Please check console log.',
                hideMessage: false,
                debug: error
            }
        });

    })


});

router.put('/sold', function (req, res, next) {

    PROMISE.resolve().then(function() {
        return [
            DB.SoldInventory.create(req.body),
            DB.Inventory.findById(req.body.Inventory_inventoryID)
        ];
    }).spread(function(soldInventory, inventory) {

        return [
            DB.SoldInventory.findOne({
                where: {
                    SoldInventoryID: soldInventory.SoldInventoryID
                },
                include: [{
                    model: DB.Inventory_Storage,
                    include: [{
                        model: DB.StorageLocation
                    }]
                }]
            }),
            inventory
        ];

    }).spread(function(soldInventory, inventory) {

        return res.send({
            success: true,
            inventory: inventory,
            soldInventory: soldInventory
        });

    }).catch(function(error) {

        console.log(error);

        if (error.name = "SequelizeUniqueConstraintError") {
            return res.status(400).send({
                success: false,
                error: {
                    message: 'Error: You are adding an item that already exist.',
                    hideMessage: false,
                    debug: error
                }
            });
        }

        return res.status(500).send({
            success: false,
            error: {
                message: 'Server error: ' + error.message +'. Please check console log.',
                hideMessage: false,
                debug: error
            }
        });

    })

});

router.delete('/sold/delete', function (req, res, next) {

    DB.SoldInventory.destroy({
        where: {
            SoldInventoryID: req.body.SoldInventoryID
        }
    }).then(function() {

        return res.send({
            success: true
        });

    }).catch(function(error) {

        console.log(error);

        return res.status(500).send({
            success: false,
            error: {
                message: 'Server error: ' + error.message +'. Please check console log.',
                hideMessage: false,
                debug: error
            }
        });

    })

});

router.post('/delivered', function (req, res, next) {

    DB.Transaction.findOne({
        where: { TransactionID: req.body.TransactionID },
        include: [{
            model: DB.Inventory_Storage,
            through: {
                model: DB.SoldInventory,
                attributes: [
                    'SoldInventoryID',
                    'Transaction_transactionID',
                    'Inventory_inventoryID',
                    'StorageLocation_storageLocationID',
                    'quantity'
                ]
            },
            include: [{
                model: DB.StorageLocation
            }, {
                model: DB.Inventory
            }]
        }]
    }).then(function(transaction) {

        if(!transaction) throw 'unable to find';

        // do some math to deduct the inventory
        //return res.send(transaction);


        return DB.sequelize.transaction(function(t) {

            return PROMISE.resolve().then(function() {
                var promises = []

                transaction.Inventory_Storages.forEach(function(inventoryDelivered) {

                    var phyiscalInventoryID = inventoryDelivered.Inventory_StorageID;
                    var quantityDelivered = inventoryDelivered.SoldInventory.quantity;

                    promises.push(DB.Inventory_Storage.update({
                        quantity: DB.sequelize.literal( 'quantity - ' + parseInt(quantityDelivered) )
                    }, {
                        where: { Inventory_StorageID: phyiscalInventoryID }
                    }));

                });


                transaction.status = 'delivered';
                promises.push(transaction.save());

                return promises;
            });

        });

    }).then(function() {

        return res.send({
            success: true
        });

    }).catch(function(error) {

        if (error === 'unable to find') {
            return res.send({ success: false, error: {
                message: 'Unable to find the related transaction. Please refresh browser and try again.',
                hideMessage: false
            }});
        }

        return res.status(500).send({
            success: false,
            error: {
                message: 'Server error: ' + error.message +'. Please check console log.',
                hideMessage: false,
                debug: error
            }
        });

    })

});

/*

return res.status(400).send({
                success: false,
                error: {
                    message: 'Unable to find transaction using `transactionID` provided',
                    hideMessage: false,
                    debug: {}
                }
            });

*/


// router.get('/tblseed', function(req, res, next) {
//     DB.Inventory.findAll({
//         order: [ ['sku', 'ASC'], ['name', 'ASC'] ],
//         include: [{
//             model: DB.StorageLocation,
//             through: {
//                 model: DB.Inventory_Storage,
//                 attributes: [
//                     'Inventory_StorageID',
//                     'StorageLocation_storageLocationID',
//                     'Inventory_inventoryID',
//                     'quantity'
//                 ]
//             }
//         }]
//     }).then(function(inventories) {
//         for(let i=0; i<inventories.length; i++) {
//             var inventory = inventories[i]
//             let storages = inventory.StorageLocations
//             let hasTBLStore = false
//
//             for(let i=0; i<storages.length; i++) {
//                 let storage = storages[i]
//                 if (storage.StorageLocationID === '6') {
//                     hasTBLStore = true
//                     break;
//                 }
//             }
//             if (!hasTBLStore) {
//                 DB.Inventory_Storage.create({
//                     quantity: 0,
//                     Inventory_inventoryID: inventory.InventoryID,
//                     StorageLocation_storageLocationID: 6
//                 });
//             }
//         }
//
//         res.send(inventories)
//
//     })
// })

module.exports = router;
