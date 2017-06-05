function PayOutPaid(sequelize, DataTypes) {

    var PayOutPaid = sequelize.define('PayOutPaid', {
        PayOutPaidID: {
            type: DataTypes.BIGINT,
            primaryKey: true,
            allowNull: false,
            autoIncrement: true
        },
        eventId: {
            type: DataTypes.BIGINT,
            allowNull: true
        },
        status: {
            type: DataTypes.STRING,
            allowNull: false,
            values: [
                'pending',
                'processing',
                'failed',
                'completed'
            ]
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
        }
    }, {
        timestamps: true,
        tableName: 'PayOutPaid',
        instanceMethods: {},
        getterMethods: {

            PayOutPaidDateUnixTS: function() {
                var self = this;
                return D.get(self, 'data.data.object.arrival_date');

            },
            PayOutPaidDateQBOFormat: function() {
                var self = this;
                return MOMENT.unix(D.get(self, 'data.data.object.arrival_date')).format('YYYY-MM-DD');
            },
            transactedCurrency: function() {
                var self = this;
                return D.get(self, 'data.data.object.currency');
            },
            amount: function() {
                if (typeof this.data.data.object.amount === "undefined") console.log('CRITICAL: Stripe PayOutPaid missing `amount`.');
                
                // stripe amount is in cents. need to divide by 100;
                return parseInt(this.data.data.object.amount)/100;
            }
        },
        classMethods: {}
    });
    return PayOutPaid;
};

module.exports = PayOutPaid;
