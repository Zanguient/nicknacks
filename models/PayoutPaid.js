function PayoutPaid(sequelize, DataTypes) {

    var PayoutPaid = sequelize.define('PayoutPaid', {
        PayoutPaidID: {
            type: DataTypes.BIGINT,
            primaryKey: true,
            allowNull: false,
            autoIncrement: true
        },
        eventId: {
            type: DataTypes.STRING,
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
        tableName: 'PayoutPaid',
        instanceMethods: {},
        getterMethods: {

            payoutPaidDateUnixTS: function() {
                var self = this;
                return D.get(self, 'data.data.object.arrival_date');

            },
            payoutPaidDateQBOFormat: function() {
                var self = this;
                return MOMENT.unix(D.get(self, 'data.data.object.arrival_date')).format('YYYY-MM-DD');
            },
            payoutPaidDateTime: function() {
                var self = this;
                return MOMENT.unix(D.get(self, 'data.data.object.arrival_date')).format('Do MMM YY, hh:mm');
            },
            transactedCurrency: function() {
                var self = this;
                return D.get(self, 'data.data.object.currency');
            },
            amount: function() {
                if (typeof this.data.data.object.amount === "undefined") console.log('CRITICAL: Stripe PayoutPaid missing `amount`.');
                
                // stripe amount is in cents. need to divide by 100;
                return parseInt(this.data.data.object.amount)/100;
            }
        },
        classMethods: {}
    });
    return PayoutPaid;
};

module.exports = PayoutPaid;
