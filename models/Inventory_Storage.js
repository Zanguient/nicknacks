function Inventory_Storage(sequelize, DataTypes) {

    var Inventory_Storage = sequelize.define('Inventory_Storage', {
        Inventory_StorageID: {
            type: DataTypes.BIGINT,
            primaryKey: true,
            allowNull: false,
            autoIncrement: true
        },
        quantity: {
            type: DataTypes.BIGINT(8),
            allowNull: false
        },
        data: {
            type: DataTypes.JSON,
            allowNull: false,
            defaultValue: {}
        }
    }, {
        timestamps: true,
        tableName: 'Inventory_Storage',
        instanceMethods: {},
        getterMethods: {},
        classMethods: {}
    });
    return Inventory_Storage;
};

module.exports = Inventory_Storage;
