function TransitInventory(sequelize, DataTypes) {

    var TransitInventory = sequelize.define('TransitInventory', {
        TransitInventoryID: {
            type: DataTypes.BIGINT,
            primaryKey: true,
            allowNull: false,
            autoIncrement: true
        },
        quantity: {
            type: DataTypes.BIGINT,
            allowNull: false
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
        tableName: 'TransitInventory',
        instanceMethods: {},
        getterMethods: {},
        classMethods: {

            associate: function (models) {

                TransitInventory.belongsTo(models.Shipment, {
                    singular: 'Shipment',
                    plural: 'Shipments',
                    foreignKey: 'Shipment_shipmentID'
                });

                TransitInventory.belongsTo(models.Inventory, {
                    singular: 'Inventory',
                    plural: 'Inventories',
                    foreignKey: 'Inventory_inventoryID'
                });

            }

        }
    });
    return TransitInventory;
};

module.exports = TransitInventory;
