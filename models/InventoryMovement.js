function InventoryMovement(sequelize, DataTypes) {

    var InventoryMovement = sequelize.define('InventoryMovement', {
        InventoryMovementID: {
            type: DataTypes.BIGINT,
            primaryKey: true,
            allowNull: false,
            autoIncrement: true
        },
        source: {
            type: DataTypes.STRING,
            allowNull: false
        },
        sourceData: {
            type: DataTypes.JSON,
            allowNull: false,
            defaultValue: {}
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
        tableName: 'InventoryMovement',
        instanceMethods: {},
        getterMethods: {},
        classMethods: {

            associate: function (models) {

                

            }

        }
    });
    return InventoryMovement;
};

module.exports = InventoryMovement;
