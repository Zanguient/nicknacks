var express = require('express');
var router = express.Router();
var debug = require('debug')('nn:api:shipment')

/* GET home page. */
router.get('/', function (req, res, next) {
    res.send({
        sucess: true,
        data: {}
    });
});

router.get('/all', (req, res, next) => {

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
            shipments: shipments
        });

    }).catch(error => { API_ERROR_HANDLER(error, req, res, next) })

});

router.get('/one/:shipmentID', function(req, res, next) {

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

router.post('/shipout', function(req, res, next) {

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
            shipment: shipment
        })

    }).catch(error => { API_ERROR_HANDLER(error, req, res, next) });

})

router.put('/create', function(req, res, next) {

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
            shipment: shipment
        });

    }).catch(error => { API_ERROR_HANDLER(error, req, res, next) });

});

router.post('/edit', function(req, res, next) {

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
            shipment: shipment
        })
    })
    .catch(function(error) { API_ERROR_HANDLER(error, req, res, next) });
});

router.delete('/delete', function(req, res, next) {

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

router.post('/arrive', function(req, res, next) {

    debug(req.body);

    return DB.sequelize.transaction(function(t) {

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

            // shipment cannot me found, possibly race condition where the shipment was deleted by someone
            // or user is accessing an outdated view.
            if (!shipment) {
                res.status(400).send({
                    success: false,
                    error: {
                        message: 'The shipment record could not be found. It might have been deleted. Please try again.',
                        hideMessage: false,
                        debug: {
                            message: 'after DB.Shipment.findOne'
                        }
                    }
                });
                throw new Error('responded');
            }

            // shipment already inventorised.
            if (shipment.hasArrived) {
                res.status(400).send({
                    success: false,
                    error: {
                        message: 'The shipment has already been inventorise.',
                        hideMessage: false,
                        debug: {
                            message: 'after DB.Shipment.findOne'
                        }
                    }
                });
                throw new Error('responded');
            }

            shipment.hasArrived =  true;
            shipment.actualArrival = req.body.actualArrival;
            shipment.arrivalDetails = req.body.arrivalDetails;
            shipment.data.inventorised = req.body.products;

            var promises = [
                shipment.save({ fields: (shipment.changed() || []).concat(['data']) })
            ];

            // create a transit dictionary for use later
            let transitObj = {};


            shipment.TransitInventories.forEach(transit => {
                transitObj[transit.Inventory_inventoryID] = transit;

                // also set all isInventorised bool to true
                transit.isInventorised = true;
                promises.push(transit.save());
            });

            // for each product, find its inventory status
            req.body.products.forEach(product => {

                let productShipmentQty = parseInt(transitObj[product.InventoryID].quantity);
                let inventoriseQty = 0;
                let findCreateOrUpdateInventoryFunctions = [];

                // for each for the toInventorise, inventory and then do an update.
                product.toInventorise.forEach(inventorise => {

                    // if inventorise quantity is zero, we ignore
                    let qty = parseInt(inventorise.quantity);
                    if(isNaN(qty) || qty === 0) return;

                    inventoriseQty += qty;

                    let where = {
                        StorageLocation_storageLocationID: inventorise.StorageLocationID,
                        Inventory_inventoryID: product.InventoryID
                    };

                    let findCreateOrUpdateInventory = DB.Inventory_Storage.findOrCreate({
                        where: where,
                        defaults: {
                                quantity: inventorise.quantity
                        },
                        limit: 1
                    }).spread(function(inventory, created) {
                        if (created) return created;

                        return DB.Inventory_Storage.update({
                            quantity: DB.sequelize.literal('quantity + ' + inventorise.quantity )
                        }, { where: where });

                    });

                    promises.push(findCreateOrUpdateInventory);
                });

                // check if the quantity adds up.
                if(inventoriseQty !== productShipmentQty) {
                    res.send({
                        success: false,
                        error: {
                            message: 'The total quantity shipped does not match with the quantity you wish to inventorise for "' + product.InventoryID + '"',
                            hideMessage: false,
                            debug: {
                                message: 'Failed "inventoriseQty !== productShipmentQty" check.'
                            }
                        }
                    });
                    throw new Error('responded');
                }
            });

            return promises;

        }).spread(function(inventorise, shipment) {

            res.send({
                success: true
            });

        }).catch(function(err) {
            console.log(err)

            if (err.message === 'responded') return;

            res.status(500).send({
                success: false,
                error: {
                    message: 'An error has occurred, please try again',
                    hideMessage: false,
                    debug: {
                        message: 'Catch handler',
                        errorObject: err.msg
                    }
                }
            });
        });

    }); // end of transaction closing brackets
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
