function Inventory(sequelize, DataTypes) {

    var Inventory = sequelize.define('Inventory', {
        InventoryID: {
            type: DataTypes.BIGINT,
            primaryKey: true,
            allowNull: false,
            autoIncrement: true
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false
        },
        cogs: {
            type: DataTypes.DECIMAL(99,2),
            allowNull: false
        },
        sku: {
            type: DataTypes.STRING,
            allowNull: true
        },
        comments: {
            type: DataTypes.STRING,
            allowNull: true
        },
        data: {
            type: DataTypes.JSON,
            allowNull: false,
            defaultValue: {}
        }
    }, {
        timestamps: true,
        tableName: 'Inventory',
        instanceMethods: {},
        getterMethods: {
            searchString: function() {
                if (this.name && this.sku) return this.name + ' ' + this.sku;
            },
            stock: function() {
                var self = this;

                var stockArray = [];

                var storedLocations = D.get(self, 'StorageLocations');

                if (storedLocations) {
                    for(let i=0; i<storedLocations.length; i++) {
                        var s = storedLocations[i];
                        stockArray.push({
                            StorageLocationID: s.StorageLocationID,
                            name: s.name,
                            quantity: D.get(s, 'Inventory_Storage.quantity', false)  // false indicates errors query
                        });
                    }
                }

                // // COUNTING FOR SOLD QUANTITIES
                // var transactions = D.get(self, 'Transactions');
                // var soldQty = null; // null indicates that something is wrong.

                // if (transactions) {

                //     soldQty = 0; // set quantity to 0 because we found attached model.

                //     for(let i=0; i<transactions.length; i++) {
                //         var t = transactions[i];

                //         // if SoldInventory cross table is not included
                //         if (!t.SoldInventory) {
                //             soldQty = false; // false indicates errors query
                //             break;
                //         }

                //         soldQty += parseInt(t.SoldInventory.quantity);
                //     }
                // }
                // stockArray.push({
                //     name: 'Sold',
                //     quantity: soldQty
                // });

                return stockArray.length === 0 ? null : stockArray;

            }
        },
        classMethods: {
            associate: function (models) {
                Inventory.belongsToMany(models.StorageLocation, {
                    singular: 'StorageLocation',
                    plural: 'StorageLocations',
                    foreignKey: 'Inventory_inventoryID',
                    through: 'Inventory_Storage'
                });

                Inventory.hasMany(models.Inventory_Storage, {
                    singular: 'Inventory_Storage',
                    plural: 'Inventory_Storages',
                    foreignKey: 'Inventory_inventoryID'
                });

                Inventory.belongsToMany(models.Shipment, {
                    singular: 'Shipment',
                    plural: 'Shipments',
                    foreignKey: 'Inventory_inventoryID',
                    through: 'TransitInventory'
                });

            }
        }
    });
    return Inventory;
};

module.exports = Inventory;
