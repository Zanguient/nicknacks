function Transaction(sequelize, DataTypes) {

    var Transaction = sequelize.define('Transaction', {
        TransactionID: {
            type: DataTypes.BIGINT,
            primaryKey: true,
            allowNull: false,
            autoIncrement: true
        },
        eventType: {
            type: DataTypes.STRING,
            allowNull: true,
            values: [
                'charge-succeeded',
                'refunded'
            ]
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
        transaction: {
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
        tableName: 'Transaction',
        instanceMethods: {},
        getterMethods: {

            transactionDateUnixTS: function() {
                var self = this;
                return D.get(self, 'data.object.created');

            },
            transactionDateQBOFormat: function() {
                var self = this;
                return MOMENT.unix(D.get(self, 'data.object.created')).format('YYYY-MM-DD');
            },
            generalDescription: function() {
             return this.data.object.description;   
            },
            salesOrderNumber: function() {
                try {
                    var orderNumber = (this.data.object.description.split(','))[0].trim();
                } catch(err) {
                    console.log('CRITICAL: Transaction model unable to parse Sales Order Number.');
                    console.log(err);
                }
                return orderNumber
            },
            salesOrderNumber: function() {
                try {
                    var orderNumber = (this.data.object.description.split(','))[0].trim();
                } catch(err) {
                    console.log('CRITICAL: Transaction model unable to parse Sales Order Number.');
                    console.log(err);
                }
                return orderNumber
            },
            customerEmail: function() {
                try {
                    var email = (this.data.object.description.split(','))[1].trim();
                } catch(err) {
                    console.log('CRITICAL: Transaction model unable to parse Customer Email.');
                    console.log(err);
                }
                return email;
            },
            totalAmount: function() {
                // stripe amount is in cents. need to divide by 100;
                return parseInt(D.get(this.data.object.amount))/100;
            }
          

        },
        classMethods: {}
    });
    return Transaction;
};

module.exports = Transaction;
