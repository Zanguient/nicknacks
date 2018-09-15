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
        user: {
            type: DataTypes.STRING,
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
        },
        involvedProductIDs: {
            type: DataTypes.ARRAY(DataTypes.INTEGER),
            allowNull: true,
            defaultValue: []
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
