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

                <Card v-for="salesReceipt in salesReceipts" :key="salesReceipt.transactionID" style="width: 100%; max-width:780px;">
                    <p slot="title">
                        <Icon type="ios-cart"></Icon>
                        {{ salesReceipt.salesOrderNumber }}
                    </p>

                    <Row>
                        <Col :xs="24" :sm="12">
                            <p><Icon type="person"></Icon> {{ salesReceipt.customer.name }}</p>
                            <p><Icon type="email"></Icon> {{ salesReceipt.customer.email }}</p>
                            <p><Icon type="ios-telephone"></Icon> {{ salesReceipt.customer.phone }}</p>
                            <p style="margin-bottom: 5px;"><Icon type="card"></Icon> {{ salesReceipt.paymentMethod }}</p>
                        </Col>
                        <Col :xs="24" :sm="12">
                            <Card style="max-width: 100%;">
                                <p slot="title">
                                    <Icon type="cube"></Icon>
                                    Product(s) sold
                                </p>

                                <a href="#" slot="extra" type="primary" @click="addInventory(salesReceipt)">
                                    <Icon type="plus"></Icon>
                                    Add
                                </a>

                                <Modal
                                    v-model="addInventoryModal"
                                    title="Add Inventory"
                                    :loading="addInventoryModalLoading"
                                    @on-ok="asyncOK">
                                    <Select v-model="inventorySelectTemp.selectedIndex" filterable @on-change="triggerStorageSelection()">
                                        <Option v-for="(inventory, index) in inventories" :value="index" :key="index">{{ inventory.name }} <br> <i>{{ inventory.sku }}</i></Option>
                                    </Select>

                                    <Select v-model="inventorySelectTemp.storageLocationID" filterable>
                                        <Option v-for="(stockItem, index) in inventorySelectTemp.stock" :value="stockItem.StorageLocationID || -1" :key="index" :disabled="!stockItem.StorageLocationID">{{ stockItem.name }} (Qty: {{ stockItem.quantity }})</Option>
                                    </Select>

                                </Modal>

                            </Card>
                        </Col>
                    </Row>

                    <Form :label-width="80" style="padding-top: 10px;">
                        <FormItem style="display:none;">
                            <Input v-model="salesReceipt.salesOrderNumber"></Input>
                        </FormItem>
                        <FormItem label="COGS">
                            <Input v-model="form.COGS" placeholder=""></Input>
                        </FormItem>
                        <FormItem label="Comments">
                            <Input v-model="form.comments" placeholder=""></Input>
                        </FormItem>

                        <FormItem>
                            <Button type="primary">Submit</Button>
                        </FormItem>
                    </Form>

                </Card>
            </Content>
        </Layout>
    </div>
</template>
<script>
import axios from 'axios'

export default {
    data () {
        return {

            salesReceipts: [{
                transactionID: '',
                customer: {
                    name: '',
                    phone: '',
                    email: ''
                },
                paymentMethod: '',
                salesOrderNumber: '',
                soldInventories: [{
                    inventoryID: '',
                    transactionID: '',
                    quantity: ''
                }]
            }],

            inventories: [],

            form: { COGS: 0, comments: '' },


            inventorySelectTemp: {
                selectedIndex: '',

                    inventoryID: '',
                    transactionID: '',
                    quantity: '',
                    storageLocationID: '',
                    stock: ''

            },

            addInventoryModal: false,
            addInventoryModalLoading: true,
        }
    },
    methods: {
        asyncOK () {
            setTimeout(() => {
                this.modal6 = false
            }, 2000)
        },
        addInventory(salesReceipt) {
            this.addInventoryModal = true
            // this.inventorySelectTemp = {
            //     selectedIndex: '',
            //     selection: {
            //         inventoryID: '',
            //         transactionID: '',
            //         quantity: '',
            //         storageLocationID: '',
            //         stock: []
            //     }
            // }
        },
        triggerStorageSelection() {
            // this.inventorySelectTemp.selection = {
            //     inventoryID: '',
            //     transactionID: '',
            //     quantity: '',
            //     storageLocationID: '',
            //     stock: []
            // }
            let selectedInventory = this.inventories[this.inventorySelectTemp.selectedIndex]
            this.inventorySelectTemp.inventoryID = selectedInventory['InventoryID']
            this.inventorySelectTemp.stock = selectedInventory['stock']
            console.log(11111)
            console.log(this.inventorySelectTemp)
        }
    },
    //     addInventory(salesReceipt) {
    //
    //         // add an inventory first
    //         var tempNewInventory = salesReceipt.soldInventories.push({
    //             name: '',
    //             storageLocationID: '',
    //             quantity: 1
    //         })
    //
    //         this.$Modal.confirm({
    //             props: ['name', 'storageLocationID', 'quantity'],
    //             render: (createElement) => {
    //                 return [
    //                     createElement(
    //                         'Select',
    //
    //                         this.inventories.map( inventory => createElement('Option', inventory.name) ),
    //
    //                         {
    //                             domProps: {
    //                                 name: self.value,
    //                                 autofocus: true,
    //                                 placeholder: 'Search inventories...'
    //                             },
    //                             on: {
    //                                 change: (val) => {
    //                                     tempNewInventory.name = val;
    //                                 }
    //                             }
    //                         }
    //                     ),
    //                     '<p>The dialog box will be closed after 2 seconds</p>'
    //                 ]
    //             },
    //             title: 'Add inventory for ' + salesReceipt.salesOrderNumber,
    //             loading: true,
    //             onOk: () => {
    //                 setTimeout(() => {
    //                     this.$Modal.remove();
    //                     this.$Message.info('Asynchronously close the dialog box');
    //                 }, 2000);
    //             }
    //         });
    //     }
    // },
    created () {
        //let domain = process.env.API_DOMAIN
        //alert(process.env.API_DOMAIN)
        let domain = 'http://192.168.86.25:3000'

        axios.get(domain + '/api/v2/sales-receipt/pending-sales-receipt/all').then(response => {
            if (!response.data.success) alert(response.data.message)
            console.log(response.data.data)
            this.salesReceipts = response.data.data
        }).catch(error => {
            alert(error)
        })

        axios.get(domain + '/api/v2/inventory/all').then(response => {
            if (!response.data.success) alert(response.data.message)
            console.log(response.data.data)
            this.inventories = response.data.data
        }).catch(error => {
            alert(error)
        })
    }
}
</script>
