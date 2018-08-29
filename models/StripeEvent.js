function StripeEvent(sequelize, DataTypes) {

    var StripeEvent = sequelize.define('StripeEvent', {
        StripeEventID: {
            type: DataTypes.BIGINT,
            primaryKey: true,
            allowNull: false,
            autoIncrement: true
        },
        eventType: {
            type: DataTypes.STRING,
            allowNull: false
        },
        salesOrderNumber: {
            type: DataTypes.STRING,
            allowNull: true
        },
        notLive: {
            type: DataTypes.BOOLEAN,
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
        eventId: {
            type: DataTypes.STRING,
            allowNull: true
        }
    }, {
        timestamps: true,
        tableName: 'StripeEvent',
        instanceMethods: {},
        getterMethods: {},
        classMethods: {}
    });
    return StripeEvent;
};

module.exports = StripeEvent;
