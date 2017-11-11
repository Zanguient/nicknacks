function SoldInventory(sequelize, DataTypes) {

    var SoldInventory = sequelize.define('SoldInventory', {
        SoldInventoryID: {
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
        tableName: 'SoldInventory',
        instanceMethods: {},
        getterMethods: {},
        classMethods: {}
    });
    return SoldInventory;
};

module.exports = SoldInventory;
