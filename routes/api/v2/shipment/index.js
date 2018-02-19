var express = require('express');
var router = express.Router();
var debug = require('debug')('routes:v2:shipment');

/* GET home page. */
router.get('/', function (req, res, next) {
    res.send({
        sucess: true,
        data: {}
    });
});

router.get('/all', function(req, res, next) {

    const where = {};
    var order = [ ['estimatedShipOut', 'DESC'] ]; // by default the order is by estimatedShipOut date

    if (req.query.hasArrived) {
        where.hasArrived = (req.query.hasArrived === 'false') ? false : true;

        // if user is looking for shipment that has arrived, the sorting will be by `actualArrival` date.
        if (where.hasArrived) order = [ ['actualArrival', 'DESC'] ];
    }

    DB.Shipment.findAll({
        where: where,
        order: [ ['estimatedShipOut', 'DESC'] ],
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
    }).then(function (shipments) {

        var shipments = JSON.parse(JSON.stringify(shipments));

        // re-format the Inventories json
        // admittedly, Inventories should have be named Products.
        shipments.forEach(function(shipment) {

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
        });

        res.send({
            success: true,
            shipments: shipments
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

    return DB.Shipment.update({
        shipOutDetails: req.body.shipOutDetails,
        actualShipOut: req.body.actualShipOut
    }, {
        where: { ShipmentID: req.body.ShipmentID },
        limit: 1,
        returning: true
    }).then(function(shipment) {

        res.send({
            success: true,
            shipment: shipment[1][0]
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

router.post('/create', function(req, res, next) {

    debug(req.body);

    return DB.sequelize.transaction(function(t) {

        return DB.Shipment.create({
            name: req.body.name,
            estimatedShipOut: req.body.estimatedShipOut,
            expectedArrival: req.body.expectedArrival,
            remarks: req.body.remarks
        }).then(function(shipment) {

            const transitInventoryObject = req.body.products.map(function(value) {
                return {
                    Shipment_shipmentID: shipment.ShipmentID,
                    Inventory_inventoryID: value.InventoryID,
                    quantity: value.quantity
                }
            });

            return [
                shipment,
                DB.TransitInventory.bulkCreate(transitInventoryObject)
            ];

        }).spread(function(shipment, transitInventories) {

            res.send({
                success: true,
                shipmentID: shipment.ShipmentID
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
});

router.post('/edit', function(req, res, next) {

    debug(req.body);

    return DB.sequelize.transaction(function(t) {

        return DB.Shipment.findOne({
            where: { ShipmentID: req.body.ShipmentID }
        }).then(function(shipment) {

            var promises = [];

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

            let updateKeys = [
                'actualShipOut',
                'estimatedShipOut',
                'expectedArrival',
                'name',
                'remarks',
                'shippedOutDetails'
            ];

            updateKeys.forEach(key => {
                shipment[key] = req.body[key];
            });

            return [
                shipment.save(),

                // destroy all inventory records to replace with new ones
                DB.TransitInventory.destroy({
                    where: { Shipment_shipmentID: shipment.ShipmentID }
                })
            ];
        }).spread(function(shipment, transitInventoryDestroy) {


            const transitInventoryObject = req.body.products.map(function(value) {
                return {
                    Shipment_shipmentID: shipment.ShipmentID,
                    Inventory_inventoryID: value.InventoryID,
                    quantity: value.quantity
                }
            });

            return [
                shipment,
                DB.TransitInventory.bulkCreate(transitInventoryObject)
            ];

        }).spread(function(shipment, transitInventories) {

            res.send({
                success: true,
                shipmentID: shipment.ShipmentID
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
                        errorObject: err
                    }
                }
            });
        });
    });
});

router.delete('/delete/:ShipmentID', function(req, res, next) {

    debug(req.params);

    DB.Shipment.destroy({
        where: { ShipmentID: req.params.ShipmentID },
        limit: 1
    }).then(function() {

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
                    errorObject: err
                }
            }
        });
    });
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
                promise.push(transit.save());
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
});

module.exports = router;
