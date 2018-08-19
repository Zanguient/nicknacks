<style scoped>
.ivu-table-cell {
    padding-left: 4px !important;
    padding-right: 4px !important;
    @media all and (max-width: 320px) {
        font-size: 10px !important;
    }
}

.expand-row{
    margin-bottom: 16px;
}
</style>

<template>
    <div>

        <Breadcrumb :style="{margin: '5px'}">
            <BreadcrumbItem>Inventory</BreadcrumbItem>
        </Breadcrumb>

        <Table no-data-text="No inventories..." disabled-hover size="small" stripe border :columns="columns" :data="inventories"></Table>

    </div>
</template>
<script>
import axios from 'axios'
import D from 'dottie'
import _ from 'lodash'
const domain = process.env.API_DOMAIN

export default {

    data () {

        return {

            columns: [{
                title: 'Name',
                key: 'name',
                sortable: true
            }, {
                title: 'sku',
                key: 'sku',
                sortable: true,
                filters: [],
                filterMultiple: true,
                filterMethod (value, row) {
                    return row.sku.indexOf(value) === 0
                }
            }, {
                title: 'COGS',
                key: 'cogs',
                width: 45
            }, {
                title: 'Stock',
                render: (h, params) => {
                    let stuff = []

                    for(let i=0; i<params.row.stock.length; i++) {
                        let stocking = params.row.stock[i]

                        // create link for sold
                        if(stocking.name.toLowerCase() === 'sold' && stocking.quantity > 0) {
                            let dom = h('a', {
                                props: {
                                    href: 'javascript:void(0);'
                                },
                                on: {
                                    click: () => {
                                        this.showSoldDetails(params.row)
                                    }
                                }
                            }, [
                                h('p', stocking.name + ': ' + stocking.quantity)
                            ])
                            stuff.push(dom)
                            continue
                        }

                        // create link for transit
                        if(stocking.name.toLowerCase() === 'transit' && stocking.quantity > 0) {
                            let dom = h('a', {
                                props: {
                                    href: 'javascript:void(0);'
                                },
                                on: {
                                    click: () => {
                                        this.showTransitDetails(params.row)
                                    }
                                }
                            }, [
                                h('p', stocking.name + ': ' + stocking.quantity)
                            ])
                            stuff.push(dom)
                            continue
                        }

                        // not sold or transit, just render plainly
                        stuff.push( h('p', stocking.name + ': ' + stocking.quantity) )
                    }
                    return stuff
                }
            }, {
                title: 'Actions',
                render: (h, params) => {
                    return h('Button', {
                        props: {
                            type: 'text',
                            size: 'small'
                        },
                        on: {
                            click: () => {
                                this.editInventory(params.row)
                            }
                        }
                    }, 'Edit')
                }
            }],

            inventories: [],

            // ADD Inventory Form
            addInventoryModal: {
                show: false,
                loading: true,
                salesReceipt: '',
                form: {
                    inventoryIndex: '',
                    StorageLocationID: '',
                    quantity: 1
                },
                formRules: {
                    inventoryIndex: [
                        { type: 'number', min: 0, message: 'Please select inventory', trigger: 'blur' }
                    ],
                    StorageLocationID: [
                        { required: true, message: 'Please select a storage location.', trigger: 'blur' }
                    ],
                    quantity: [
                        { type: 'number', min: 1, message: 'Quantity cannot be less than 1', trigger: 'blur' }
                    ]
                },

                selectedInventory: {
                    stock: []
                }
            }
        }

    },
    methods: {

        editInventory (inventory) {
            this.$Modal.info({
                title: inventory.name,
                content: JSON.stringify(inventory)
            });
        },

        // showTransitDetails (inventory) {
        //     let content = 'Error retrieving information...'
        //     let soldInv = D.get(inventory, 'soldInventories[0]')
        //
        //     if (soldInv) {
        //         for(let i=0; i<soldInv.Transactions.length; i++) {
        //             let t = soldInv.Transactions[i];
        //
        //         }
        //     }
        //     this.$Modal.info({
        //         title: title,
        //         content: content
        //     });
        // },

        addInventoryOK (formName, salesReceipt) {

            this.$refs[formName].validate(valid => {

                if (valid) {

                    let payload = {
                        TransactionID: this.addInventoryModal.salesReceipt.TransactionID,
                        InventoryID: this.addInventoryModal.selectedInventory['InventoryID'],
                        StorageLocationID: this.addInventoryModal.form.storageLocationID,
                        quantity: this.addInventoryModal.form.quantity
                    }

                    axios.put(domain + '/api/v2/inventory/sold', payload).then(response => {
                        if (!response.data.success) {
                            alert(response.data.message)
                            this.addInventoryModal.loading = false
                            return
                        }
                        salesReceipt.soldInventories.push(response.data.data)

                        this.$Message.success('Success!');
                        this.addInventoryModal.show = false
                        this.addInventoryModal.loading = false

                    }).catch(error => {

                        CATCH_ERR_HANDLER(error)

                        this.addInventoryModal.loading = false
                        this.$Message.error('Failed request!');
                    })

                } else {
                    this.addInventoryModal.loading = false
                    this.$Message.error('Check your entry!');
                }
            })
        },
        addInventory(salesReceipt) {
            this.addInventoryModal.show = true
            this.addInventoryModal.salesReceipt = salesReceipt
            this.addInventoryModal.form = {
                inventoryIndex: '',
                StorageLocationID: '',
                quantity: 1
            }
            this.addInventoryModal.selectedInventory = { stock: [] }
            this.$refs['addInventoryForm'].resetFields()
            this.$refs['addInventoryFormStorage'].reset()
            this.addInventoryModal.inventories = this.inventories

        },
        triggerStorageSelection() {
            // set the selectedInventory to point to the inventory object within the inventories array
            let i = this.addInventoryModal.form.inventoryIndex
            if (this.inventories[i]) {
                this.addInventoryModal.selectedInventory = this.inventories[i]
                this.$refs['addInventoryFormStorage'].reset()
            }
        },
        removeSoldInventory(soldInventory, salesReceipt) {

            this.$Modal.confirm({
                title: 'Delete Sold Inventory Entry',
                content: '<p>Confirm delete sold inventory entry of <strong>' + soldInventory.name + '</strong>?</p>',
                loading: true,
                onOk: () => {

                    axios.delete(domain + '/api/v2/inventory/sold/delete', { data: { SoldInventoryID: soldInventory.SoldInventoryID }}).then(response => {
                        if (!response.data.success) return alert(response.data.message)

                        // remove the deleted entry
                        salesReceipt.soldInventories.splice(salesReceipt.soldInventories.indexOf(soldInventory), 1)

                        // re-compute the totalCOGS
                        salesReceipt.totalCOGS = 0
                        for(let i=0; i<salesReceipt.soldInventories.length; i++) {
                            let soldInventory = salesReceipt.soldInventories[i]
                            salesReceipt.totalCOGS += parseFloat(soldInventory.totalCOGS)
                        }
                        salesReceipt.totalCOGS = salesReceipt.totalCOGS.toFixed(2)

                        this.$Modal.remove();
                        this.$Message.info('Succesfully removed sold inventory entry!')

                    }).catch(error => {

                        CATCH_ERR_HANDLER(error)

                        this.$Modal.remove()
                        this.$Message.error('Failed request!')

                    })

                }
            })
        },
        submitSalesReceipt (formName, salesReceipt) {

            salesReceipt.submitLoading = true

            this.$refs[formName][0].validate((valid) => {

                if (valid) {

                    console.log(salesReceipt)

                    let payload = {
                        TransactionID: salesReceipt.TransactionID,
                        COGS: salesReceipt.totalCOGS,
                        comments: salesReceipt.comments
                    }

                    axios.post(domain + '/api/v2/sales-receipt/create-sales-receipt', payload).then(response => {

                        // if success: false
                        if (!response.data.success) {
                            alert(response.data.message)
                            salesReceipt.submitLoading = false
                            return
                        }

                        // remove the successful entry
                        this.salesReceipts.splice(this.salesReceipts.indexOf(salesReceipt), 1)

                        this.$Message.success('Successfully submitted sales receipt!');

                    }).catch(error => {

                        salesReceipt.submitLoading = false
                        this.$Message.error('Failed request!');

                        CATCH_ERR_HANDLER(error)
                    })

                } else {
                    salesReceipt.submitLoading = false
                    this.$Message.error('Check your entry!');
                }
            })
        }
    },

    created () {

        window.V = this

        this.$Spin.show()

        axios.get(domain + '/api/v2/inventory/all').then(response => {
            if (!response.data.success) return alert(response.data.message)
            console.log(response.data.data)
            this.inventories = response.data.data

            let categoryArray = []

            // split up the skus and get the broad categories
            for(let i=0; i<this.inventories.length; i++) {
                let inv = this.inventories[i]
                let sku = inv.sku
                let categoryName = sku.split('-')[0].toLowerCase()

                if (categoryArray.indexOf(categoryName) > -1) continue

                categoryArray.push(categoryName)
            }

            _.sortBy(categoryArray)

            //make categoryArray into filters
            let categoryFilters = []
            for(let i=0; i<categoryArray.length; i++) {
                let cat = categoryArray[i]

                categoryFilters.push({
                    label: cat,
                    value: cat
                })

            }

            this.columns[1].filters = categoryFilters

            this.$Spin.hide()

        }).catch(CATCH_ERR_HANDLER)
    }
}
</script>
