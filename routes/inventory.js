var express = require('express');
var router = express.Router();
var qs = require('querystring');
//var QuickBooks = require('node-quickbooks');
var request = require('request');
var rp = require('request-promise');

/* GET home page. */
router.put('/add', function (req, res, next) {

    console.log(req.body)


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
                model: DB.Transaction,
                through: {
                    model: DB.SoldInventory,
                    attributes: [ 'quantity' ]
                }
            }, {
                model: DB.StorageLocation,
                through: {
                    model: DB.Inventory_Storage,
                    attributes: [ 'quantity' ]
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

    console.log(req.body)


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
                model: DB.Transaction,
                through: {
                    model: DB.SoldInventory,
                    attributes: [ 'quantity' ]
                }
            }, {
                model: DB.StorageLocation,
                through: {
                    model: DB.Inventory_Storage,
                    attributes: [ 'quantity' ]
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

        DB.Inventory.findById(soldInventory.Inventory_inventoryID)

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
