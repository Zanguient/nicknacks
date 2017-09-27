function WunderlistTask(sequelize, DataTypes) {

    var WunderlistTask = sequelize.define('WunderlistTask', {
        WunderlistTaskID: {
            type: DataTypes.BIGINT,
            primaryKey: true,
            allowNull: false,
            autoIncrement: false
        },
        salesOrderID: {
            type: DataTypes.BIGINT,
            allowNull: false
        },
        status: {
            type: DataTypes.STRING,
            allowNull: true
        },
        data: {
            type: DataTypes.JSON,
            allowNull: false,
            defaultValue: {},
            roles: {
                vendor: true,
                admin: true,
                member: true
            }
        },
        errorJSON: {
            type: DataTypes.JSON,
            allowNull: false,
            defaultValue: {},
            roles: {
                vendor: true,
                admin: true,
                member: true
            }
        },
    }, {
        timestamps: true,
        tableName: 'WunderlistTask',
        instanceMethods: {},
        getterMethods: {},
        classMethods: {}
    });
    return WunderlistTask;
};

module.exports = WunderlistTask;
