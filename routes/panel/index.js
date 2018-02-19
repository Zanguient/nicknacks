var express = require('express');
var router = express.Router();

router.get('/', function(req, res, next) {

    var optionsForTransaction = {
        where: {},
        order: [['TransactionID', 'DESC']],
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
    };

    var optionsForPayoutPaid = {
        where :{},
        limit: 20,
        order: [['PayoutPaidID', 'DESC']]
    };

    if (req.query.filter === "all") {

        delete optionsForPayoutPaid.limit;

    } else {

        optionsForTransaction.where.status = 'pending';

    }


    PROMISE.resolve().then(function() {

        return [

            DB.Transaction.findAll(optionsForTransaction),
            DB.PayoutPaid.findAll(optionsForPayoutPaid),
            DB.StorageLocation.findAll({ order: [ ['StorageLocationID', 'ASC'] ] }),

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
                }, {
                    model: DB.TransitInventory,
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

        ];

    }).spread(function(transactions, payouts, storageLocations, inventories, soldInventories) {

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

        res.render('panel', {
            data: {
                sales: transactions,
                payouts: payouts,
                status: serverStatus,
                storageLocations: storageLocations,
                inventories: inventories,
                inventoriesString: JSON.stringify(inventories)
            }
        });

    }).catch(function(err) {
        console.log(err)
        res.render('error', err);
    });


});

router.get('/delivery', function(req, res, next) {


    var optionsForTransaction = {
        where: { status: 'completed' },
        order: [['TransactionID', 'DESC']],
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
    };

    PROMISE.resolve().then(function() {

        return [

            DB.Transaction.findAll(optionsForTransaction),
            DB.StorageLocation.findAll({ order: [ ['StorageLocationID', 'ASC'] ] }),


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
                    where: { status: 'completed'  },
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

    }).spread(function(transactions, storageLocations, inventories, soldInventories) {


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



        res.render('delivery', {
            data: {
                sales: transactions,
                status: serverStatus,
                storageLocations: storageLocations,
                inventories: inventories,
                inventoriesString: JSON.stringify(inventories)
            }
        });

    }).catch(function(err) {
        console.log(err)
        res.render('error', err);
    });


});

router.get('/delivery/history', function(req, res, next) {


    var optionsForTransaction = {
        where: { status: 'delivered' },
        order: [['updatedAt', 'DESC']],
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
    };

    PROMISE.resolve().then(function() {

        return [

            DB.Transaction.findAll(optionsForTransaction),

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
                    where: { status: 'delivered' },
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

    }).spread(function(transactions, inventories, soldInventories) {


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



        res.render('delivery-history', {
            data: {
                sales: transactions,
                status: serverStatus,
                inventories: inventories,
                inventoriesString: JSON.stringify(inventories)
            }
        });

    }).catch(function(err) {
        console.log(err)
        res.render('error', err);
    });


});

module.exports = router;
