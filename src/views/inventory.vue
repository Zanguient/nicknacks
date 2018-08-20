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

        <Modal
            v-model="editInventoryModal.show"
            title="Edit product"
            :loading="editInventoryModal.loading"
            @on-ok="editInventoryOK('editInventoryForm', editInventoryModal.inventory)">

            <Form ref="editInventoryForm" :model="editInventoryModal.form" :rules="editInventoryModal.formRules">

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
                        <Button type="warning" @click="deactivateInv(inventory)">Deactivate</Button>
                        <Button type="error" @click="deleteInv(inventory)">Delete</Button>
                    </p>
                </Panel>
            </Collapse>

            <p>InventoryID: {{ editInventoryModal.inventory.InventoryID }}</p>

        </Modal>

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

            // ADD Inventory Form
            editInventoryModal: {
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
                        validator (rule, value, callback) {

                            // check regex
                            let regex = /^[1-9]\d*(((,\d{3}){1})?(\.\d{0,2})?)$/
                            if (!regex.test(value.toString())) return callback( new Error('Please the value in the correct format.') )

                            // everything passed
                            return callback()

                        },
                        trigger: 'blur'
                    }]
                }
            }
        }

    },
    methods: {
        /* TO BE WORKED ON */
        deactivateInv(inventory) {
            this.$Modal.confirm({
                render: (h) => {

                    this.deactivateInvSKU = ''

                    return h('Input', {
                        props: {
                            value: this.deactivateInvSKU,
                            autofocus: true,
                            placeholder: 'To confirm, please type the product sku'
                        },
                        on: {
                            input: (val) => {
                                this.deactivateInvSKU = val;
                            }
                        }
                    })
                },
                onOk() {
                    if(this.deactivateInvSKU.toLowerCase === inventory.sku.toLowerCase()) {
                        // do delete


                        // if successful
                    }
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

        /* TO BE WORKED ON */
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
                            alert(response.data.message)
                            this.editInventoryModal.loading = false
                            return
                        }

                        // set the new inventory data for view
                        let index = _.findIndex(this.inventories, ['InventoryID', inventory.InventoryID])
                        this.$set(this.inventories, index, response.data.inventory)

                        this.$Message.success('Success!');
                        this.editInventoryModal.show = false
                        this.editInventoryModal.loading = false

                    }).catch(error => {

                        CATCH_ERR_HANDLER(error)

                        this.editInventoryModal.loading = false
                        this.$Message.error('Failed request!');
                    })

                } else {
                    this.editInventoryModal.loading = false
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
