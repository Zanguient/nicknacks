const express = require('express');
const router = express.Router();

router.get('/all', function (req, res, next) {

    PROMISE.resolve().then(() => {

        return [
            DB.Inventory.findAll({
                where: {
                    notActive: { $not: true}
                },
                order: [ ['sku', 'ASC'], ['name', 'ASC'] ],
                include: [{

                    // include all the places which the inventories are stored.
                    model: DB.StorageLocation,
                    through: {
                        // and the quantites of how many inventories stored is in the cross table
                        model: DB.Inventory_Storage,
                        attributes: [
                            'Inventory_StorageID',
                            'StorageLocation_storageLocationID',
                            'Inventory_inventoryID',
                            'quantity'
                        ]
                    }
                }, {

                    // also need to include its transit inventory
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
        ]

    }).spread( (inventories, soldInventories) => {


        // merge inventories with soldInventories
        inventories = JSON.parse(JSON.stringify(inventories));
        soldInventories = JSON.parse(JSON.stringify(soldInventories));

        // for each of the soldInventories record
        soldInventories.forEach(element => {

            // find the matching inventory from the inventory list
            var matchedInventory = inventories.find(item => {
                if (item.InventoryID === element.Inventory_inventoryID) return item;
            });

            // past sold inventories could have gone obsolete (deleted or deactivated)
            // can stop the operations here.
            // matchedInventory is undefined when nothing is found:
            if (!matchedInventory) return;

            // joining this particular soldInventory line item to the inventory line item
            if (Array.isArray(matchedInventory.soldInventories)) {
                matchedInventory.soldInventories.push(element);
            } else {
                matchedInventory.soldInventories = [ element ];
            }


            // calculating for quantities sold
            var quantitySold = 0;

            // for each of the transactions within this soldInventory
            // NOTE: a single line of soldInventory is a pair between Transaction and
            //       a particular physical inventory stored at a place (Inventory_Storage)
            element.Transactions.forEach( element => {
                quantitySold += parseInt(element.SoldInventory.quantity)
            });

            var soldStockObject = matchedInventory.stock.find( item => {
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

        res.send({
            success: true,
            data: inventories
        })

    }).catch(err => {
        console.log(err)
        res.status(500).send({
            success: false,
            message: 'Server error in retrieving sale receipts.',
            debug: {
                message: 'Server error',
                error: err
            }
        })
    })

})

router.put('/add', function (req, res, next) {

    DB.Inventory.create(req.body).then( inventory => {

        var promises = [ inventory ]; //push inventory back to the next bubble.

        req.body.storageAndQuantities.forEach( el => {
            promises.push(  DB.Inventory_Storage.create({
                Inventory_inventoryID: inventory.InventoryID,
                StorageLocation_storageLocationID: el.StorageLocationID,
                quantity: el.quantity
            })  )
        });

        return promises;

    }).spread(inventory => {

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

    }).then(inventory => {

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

router.post('/update', (req, res, next) => {

    var where = { InventoryID: req.body.InventoryID };

    PROMISE.resolve().then( () => {

        var promises = [];

        promises.push(DB.Inventory.update(req.body, {
            where: where
        }));

        req.body.storageAndQuantities.forEach(el => {
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

    }).spread(inventory => {

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

    }).then(inventory => {

        return res.send({
            success: true,
            inventory: inventory
        });

    }).catch( error => {

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

router.delete('/delete', (req, res, next) => {

    var where = { InventoryID: req.body.InventoryID };

    DB.Inventory.destroy({
        where: where,
        limit: 1
    }).then(() => {

        return res.send({
            success: true
        });

    }).catch(error => {

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

router.post('/deactivate', function (req, res, next) {

    var where = { InventoryID: req.body.InventoryID };

    DB.Inventory.update({
        notActive: true
    }, {
        where: where
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

router.put('/sold', function (req, res, next) {

    console.log(req.body)

    // find the Inventory_Storage
    DB.Inventory_Storage.find({
        where: {
            Inventory_inventoryID: req.body.InventoryID,
            StorageLocation_storageLocationID: req.body.StorageLocationID
        }
    }).then(inventory_Storage => {
        if (!inventory_Storage) {
            return res.status(400).send({
                success: false,
                message: 'Unable to find `Inventory_Storage`',
                debug: {
                    message: 'Unable to find `Inventory_Storage`',
                    error: ''
                }
            })
        }

        return PROMISE.resolve().then(() => {
            return [
                DB.SoldInventory.create({
                    Inventory_Storage_inventory_StorageID: inventory_Storage.Inventory_StorageID,
                    Transaction_transactionID: req.body.TransactionID,
                    quantity: req.body.quantity
                }),
                DB.Inventory.findById(req.body.InventoryID)
            ];
        }).spread((soldInventory, inventory) => {

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
            ]

        }).spread((soldInventory, inventory) => {

            var obj = {};

            obj.Inventory_StorageID = soldInventory.Inventory_StorageID
            obj.InventoryID = inventory.InventoryID
            obj.SoldInventoryID = soldInventory.SoldInventoryID
            obj.quantity = soldInventory.quantity
            obj.StorageLocationID = soldInventory.isStoredAt.StorageLocationID
            obj.StorageLocationName = soldInventory.isStoredAt.name
            obj.name = inventory.name
            obj.sku = inventory.sku
            obj.perItemCOGS = inventory.cogs
            obj.totalCOGS = (parseFloat(obj.perItemCOGS) * parseFloat(obj.quantity)).toFixed(2)

            return res.send({
                success: true,
                data: obj
            });

        })

    }).catch(error => {

        console.log(error)

        if (error.name = "SequelizeUniqueConstraintError") {
            return res.status(400).send({
                success: false,
                message: 'Error: You are adding an item that already exist.',
                error: {
                    message: 'Error: You are adding an item that already exist.',
                    hideMessage: false,
                    debug: error
                }
            })
        }

        return res.status(500).send({
            success: false,
            message: 'Server error: ' + error.message +'. Please check console log.',
            error: {
                message: 'Server error: ' + error.message +'. Please check console log.',
                hideMessage: false,
                debug: error
            }
        })

    })

})

router.delete('/sold/delete', (req, res, next) => {

    if(!req.body.SoldInventoryID || isNaN(parseInt(req.body.SoldInventoryID))) {
        return res.status(400).send({
            success: false,
            message: 'You did not provide `SoldInventoryID`',
            error: {
                message: '`SoldInventoryID not provided.`',
                hideMessage: false,
                debug: null
            }
        })
    }

    DB.SoldInventory.destroy({
        where: {
            SoldInventoryID: req.body.SoldInventoryID
        }
    }).then(() => {

        return res.send({
            success: true
        })

    }).catch(error => {

        console.log(error)

        return res.status(500).send({
            success: false,
            error: {
                message: 'Server error: ' + error.message +'. Please check console log.',
                hideMessage: false,
                debug: error
            }
        })

    })

})

router.post('/inventory/delivered', function (req, res, next) {

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

module.exports = router;