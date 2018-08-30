<template>
    <div>
        <Spin size="large" fix v-if="spinShow"></Spin>
        <Breadcrumb class="mainBreadCrumb">
            <BreadcrumbItem>Inventory</BreadcrumbItem>
        </Breadcrumb>

        <Button type="primary" @click="addProduct()">Add product</Button>

        <Table no-data-text="No inventories..." disabled-hover size="small" stripe border :columns="columns" :data="inventories"></Table>

        <Modal
            v-model="editInventoryModal.show"
            title="Edit product"
            :loading="editInventoryModal.loading"
            @on-ok="editInventoryOK('editInventoryForm', editInventoryModal.inventory)">

            <Form label-position="right" :label-width="80" ref="editInventoryForm" :model="editInventoryModal.form" :rules="editInventoryModal.formRules">

                <FormItem label="Name" prop="name">
                    <Input v-model="editInventoryModal.form.name"></Input>
                </FormItem>
                <FormItem label="SKU" prop="sku">
                    <Input v-model="editInventoryModal.form.sku"></Input>
                </FormItem>
                <FormItem prop="cogs" label="COGS">
                    <Input type="text" number v-model="editInventoryModal.form.cogs"></Input>
                </FormItem>

            </Form>

            <Collapse>
                <Panel>
                    Advanced
                    <p slot="content">
                        <Button type="warning" @click="deactivateInv(editInventoryModal.inventory)">Deactivate</Button>
                        <Button type="error" @click="deleteInv(editInventoryModal.inventory)">Delete</Button>
                    </p>
                </Panel>
            </Collapse>

            <p>InventoryID: {{ editInventoryModal.inventory.InventoryID }}</p>

        </Modal>

        <Modal
            v-model="transitModal.show"
            title="Transit Info">

            <h1>{{transitModal.inventory.name}}</h1>

            <Card v-for="transitInv in transitModal.inventory.TransitInventories" :key="transitInv.TransactionInventoryID">
                <p slot="title">
                    <Icon type="ios-boat"></Icon>
                    {{transitInv.Shipment.name}}
                </p>
                <p>Quantity: {{transitInv.quantity}}</p>
                <p>Est. Shipout: {{ transitInv.Shipment.estimatedShipOut | momentUnix }}</p>
            </Card>

        </Modal>

        <Modal
            v-model="soldModal.show"
            title="Sold information">

            <h1>{{soldModal.inventory.name}}</h1>
            <span v-for="soldInv in soldModal.inventory.soldInventories" :key="soldInv.Inventory_StorageID">
                <Card v-for="txn in soldInv.Transactions" :key="txn.TransactionID">
                    <p slot="title">
                        <Icon type="ios-cart"></Icon>
                        SO: {{txn.salesOrderNumber}}
                    </p>
                    <p>Name: {{txn.details.customerName}}</p>
                    <p>Date sold: {{ txn.details.transactionDateTime }}</p>
                    <p>Qty: {{ txn.SoldInventory.quantity }}</p>
                </Card>
            </span>

        </Modal>

        <Modal
            v-model="addInventoryModal.show"
            title="Add product"
            :loading="addInventoryModal.loading"
            @on-ok="addInventoryOK('addInventoryForm')">

            <Form label-position="right" :label-width="80" ref="addInventoryForm" :model="addInventoryModal.form" :rules="addInventoryModal.formRules">

                <FormItem label="Name" prop="name">
                    <Input v-model="addInventoryModal.form.name"></Input>
                </FormItem>
                <FormItem label="SKU" prop="sku">
                    <Input v-model="addInventoryModal.form.sku"></Input>
                </FormItem>
                <FormItem prop="cogs" label="COGS">
                    <Input type="text" number v-model="addInventoryModal.form.cogs"></Input>
                </FormItem>

            </Form>

        </Modal>


    </div>
</template>
<script>
import axios from 'axios'
import D from 'dottie'
import _ from 'lodash'
import moment from 'moment'
const domain = process.env.API_DOMAIN

export default {

    data () {

        return {

            spinShow: true,

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
                width: 40
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
                title: 'Action',
                width: 45,
                render: (h, params) => {
                    return h('Button', {
                        props: {
                            type: 'primary',
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

            // EDIT Inventory Form
            editInventoryModal: {
                deactivateInvSKU: '',
                deleteInvSKU: '',
                show: false,
                loading: true,
                inventory: '',
                form: {
                    name: '',
                    sku: '',
                    cogs: 0
                },
                formRules: {
                    name: [
                        { required: true, message: 'The name cannot be empty', trigger: 'blur' }
                    ],
                    sku: [
                        { required: true, message: 'The sku cannot be empty', trigger: 'blur' }
                    ],
                    cogs: [{
                        required: true,
                        validator (rule, value, callback) {

                            // check regex
                            let regex = /^\d{1,6}(\.\d{1,2})?$/
                            if (!regex.test(value.toString())) return callback( new Error('Please the value in the correct format.') )

                            // everything passed
                            return callback()

                        },
                        trigger: 'blur'
                    }]
                }
            },

            // ADD Inventory Form
            addInventoryModal: {
                show: false,
                loading: true,
                form: {
                    name: '',
                    sku: '',
                    cogs: 0
                },
                formRules: {
                    name: [
                        { required: true, message: 'The name cannot be empty', trigger: 'blur' }
                    ],
                    sku: [
                        { required: true, message: 'The sku cannot be empty', trigger: 'blur' }
                    ],
                    cogs: [{
                        required: true,
                        validator (rule, value, callback) {

                            // check regex
                            let regex = /^\d{1,6}(\.\d{1,2})?$/
                            if (!regex.test(value.toString())) return callback( new Error('Please the value in the correct format.') )

                            // everything passed
                            return callback()

                        },
                        trigger: 'blur'
                    }]
                }
            },

            transitModal: {
                show: false,
                inventory: ''
            },
            soldModal: {
                show: false,
                inventory: ''
            }
        }

    },
    methods: {

        deactivateInv(inventory) {
            let self = this
            this.editInventoryModal.deactivateInvSKU = ''

            this.$Modal.confirm({
                render: (h) => {

                    return h('Input', {
                        props: {
                            value: this.editInventoryModal.deactivateInvSKU,
                            autofocus: true,
                            placeholder: 'To confirm, please type the product sku'
                        },
                        on: {
                            input: (val) => {
                                this.editInventoryModal.deactivateInvSKU = val;
                            }
                        }
                    })
                },
                onOk() {

                    if(self.editInventoryModal.deactivateInvSKU.toLowerCase() !== inventory.sku.toLowerCase()) {
                        alert('Your sku entered does not match.')
                        this.$Modal.remove()
                        return
                    }

                    // do delete
                    axios.post(domain + '/api/v2/inventory/deactivate', { InventoryID: inventory.InventoryID }).then(response => {
                        if (!response.data.success) {
                            let error = new Error('API operation not successful.')
                            error.reponse = response
                            throw error
                        }

                        // remove the inventory from view
                        let index = _.findIndex(self.inventories, ['InventoryID', inventory.InventoryID])
                        self.inventories.splice(index, 1)

                        self.$Message.success('Success!');
                        self.$Modal.remove()
                        self.editInventoryModal.show = false

                    }).catch(error => {

                        CATCH_ERR_HANDLER(error)

                        self.$Modal.loading = false
                        self.$Message.error('Failed request!');
                    })

                },
                loading: true
            })
        },

        deleteInv(inventory) {

            let self = this
            this.editInventoryModal.deleteInvSKU = ''

            this.$Modal.confirm({
                render: (h) => {

                    return h('p', [
                        'DANGER: This process is irreversible. Only delete an inventory if you made a mistake in creating it.',
                        h('Input', {
                            props: {
                                value: this.editInventoryModal.deleteInvSKU,
                                autofocus: true,
                                placeholder: 'To confirm, please type the product sku'
                            },
                            on: {
                                input: (val) => {
                                    this.editInventoryModal.deleteInvSKU = val;
                                }
                            }
                        })
                    ])

                },
                onOk() {

                    if(self.editInventoryModal.deleteInvSKU.toLowerCase() !== inventory.sku.toLowerCase()) {
                        alert('Your sku entered does not match.')
                        this.$Modal.remove()
                        return
                    }

                    // do delete
                    axios.delete(domain + '/api/v2/inventory/delete', { data: {InventoryID: inventory.InventoryID} }).then(response => {
                        if (!response.data.success) {
                            let error = new Error('API operation not successful.')
                            error.reponse = response
                            throw error
                        }

                        // remove the inventory from view
                        let index = _.findIndex(self.inventories, ['InventoryID', inventory.InventoryID])
                        self.inventories.splice(index, 1)

                        self.$Message.success('Success!');
                        self.$Modal.remove()
                        self.editInventoryModal.show = false

                    }).catch(error => {

                        CATCH_ERR_HANDLER(error)

                        self.$Modal.loading = false
                        self.$Message.error('Failed request!');
                    })

                },
                loading: true
            })
        },

        editInventory (inventory) {

            this.editInventoryModal.form.name = inventory.name
            this.editInventoryModal.form.sku = inventory.sku
            this.editInventoryModal.form.cogs = inventory.cogs
            this.editInventoryModal.inventory = inventory
            this.editInventoryModal.show = true

        },

        showTransitDetails (inventory) {
            this.transitModal.inventory = inventory
            this.transitModal.show = true
        },

        showSoldDetails (inventory) {
            this.soldModal.inventory = inventory
            this.soldModal.show = true
        },

        editInventoryOK (formName, inventory) {

            let newVal = this.editInventoryModal.form
            if (newVal.name === inventory.name && newVal.sku === inventory.sku && newVal.cogs === inventory.cogs) {
                //no changes.

                this.$Message.success('There are no changes made.');

                this.editInventoryModal.show = false
                this.editInventoryModal.loading = false

                return
            }

            this.$refs[formName].validate(valid => {

                if (valid) {

                    let payload = {
                        InventoryID: this.editInventoryModal.inventory.InventoryID,
                        name: this.editInventoryModal.form.name,
                        sku: this.editInventoryModal.form.sku,
                        cogs: this.editInventoryModal.form.cogs
                    }

                    axios.post(domain + '/api/v2/inventory/update', payload).then(response => {
                        if (!response.data.success) {
                            let error = new Error('API operation not successful.')
                            error.reponse = response
                            throw error
                        }

                        // set the new inventory data for view
                        let index = _.findIndex(this.inventories, ['InventoryID', inventory.InventoryID])
                        this.$set(this.inventories, index, response.data.inventory)

                        this.$Message.success('Success!');
                        this.editInventoryModal.show = false

                    }).catch(error => {

                        CATCH_ERR_HANDLER(error)
                        this.$Message.error('Failed request!');

                    }).then(() => {
                        this.editInventoryModal.loading = false
                    })

                } else {
                    this.editInventoryModal.loading = false
                    this.$Message.error('Check your entry!');
                }
            })
        },

        addProduct() {
            this.addInventoryModal.show = true
        },

        addInventoryOK (formName) {

            this.$refs[formName].validate(valid => {

                if (valid) {

                    let payload = {
                        name: this.addInventoryModal.form.name,
                        sku: this.addInventoryModal.form.sku,
                        cogs: this.addInventoryModal.form.cogs
                    }

                    axios.put(domain + '/api/v2/inventory/add', payload).then(response => {
                        if (!response.data.success) {
                            let error = new Error('API operation not successful.')
                            error.reponse = response
                            throw error
                        }
                        console.log(response.data)

                        // push the new inventory into view
                        this.inventories.unshift(response.data.inventory)

                        this.$Message.success('Success!');
                        this.addInventoryModal.show = false

                    }).catch(error => {

                        CATCH_ERR_HANDLER(error)
                        this.$Message.error('Failed request!')

                    }).then(() => {
                        this.addInventoryModal.loading = false
                    })

                } else {
                    this.addInventoryModal.loading = false
                    this.$Message.error('Check your entry!');
                }
            })
        }
    },
    filters: {
        momentUnix(date) {
            return moment(parseInt(date)).format('DD MMM YY');
        }
    },

    created () {

        window.V = this

        axios.get(domain + '/api/v2/inventory/all').then(response => {

            if (!response.data.success) {
                let error = new Error('API operation not successful.')
                error.reponse = response
                throw error
            }

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

        }).catch(CATCH_ERR_HANDLER).then(() => { this.spinShow = false })
    }
}
</script>
