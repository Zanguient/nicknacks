function StorageLocation(sequelize, DataTypes) {

    var StorageLocation = sequelize.define('StorageLocation', {
        StorageLocationID: {
            type: DataTypes.BIGINT,
            primaryKey: true,
            allowNull: false,
            autoIncrement: true
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false
        },
        details: {
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
        tableName: 'StorageLocation',
        instanceMethods: {},
        getterMethods: {},
        classMethods: {

            associate: function (models) {

                StorageLocation.belongsToMany(models.Inventory, {
                    singular: 'StorageAndQuantity',
                    plural: 'StorageAndQuantities',
                    foreignKey: 'StorageLocation_storageLocationID',
                    through: 'Inventory_Storage'
                });
            }
            
        }
    });
    return StorageLocation;
};

module.exports = StorageLocation;
