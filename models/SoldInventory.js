function SoldInventory(sequelize, DataTypes) {

    var SoldInventory = sequelize.define('SoldInventory', {
        SoldInventoryID: {
            type: DataTypes.BIGINT,
            primaryKey: true,
            allowNull: false,
            autoIncrement: true
        },
        quantity: {
            type: DataTypes.BIGINT,
            allowNull: false
        },
        data: {
            type: DataTypes.JSON,
            allowNull: false,
            defaultValue: {}
        }
    }, {
        timestamps: true,
        tableName: 'SoldInventory',
        instanceMethods: {},
        getterMethods: {
            isStoredAt: function() {
                var self = this;

                return D.get(self, 'Inventory_Storage.StorageLocation');
            }
        },
        classMethods: {
            associate: function (models) {
                SoldInventory.belongsTo(models.Inventory_Storage, {
                    singular: 'Inventory_Storage',
                    plural: 'Inventory_Storages',
                    foreignKey: 'Inventory_Storage_inventory_StorageID'
                });

            }
        }
    });
    return SoldInventory;
};

module.exports = SoldInventory;
