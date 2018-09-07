const express = require('express')
const router = express.Router()
const debug = require('debug')('nn:api:inventory')
const singleInventoryProcessor = require(__appsDir + '/inventory/singleInventoryProcessor')
const createInventoryRecord = require(__appsDir + '/inventory/createInventoryRecord')
const _ = require('lodash')

let inventoryIncludes = [{

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
    ],
    include: [{
        model: DB.Shipment,
        attributes: [
            'name', 'estimatedShipOut', 'actualShipOut', 'expectedArrival', 'remarks'
        ]
    }]
}]

let inventoryStorageIncludes = [{
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

router.get('/all', (req, res, next) => {

    PROMISE.resolve().then(() => {

        return [
            DB.Inventory.findAll({
                where: {
                    notActive: { $not: true}
                },
                order: [ ['sku', 'ASC'], ['name', 'ASC'] ],
                include: inventoryIncludes
            }),

            DB.Inventory_Storage.findAll({
                include: inventoryStorageIncludes
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

                if (!matchedInventory.stock) {
                    matchedInventory.stock = {name: "Sold", quantity: quantitySold }
                } else {
                    matchedInventory.stock.push({name: "Sold", quantity: quantitySold })
                }

            }

        });

        // Loop through the transit inventories to generate the Transit object.
        inventories.forEach(inventory => {

            let transitStock = { name: 'Transit', quantity: 0 };

            inventory.TransitInventories.forEach(transit => {
                transitStock.quantity += parseInt(transit.quantity)
            });

            if (!inventory.stock) {
                inventory.stock = [transitStock]
            } else {
                inventory.stock.push(transitStock)
            }

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

router.put('/add', (req, res, next) => {

    DB.Inventory.create(req.body, {returning: true}).then(inventory => {

        return [
            DB.Inventory.findById(inventory.InventoryID, {
                include: inventoryIncludes
            }),

            DB.Inventory_Storage.findAll({
                where: {
                    Inventory_inventoryID: inventory.InventoryID
                },
                include: inventoryStorageIncludes
            })
        ]
    }).spread( (inventory, soldInventories) => {

        let processed = singleInventoryProcessor(inventory, soldInventories)

        return res.send({
            success: true,
            inventory: processed
        })

    }).catch( error => { API_ERROR_HANDLER(error, req, res, next) })

})

router.post('/update', (req, res, next) => {

    debug(req.body)

    let where = { InventoryID: req.body.InventoryID };

    DB.Inventory.update(req.body, {
        where: where
    }).then(inventory => {
        return [
            DB.Inventory.findById(req.body.InventoryID, {
                include: inventoryIncludes
            }),

            DB.Inventory_Storage.findAll({
                where: {
                    Inventory_inventoryID: req.body.InventoryID
                },
                include: inventoryStorageIncludes
            })
        ]
    }).spread( (inventory, soldInventories) => {

        let processed = singleInventoryProcessor(inventory, soldInventories)

        return res.send({
            success: true,
            inventory: processed
        })

    }).catch( error => { API_ERROR_HANDLER(error, req, res, next) })


});

router.delete('/delete', (req, res, next) => {

    debug(req.body)

    DB.Inventory.findById(req.body.InventoryID, {
        include: inventoryIncludes
    }).then(inventory => {

        if (!inventory) {
            //no inventory is found. don't care just respond that it is deleted.
            return
        }

        // inventory is found
        return DB.sequelize.transaction(t => {

            let promises = []

            //record inventory movement
            // same for DB calls "required" from outside, it will be outside of this CLS scoping, need to manually pass `t`
            let recordMovement = createInventoryRecord(t, 'inventoryDeleted', inventory, req.user)
            promises.push(recordMovement)

            let destroy = inventory.destroy()
            promises.push(destroy)

            // don't need to call a spread. instead just call #all to wait for all before commiting.
            return PROMISE.all(promises)

        })

    })
    .then(() => {

        return res.send({
            success: true
        })

    })
    .catch(error => { API_ERROR_HANDLER(error, req, res, next) })

})

router.post('/deactivate', (req, res, next) => {

    let where = { InventoryID: req.body.InventoryID };

    DB.Inventory.update({
        notActive: true
    }, {
        where: where
    }).then(inventory => {

        return res.send({
            success: true
        })

    }).catch(function(error) { API_ERROR_HANDLER(error, req, res, next) })

});

router.put('/sold', (req, res, next) => {

    debug(req.body)

    // find the Inventory_Storage
    DB.Inventory_Storage.find({
        where: {
            Inventory_inventoryID: req.body.InventoryID,
            StorageLocation_storageLocationID: req.body.StorageLocationID
        }
    }).then(inventory_Storage => {

        if (!inventory_Storage) {
            let err = new Error('Unable to find `Inventory_Storage`')
            err.status = 400
            throw err
        }

        let promises = []

        // create the Sold Inventory Record and return it with associated models
        let createSoldInventoryRecord = DB.SoldInventory.create({
            Inventory_Storage_inventory_StorageID: inventory_Storage.Inventory_StorageID,
            Transaction_transactionID: req.body.TransactionID,
            quantity: req.body.quantity
        }).then((soldInventory) => {
            return DB.SoldInventory.findOne({
                where: {
                    SoldInventoryID: soldInventory.SoldInventoryID
                },
                include: [{
                    model: DB.Inventory_Storage,
                    include: [{
                        model: DB.StorageLocation
                    }]
                }]
            })
        })
        promises.push(createSoldInventoryRecord)


        let findInventory = DB.Inventory.findById(req.body.InventoryID)
        promises.push(findInventory)


        return promises;

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
        })

    })
    .catch(error => {

        // most likely the case whereby the sold inventory is already added.
        if (error.name = "SequelizeUniqueConstraintError") {

            let newError = new Error('Error: You are adding an item that already exist.')
            newError.status = 400
            newError.debug = error

            return API_ERROR_HANDLER(newError, req, res, next)

        }

        API_ERROR_HANDLER(error, req, res, next)

    })

})

router.delete('/sold/delete', (req, res, next) => {

    if(!req.body.SoldInventoryID || isNaN(parseInt(req.body.SoldInventoryID))) {

        let error = new Error('You did not provide `SoldInventoryID`')
        error.status = 400
        throw error

    }

    DB.SoldInventory.destroy({
        where: {
            SoldInventoryID: req.body.SoldInventoryID
        }
    }).then(() => {

        return res.send({ success: true })

    }).catch(error => { API_ERROR_HANDLER(error, req, res, next) })

})

router.post('/discrepancy', (req, res, next) => {

    if (!req.body.discrepancyReason) {
        let error = new Error('Please provide a reason for discrepancies.')
        error.status = 400
        return API_ERROR_HANDLER(error, req, res, next)
    }
    let _MOVEMENT = {
        discrepancyReason: req.body.discrepancyReason,
        adjustments: []
    }

    return DB.sequelize.transaction(function(t) {

        return DB.Inventory.findOne({
            where: { InventoryID: req.body.InventoryID }
        }, {transaction: t}).then(inventory => {
            if (!inventory) {
                let error = new Error('Inventory is not found.')
                error.status = 400
                throw error
            }

            let promises = []

            var inventory = req.body

            for(let i=0; i<inventory.stock.length; i++) {
                if(!inventory.InventoryID) continue
                let stock = inventory.stock[i]
                let discrepancy = parseInt(stock.discrepancy)
                if (isNaN(discrepancy) || discrepancy === 0) continue

                _MOVEMENT.adjustments.push({
                    InventoryID: inventory.InventoryID,
                    name: inventory.name,
                    sku: inventory.sku,
                    StorageLocationID: stock.StorageLocationID,
                    storageLocationName: stock.name,
                    adjustment: stock.discrepancy
                })

                var quantityLiteral = 'quantity '
                if(discrepancy < 0) {
                    quantityLiteral += discrepancy.toString()
                } else {
                    quantityLiteral += '+ ' + discrepancy.toString()
                }

                let updateDiscrepancy = DB.Inventory_Storage.update({
                    quantity: DB.sequelize.literal(quantityLiteral)
                }, {
                    where: {
                        StorageLocation_storageLocationID: stock.StorageLocationID,
                        Inventory_inventoryID: inventory.InventoryID
                    },
                    transaction: t
                })

                promises.push(updateDiscrepancy)
            }

            return promises
        }).spread(() => {
            return createInventoryRecord(t, 'discrepancy', _MOVEMENT, req.user)
        })

    })
    .then(() => {

        return [
            DB.Inventory.findById(req.body.InventoryID, {
                include: inventoryIncludes
            }),

            DB.Inventory_Storage.findAll({
                where: {
                    Inventory_inventoryID: req.body.InventoryID
                },
                include: inventoryStorageIncludes
            })
        ]

    }).spread( (inventory, soldInventories) => {

        let processed = singleInventoryProcessor(inventory, soldInventories)

        return res.send({
            success: true,
            inventory: processed
        })

    }).catch( error => { API_ERROR_HANDLER(error, req, res, next) })

})

router.post('/transfer', function(req, res, next) {

    debug(req.body);

    let stock = D.get(req, 'body.stock')
    if (!stock || !Array.isArray(stock) || stock.length < 1) {
        let error = new Error('`stock` format is incorrect')
        error.status = 400; error.level = 'low'
        throw error
    }

    // check the transfer numbers tally, which should add up to ZERO
    // and if there is any transfer movement.

    let transferCount = 0
    let hasMovement = false

    stock.forEach(stock => {
        let transfer = parseInt(stock.transfer)

        if (isNaN(transfer)) {
            let error = new Error('`stock.transfer` is invalid.')
            error.status = 400; error.level = 'low'; error.noLogging = true
            throw error
        }

        transferCount += transfer
        if (transfer !== 0) hasMovement = true
    })

    if (transferCount !== 0) {
        let error = new Error('The transfers does not tally with the overall quantity. Please check your inputs.')
        error.status = 400; error.level = 'low'; error.noLogging = true
        throw error
    }



    var _INVENTORY
    return DB.Inventory.findOne({
        where: { InventoryID: req.body.InventoryID },
        include: inventoryIncludes
    }).then(function(inventory) {

        _INVENTORY = inventory

        console.log(inventory)
        return console.log(inventory.StorageLocations)
        
        
        let requestorStorage = _.filter(req.body.stock, function(o) { 
            // has valid InventoryID, quantity can be parse into Int, and quantity is not zero.
            // we don't want to compare zeros, be will compare negatives which are significant
            return (o.StorageLocationID && !isNaN( parseInt(o.quantity) ) && parseInt(o.quantity) !== 0) 
        })
        requestorStorage = _.orderBy(requestorStorage, ['quantity'], ['desc'] )
        
        let dbStorage = _.filter(inventory.StorageLocations, function(o) { 
            return o.quantity) !== 0
        })
        let dbStorage = _.orderBy(dbStorage, ['quantity'], ['desc'])
        
        // these 2 arrays should be identical, if not indicating that the requestor is not updating on the latest data.
        if (requestorStorage.length !== dbStorage.length) {
            let error = new Error('You may be updating on outdated information. Please refresh and try again.')
            error.level = "low"; error.noLogging = true; error.status = 400
            throw error
        }
        
        requestorStorage.forEach((requestor, index => {
            if ( parseInt(requestor.quantity) !== dbStorage[index].quantity ) {
                let error = new Error('You may be updating on outdated information. Please refresh and try again.')
                error.level = "low"; error.noLogging = true; error.status = 400
                error.data = {
                    requestorStorage: reqestorStorage,
                    dbStorage: dbStorage
                }
                throw error
            }
        })
                                                         
        // testing is good, do the transfer
        return DB.sequelize.transaction(function(t) {
            
            return createInventoryRecord(t, 'inventoryTransfer', { 
                
                inventory: inventory, 
                transfer: req.body.stock 
                
            }, req.user).then(() => {
               
                let promises = []
                
                stock.forEach(stock => {

                    let newQty = parseInt(stock.quantity) 
                    let transfer = parseInt(stock.transfer)
                    
                    // nothing to transfer
                    if (transfer === 0) return
                    
                    let transferLiteral = 'quantity '
                    if(transfer < 0) {
                        transferLiteral += transfer.toString()
                    } else {
                        transferLiteral += '+ ' + transfer.toString()
                    }
                
                    let where = {
                        StorageLocation_storageLocationID: inventorise.StorageLocationID,
                        Inventory_inventoryID: product.InventoryID
                    }

                    // as it may be the first time this inventory is inventorised at a particular location
                    // this is to attempt to create if it is so
                    let findCreateOrUpdateInventory = DB.Inventory_Storage.findOrCreate({
                        where: where,
                        defaults: {
                            quantity: newQty
                        },
                        transaction: t
                    }).spread(function(inventory, created) {

                        if (created) return created;

                        // if it is not create, means the inventory already exist in a particular location
                        // hence just add to it.
                        return DB.Inventory_Storage.update({
                            quantity: DB.sequelize.literal('quantity + ' + transferLiteral )
                        }, {
                            where: where,
                            transaction: t
                        })

                    })
                    promises.push(findCreateOrUpdateInventory);
                
                })

                return PROMISE.all(promises)

            })
        })
    }).then(() => {
    
        return [
            DB.Inventory.findById(_INVENTORY.InventoryID, {
                include: inventoryIncludes
            }),

            DB.Inventory_Storage.findAll({
                where: {
                    Inventory_inventoryID: _INVENTORY.InventoryID
                },
                include: inventoryStorageIncludes
            })
        ]

    }).spread( (inventory, soldInventories) => {

        let processed = singleInventoryProcessor(inventory, soldInventories)

        return res.send({
            success: true,
            inventory: processed
        })

    
    }).catch(function(error) { API_ERROR_HANDLER(error, req, res, next) });

})

module.exports = router;
