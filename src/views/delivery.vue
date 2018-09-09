<template>
    <div>
        <Spin size="large" fix v-if="spinShow"></Spin>
        <Breadcrumb class="mainBreadCrumb">
            <BreadcrumbItem>Delivery</BreadcrumbItem>
        </Breadcrumb>

        <span v-if="salesReceipts.length < 1">
            <Card class="salesReceiptCard">
                <p slot="title">No undelivered sales receipts.</p>
            </Card>
        </span>

        <span v-else>
            <Card v-for="salesReceipt in salesReceipts" :key="salesReceipt.TransactionID" class="salesReceiptCard">
                <p slot="title">
                    <Icon type="ios-cart"></Icon>
                    {{ salesReceipt.salesOrderNumber }}
                </p>

                <Button type="primary" slot="extra" :loading="salesReceipt.submitLoading" :disable="salesReceipt.submitLoading" @click='deliverSalesReceipt(salesReceipt)'>
                    <span v-if="!salesReceipt.submitLoading">Deliver</span>
                    <span v-else>Loading...</span>
                </Button>

                <Collapse style="max-width: 100%;" value="info">
                    <Panel name="info">
                        Info
                        <p slot="content">
                            <Icon type="ios-person" /> {{ salesReceipt.details.customerName }}<br>
                            <Icon type="ios-mail" /> {{ salesReceipt.details.customerEmail }}<br>
                            <Icon type="ios-phone-portrait" /> {{ salesReceipt.customer_telephone }}<br>
                            <Icon type="ios-card" /> {{ salesReceipt.paymentMethod }}<br>
                        </p>
                    </Panel>
                    <Panel name="productsSold">
                        <Icon type="ios-cube" />
                        Product(s) sold (<b>{{ salesReceipt.data.items.length }}</b>)
                        <p slot="content">
                            <Card v-for="(cartItem, index) in salesReceipt.data.items" :key="cartItem.id + '_' + index">
                                <p slot="title">{{ cartItem.name }} <br></p>
                                <p><b>SKU:</b> {{ cartItem.sku }}</p>
                                <p><b>Qty:</b> {{ cartItem["Ordered Qty"] }}</p>
                                <p><b>Price:</b> {{ cartItem.Price }} </p>
                                <span v-if="cartItem.Options" v-for="(option, label) in cartItem.Options">
                                    <p><b>{{ label }}:</b> {{ option }}</p>
                                </span>
                            </Card>
                        </p>
                    </Panel>
                    <Panel name="productsTagged">
                        <Icon type="md-done-all" />
                        Product(s) tagged (<b>{{ salesReceipt.soldInventories.length }}</b>)
                        <p slot="content">
                            <Card v-for="soldInventory in salesReceipt.soldInventories" :key="soldInventory.SoldInventoryID">
                                <p slot="title">{{ soldInventory.name }} <br></p>
                                <a href="javascript:void(0);" slot="extra" type="primary" @click="removeSoldInventory(soldInventory, salesReceipt)">
                                    <Icon type="ios-trash"></Icon>
                                </a>
                                <p><b>SKU:</b> {{ soldInventory.sku }}</p>
                                <p><b>Qty:</b> {{ soldInventory.quantity }} (from <b>{{ soldInventory.StorageLocationName }}</b>)</p>
                                <p><b>COGS/item:</b> {{ soldInventory.perItemCOGS }} </p>
                                <p><b>Total COGS: {{ soldInventory.totalCOGS }}</b></p>
                            </Card>

                            <Button icon="md-add" type="primary" @click="addInventory(salesReceipt)">Add</Button>
                        </p>
                    </Panel>
                </Collapse>

            </Card>
        </span>


        <Modal
            v-model="addInventoryModal.show"
            title="Add Inventory"
            :loading="addInventoryModal.loading"
            @on-ok="addInventoryOK('addInventoryForm', addInventoryModal.salesReceipt)">

            <Form ref="addInventoryForm" :model="addInventoryModal.form" :rules="addInventoryModal.formRules">
                <FormItem prop="inventoryIndex">
                    <Select placeholder="Select product" v-model="addInventoryModal.form.inventoryIndex" filterable @on-change="triggerStorageSelection()">
                        <Option v-for="(inventory, index) in addInventoryModal.inventories" :value="index" :key="index">{{ inventory.name }} <br> <i>{{ inventory.sku }}</i></Option>
                    </Select>
                </FormItem>
                <FormItem prop="storageLocationID">
                    <Select ref="addInventoryFormStorage" placeholder="Select location" v-model="addInventoryModal.form.storageLocationID" filterable>
                        <Option v-for="(stockItem, index) in addInventoryModal.selectedInventory.stock" :value="stockItem.StorageLocationID || -1" :key="index" :disabled="!stockItem.StorageLocationID">{{ stockItem.name }} (Qty: {{ stockItem.quantity }})</Option>
                    </Select>
                </FormItem>
                <FormItem label="Quantity" prop="quantity">
                    <InputNumber :max="999" :min="1" v-model="addInventoryModal.form.quantity"></InputNumber>
                </FormItem>
            </Form>

            <p>TransactionID: {{ addInventoryModal.salesReceipt.TransactionID }}</p>

        </Modal>

    </div>
</template>
<script>
import axios from 'axios'
import D from 'dottie'
const domain = process.env.API_DOMAIN

export default {
    data () {
        return {

            spinShow: true,

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
                data: {
                    items: []
                },
                // view properties
                submitLoading: false
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
        deliverSalesReceipt (salesReceipt) {

            salesReceipt.submitLoading = true

            let payload = {
                TransactionID: salesReceipt.TransactionID
            }

            axios.post(domain + '/api/v2/sales-receipt/deliver', payload).then(response => {

                // if success: false
                if (!response.data.success) {
                    alert(response.data.message)
                    salesReceipt.submitLoading = false
                    return
                }

                this.$Message.success('Successfully delivered sales receipt!');

                // remove the successful entry
                this.salesReceipts.splice(this.salesReceipts.indexOf(salesReceipt), 1)

            }).catch(error => {

                this.$Message.error('Failed request!');
                salesReceipt.submitLoading = false


                CATCH_ERR_HANDLER(error)
            })

        }
    },

    created () {

        window.V = this

        axios.get(domain + '/api/v2/sales-receipt/pending-delivery/all').then(response => {

            if (!response.data.success) return alert(response.data.message)

            console.log(response.data.data)

            for(let i=0; i<response.data.data.length; i++) {
                let salesReceipt = response.data.data[i]
                salesReceipt.submitLoading = false
            }

            this.salesReceipts = response.data.data

        }).catch(CATCH_ERR_HANDLER).then(() => { this.spinShow = false })

        axios.get(domain + '/api/v2/inventory/all').then(response => {
            if (!response.data.success) return alert(response.data.message)
            console.log(response.data.data)
            this.inventories = response.data.data
        }).catch(CATCH_ERR_HANDLER)
    }
}
</script>
