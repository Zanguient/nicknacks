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
        getterMethods: {},
        classMethods: {

            associate: function (models) {

                Shipment.hasMany(models.TransitInventory, {
                    singular: 'TransitInventory',
                    plural: 'TransitInventories',
                    foreignKey: 'Shipment_shipmentID'
                });

            }
            
        }
    });
    return Shipment;
};

module.exports = Shipment;
