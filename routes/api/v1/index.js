var express = require('express');
var router = express.Router();

router.put('/inventory/add', function (req, res, next) {

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

router.post('/inventory/update', function (req, res, next) {

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

router.delete('/inventory/delete', function (req, res, next) {

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

router.post('/inventory/deactivate', function (req, res, next) {

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

router.put('/inventory/sold', function (req, res, next) {

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

router.delete('/inventory/sold/delete', function (req, res, next) {

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
