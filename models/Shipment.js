function Shipment(sequelize, DataTypes) {

    var Shipment = sequelize.define('Shipment', {
        ShipmentID: {
            type: DataTypes.BIGINT,
            primaryKey: true,
            allowNull: false,
            autoIncrement: true
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false
        },
        estimatedShipOut: {
            type: DataTypes.BIGINT,
            allowNull: false
        },
        actualShipOut: {
            type: DataTypes.BIGINT,
            allowNull: true
        },
        shipOutDetails: {
            type: DataTypes.STRING,
            allowNull: true
        },
        expectedArrival: {
            type: DataTypes.BIGINT,
            allowNull: false
        },
        actualArrival: {
            type: DataTypes.BIGINT,
            allowNull: true
        },
        arrivalDetails: {
            type: DataTypes.STRING,
            allowNull: true
        },
        hasArrived: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false
        },
        remarks: {
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
        tableName: 'Shipment',
        instanceMethods: {},
        getterMethods: {
            products: function() {

                let self = this
                var products = null

                if (D.get(self, 'Inventories')) {

                    products = []

                    this.Inventories.forEach(inventory => {
                        products.push({
                            InventoryID: inventory.InventoryID,
                            name: inventory.name,
                            sku: inventory.sku,
                            quantity: inventory.TransitInventory.quantity
                        })
                    })

                }

                return products

            }
        },
        classMethods: {

            associate: function (models) {

                Shipment.belongsToMany(models.Inventory, {
                    singular: 'Inventory',
                    plural: 'Inventories',
                    foreignKey: 'Shipment_shipmentID',
                    through: 'TransitInventory'
                });

                Shipment.hasMany(models.TransitInventory, {
                    singular: 'TransitInventory',
                    plural: 'TransitInventories',
                    foreignKey: 'Shipment_shipmentID',
                    onDelete: 'cascade'
                });

            }

        }
    });
    return Shipment;
};

module.exports = Shipment;
