<template>
    <div>
        <Spin size="large" fix v-if="spinShow"></Spin>
        <Breadcrumb class="mainBreadCrumb">
            <BreadcrumbItem>Inventory</BreadcrumbItem>
        </Breadcrumb>

        <Button width="200" type="primary" @click="addProduct()">Add product</Button>

        <el-table :data="inventories" style="width:100%;">
            <el-table-column
                prop="name"
                label="Name"
                sortable
            >

                <template slot-scope="scope">
                    <p>{{ scope.row.name }}</p>
                    <div>
                        <Button size="small" @click="showTimeline(scope.row)" :type="(scope.row.timeline.hasShortFall ? 'error' : 'success' )">Timeline</Button>
                        <Tag v-if="scope.row.timeline.list[0].stockAvailableAtCurrentDate < 5" color="orange">Low stock</Tag>
                    </div>
                </template>


        </el-table-column>

            <el-table-column
                prop="sku"
                label="sku"
                sortable
                :filters="categoryFilters"
                :filter-method="filterHandler"
            ></el-table-column>

            <el-table-column label="Stock">
                <template slot-scope="scope">

                    <span style="font-size:11px; line-height: 12px;" v-for="location in scope.row.stock">

                        <span v-if="location.name.toLowerCase() === 'sold' && location.quantity > 0">
                            <a href="javascript:void(0);" @click="showSoldDetails(scope.row)">
                                <p>{{ location.name }}: {{ location.quantity }}</p>
                            </a>
                        </span>
                        <span v-else-if="location.name.toLowerCase() === 'transit' && location.quantity > 0">
                            <a href="javascript:void(0);" @click="showTransitDetails(scope.row)">
                                <p>{{ location.name }}: {{ location.quantity }}</p>
                            </a>
                        </span>
                        <span v-else><p>{{ location.name }}: {{ location.quantity }}</p></span>

                    </span>
                </template>
            </el-table-column>

            <el-table-column
                prop="cogs"
                label="COGS"
                sortable
            ></el-table-column>

            <el-table-column
                label="Action"
                sortable
            >
                <template slot-scope="scope">
                    <Button type="primary" size="small" @click="editInventory(scope.row)">
                        <Icon type="ios-create" /><span class="inventoryActionText">Edit</span>
                    </Button>
                    <br>
                    <Button type="warning" size="small" @click="transfer(scope.row)">
                        <Icon type="md-git-compare" /><span class="inventoryActionText">Transfer</span>
                    </Button>
                    <br>
                    <Button type="error" size="small" @click="discrepancy(scope.row)">
                        <Icon type="ios-podium" /><span class="inventoryActionText">Discrepancy</span>
                    </Button>
                </template>
            </el-table-column>
        </el-table>


        <add-inventory-modal
            v-on:inventory:added="lineAdd"
            :modalData="addInventoryModal"></add-inventory-modal>

        <edit-inventory-modal
            v-on:inventory:edited="lineRefresh"
            v-on:inventory:deactivatedOrDeleted="lineRemove"
            :modalData="editInventoryModal"></edit-inventory-modal>

        <discrepancy-modal
            v-on:inventory:discrepancy-complete="lineRefresh"
            :modalData="discrepancyModal"></discrepancy-modal>

        <transfer-inventory-modal
            v-on:inventory:transferred="lineRefresh"
            :stock="stockCache"
            :modalData="transferModal"></transfer-inventory-modal>


        <timeline-modal :modalData="timelineModal"></timeline-modal>

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

    </div>
</template>
<script>
import axios from 'axios'
import D from 'dottie'
import _ from 'lodash'
import moment from 'moment'
import transferInventoryModal from './components/inventory/transfer.vue'
import editInventoryModal from './components/inventory/edit.vue'
import addInventoryModal from './components/inventory/add.vue'
import discrepancyModal from './components/inventory/discrepancy.vue'
import timelineModal from './components/inventory/timeline.vue'

const domain = process.env.API_DOMAIN

export default {
    components: {
        transferInventoryModal,
        editInventoryModal,
        addInventoryModal,
        discrepancyModal,
        timelineModal
    },
    data () {

        return {
            stockCache: [],
            spinShow: true,
            categoryFilters: [],
            inventories: [],

            storageLocations: [],

            // EDIT Inventory Form
            editInventoryModal: {
                show: false,
                inventory: Object,
                form: {
                    name: '',
                    sku: '',
                    cogs: 0
                }
            },

            // ADD Inventory Form
            addInventoryModal: {
                show: false,
                form: {
                    name: '',
                    sku: '',
                    cogs: 0
                }
            },
            transitModal: {
                show: false,
                inventory: ''
            },
            soldModal: {
                show: false,
                inventory: ''
            },
            discrepancyModal: {
                show: false,
                inventory: {
                    stock: [],
                    discrepancyReason: '',
                    final: 0,
                    quantity: 0
                }
            },
            transferModal: {
                show: false,
                inventory: Object
            },
            timelineModal: {
                show: false,
                inventory: {
                    name: String,
                    sku: String,
                    InventoryID: String,
                    timeline: {
                        list: Array,
                        hasShortFall: Boolean
                    }
                }
            }
        }

    },
    methods: {
        filterHandler (value, row) {
            return row.sku.indexOf(value) === 0
        },
        lineAdd(inventory) {
            this.inventories.unshift(inventory)
        },
        lineRefresh(inventory) {
            let index = _.findIndex(this.inventories, ['InventoryID', inventory.InventoryID])
            this.$set(this.inventories, index, inventory)
        },
        lineRemove(inventoryID) {
            let index = _.findIndex(this.inventories, ['InventoryID', inventoryID])
            this.inventories.splice(index, 1)
        },

        transfer(inventory) {

            let self = this

            this.stockCache = []

            this.storageLocations.forEach(loc => {
                let obj = {
                    StorageLocationID: loc.StorageLocationID,
                    name: loc.name,
                    quantity: 0,
                    transfer: 0,
                    final: 0
                }
                let id = loc.StorageLocationID
                let inventoryThatHasLocation = _.find(inventory.stock, { StorageLocationID: id })

                if (inventoryThatHasLocation) {
                    obj.quantity = obj.final = parseInt(inventoryThatHasLocation.quantity)
                }
                this.stockCache.push(obj)
            })

            this.transferModal.inventory = inventory
            this.transferModal.show = true
        },
        discrepancy(inventory) {

            var inventory  = _.cloneDeep(inventory)

            // filter away the stock that are not actual storage
            inventory.stock = _.filter(inventory.stock, s => {
                return (  !isNaN( parseInt(s.StorageLocationID) )  )
            })

            // add stuff to it.
            for(let i=0; i<inventory.stock.length; i++) {
                let stock = inventory.stock[i]
                stock.discrepancy = 0
                stock.final = stock.quantity
            }

            inventory.discrepancyReason = ''

            this.discrepancyModal.inventory = inventory

            this.discrepancyModal.show = true
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

        addProduct() {
            this.addInventoryModal.show = true
        },
        showTimeline(inventory) {
            this.timelineModal.inventory = inventory
            this.timelineModal.show = true
        }
    },
    filters: {
        momentUnix(date) {
            return moment(parseInt(date)).format('DD MMM YYYY');
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
                    text: cat,
                    value: cat
                })

            }
            this.categoryFilters = categoryFilters

        }).catch(CATCH_ERR_HANDLER).then(() => { this.spinShow = false })

        // get all storage location info
        axios.get(domain + '/api/v2/storage-location/all').then(response => {
            if (!response.data.success) {
                let error = new Error('API operation not successful.')
                error.reponse = response
                throw error
            }
            this.storageLocations = response.data.data
        }).catch(CATCH_ERR_HANDLER)
    }
}
</script>
