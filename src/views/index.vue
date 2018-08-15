<style scoped>
.layout{
    border: 1px solid #d7dde4;
    background: #f5f7f9;
    position: relative;
    border-radius: 4px;
    overflow: hidden;
}
.layout-nav{
    width: 420px;
    margin: 0 auto;
    margin-right: 20px;
}
.ivu-icon {
    margin-right: 2px;
}
.ivu-menu-horizontal .ivu-menu-item {
    padding: 0 5px;
}
.salesReceiptCard {
     width: 100%;
     max-width:780px;
}
</style>
<template>
    <div class="layout">
        <Layout>
            <Header :style="{padding: '0 5px'}">
                <Menu mode="horizontal" theme="dark" active-name="1">
                    <div class="layout-nav">
                        <MenuItem name="1">
                            <Icon type="ios-cart"></Icon>
                            Sales
                        </MenuItem>
                        <MenuItem name="2" >
                            <Icon type="bag" ></Icon>
                            Delivery
                        </MenuItem>
                        <MenuItem name="3">
                            <Icon type="cube" ></Icon>
                            Inventory
                        </MenuItem>
                        <MenuItem name="4" >
                            <Icon type="android-boat" ></Icon>
                            Shipment
                        </MenuItem>
                    </div>
                </Menu>
            </Header>
            <Content :style="{padding: '5px'}">
                <Breadcrumb :style="{margin: '5px'}">
                    <BreadcrumbItem>Sales receipts</BreadcrumbItem>
                </Breadcrumb>
                <span v-if="salesReceipts.length < 1">
                    <Card class="salesReceiptCard">
                        <p slot="title">No outstanding sales receipts for accounting entry.</p>
                    </Card>
                </span>
                <span v-else>
                    <Card v-for="salesReceipt in salesReceipts" :key="salesReceipt.TransactionID" class="salesReceiptCard">
                        <p slot="title">
                            <Icon type="ios-cart"></Icon>
                            {{ salesReceipt.salesOrderNumber }}
                        </p>

                        <Row>
                            <Col :xs="24" :sm="12">
                                <p><Icon type="person"></Icon> {{ salesReceipt.details.customerName }}</p>
                                <p><Icon type="email"></Icon> {{ salesReceipt.details.customerEmail }}</p>
                                <p><Icon type="ios-telephone"></Icon> {{ salesReceipt.customer_telephone }}</p>
                                <p style="margin-bottom: 5px;"><Icon type="card"></Icon> {{ salesReceipt.paymentMethod }}</p>
                            </Col>
                            <Col :xs="24" :sm="12">
                                <Collapse style="max-width: 100%;">
                                    <Panel name="productsSold">
                                        <Icon type="cube"></Icon>
                                        Product(s) sold (<b>{{ salesReceipt.soldInventories.length }}</b>)
                                        <p slot="content">

                                            <Modal
                                                v-model="addInventoryModal"
                                                title="Add Inventory"
                                                :loading="addInventoryModalLoading"
                                                @on-ok="addInventoryOK('addInventoryForm', salesReceipt)">

                                                <Form ref="addInventoryForm" :model="addInventoryForm" :rules="addInventoryFormRules">
                                                    <FormItem prop="inventoryIndex">
                                                        <Select placeholder="Select product" v-model="addInventoryForm.inventoryIndex" filterable @on-change="triggerStorageSelection()">
                                                            <Option v-for="(inventory, index) in inventories" :value="index" :key="index">{{ inventory.name }} <br> <i>{{ inventory.sku }}</i></Option>
                                                        </Select>
                                                    </FormItem>
                                                    <FormItem prop="storageLocationID">
                                                        <Select ref="addInventoryFormStorage" placeholder="Select location" v-model="addInventoryForm.storageLocationID" filterable>
                                                            <Option v-for="(stockItem, index) in selectedInventory.stock" :value="stockItem.StorageLocationID || -1" :key="index" :disabled="!stockItem.StorageLocationID">{{ stockItem.name }} (Qty: {{ stockItem.quantity }})</Option>
                                                        </Select>
                                                    </FormItem>
                                                    <FormItem label="Quantity" prop="quantity">
                                                        <InputNumber :max="999" :min="1" v-model="addInventoryForm.quantity"></InputNumber>
                                                    </FormItem>
                                                </Form>

                                                <p>TransactionID: {{ addInventoryForm.TransactionID }}</p>

                                            </Modal>

                                            <Card v-for="soldInventory in salesReceipt.soldInventories" :key="soldInventory.SoldInventoryID">
                                                <p slot="title">{{ soldInventory.name }} <br></p>
                                                <a href="javascript:void(0);" slot="extra" type="primary" @click="removeSoldInventory(soldInventory, salesReceipt)">
                                                    <Icon type="trash-b"></Icon>
                                                </a>
                                                <p><b>SKU:</b> {{ soldInventory.sku }}</p>
                                                <p><b>Qty:</b> {{ soldInventory.quantity }} (from <b>{{ soldInventory.StorageLocationName }}</b>)</p>
                                                <p><b>COGS/item:</b> {{ soldInventory.perItemCOGS }} </p>
                                                <p><b>Total COGS: {{ soldInventory.totalCOGS }}</b></p>
                                            </Card>

                                            <Button icon="plus "type="primary" @click="addInventory(salesReceipt)">Add</Button>
                                        </p>
                                    </Panel>
                                </Collapse>
                            </Col>
                        </Row>

                        <Form :ref="salesReceipt.TransactionID" :model="salesReceipt" :rules="salesReceiptFormRules" :label-width="80" style="padding-top: 10px;">
                            <FormItem prop="totalCOGS" label="COGS">
                                <Input type="text" number v-model="salesReceipt.totalCOGS" placeholder=""></Input>
                            </FormItem>
                            <FormItem prop="comments" label="Comments">
                                <Input type="text" v-model="salesReceipt.comments" placeholder=""></Input>
                            </FormItem>

                            <FormItem>
                                <Button type="primary" :loading="salesReceipt.submitLoading" :disable="salesReceipt.submitLoading" @click='submitSalesReceipt(salesReceipt.TransactionID, salesReceipt)'>
                                    <span v-if="!salesReceipt.submitLoading">Submit</span>
                                    <span v-else>Loading...</span>
                                </Button>
                            </FormItem>
                        </Form>

                    </Card>
                </span>
            </Content>
        </Layout>
    </div>
</template>
<script>
import axios from 'axios'
import D from 'dottie'
const domain = process.env.API_DOMAIN

export default {
    data () {
        return {

            salesReceipts: [{
                TransactionID: '',
                details: {
                    customerName: '',
                    customerPhone: '',
                    customerEmail: ''
                },
                paymentMethod: '',
                salesOrderNumber: '',
                soldInventories: [{
                    InventoryID: '',
                    TransactionID: '',
                    quantity: ''
                }],

                // view properties
                totalCOGS: '',
                comments: '',
                submitLoading: false
            }],

            inventories: [],

            // Sales Receipt form
            salesReceiptFormRules: {
                totalCOGS: [
                    {
                        validator (rule, value, callback) {

                            // check regex
                            let regex = /^[1-9]\d*(((,\d{3}){1})?(\.\d{0,2})?)$/
                            if (!regex.test(value.toString())) return callback( new Error('Please the value in the correct format.') )

                            // everything passed
                            return callback()

                        },
                        trigger: 'blur'
                    }
                ]
            },

            // ADD Inventory Form
            addInventoryModal: false,
            addInventoryModalLoading: true,

            addInventoryForm: {
                inventoryIndex: '',
                TransactionID: '',
                StorageLocationID: '',
                quantity: 1
            },

            addInventoryFormRules: {
                inventoryIndex: [
                    { type: 'number', min: 0, message: 'Please select inventory', trigger: 'blur' }
                ],
                TransactionID: [
                    { required: true, message: '', trigger: 'blur' }
                ],
                StorageLocationID: [
                    { required: true, message: 'Please select a storage location.', trigger: 'blur' }
                ],
                quantity: [
                    { type: 'number', min: 1, message: 'Quantity cannot be less than 1', trigger: 'blur' }
                ]
            },

            selectedInventory: {},

        }

    },
    methods: {

        addInventoryOK (formName, salesReceipt) {

            this.$refs[formName][0].validate((valid) => {

                if (valid) {

                    let payload = {
                        TransactionID: this.addInventoryForm.TransactionID,
                        InventoryID: this.inventories[this.addInventoryForm.inventoryIndex]['InventoryID'],
                        StorageLocationID: this.addInventoryForm.storageLocationID,
                        quantity: this.addInventoryForm.quantity
                    }

                    axios.put(domain + '/api/v2/inventory/sold', payload).then(response => {
                        if (!response.data.success) {
                            alert(response.data.message)
                            this.addInventoryModalLoading = false
                            return
                        }
                        console.log(response.data.data)

                        salesReceipt.soldInventories.push(response.data.data)

                        // re-compute the totalCOGS
                        salesReceipt.totalCOGS = 0
                        for(let i=0; i<salesReceipt.soldInventories.length; i++) {
                            let soldInventory = salesReceipt.soldInventories[i]
                            salesReceipt.totalCOGS += parseFloat(soldInventory.totalCOGS)
                        }
                        salesReceipt.totalCOGS = salesReceipt.totalCOGS.toFixed(2)

                        this.$Message.success('Success!');
                        this.addInventoryModal = false
                        this.addInventoryModalLoading = false

                    }).catch(error => {

                        CATCH_ERR_HANDLER(error)

                        this.addInventoryModalLoading = false
                        this.$Message.error('Failed request!');
                    })

                } else {
                    this.addInventoryModalLoading = false
                    this.$Message.error('Check your entry!');
                }
            })
        },
        addInventory(salesReceipt) {
            this.addInventoryModal = true
            this.addInventoryForm.TransactionID = salesReceipt.TransactionID

            this.$refs['addInventoryForm'][0].resetFields()
        },
        triggerStorageSelection() {
            // set the selectedInventory to point to the inventory object within the inventories array
            this.selectedInventory = this.inventories[this.addInventoryForm.inventoryIndex]
            this.$refs['addInventoryFormStorage'][0].reset()
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

                    console.log(payload)

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

        axios.get(domain + '/api/v2/sales-receipt/pending-sales-receipt/all').then(response => {

            if (!response.data.success) return alert(response.data.message)

            console.log(response.data.data)

            // compute the totalCOGS
            for(let i=0; i<response.data.data.length; i++) {
                let salesReceipt = response.data.data[i]

                salesReceipt.totalCOGS = 0

                for(let i=0; i<salesReceipt.soldInventories.length; i++) {
                    let soldInventory = salesReceipt.soldInventories[i]
                    salesReceipt.totalCOGS += parseFloat(soldInventory.totalCOGS)
                }

                salesReceipt.totalCOGS = salesReceipt.totalCOGS.toFixed(2)

                salesReceipt.submitLoading = false
            }

            this.salesReceipts = response.data.data

        }).catch(CATCH_ERR_HANDLER)

        axios.get(domain + '/api/v2/inventory/all').then(response => {
            if (!response.data.success) return alert(response.data.message)
            console.log(response.data.data)
            this.inventories = response.data.data
        }).catch(CATCH_ERR_HANDLER)
    }
}
</script>
