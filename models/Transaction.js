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
        },
        deliveryDate: {
            type: DataTypes.BIGINT,
            allowNull: true
        },
        deliveryConfirmed: {
            type: DataTypes.BOOLEAN,
            allowNull: true,
            default: false
        }
    }, {
        timestamps: true,
        tableName: 'Transaction',
        instanceMethods: {},
        getterMethods: {

            details: function() {
                var self = this;

                if (!this.paymentMethod) return null;

                // old stripe webhook will carry this, we are checking for new magento webhooks
                if (D.get(self, 'data.type') !== 'charge.succeeded') {

                    let object = {};

                    let momentDate = MOMENT.unix(D.get(self, 'data.order_created_at'))

                    object.transactionDateUnixTS = momentDate.unix()
                    object.transactionDateQBOFormat = momentDate.format('YYYY-MM-DD');
                    object.transactionDateTime = momentDate.format('Do MMM YY, HH:mm');

                    object.customerName = (function(txn) {
                        let firstName = D.get(txn, 'data.data.customer_firstname')
                        let lastName = D.get(txn, 'data.data.customer_lastname')

                        var name = ''

                        if (firstName) name += firstName
                        if (lastName) name += ' ' + lastName

                        return name
                    })(this)

                    object.generalDescription = D.get(self, 'salesOrderNumber') + ', ' + (object.customerName || 'Anonymous')

                    object.salesOrderNumber = this.salesOrderNumber

                    object.customerEmail = D.get(self, 'data.data.customer_email')

                    object.customerPhone = D.get(self, 'data.data.customer_telephone')

                    // MISSING!!!
                    object.totalAmount = D.get(self, 'data.totals.grand_total_incl_tax')
                    if (!object.totalAmount) throw new Error('`totalAmount` is missing from transaction.`')

                    object.address = D.get(self, 'data.data.shipping_address')


                    return object;

                } else {
                    // this is the old stripe object.
                    let object = {};

                    object.transactionDateUnixTS = D.get(self, 'data.data.object.created');
                    object.transactionDateQBOFormat = MOMENT.unix(D.get(self, 'data.data.object.created')).format('YYYY-MM-DD');
                    object.transactionDateTime = MOMENT.unix(D.get(self, 'data.data.object.created')).format('Do MMM YY, HH:mm');
                    object.transactedCurrency = D.get(self, 'data.data.object.currency');
                    object.transactionReferenceCode = D.get(self, 'data.data.object.id');

                    object.customerName = D.get(self, 'data.data.object.source.name') || 'Anonymous';

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

                    object.totalAmount = (function(transaction) {
                        if (typeof transaction.data.data.object.amount === "undefined") {
                            let error = new Error('CRITICAL: Stripe transaction missing `amount`.')
                            throw error
                        }

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
                }

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
