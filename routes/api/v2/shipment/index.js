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

    DB.Shipment.findAll({
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

        const shipments = JSON.parse(JSON.stringify(shipments));
        //
        // // re-format the Inventories json
        // // admittedly, Inventories should have be named Products.
        // shipments.forEach(function(shipment) {
        //
        //     shipment.products = [];
        //
        //     shipment.Inventories.forEach(function(inventory) {
        //
        //     })
        // })

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
                    Inventory_inventoryID: value.ID,
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
module.exports = router;
