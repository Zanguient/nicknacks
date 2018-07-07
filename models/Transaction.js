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
                'checkout',
                'charge-succeeded',
                'refunded'
            ]
        },
        status: {
            type: DataTypes.STRING,
            allowNull: false,
            values: [
                'pending', // pending COGS to be entered
                'processing',
                'failed',
                'completed', // COGSed. Pending inventory to be added and delivered
                'delivered' // this is the final status
            ]
        },
        salesOrderNumber: {
            type: DataTypes.STRING,
            allowNull: true
        },
        paymentMethod: {
            type: DataTypes.STRING,
            allowNull: false
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
        qboSalesReceiptId: {
            type: DataTypes.BIGINT,
            allowNull: true
        },
        qboCOGSJournalId: {
            type: DataTypes.BIGINT,
            allowNull: true
        },
        qboStripeExpenseId: {
            type: DataTypes.BIGINT,
            allowNull: true
        },
        qboRefundJournalId: {
            type: DataTypes.BIGINT,
            allowNull: true
        },
        eventId: {
            type: DataTypes.STRING,
            allowNull: true
        }
    }, {
        timestamps: true,
        tableName: 'Transaction',
        instanceMethods: {},
        getterMethods: {

            oldJSON_v1: function() {
                var self = this;

                // new version has attribute `increment_id`, if we can find it, we assume it is v1
                if ( D.get(self, 'data.increment_id') ) return null;

                var object = {};

                object.transactionDateUnixTS = D.get(self, 'data.data.object.created');
                object.transactionDateQBOFormat = MOMENT.unix(D.get(self, 'data.data.object.created')).format('YYYY-MM-DD');
                object.transactionDateTime = MOMENT.unix(D.get(self, 'data.data.object.created')).format('Do MMM YY, HH:mm');
                object.transactedCurrency = D.get(self, 'data.data.object.currency');
                object.transactionReferenceCode = D.get(self, 'data.data.object.id');
                object.generalDescription = D.get(self, 'data.data.object.description') + ', ' + D.get(self, 'data.data.object.source.name') || 'Anonymous';

                object.salesOrderNumber = (function(transaction) {
                    try {
                        var orderNumber = (transaction.data.data.object.description.split(','))[0].trim();
                    } catch(err) {
                        console.log('CRITICAL: Transaction model unable to parse Sales Order Number.');
                        console.log(err);
                    }
                    return orderNumber
                })(this);

                object.salesOrderNumber = (function(transaction) {
                    try {
                        var orderNumber = (transaction.data.data.object.description.split(','))[0].trim();
                    } catch(err) {
                        console.log('CRITICAL: Transaction model unable to parse Sales Order Number.');
                        console.log(err);
                    }
                    return orderNumber
                })(this);

                object.customerEmail = (function(transaction) {

                    try {
                        var email = (transaction.data.data.object.description.split(','))[1].trim();
                    } catch(err) {
                        console.log('CRITICAL: Transaction model unable to parse Customer Email.');
                        console.log(err);
                    }
                    return email;
                })(this);

                object.customerName = D.get(self, 'data.data.object.source.name') || 'Anonymous';

                object.totalAmount = (function(transaction) {
                    if (typeof transaction.data.data.object.amount === "undefined") console.log('CRITICAL: Stripe transaction missing `amount`.');

                    // stripe amount is in cents. need to divide by 100;
                    return parseInt(transaction.data.data.object.amount)/100;
                })(this);

                object.address = D.get(this, 'data.data.object.source.address_line1');
                object.addressZip = D.get(this, 'data.data.object.source.address_zip');
                object.addressCountry = D.get(this, 'data.data.object.source.address_country');
                object.creditCardOriginCountry = D.get(this, 'data.data.object.source.country');

                object.creditCardOriginCountryIsSG = (function(transaction) {
                    return D.get(transaction, 'data.data.object.source.country') === 'SG';
                })(this);

                object.creditCardIsAMEXorIsNotSG = (function(transaction) {
                    return D.get(transaction, 'data.data.object.source.country') !== 'SG' || D.get(transaction, 'data.data.object.source.brand') === 'American Express';
                })(this);

                return object;

            },

            soldInventories: function() {
                var array = [];

                if (!this.Inventory_Storages) return array;

                this.Inventory_Storages.forEach(function(element) {
                    var obj = {};

                    obj.Inventory_StorageID = element.Inventory_StorageID;
                    obj.InventoryID = element.Inventory_inventoryID;
                    obj.SoldInventoryID = D.get(element, 'SoldInventory.SoldInventoryID');
                    obj.quantity = D.get(element, 'SoldInventory.quantity');
                    obj.StorageLocationID = element.StorageLocation_storageLocationID;
                    obj.StorageLocationName = D.get(element, 'StorageLocation.name');
                    obj.name = D.get(element, 'Inventory.name');
                    obj.sku = D.get(element, 'Inventory.sku');
                    obj.perItemCOGS = D.get(element, 'Inventory.cogs');
                    obj.totalCOGS = parseFloat(obj.perItemCOGS) * parseFloat(obj.quantity);

                    array.push(obj);
                })

                return array;
            }
        },
        classMethods: {
            associate: function (models) {

                Transaction.belongsToMany(models.Inventory_Storage, {
                    singular: 'SoldInventory',
                    plural: 'SoldInventories',
                    foreignKey: 'Transaction_transactionID',
                    through: 'SoldInventory'
                });

            }

        }
    });
    return Transaction;
};

module.exports = Transaction;
