const express = require('express');
const router = express.Router();
const permit = require(__appsDir + '/passport/permit')('/api/v2/shipment')
const debug = require('debug')('nn:api:shipment')
debug.log = console.log.bind(console)
const createInventoryRecord = require(__appsDir + '/inventory/createInventoryRecord')

/* GET home page. */
router.get('/', permit('/', 1), function (req, res, next) {
    res.send({
        sucess: true,
        data: {}
    });
});

router.get('/all', permit('/all', 1), (req, res, next) => {

    let where = {
        hasArrived: { $ne: true }
    }
    var order = [ ['estimatedShipOut', 'ASC'] ]; // by default the order is by estimatedShipOut date

    if (req.query.hasArrived) {
        where.hasArrived = (req.query.hasArrived === 'false') ? false : true;

        // if user is looking for shipment that has arrived, the sorting will be by `actualArrival` date.
        if (where.hasArrived) order = [ ['actualArrival', 'DESC'] ];
    }

    DB.Shipment.findAll({
        where: where,
        order: order,
        include: getShipmentWithProductsIncludes()
    }).then(shipments => {

        res.send({
            success: true,
            data: shipments
        });

    }).catch(error => { API_ERROR_HANDLER(error, req, res, next) })

});

router.get('/one/:shipmentID', permit('/one/:shipmentID', 1), function(req, res, next) {

    DB.Shipment.findOne({
        where: { ShipmentID: req.params.shipmentID },
        include: [{
            model: DB.Inventory,
            through: {
                model: DB.TransitInventory,
                attributes: [
                    'TransitInventoryID',
                    'Shipment_shipmentID',
                    'Inventory_inventoryID',
                    'quantity'
                ]
            }
        }]
    }).then(function (shipment) {

        var shipment = JSON.parse(JSON.stringify(shipment));

        // re-format the Inventories json
        // admittedly, Inventories should have be named Products.
        shipment.products = [];

        shipment.Inventories.forEach(function(inventory) {
            shipment.products.push({
                InventoryID: inventory.InventoryID,
                name: inventory.name,
                sku: inventory.sku,
                quantity: inventory.TransitInventory.quantity
            })
        });

        delete shipment.Inventories;

        res.send({
            success: true,
            shipment: shipment
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

router.post('/shipout', permit('/shipout', 7), function(req, res, next) {

    debug(req.body);

    return DB.Shipment.findOne({
        where: { ShipmentID: req.body.ShipmentID }
    }).then(shipment => {

        if (!shipment) {
            let error = new Error('No shipment was found.')
            error.status = 400
            throw error
        }

        if (shipment.hasArrived) {
            let error = new Error('You cannot shipout a shipment that has arrived and been inventorised.')
            error.status = 400
            throw error
        }

        shipment.shipOutDetails = req.body.shipOutDetails
        shipment.actualShipOut = req.body.actualShipOut
        shipment.expectedArrival = req.body.expectedArrival

        return shipment.save({ returning: true })

    })
    .then(shipment => {
        return getShipmentWithProducts({ ShipmentID: shipment.ShipmentID })
    })
    .then(shipment => {

        res.send({
            success: true,
            data: shipment
        })

    }).catch(error => { API_ERROR_HANDLER(error, req, res, next) });

})

router.put('/create', permit('/create', 7), function(req, res, next) {

    debug(req.body);

    return DB.sequelize.transaction(function(t) {

        return DB.Shipment.create({
            name: req.body.name,
            estimatedShipOut: req.body.estimatedShipOut,
            expectedArrival: req.body.expectedArrival,
            remarks: req.body.remarks
        }, { transaction: t }).then(function(shipment) {

            let transitInventoryObject = req.body.products.map(function(value) {
                return {
                    Shipment_shipmentID: shipment.ShipmentID,
                    Inventory_inventoryID: value.InventoryID,
                    quantity: value.quantity
                }
            });

            return [
                shipment,
                DB.TransitInventory.bulkCreate(transitInventoryObject, { transaction: t })
            ];

        }).spread(function(shipment, transitInventories) {

            return getShipmentWithProducts({ShipmentID: shipment.ShipmentID})

        })

    })
    .then(shipment => {

        if (!shipment) throw new Error('shipment is not found after creation.')

        res.send({
            success: true,
            data: shipment
        });

    }).catch(error => { API_ERROR_HANDLER(error, req, res, next) });

});

router.post('/edit', permit('/edit', 7), function(req, res, next) {

    debug(req.body);

    return DB.sequelize.transaction(function(t) {

        return DB.Shipment.findOne({
            where: { ShipmentID: req.body.ShipmentID }
        }).then(function(shipment) {

            var promises = [];

            if (!shipment) {
                let error = new Error('The shipment record could not be found. It might have been deleted. Please try again.')
                error.status = 400
                throw error
            }

            if (shipment.hasArrived) {
                let error = new Error('You cannot edit a shipment that has been inventorised.')
                error.status = 400
                throw error
            }

            let updateKeys = [
                'actualShipOut',
                'estimatedShipOut',
                'expectedArrival',
                'name',
                'remarks',
                'shipOutDetails'
            ]

            updateKeys.forEach(key => {
                shipment[key] = req.body[key];
            });

            return [
                shipment.save({transaction: t}),

                // destroy all inventory records to replace with new ones
                DB.TransitInventory.destroy({
                    where: { Shipment_shipmentID: shipment.ShipmentID }
                }, {transaction: t})
            ];
        }).spread(function(shipment, transitInventoryDestroy) {


            let transitInventoryObject = req.body.products.map(function(value) {
                return {
                    Shipment_shipmentID: shipment.ShipmentID,
                    Inventory_inventoryID: value.InventoryID,
                    quantity: value.quantity
                }
            });

            return [
                shipment,
                DB.TransitInventory.bulkCreate(transitInventoryObject, {transaction: t})
            ]

        }).spread(function(shipment, transitInventories) {

            return shipment

        })
    })
    .then(shipment => {

        return getShipmentWithProducts({ShipmentID: shipment.ShipmentID})

    })
    .then(shipment => {
        res.send({
            success: true,
            data: shipment
        })
    })
    .catch(function(error) { API_ERROR_HANDLER(error, req, res, next) });
});

router.delete('/delete', permit('/delete', 7), function(req, res, next) {

    debug(req.body);

    // i think we ought to record this in inventory movement as well.

    DB.Shipment.destroy({
        where: { ShipmentID: req.body.ShipmentID },
        limit: 1
    }).then(function() {

        res.send({
            success: true
        });

    }).catch(function(error) { API_ERROR_HANDLER(error, req, res, next) });
});

router.post('/arrive', permit('/arrive', 7), function(req, res, next) {

    debug(req.body);

    var error

    let products = D.get(req, 'body.products')
    if (!products) {
        error = new Error('`products` missing from request')


    }
    for(let i=0; i<products.length; i++) {
        if (parseInt(products[i].quantityRemaining) !== 0) {
            error = new Error('There seems to be error in inventorising ' + products[i].name + '. Please check your inputs.')
            break
        }
    }

    if (error) {
        Object.assign(error, {
            status: 400,
            noLogging: true,
            requestBody: req.body,
            level: 'low'
        })

        return API_ERROR_HANDLER(error, req, res, next)
    }

    var _SHIPMENT
    return DB.Shipment.findOne({
        where: { ShipmentID: req.body.ShipmentID },
        include: [{

            model: DB.TransitInventory,
            attributes: [
                'TransitInventoryID',
                'Shipment_shipmentID',
                'Inventory_inventoryID',
                'quantity',
                'isInventorised'
            ]

        }]
    }).then(function(shipment) {

        _SHIPMENT = shipment

        // shipment cannot be found, possibly race condition where the shipment was deleted by someone
        // or user is accessing an outdated view.
        if (!shipment) {
            let error = new Error('The shipment record could not be found. It might have been deleted. Please try again.')
            error.status = 400
            throw error
        }

        // shipment already inventorised.
        if (shipment.hasArrived) {
            let error = new Error('The shipment has already been inventorise.')
            error.status = 400
            throw error
        }

        shipment.hasArrived =  true;
        shipment.actualArrival = req.body.actualArrival;
        shipment.arrivalDetails = req.body.arrivalDetails;
        shipment.data.inventorised = req.body.products;

        let transitObj = {}

        return DB.sequelize.transaction(function(t) {

            let thingsToCreate = []

            return PROMISE.resolve().then(() => {

                let saveShipment = shipment.save({
                    fields: (shipment.changed() || []).concat(['data']),
                    returning: true,
                    transaction: t
                })
                return saveShipment
            })
            .then(() => {

                let promises = []

                // create a transit dictionary for use later
                //let transitObj = {};

                for(let i=0; i<shipment.TransitInventories.length; i++) {
                    let transit = shipment.TransitInventories[i]
                    transitObj[transit.Inventory_inventoryID] = transit

                    // also set all isInventorised bool to true
                    transit.isInventorised = true
                    promises.push( transit.save({ transaction: t }) )
                }

                return promises

            }).spread(() => {

                let promises = []

                // for each product, find its inventory status
                for(let i=0; i<req.body.products.length; i++) {
                    let product = req.body.products[i]

                    let productShipmentQty = parseInt(transitObj[product.InventoryID].quantity);
                    let inventoriseQty = 0;

                    // for each for the toInventorise, inventory and then do an update.
                    if ( typeof D.get(product, 'toInventorise.stores') !== 'object' ) {
                        let error = new Error('`toInventorise` is not valid.')
                        error.status = 400
                        throw error
                    }

                    let stores = product.toInventorise.stores
                    let storeKeys = Object.keys(stores)
                    for(let i=0; i<storeKeys.length; i++) {
                        let inventorise = stores[ storeKeys[i] ]

                        // if inventorise quantity is zero, we ignore
                        let qty = parseInt(inventorise.quantity);
                        if(isNaN(qty) || qty === 0) continue

                        inventoriseQty += qty;

                        let where = {
                            StorageLocation_storageLocationID: inventorise.StorageLocationID,
                            Inventory_inventoryID: product.InventoryID
                        }

                        // as it may be the first time this inventory is inventorised at a particular location
                        // this is to attempt to create it if so
                        // NOTE : in a similar concept for inventory/transfer route, the
                        //        findOrCreate was refactor as doesn't seem to respect the transaction.
                        //        however, this is test and is rolling back correctly.
                        let findCreateOrUpdateInventory = DB.Inventory_Storage.findOrCreate({
                            where: where,
                            defaults: {
                                quantity: inventorise.quantity
                            },
                            transaction: t
                        }).spread(function(inventory, created) {

                            if (created) return created;

                            // if it is not create, means the inventory already exist in a particular location
                            // hence just add to it.
                            return DB.Inventory_Storage.update({
                                quantity: DB.sequelize.literal('quantity + ' + inventorise.quantity )
                            }, {
                                where: where,
                                transaction: t
                            })

                        })
                        promises.push(findCreateOrUpdateInventory);
                    }

                    // check if the quantity adds up.
                    if(inventoriseQty !== productShipmentQty) {
                        let error = new Error('The total quantity shipped does not match with the quantity you wish to inventorise for "' + product.InventoryID + '"')
                        error.status = 400
                        throw error
                    }
                }

                return promises

            })
            .spread(() => {

                // create the record
                return createInventoryRecord(t, 'shipment', _SHIPMENT, req.user)

            })
        })
    })
    .then(function() {

        return getShipmentWithProducts({ShipmentID: _SHIPMENT.ShipmentID})

    }).then(shipment => {

        res.send({
            success: true,
            data: shipment
        })

    }).catch(function(error) { API_ERROR_HANDLER(error, req, res, next) });

})

/* Local functions */
const shipmentInventoriesOrder = [ [ DB.Inventory, 'sku', 'ASC'] ]

const getShipmentWithProductsIncludes = function(order) {

    if (!order && shipmentInventoriesOrder) var order = shipmentInventoriesOrder
    if (!order) throw new Error('getShipmentWithProductsIncludes: `shipmentInventoriesOrder` missing and/or `order` param not present.')

    return [{
        model: DB.Inventory,
        order: order,
        through: {
            model: DB.TransitInventory,
            attributes: [
                'TransitInventoryID',
                'Shipment_shipmentID',
                'Inventory_inventoryID',
                'quantity'
            ]
        }
    }]

}

const getShipmentWithProducts = function(where, includes, order) {
    if (!includes && getShipmentWithProductsIncludes) var includes = getShipmentWithProductsIncludes()
    if (!includes) throw new Error('getShipmentWithProducts: `getShipmentWithProductsIncludes` missing and/or `includes` param not present.')

    if (!order && shipmentInventoriesOrder) var order = shipmentInventoriesOrder
    if (!order) throw new Error('getShipmentWithProducts: `shipmentInventoriesOrder` missing and/or `order` param not present.')


    return DB.Shipment.findOne({
        where: where,
        order: order,
        include: includes
    })
}

module.exports = router;
